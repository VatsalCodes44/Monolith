import { Alert, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {ChessBoard} from "@/src/components/ChessBoard"
import { CHECK, GAME_OVER, INIT_GAME, MOVE } from '@/src/config/serverResponds'
import { Chess, Square } from 'chess.js'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'
import { router } from 'expo-router'

export interface GameOver {
  winner: "b" | "w" | null,
  gameOverType: "checkmate" | "stalemate" | "draw" | null,
  isGameOver: boolean
}

export default function Game() {
  const [socket, setSocket] = useState<WebSocket | null> (null);
  const [chess, setChess] = useState(new Chess())
  const [color, setColor] = useState<"w" | "b">("w");
  const [from, setFrom] = useState<Square | null>(null);
  const [prevFrom, setPrevFrom] = useState<Square | null>(null);
  const [prevTo, setPrevTo] = useState<Square | null>(null);
  const [isCheck, setIsCheck] = useState(false)
  const [GameOver, setGameOver] = useState<GameOver>({
    winner: null,
    gameOverType: null,
    isGameOver: false
  });

  useEffect(() => {
    if (!socket) {
      const ws = new WebSocket(WS_URL);
  
      ws.onopen = () => {
          setSocket(ws);
      };
  
      ws.onclose = () => {
          Alert.alert("Are you sure want to leave the game ?")
          setSocket(null);
          router.replace("/")
      };
  
      ws.onerror = () => {
        setSocket(null);
          router.replace("/");
      };
  
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const payload = message.payload;
        switch (message.type) {
          case INIT_GAME: 
            setColor(payload.color);
            setChess(new Chess(payload.board))
            break;
          case MOVE: 
            let newChess = new Chess(payload.board)
            setChess(newChess);
            setPrevFrom(payload.move.from);
            setPrevTo(payload.move.to);
            break;
          
          case CHECK:
            let checkChess = new Chess(payload.board)
            setChess(checkChess);
            setPrevFrom(payload.move.from);
            setPrevTo(payload.move.to);
            setIsCheck(true)
            break;
  
          case GAME_OVER:
            console.log("game over");
            let gameOver = new Chess(payload.board)
            setChess(gameOver)
            setPrevFrom(payload.move.from);
            setPrevTo(payload.move.to);
            setGameOver({
              winner: payload.winner,
              gameOverType: payload.gameOverType,
              isGameOver: true
            })
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

  if (!socket) {
    return <ConnectingToServer />;
  }


  return (
    <SafeAreaView>
      <View style={{
        flexDirection: "row",
        justifyContent: "center"
      }}>
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
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919"
  }
})