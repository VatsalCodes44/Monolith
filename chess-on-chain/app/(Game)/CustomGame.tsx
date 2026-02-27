import { StyleSheet, View, Text, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    GAME_OVER,
    GAME_OVER_RESPONSE_PAYLOAD,
    GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD,
    INIT_GAME,
    INIT_GAME_RESPONSE_PAYLOAD,
    MESSAGE,
    message_payload,
    MOVE,
    MOVE_RESPONSE_PAYLOAD,
    RE_JOIN_GAME,
    Re_JOIN_GAME_RESPONSE_PAYLOAD,
    TIME_OUT
} from '@/src/config/serverResponds';
import { Chess, Move, Square } from 'chess.js';
import { WS_URL } from '@/src/config/config';
import { ConnectingToServer } from '@/src/components/connectingToServer';
import { GameBet } from '@/src/stores/gameBet';
import { Audio } from 'expo-av';
import { useWalletStore } from '@/src/stores/wallet-store';
import { INIT_GAME_TYPE_TS, Re_JOIN_GAME_TYPE_TS } from '@/src/config/serverInputs';
import { jwtStore } from '@/src/stores/jwt';
import { GameBase } from '@/src/components/GameBase';

export interface GameOver {
    winner: "b" | "w" | null,
    gameOverType: "checkmate" | "stalemate" | "draw" | "time_out" | null,
    isGameOver: boolean
}

export interface Message {
    from: "w" | "b",
    message: string,
}

export default function Game() {

    // ---------------- STATE ----------------
    const socket = useRef<WebSocket | null>(null)
    const [chess, setChess] = useState(new Chess())
    const [color, setColor] = useState<"w" | "b">("w")
    const [from, setFrom] = useState<Square | null>(null)
    const [prevFrom, setPrevFrom] = useState<Square | null>(null)
    const [prevTo, setPrevTo] = useState<Square | null>(null)
    const [gameStarted, setGameStarted] = useState(false)
    const gameIdRef = useRef<string | null>(null)
    const isMountedRef = useRef(true);
    const [messages, setMessages] = useState<Message[]>([])
    const [lastMessage, setLastMessage] = useState<Message>()
    const [moves, setMoves] = useState<Move[]>([])
    const [showMessages, setShowMessages] = useState(false)
    const [connected, setConnected] = useState(false)

    const moveSoundRef = useRef<Audio.Sound | null>(null);
    const checkSoundRef = useRef<Audio.Sound | null>(null);
    const illegalSoundRef = useRef<Audio.Sound | null>(null);
    const lowOnTimeSoundRef = useRef<Audio.Sound | null>(null);
    const [timer1, setTimer1] = useState(10 * 60 * 1000)
    const [timer2, setTimer2] = useState(10 * 60 * 1000)
    const [opponentPubkey, setOpponentPubkey] = useState<string | null>(null)

    const [gameover, setGameOver] = useState<GameOver>({
        winner: null,
        gameOverType: null,
        isGameOver: false
    })
    const gameOverRef = useRef(false)
    const reconnectTimeoutRef = useRef<number | null>(null)
    const scrollRef = useRef<ScrollView>(null);

    const { width } = useWindowDimensions()

    const setSol = GameBet(s => s.setSol)
    const sol = GameBet(s => s.sol)

    const isDevnet = useWalletStore(s => s.isDevnet)

    const jwt = jwtStore(s => s.jwt)
    const publicKey = useWalletStore(s => s.publicKey)
    // const [fontsLoaded] = useFonts({
    //   Orbitron_900Black,
    // });
    const fontsLoaded = true;

    const onInitGameResponse = useCallback((payload: INIT_GAME_RESPONSE_PAYLOAD) => {
        setColor(payload.color)
        setChess(new Chess(payload.board))
        setGameStarted(true)
        setTimer1(payload.timer1)
        setTimer2(payload.timer2)
        gameIdRef.current = payload.gameId
        setSol(payload.sol)
        setOpponentPubkey(payload.opponentPubkey)
    }, [])

    const onMoveResponse = useCallback((payload: MOVE_RESPONSE_PAYLOAD) => {
        let newChess = new Chess(payload.board)
        setChess(newChess);
        setPrevFrom(payload.move.from);
        setPrevTo(payload.move.to);
        setTimer1(payload.timer1);
        setTimer2(payload.timer2);
        setMoves(payload.history)
        playMoveSound()
    }, [])

    const onGameOver = useCallback((payload: GAME_OVER_RESPONSE_PAYLOAD) => {
        setChess(new Chess(payload.board))
        setPrevFrom(payload.move.from)
        setPrevTo(payload.move.to)
        setMoves(payload.history)
        setGameOver({
            winner: payload.winner,
            gameOverType: payload.gameOverType,
            isGameOver: true
        })
        gameOverRef.current = true;
    }, [])

    const onTimeOutResponse = useCallback((payload: GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD) => {
        setPrevFrom(payload.move.from)
        setPrevTo(payload.move.to)
        setMoves(payload.history)
        setGameOver({
            winner: payload.winner,
            gameOverType: payload.gameOverType,
            isGameOver: true
        })
        gameOverRef.current = true;
    }, [])

    const onReJoinGameResponse = useCallback((payload: Re_JOIN_GAME_RESPONSE_PAYLOAD) => {
        setColor(payload.color)
        setChess(new Chess(payload.board))
        setGameStarted(true)
        setTimer1(payload.timer1)
        setTimer2(payload.timer2)
        gameIdRef.current = payload.gameId
        setSol(payload.sol)
        setOpponentPubkey(payload.opponentPubkey)
    }, [])

    const connect = useCallback((isRejoin = false) => {
        const ws = new WebSocket(WS_URL)

        ws.onopen = () => {
            if (!jwt || !sol) {
                console.log("here1")
                ws.close();
                return;
            }
            socket.current = ws
            setConnected(true)
            if (isRejoin && gameIdRef.current) {
                console.log("here2")
                const payload: Re_JOIN_GAME_TYPE_TS = {
                    type: RE_JOIN_GAME,
                    payload: {
                        gameId: gameIdRef.current,
                        network: isDevnet ? "DEVNET" : "MAINNET",
                        sol,
                        jwt
                    }
                }
                ws.send(JSON.stringify(payload))
            } else {
                console.log("here3")
                const payload: INIT_GAME_TYPE_TS = {
                    type: INIT_GAME,
                    payload: {
                        jwt,
                        network: isDevnet ? "DEVNET" : "MAINNET",
                        sol
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

                case INIT_GAME:
                    onInitGameResponse(payload as INIT_GAME_RESPONSE_PAYLOAD);
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

                case MESSAGE:
                    onMessageResponse(payload as message_payload);
                    break;

                case RE_JOIN_GAME:
                    onReJoinGameResponse(payload as Re_JOIN_GAME_RESPONSE_PAYLOAD);
                    break;
            }
        }
    }, [jwt, sol, isDevnet])

    const onMessageResponse = useCallback((payload: message_payload) => {
        setMessages(m => [...m, payload])
        setLastMessage(payload)
    }, [])

    const playMoveSound = async () => {
        if (!moveSoundRef.current) return;

        try {
            await moveSoundRef.current.stopAsync();
            await moveSoundRef.current.setPositionAsync(0);
            await moveSoundRef.current.playAsync();
        } catch (err) {
            console.log("Move sound error:", err);
        }
    };

    const playCheckSound = async () => {
        if (!checkSoundRef.current) return;

        try {
            await checkSoundRef.current.stopAsync();
            await checkSoundRef.current.setPositionAsync(0);
            await checkSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    };

    const playIllegalMoveSound = async () => {
        if (!illegalSoundRef.current) return;

        try {
            await illegalSoundRef.current.stopAsync();
            await illegalSoundRef.current.setPositionAsync(0);
            await illegalSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    };

    const playLowOnTimeSound = async () => {
        if (!lowOnTimeSoundRef.current) return;

        try {
            await lowOnTimeSoundRef.current.stopAsync();
            await lowOnTimeSoundRef.current.setPositionAsync(0);
            await lowOnTimeSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    };

    useEffect(() => {
        if (showMessages && messages.length > 0) {
            // slight delay because modal animation + layout timing
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
    }, [showMessages, messages]);

    useEffect(() => {
        const loadSounds = async () => {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                playThroughEarpieceAndroid: true,
            });

            const moveSound = new Audio.Sound();
            const checkSound = new Audio.Sound();
            const illegalSound = new Audio.Sound();
            const lowOnTimeSound = new Audio.Sound();

            await moveSound.loadAsync(
                require('../../assets/audios/moveSound.mp3')
            );

            await checkSound.loadAsync(
                require('../../assets/audios/checkSound.mp3')
            );

            await illegalSound.loadAsync(
                require('../../assets/audios/illegalMoveSound.mp3')
            );

            await lowOnTimeSound.loadAsync(
                require('../../assets/audios/lowOnTime.mp3')
            );

            moveSoundRef.current = moveSound;
            checkSoundRef.current = checkSound;
            illegalSoundRef.current = illegalSound;
            lowOnTimeSoundRef.current = lowOnTimeSound;
        };

        loadSounds();

        return () => {
            // Do NOT unload on unmount
            // Let Expo AV handle destruction.
            // moveSoundRef.current?.unloadAsync();
            // checkSoundRef.current?.unloadAsync();
            // illegalSoundRef.current?.unloadAsync();
            // lowOnTimeSoundRef.current?.unloadAsync();
            setSol(null)
        };
    }, []);

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



    return (
        <View style={{ flex: 1 }}>
            {(!socket.current || !publicKey || !jwt || !sol || !connected) &&
                <ConnectingToServer message='Connecting to server...' fontsLoaded={fontsLoaded} />
            }

            {(socket.current && publicKey && jwt && sol && connected) &&
                <GameBase
                    width={width}
                    showMessages={showMessages}
                    setShowMessages={setShowMessages}
                    messages={messages}
                    scrollRef={scrollRef}
                    color={color}
                    socket={socket}
                    setMessages={setMessages}
                    jwt={jwt}
                    gameIdRef={gameIdRef}
                    isDevnet={isDevnet}
                    sol={sol}
                    chess={chess}
                    fontsLoaded={fontsLoaded}
                    timer1={timer1}
                    timer2={timer2}
                    gameStarted={gameStarted}
                    gameover={gameover}
                    playLowOnTimeSound={playLowOnTimeSound}
                    moves={moves}
                    from={from}
                    prevFrom={prevFrom}
                    setFrom={setFrom}
                    prevTo={prevTo}
                    playIllegalMoveSound={playIllegalMoveSound}
                    playCheckSound={playCheckSound}
                    lastMessage={lastMessage}
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