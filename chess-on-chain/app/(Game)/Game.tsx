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
import { Chess, Move, Square } from 'chess.js'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'
import { GameBet } from '@/src/stores/gameBet'
import { useWalletStore } from '@/src/stores/wallet-store'
import { INIT_GAME_TYPE_TS, Re_JOIN_GAME_TYPE_TS } from '@/src/config/serverInputs'
import { jwtStore } from '@/src/stores/jwt'
import { GameBase } from '@/src/components/GameBase'
import { router } from 'expo-router'

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
  
  // const [fontsLoaded] = useFonts({
  //   Orbitron_900Black,
  // });
  const fontsLoaded = true;
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

  const onInitGameResponse = useCallback((payload: INIT_GAME_RESPONSE_PAYLOAD) => {
    setColor(payload.color)
    setChess(new Chess(payload.board))
    setGameStarted(true)
    setTimer1(payload.timer1)
    setTimer2(payload.timer2)
    gameIdRef.current = payload.gameId
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
    // playMoveSound()
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
  }, [jwt, isDevnet])

  const onMessageResponse = useCallback((payload: message_payload) => {
    setMessages(m => [...m, payload])
    setLastMessage(payload)
  }, [])

  

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
        <ConnectingToServer message='Connecting to server...' fontsLoaded={fontsLoaded} />
      }

      {(socket.current && publicKey && jwt && sol && connected) &&
        <GameBase
          spectator={false}
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
          moves={moves}
          from={from}
          prevFrom={prevFrom}
          setFrom={setFrom}
          prevTo={prevTo}
          lastMessage={lastMessage}
          player1Pubkey={publicKey}
          player2Pubkey={opponentPubkey}
          gameType='NORMAL'
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