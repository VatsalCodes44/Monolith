import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {ChessBoard} from "@/src/components/ChessBoard"
import { gameState, socketConnection } from '@/src/store/store'
import { GAME_OVER, MOVE } from '@/src/config/serverResponds'

export default function Game() {
  const chess = gameState(s=>s.chess)!
  const socket = socketConnection((s) => s.socket)!
  const [board, setBoard] = useState(chess!.board())

  useEffect(() => {
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case MOVE: 
          const move = message.payload;
          console.log(move)
          chess.move(move);
          setBoard(chess.board());
          break;
        
        case GAME_OVER:
          console.log("game over");
          break;
      }
    }
  }, []);

  return (
    <SafeAreaView>
      <View>
        <ChessBoard board= {board} />
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