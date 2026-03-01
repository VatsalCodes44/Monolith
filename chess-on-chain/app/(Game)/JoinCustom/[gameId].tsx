import { StyleSheet, View, Text, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    ENTER_ARENA_PAYLOAD,
    ENTERED_ARENA,
    GAME_OVER,
    GAME_OVER_RESPONSE_PAYLOAD,
    GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD,
    JOIN_CUSTOM_GAME,
    JOIN_CUSTOM_GAME_Response_Payload,
    MESSAGE,
    MESSAGE_CUSTOM,
    message_payload,
    MOVE,
    MOVE_RESPONSE_PAYLOAD,
    RE_JOIN_CUSTOM_GAME,
    RE_JOIN_CUSTOM_GAME_RESPONSE_PAYLOAD,
    TIME_OUT
} from '@/src/config/serverResponds';
import { Chess, Move, Square } from 'chess.js';
import { WS_URL } from '@/src/config/config';
import { ConnectingToServer } from '@/src/components/connectingToServer';
import { Audio } from 'expo-av';
import { useWalletStore } from '@/src/stores/wallet-store';
import { INIT_GAME_TYPE_TS, JOIN_CUSTOM_GAME_TYPE_TS, Re_JOIN_CUSTOM_GAME_TYPE_TS } from '@/src/config/serverInputs';
import { jwtStore } from '@/src/stores/jwt';
import { GameBase } from '@/src/components/GameBase';
import { router, useLocalSearchParams } from 'expo-router';
import { GAME_STATE } from '@/src/config/game';

export interface GameOver {
    winner: "b" | "w" | null,
    gameOverType: "checkmate" | "stalemate" | "draw" | "time_out" | null,
    isGameOver: boolean
}

export interface Message {
    from: "w" | "b",
    message: string,
}

export default function CustomGame() {
    // const [fontsLoaded] = useFonts({
    //   Orbitron_900Black,
    // });
    const fontsLoaded = true;
    const { gameId} = useLocalSearchParams<{ gameId: string}>();
    const gameIdRef = useRef<string | null>(gameId)
    const [skr, setSkr] = useState <number>(0);
    const [gameState, setGameState] = useState<GAME_STATE>({
        chess: new Chess(),
        color: "w",
        from: null,
        prevFrom: null,
        prevTo: null,
        moves: [],
        timer1: 10 * 60 * 1000,
        timer2: 10 * 60 * 1000,
        opponentPubkey: null,
        gameover: {
            winner: null,
            gameOverType: null,
            isGameOver: false
        }
    })
    const socket = useRef<WebSocket | null>(null);
    const [gameStarted, setGameStarted] = useState(false)
    const isMountedRef = useRef(true);
    const [lastMessage, setLastMessage] = useState<Message>()
    const [showMessages, setShowMessages] = useState(false)
    const [messages, setMessages] = useState<Message[]>([]);
    const [connected, setConnected] = useState(false)
    const gameOverRef = useRef(false)
    const reconnectTimeoutRef = useRef<number | null>(null)
    const scrollRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions()
    const isDevnet = useWalletStore(s => s.isDevnet)
    const jwt = jwtStore(s => s.jwt)
    const publicKey = useWalletStore(s => s.publicKey)

    const onJoinCustomGameResponse = useCallback((payload: JOIN_CUSTOM_GAME_Response_Payload) => {
        setGameState(p => ({
            ...p,
            color: payload.color,
            chess: new Chess(payload.board),
            timer1: payload.timer1,
            timer2: payload.timer2,
            opponentPubkey: payload.opponentPubkey
        }));
        setGameStarted(true);
        gameIdRef.current = payload.gameId
        setSkr(payload.skr)
    }, [])
    
    const onEnterArenaResponse = useCallback((payload: ENTER_ARENA_PAYLOAD) => {
        setGameState(p => ({
            ...p,
            chess: new Chess(payload.board),
            timer1: payload.timer1,
            timer2: payload.timer2,
        }))
        setSkr(payload.skr);
        setGameStarted(false);
    }, []);

    const onMoveResponse = useCallback((payload: MOVE_RESPONSE_PAYLOAD) => {
        setGameState(p => ({
            ...p,
            chess: new Chess(payload.board),
            prevFrom: payload.move.from,
            prevTo: payload.move.to,
            timer1: payload.timer1,
            timer2: payload.timer2,
            moves: payload.history,
        }));
    }, [])

    const onGameOver = useCallback((payload: GAME_OVER_RESPONSE_PAYLOAD) => {
        setGameState(p => ({
            ...p,
            chess: new Chess(payload.board),
            prevFrom: payload.move.from,
            prevTo: payload.move.to,
            moves: payload.history,
            gameover: {
                winner: payload.winner,
                gameOverType: payload.gameOverType,
                isGameOver: true
            }
        }));
        gameOverRef.current = true;
    }, [])

    const onTimeOutResponse = useCallback((payload: GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD) => {
        setGameState(p => ({
            ...p,
            prevFrom: payload.move.from,
            prevTo: payload.move.to,
            gameover: {
                winner: payload.winner,
                gameOverType: payload.gameOverType,
                isGameOver: true
            },
            moves: payload.history
        }));
        gameOverRef.current = true;
    }, [])

    const onReJoinCustomGameResponse = useCallback((payload: RE_JOIN_CUSTOM_GAME_RESPONSE_PAYLOAD) => {
        setGameState(p => ({
            ...p,
            color: payload.color,
            chess: new Chess(payload.board),
            timer1: payload.timer1,
            timer2: payload.timer2,
            opponentPubkey: payload.opponentPubkey,
        }));
        setGameStarted(true)
        gameIdRef.current = payload.gameId
        setSkr(payload.skr)
    }, [])

    const onMessageResponse = useCallback((payload: message_payload) => {
        setMessages(m => [...m, payload])
        setLastMessage(payload)
    }, [])

    const connect = useCallback((isRejoin = false) => {

        if (socket.current?.readyState === WebSocket.CONNECTING ||
            socket.current?.readyState === WebSocket.OPEN) {
            console.log("Already connecting/connected, skipping");
            return;
        }
        if (!jwt) {
            router.replace("/");
            return;
        }

        const ws = new WebSocket(WS_URL)

        ws.onopen = () => {
            if (!jwt) {
                return;
            }
            socket.current = ws
            setConnected(true)
            if (isRejoin && gameIdRef.current) {
                console.log("here2")
                const payload: Re_JOIN_CUSTOM_GAME_TYPE_TS = {
                    type: RE_JOIN_CUSTOM_GAME,
                    payload: {
                        gameId: gameIdRef.current,
                        jwt
                    }
                }
                ws.send(JSON.stringify(payload))
            } else {
                console.log("here3")
                if (!gameIdRef.current) {
                    console.log("here5")
                    isMountedRef.current = false
                    ws.close();
                    router.replace("/")
                    return;
                }
                const payload: JOIN_CUSTOM_GAME_TYPE_TS = {
                    type: JOIN_CUSTOM_GAME,
                    payload: {
                        jwt,
                        gameId: gameIdRef.current,
                    }
                }

                ws.send(JSON.stringify(payload))
            }
        }

        ws.onclose = () => {
            if (gameOverRef.current || !isMountedRef.current) {
                console.log("here4")
                return;
            };
            if (reconnectTimeoutRef.current) return;
            console.log("WebSocket closed")
            socket.current = null
            setConnected(false)
            reconnectTimeoutRef.current = setTimeout(() => {
                connect(true)
                reconnectTimeoutRef.current = null
            }, 2000)
        }

        ws.onerror = (err) => {
            console.log("WebSocket error", err)
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data)
            const payload = message.payload

            switch (message.type) {
                case ENTERED_ARENA:
                    onEnterArenaResponse(payload as ENTER_ARENA_PAYLOAD);
                    break;

                case JOIN_CUSTOM_GAME:
                    onJoinCustomGameResponse(payload as JOIN_CUSTOM_GAME_Response_Payload);
                    break;

                case MOVE:
                    onMoveResponse(payload as MOVE_RESPONSE_PAYLOAD);
                    break;

                case GAME_OVER:
                    onGameOver(payload as GAME_OVER_RESPONSE_PAYLOAD);
                    break;

                case TIME_OUT:
                    onTimeOutResponse(payload as GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD);
                    break;

                case MESSAGE_CUSTOM:
                    onMessageResponse(payload as message_payload);
                    break;

                case RE_JOIN_CUSTOM_GAME:
                    onReJoinCustomGameResponse(payload as RE_JOIN_CUSTOM_GAME_RESPONSE_PAYLOAD);
                    break;
            }
        }
    }, [jwt, isDevnet])

    useEffect(() => {
        if (showMessages && messages.length > 0) {
            // slight delay because modal animation + layout timing
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
    }, [showMessages, messages]);

    useEffect(() => {
        connect();
        return () => {
            isMountedRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (socket.current) {
                socket.current.onclose = null;
                socket.current.close();
                socket.current = null;
            }
        }
    }, [])

    const isReady =
        socket.current &&
        publicKey &&
        jwt &&
        skr > 0 &&
        connected;
        console.log(isReady)

    return (
        <View style={{ flex: 1 }}>
            {!isReady &&
                <ConnectingToServer message='Connecting to server...' fontsLoaded={fontsLoaded} />
            }

            {isReady &&
                <GameBase
                    spectator={false}
                    width={width}
                    showMessages={showMessages}
                    setShowMessages={setShowMessages}
                    messages={messages}
                    scrollRef={scrollRef}
                    socket={socket}
                    setMessages={setMessages}
                    jwt={jwt}
                    gameIdRef={gameIdRef}
                    isDevnet={isDevnet}
                    sol={"0.01"} // no use
                    fontsLoaded={fontsLoaded}
                    gameStarted={gameStarted}
                    lastMessage={lastMessage}
                    player1Pubkey={publicKey}
                    gameType='CUSTOM'
                    skr={skr}
                    gameState={gameState}
                    setGameState={setGameState}
                />
            }
            <TouchableOpacity onPress={() => {
                socket.current?.close()
            }} style={{ position: "absolute", bottom: 100, right: 10, backgroundColor: "#CE2EDF", padding: 10, borderRadius: 10 }}>
                <Text style={{ color: "#ffffff" }}>Close</Text>
            </TouchableOpacity>
        </View>
    )
}
    

const styles = StyleSheet.create({})