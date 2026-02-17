import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {ChessBoard} from "@/src/components/ChessBoard"
import { gameState, socketConnection } from '@/src/store/store'
import { CHECK, GAME_OVER, MOVE } from '@/src/config/serverResponds'
import { Chess } from 'chess.js'
export default function Game() {
  const chess = gameState(s=>s.chess)!
  const setChess = gameState(s=>s.setChess)!
  const socket = socketConnection((s) => s.socket)!

  useEffect(() => {
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case MOVE: 
          const payload = message.payload;
          console.log(payload.move)
          console.log("Received board:", message.payload.board);
          // chess.move(payload.move);
          let newChess = new Chess(payload.board)
          setChess(newChess);
          break;
        
        case CHECK:
          console.log("check");
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
        <ChessBoard board={chess.board()} socket={socket} fen={chess.fen()} />
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