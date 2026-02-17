import { Alert, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {ChessBoard} from "@/src/components/ChessBoard"
import { CHECK, GAME_OVER, INIT_GAME, MOVE } from '@/src/config/serverResponds'
import { Chess, Square } from 'chess.js'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'
import { router } from 'expo-router'


export default function Game() {
  const [socket, setSocket] = useState<WebSocket | null> (null);
  const [chess, setChess] = useState(new Chess())
  const [color, setColor] = useState<"w" | "b">("w");
  const [from, setFrom] = useState<Square | null>(null);
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
            console.log(payload)
            setColor(payload.color);
            setChess(new Chess(payload.board))
            break;
          case MOVE: 
            console.log(payload.move)
            console.log("Received board:", message.payload.board);
            // chess.move(payload.move);
            let newChess = new Chess(payload.board)
            setChess(newChess);
            break;
          
          case CHECK:
            console.log("check");
            console.log(payload.move)
            console.log("Received board:", message.payload.board);
            // chess.move(payload.move);
            let checkChess = new Chess(payload.board)
            setChess(checkChess);
            break;
  
          case GAME_OVER:
            console.log("game over");
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
      <View>
        <ChessBoard
          chess={chess}
          from={from} 
          setFrom={setFrom} 
          socket={socket} 
          fen={chess.fen()}
          color= {color}
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