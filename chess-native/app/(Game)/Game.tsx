import { Alert, StyleSheet, View, Text, useWindowDimensions, TouchableOpacity, FlatList, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {ChessBoard} from "@/src/components/ChessBoard"
import { CHECK, GAME_OVER, INIT_GAME, MESSAGE, MOVE, TIME_OUT } from '@/src/config/serverResponds'
import { Chess, Move, Square } from 'chess.js'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'
import { router } from 'expo-router'
import { Avatar, YStack } from 'tamagui'
import { Orbitron_900Black, useFonts } from '@expo-google-fonts/orbitron'
import { GameBet } from '@/src/store/store'
import { Timer } from '@/src/components/Timer'
import { Audio } from 'expo-av';
import { useRef } from 'react';
import { LastMessage } from '@/src/components/LastMessage'
import { Messages } from '@/src/components/Message'
import { MoveHistory } from '@/src/components/MoveHistory'
import { Captured } from '@/src/components/Captured'
import { ShowMessages } from '@/src/components/ShowMessages'

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
  const [timer1, setTimer1] = useState(10*60*1000)
  const [timer2, setTimer2] = useState(10*60*1000)
  const moveSoundRef = useRef<Audio.Sound | null>(null);
  const checkSoundRef = useRef<Audio.Sound | null>(null);
  const illegalSoundRef = useRef<Audio.Sound | null>(null);
  const lowOnTimeSoundRef = useRef<Audio.Sound | null>(null);
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMessage, setLastMessage] = useState<Message>();
  const [moves, setMoves] = useState<Move[]>([])
  const {height, width} = useWindowDimensions()
  const [showMessages, setShowMessages] = useState(false)
  const [fontsLoaded] = useFonts({
    Orbitron_900Black,
  });
  const sol = GameBet(s=> s.sol)

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
            setColor(payload.color);
            setChess(new Chess(payload.board));
            setGameStarted(true);
            break;
          case MOVE: 
            let newChess = new Chess(payload.board)
            console.log(payload.board)
            setChess(newChess);
            setPrevFrom(payload.move.from);
            setPrevTo(payload.move.to);
            setTimer1(payload.timer1);
            setTimer2(payload.timer2);
            setMoves(payload.history)
            playMoveSound()
            break;
            
          case CHECK:
            let checkChess = new Chess(payload.board)
            setChess(checkChess);
            setPrevFrom(payload.move.from);
            setPrevTo(payload.move.to);
            setTimer1(payload.timer1);
            setTimer2(payload.timer2);
            setIsCheck(true);
            setMoves(payload.history)
            playCheckSound()
          break;
              
        case GAME_OVER:
          console.log("game over");
          let gameOverChess = new Chess(payload.board)
          setChess(gameOverChess)
          setPrevFrom(payload.move.from);
          setPrevTo(payload.move.to);
          setMoves(payload.history)
          setGameOver({
            winner: payload.winner,
            gameOverType: payload.gameOverType,
            isGameOver: true
          })
          setTimer1(payload.timer1);
          setTimer2(payload.timer2);
          break;

          case TIME_OUT:
            console.log("time out");
            setPrevFrom(payload.move.from);
            setPrevTo(payload.move.to);
            setGameOver({
              winner: payload.winner,
              gameOverType: payload.gameOverType,
              isGameOver: true
            })
            setTimer1(payload.timer1);
            setTimer2(payload.timer2);
            setMoves(payload.history)
            break;
          case MESSAGE:
            setMessages(m => [...m, payload]);
            setLastMessage(payload);
            break;
        }
      }
    } else {
      socket.send(JSON.stringify({
        type: INIT_GAME
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


  if (!socket) {
    return <ConnectingToServer />;
  }

  function sendMessage(message:Message) {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: MESSAGE,
      payload: {...message}
    }))
    setLastMessage(message)
  }

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
        <ScrollView>
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
                backgroundColor: color == item.from ? "#B048C2" : "#3DE3B4",
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 8,
                fontSize: 18
              }}>
                {item.message}
              </Text>
            </View>
          ))}
        </ScrollView> :
        <Text style={{color: "#ffffff", fontSize: 25, textAlign: "center"}}>
          No messages 
        </Text>
      }
    </ShowMessages>

      <View style={styles.avatar}>

        <Avatar circular size="$3">
          <Avatar.Image src="http://picsum.photos/200/300" />
          <Avatar.Fallback />
        </Avatar>

        <Text style={{
          color: "#ffffff", 
          fontFamily: fontsLoaded ? "Orbitron_900Black": "Roboto",
          fontSize: 18
        }}>
          {0.2} Sol
        </Text>

        <Avatar circular size="$3">
          <Avatar.Image src="http://picsum.photos/200/300" />
          <Avatar.Fallback />
        </Avatar>

      </View>

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
          playIllegalMoveSound={ playIllegalMoveSound}
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
        <Messages sendMessage={sendMessage} color={color} setShowMessages={setShowMessages} />
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