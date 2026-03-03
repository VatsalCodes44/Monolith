import { StyleSheet, View, Text, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChessBoard } from "@/src/components/ChessBoard"
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
} from '@/src/config/serverResponds'
import { Audio } from 'expo-av'
import { Chess, Move, Square } from 'chess.js'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'
import { GameBet } from '@/src/stores/gameBet'
import { useWalletStore } from '@/src/stores/wallet-store'
import { INIT_GAME_TYPE_TS, Re_JOIN_GAME_TYPE_TS } from '@/src/config/serverInputs'
import { jwtStore } from '@/src/stores/jwt'
import { GameBase } from '@/src/components/GameBase'
import { router, useLocalSearchParams } from 'expo-router'
import { GAME_STATE, Message } from '@/src/config/game'

export default function Game() {
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
    const { gameId, sol, network } = useLocalSearchParams<{ 
        gameId: "null" | string,
        sol: "0.01" | "0.05" | "0.1",
        network: "MAINNET" | "DEVNET"
    }>();
    const isDevnet = useRef(network == "DEVNET" ? true : false);
    const socket = useRef<WebSocket | null>(null);
    const [gameStarted, setGameStarted] = useState(false)
    const gameIdRef = useRef<string | null>(gameId == "null" ? null : gameId)
    const isMountedRef = useRef(true);
    const [lastMessage, setLastMessage] = useState<Message>()
    const [showMessages, setShowMessages] = useState(false)
    const [messages, setMessages] = useState<Message[]>([]);
    const [connected, setConnected] = useState(false)
    const gameOverRef = useRef(false)
    const reconnectTimeoutRef = useRef<number | null>(null)
    const scrollRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions()
    const setSol = GameBet(s => s.setSol)
    const jwt = jwtStore(s => s.jwt)
    const publicKey = useWalletStore(s => s.publicKey)
    const moveSoundRef = useRef<Audio.Sound | null>(null);
    const checkSoundRef = useRef<Audio.Sound | null>(null);
    const illegalSoundRef = useRef<Audio.Sound | null>(null);
    const lowOnTimeSoundRef = useRef<Audio.Sound | null>(null);

    const onInitGameResponse = useCallback((payload: INIT_GAME_RESPONSE_PAYLOAD) => {
        setGameState(p => ({
            ...p,
            color: payload.color,
            chess: new Chess(payload.board),
            timer1: payload.timer1,
            timer2: payload.timer2,
            opponentPubkey: payload.opponentPubkey
        }))
        setGameStarted(true)
        gameIdRef.current = payload.gameId
    }, [])

    const onMoveResponse = useCallback((payload: MOVE_RESPONSE_PAYLOAD) => {
        setGameState(p => ({
            ...p,
            chess: new Chess(payload.board),
            prevFrom: payload.move.from,
            prevTo: payload.move.to,
            timer1: payload.timer1,
            timer2: payload.timer2,
            moves: payload.history,
        }))
        playMoveSound();
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

    const onReJoinGameResponse = useCallback((payload: Re_JOIN_GAME_RESPONSE_PAYLOAD) => {
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
        setSol(payload.sol)
    }, [])

    const onMessageResponse = useCallback((payload: message_payload) => {
        setMessages(p => [...p, payload]);
        setLastMessage(payload)
    }, [])

    const connect = useCallback(() => {
        if (socket.current?.readyState === WebSocket.CONNECTING ||
            socket.current?.readyState === WebSocket.OPEN) {
            console.log("Already connecting/connected, skipping");
            return;
        }
        if (!jwt || !sol) {
            router.replace("/");
            return;
        }
        const ws = new WebSocket(WS_URL)

        ws.onopen = () => {
            console.log("gameIdRef.current:", gameIdRef.current)
            if (!jwt || !sol) {
                console.log("here1")
                ws.close();
                return;
            }
            socket.current = ws
            setConnected(true)
            if (gameIdRef.current) {
                console.log("here2")
                const payload: Re_JOIN_GAME_TYPE_TS = {
                    type: RE_JOIN_GAME,
                    payload: {
                        gameId: gameIdRef.current,
                        network: isDevnet.current ? "DEVNET" : "MAINNET",
                        sol,
                        jwt
                    }
                }
                ws.send(JSON.stringify(payload))
            } 
            else {
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
                connect()
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
    }, [jwt, isDevnet])

    const playMoveSound = useCallback(async () => {
        if (!moveSoundRef.current) return;

        try {
            await moveSoundRef.current.stopAsync();
            await moveSoundRef.current.setPositionAsync(0);
            await moveSoundRef.current.playAsync();
        } catch (err) {
            console.log("Move sound error:", err);
        }
    }, []);

    const playCheckSound = useCallback(async () => {
        if (!checkSoundRef.current) return;

        try {
            await checkSoundRef.current.stopAsync();
            await checkSoundRef.current.setPositionAsync(0);
            await checkSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    }, []);

    const playIllegalMoveSound = useCallback(async () => {
        if (!illegalSoundRef.current) return;

        try {
            await illegalSoundRef.current.stopAsync();
            await illegalSoundRef.current.setPositionAsync(0);
            await illegalSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    }, []);

    const playLowOnTimeSound = useCallback(async () => {
        if (!lowOnTimeSoundRef.current) return;

        try {
            await lowOnTimeSoundRef.current.stopAsync();
            await lowOnTimeSoundRef.current.setPositionAsync(0);
            await lowOnTimeSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    }, []);

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
            require('../../../assets/audios/moveSound.mp3')
            );

            await checkSound.loadAsync(
            require('../../../assets/audios/checkSound.mp3')
            );

            await illegalSound.loadAsync(
            require('../../../assets/audios/illegalMoveSound.mp3')
            );

            await lowOnTimeSound.loadAsync(
            require('../../../assets/audios/lowOnTime.mp3')
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
        };
    }, []);

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
            setSol(null)
        }
    }, [])



  return (
    <View style={{ flex: 1 }}>
      {(!socket.current || !publicKey || !jwt || !sol || !connected) &&
        <ConnectingToServer message='Connecting to server...' />
      }

      {(socket.current && publicKey && jwt && sol && connected) &&
        <GameBase
          setLastMessage={setLastMessage}
          spectator={false}
          width={width}
          showMessages={showMessages}
          setShowMessages={setShowMessages}
          scrollRef={scrollRef}
          socket={socket}
          jwt={jwt}
          gameIdRef={gameIdRef}
          isDevnet={isDevnet.current}
          sol={sol}
          gameStarted={gameStarted}
          lastMessage={lastMessage}
          player1Pubkey={publicKey}
          gameType='NORMAL'
          messages={messages}
          setMessages={setMessages}
          gameState={gameState}
          setGameState={setGameState}
          playCheckSound={playCheckSound}
          playIllegalMoveSound={playIllegalMoveSound}
          playLowOnTimeSound={playLowOnTimeSound}
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