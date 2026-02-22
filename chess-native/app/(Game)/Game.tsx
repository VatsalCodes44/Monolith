import { Alert, StyleSheet, View, Text, useWindowDimensions, TouchableOpacity, FlatList, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {ChessBoard} from "@/src/components/ChessBoard"
import { CHECK, GAME_OVER, GAME_OVER_RESPONSE_PAYLOAD, GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD, INIT_GAME, INIT_GAME_RESPONSE_PAYLOAD, MESSAGE, message_payload, MOVE, MOVE_RESPONSE_PAYLOAD, TIME_OUT } from '@/src/config/serverResponds'
import { Chess, Move, Square } from 'chess.js'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'
import { router, useNavigation } from 'expo-router'
import { Orbitron_900Black, useFonts } from '@expo-google-fonts/orbitron'
import { GameBet } from '@/src/stores/gameBet'
import { Timer } from '@/src/components/Timer'
import { Audio } from 'expo-av';
import { useRef } from 'react';
import { LastMessage } from '@/src/components/LastMessage'
import { SendMessage } from '@/src/components/SendMessage'
import { MoveHistory } from '@/src/components/MoveHistory'
import { Captured } from '@/src/components/Captured'
import { ShowMessages } from '@/src/components/ShowMessages'
import { usePreventRemove } from '@react-navigation/native'
import { signedPubkey } from '@/src/stores/gameStore'
import { useWalletStore } from '@/src/stores/wallet-store'
import { INIT_GAME_TYPE_PAYLOAD_TS, INIT_GAME_TYPE_TS, MESSAGE_TYPE_TS } from '@/src/config/serverInputs'

export interface GameOver {
  winner: "b" | "w" | null,
  gameOverType: "checkmate" | "stalemate" | "draw" | "time_out" | null,
  isGameOver: boolean
}

export interface Message {
  from: "w" | "b",
  message: string,
};
export default function Game() {
  const [socket, setSocket] = useState<WebSocket | null> (null);
  const [chess, setChess] = useState(new Chess())
  const [color, setColor] = useState<"w" | "b">("w");
  const [from, setFrom] = useState<Square | null>(null);
  const [prevFrom, setPrevFrom] = useState<Square | null>(null);
  const [prevTo, setPrevTo] = useState<Square | null>(null);
  const [isCheck, setIsCheck] = useState(false)
  const [gameStarted, setGameStarted] = useState(false);
  const [GameOver, setGameOver] = useState<GameOver>({
    winner: null,
    gameOverType: null,
    isGameOver: false
  });
  const [timer1, setTimer1] = useState(10*60*1000);
  const [timer2, setTimer2] = useState(10*60*1000);
  const moveSoundRef = useRef<Audio.Sound | null>(null);
  const checkSoundRef = useRef<Audio.Sound | null>(null);
  const illegalSoundRef = useRef<Audio.Sound | null>(null);
  const lowOnTimeSoundRef = useRef<Audio.Sound | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessage, setLastMessage] = useState<Message>();
  const [moves, setMoves] = useState<Move[]>([]);
  const {height, width} = useWindowDimensions();
  const [showMessages, setShowMessages] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Orbitron_900Black,
  });
  const navigation = useNavigation();
  const setSol = GameBet(s=> s.setSol);
  const sol = GameBet(s => s.sol);
  const signature = signedPubkey(s => s.signature);
  const setSignature = signedPubkey(s => s.setSignature);
  const publicKey = useWalletStore(s => s.publicKey);
  const isDevnet = useWalletStore(s => s.isDevnet)
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
    if (!socket) {
      const ws = new WebSocket(WS_URL);
  
      ws.onopen = () => {
        setSocket(ws);
      };
  
      ws.onclose = () => {
          // Alert.alert("Are you sure want to leave the game ?")
          // setSocket(null);
          // router.replace("/")
      };
  
      ws.onerror = () => {
        setSocket(null);
        // router.replace("/");
      };
  
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const payload = message.payload;
        switch (message.type) {
          case INIT_GAME: 
            const initPayload = payload as INIT_GAME_RESPONSE_PAYLOAD;
            setColor(initPayload.color);
            setChess(new Chess(initPayload.board));
            setGameStarted(true);
            setTimer1(initPayload.timer1);
            setTimer2(initPayload.timer2);
            setGameId(initPayload.gameId);
            setSol(initPayload.sol);
            break;
          case MOVE: 
          const move_response_payload = payload as MOVE_RESPONSE_PAYLOAD;
          let newChess = new Chess(move_response_payload.board)
            setChess(newChess);
            setPrevFrom(move_response_payload.move.from);
            setPrevTo(move_response_payload.move.to);
            setTimer1(move_response_payload.timer1);
            setTimer2(move_response_payload.timer2);
            setMoves(move_response_payload.history)
            playMoveSound()
            break;
            
          // case CHECK:
          //   let checkChess = new Chess(payload.board)
          //   setChess(checkChess);
          //   setPrevFrom(payload.move.from);
          //   setPrevTo(payload.move.to);
          //   setTimer1(payload.timer1);
          //   setTimer2(payload.timer2);
          //   setIsCheck(true);
          //   setMoves(payload.history)
          //   playCheckSound()
          // break;
              
          case GAME_OVER:
            console.log("game over");
            const gameOverPayload = payload as GAME_OVER_RESPONSE_PAYLOAD;
            let gameOverChess = new Chess(gameOverPayload.board)
            setChess(gameOverChess)
            setPrevFrom(gameOverPayload.move.from);
            setPrevTo(gameOverPayload.move.to);
            setMoves(gameOverPayload.history)
            setGameOver({
              winner: gameOverPayload.winner,
              gameOverType: gameOverPayload.gameOverType,
              isGameOver: true
            })
            setTimer1(gameOverPayload.timer1);
            setTimer2(gameOverPayload.timer2);
            break;

          case TIME_OUT:
            console.log("time out");
            const timeOutPayload = payload as GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD;
            setPrevFrom(timeOutPayload.move.from);
            setPrevTo(timeOutPayload.move.to);
            setGameOver({
              winner: timeOutPayload.winner,
              gameOverType: timeOutPayload.gameOverType,
              isGameOver: true
            })
            setTimer1(timeOutPayload.timer1);
            setTimer2(timeOutPayload.timer2);
            setMoves(timeOutPayload.history)
            break;

          case MESSAGE:
            const messagePayload = payload as message_payload;
            setMessages(m => [...m, messagePayload]);
            if (!showMessages) setLastMessage(messagePayload);
            break;
        }
      }
    } else {
      if (!publicKey || !signature || !sol) return;
      const payload: INIT_GAME_TYPE_TS = {
        type: INIT_GAME,
        payload: {
          publicKey,
          signature,
          network: isDevnet ? "DEVNET" : "MAINNET",
          sol: sol
        }
      }
      socket.send(JSON.stringify({
        type: INIT_GAME,
        payload
      }))
    }

    return () => {
    };

  }, [socket]);

  useEffect(() => {
    return () => {
      socket?.close();
    }
  }, [])

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

  usePreventRemove(!GameOver.isGameOver, ({ data }) => {
    
      Alert.alert(
        'Are you sure you want to leave the game?',
        'Please be aware that leaving now will result in the loss of all SOL you have staked in this game.',
        [
          { text: "cancel", style: 'cancel', onPress: () => {} },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.dispatch(data.action),
          },
        ]
      );
  });

  if (!socket) {
    return <ConnectingToServer message='Connecting to the server' />;
  }

  function sendMessage(message: MESSAGE_TYPE_TS) {
    if (!socket) return;
    socket.send(JSON.stringify(message))
    setLastMessage({
      from: message.payload.from,
      message: message.payload.message
    })
  }

  if (!publicKey || !signature || !sol) return null;

  return (
    <SafeAreaView style={{
      flex: 1, 
      backgroundColor: "#000000", 
      paddingVertical: 20,
    }}>

    <ShowMessages
     width= {width * 0.95}
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
                  maxWidth:"80%"
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
          publicKey={publicKey}
          signature={signature}         
          gameId={gameId}
          isDevnet={isDevnet}
          sol={sol}
          />
        </View> :
        <Text style={{color: "#ffffff", fontSize: 25, textAlign: "center", opacity: .3}}>
          No messages 
        </Text>
      }
    </ShowMessages>

      <View style={{paddingHorizontal: 4}}>
        <Timer 
        fontsLoaded={fontsLoaded} 
        timer1={timer1} 
        timer2={timer2}
        turn={chess.turn()}
        gameStarted={gameStarted}
        GameOver={GameOver}
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
          socket={socket} 
          fen={chess.fen()}
          color= {color}
          prevFrom={prevFrom}
          prevTo={prevTo}
          GameOver={GameOver}
          isCheck={isCheck}
          gameStarted={gameStarted}
          playIllegalMoveSound={playIllegalMoveSound}
          playCheckSound={playCheckSound}
          publicKey={publicKey}
          signature= {signature}
          gameId={gameId}
          network={isDevnet ? "DEVNET" : "MAINNET"}
          sol={sol}
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
        publicKey={publicKey}
        signature={signature}
        isDevnet={isDevnet}
        sol={sol}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919"
  },
  avatar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4
  },
  gradient: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    overflow: "hidden",
    marginHorizontal: 15,
    height: 48
  }
})