import { StyleSheet, View, Text, useWindowDimensions, ScrollView } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
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
  TIME_OUT
} from '@/src/config/serverResponds'
import { Chess, Move, Square } from 'chess.js'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'
import { GameBet } from '@/src/stores/gameBet'
import { Timer } from '@/src/components/Timer'
import { Audio } from 'expo-av'
import { LastMessage } from '@/src/components/LastMessage'
import { SendMessage } from '@/src/components/SendMessage'
import { MoveHistory } from '@/src/components/MoveHistory'
import { Captured } from '@/src/components/Captured'
import { ShowMessages } from '@/src/components/ShowMessages'
import { useWalletStore } from '@/src/stores/wallet-store'
import { INIT_GAME_TYPE_TS, MESSAGE_TYPE_TS } from '@/src/config/serverInputs'

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
  const [gameId, setGameId] = useState<string | null>(null)
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

  const [gameover, setGameOver] = useState<GameOver>({
    winner: null,
    gameOverType: null,
    isGameOver: false
  })

  const { width } = useWindowDimensions()

  const setSol = GameBet(s => s.setSol)
  const sol = "0.01"

  const isDevnet = useWalletStore(s => s.isDevnet)

  const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNLZXkiOiI2a25CQlVSUWNpMW5Na24xRlFtM0NOR2tVWmtLVjNTTHNuODhueUF0TldXbyIsImlhdCI6MTc3MjEwNjUwM30.Xf_Tnl1uDvyO3knbSAHij6KEHQhkReaKKcFXvzQ2esQ"
  const publicKey = "6knBBURQci1nMkn1FQm3CNGkUZkKV3SLsn88nyAtNW"

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
      moveSoundRef.current?.unloadAsync();
      checkSoundRef.current?.unloadAsync();
      illegalSoundRef.current?.unloadAsync();
      lowOnTimeSoundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {

    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      const payload: INIT_GAME_TYPE_TS = {
        type: INIT_GAME,
        payload: {
          jwt,
          network: isDevnet ? "DEVNET" : "MAINNET",
          sol
        }
      }

      ws.send(JSON.stringify(payload))
      socket.current = ws
      setConnected(true)
    }

    ws.onclose = () => {
      console.log("WebSocket closed")
      socket.current = null
    }

    ws.onerror = (err) => {
      console.log("WebSocket error", err)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const payload = message.payload

      switch (message.type) {

        case INIT_GAME:
          const init = payload as INIT_GAME_RESPONSE_PAYLOAD
          setColor(init.color)
          setChess(new Chess(init.board))
          setGameStarted(true)
          setTimer1(init.timer1)
          setTimer2(init.timer2)
          setGameId(init.gameId)
          setSol(init.sol)
          break

        case MOVE:
          const movePayload = payload as MOVE_RESPONSE_PAYLOAD
          setChess(new Chess(movePayload.board))
          setPrevFrom(movePayload.move.from)
          setPrevTo(movePayload.move.to)
          setTimer1(movePayload.timer1)
          setTimer2(movePayload.timer2)
          setMoves(movePayload.history)
          break

        case GAME_OVER:
          const gameOver = payload as GAME_OVER_RESPONSE_PAYLOAD
          setChess(new Chess(gameOver.board))
          setPrevFrom(gameOver.move.from)
          setPrevTo(gameOver.move.to)
          setMoves(gameOver.history)
          setGameOver({
            winner: gameOver.winner,
            gameOverType: gameOver.gameOverType,
            isGameOver: true
          })
          break

        case TIME_OUT:
          const timeout = payload as GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD
          setPrevFrom(timeout.move.from)
          setPrevTo(timeout.move.to)
          setMoves(timeout.history)
          setGameOver({
            winner: timeout.winner,
            gameOverType: timeout.gameOverType,
            isGameOver: true
          })
          break

        case MESSAGE:
          const msg = payload as message_payload
          setMessages(m => [...m, msg])
          setLastMessage(msg)
          break
      }
    }

    return () => {
      ws.close()
    }

  }, [])


  // // ---------------- MESSAGE SEND ----------------
  const sendMessage = (message: MESSAGE_TYPE_TS) => {
    if (!socket) return
    socket.current?.send(JSON.stringify(message))
  }




  // ---------------- UI ----------------
  return (
    <View style={{ flex: 1 }}>
      {(!socket.current || !publicKey || !jwt || !sol) &&
        <ConnectingToServer message='Connecting to server...' fontsLoaded={true} />
      }

      {(socket.current && publicKey && jwt && sol) &&
        <SafeAreaView style={{
          flex: 1,
          backgroundColor: "#000000",
          paddingVertical: 20,
        }}>

          <ShowMessages
            width={width * 0.95}
            isOpen={showMessages}
            onClose={() => {
              setShowMessages(false);
            }} >
            {
              messages.length > 0 ?
                <View style={{ height: 450, gap: 15 }}>
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    {messages.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          justifyContent: color == item.from ? "flex-end" : "flex-start",
                          marginVertical: 8
                        }}
                      >
                        <Text style={{
                          color: "#ffffff",
                          backgroundColor: color == item.from ? "#3DE3B4" : "#B048C2",
                          paddingVertical: 2,
                          paddingHorizontal: 8,
                          borderRadius: 8,
                          fontSize: 18,
                          maxWidth: "80%"
                        }}>
                          {item.message}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                  <SendMessage
                    sendMessage={sendMessage}
                    setMessages={setMessages}
                    color={color}
                    setShowMessages={setShowMessages}
                    showMenuIcon={false}
                    jwt={jwt}
                    gameId={gameId}
                    isDevnet={isDevnet}
                    sol={sol}
                  />
                </View> :
                <Text style={{ color: "#ffffff", fontSize: 25, textAlign: "center", opacity: .3 }}>
                  No messages
                </Text>
            }
          </ShowMessages>

          <View style={{ paddingHorizontal: 4 }}>
            <Timer
              fontsLoaded={true}
              timer1={timer1}
              timer2={timer2}
              turn={chess.turn()}
              gameStarted={gameStarted}
              GameOver={gameover}
              playLowOnTimeSound={playLowOnTimeSound}
              color={color}
            />
          </View>
          <View style={{
            height: 60,
            marginVertical: 4,
            width: "100%",
          }}>
            <Captured moves={moves} color={color} />
          </View>

          <View style={{
            justifyContent: "center",
            alignItems: "center"
          }}>
            <View style={{
              height: 60,
              marginVertical: 4,
              width: "100%",
            }}>
              <MoveHistory moves={moves} />
            </View>
            <ChessBoard
              chess={chess}
              from={from}
              setFrom={setFrom}
              socket={socket.current}
              color={color}
              prevFrom={prevFrom}
              prevTo={prevTo}
              GameOver={gameover}
              gameStarted={gameStarted}
              playIllegalMoveSound={playIllegalMoveSound}
              playCheckSound={playCheckSound}
              gameId={gameId}
              network={isDevnet ? "DEVNET" : "MAINNET"}
              sol={sol}
              jwt={jwt}
            />
          </View>

          <View style={{
            marginHorizontal: 15,
            gap: 10,
            height: 60,
            justifyContent: "flex-end",
            flex: 1
          }}>
            {lastMessage && <LastMessage color={color} lastMessage={lastMessage} width={width} />}
            <SendMessage
              sendMessage={sendMessage}
              setMessages={setMessages}
              color={color}
              setShowMessages={setShowMessages}
              showMenuIcon={true}
              gameId={gameId}
              jwt={jwt}
              isDevnet={isDevnet}
              sol={sol}
            />
          </View>
        </SafeAreaView>
      }
    </View>
  )
}

const styles = StyleSheet.create({})