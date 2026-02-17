import { FlatList, StyleSheet, Text, View, useWindowDimensions, ImageBackground, Pressable  } from 'react-native'
import React, { useState } from 'react'
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import { MOVE } from '../config/serverResponds';

type Board = ({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)[][]
      
export function ChessBoard(
  {chess, socket, fen, from, setFrom, color}: {
    chess: Chess, 
    socket: WebSocket, 
    fen: string,
    from: Square | null,
    setFrom:  React.Dispatch<React.SetStateAction<Square | null>>
    color: "w" | "b"
  }) {
  const { width, height } = useWindowDimensions();
  
  return (
    <View style={{
      width: width, 
      height: width,
      maxWidth: 642,
      maxHeight: 642
    }}>
      <LinearGradient
        colors={['#B048C2', '#9082DB', '#3DE3B4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >

        <FlatList 
          data={chess.board()}
          keyExtractor={(_, rowIdx) => rowIdx.toString()}
          scrollEnabled={false}
          renderItem={({ item: row, index: rowIdx }) => (
            <FlatList style={{flexDirection: "row"}}
              data={row}
              keyExtractor={(_, colIdx) => `square-${rowIdx}-${colIdx}`}
              scrollEnabled={false}
              renderItem={({ item: piece, index: colIndex }) => {
                const isLight =
                (rowIdx + colIndex) % 2 === 0;

                return (
                  <ImageBackground
                    source={
                      isLight
                        ? require("@/assets/image/white.jpg")
                        : require("@/assets/image/black.jpg")
                    }
                    resizeMode="cover"
                    style={[
                      styles.square,
                      {
                        width: (width - 2) / 8,
                        height: (width - 2) / 8,
                        justifyContent: "center",
                        alignItems: "center",
                        maxHeight: 80,
                        maxWidth: 80,
                        backgroundColor: "#ffffff"
                      },
                    ]}
                    >
                    <Pressable
                      onPress={() => {
                        console.log("hi")
                        if (!piece && !from) return;

                        if (!from && piece) {
                          console.log("from: ", piece.square)
                          setFrom(piece.square);
                          return;
                        }
                        console.log(rowIdx, " ", colIndex)
                        const moveTo = String.fromCharCode('a'.charCodeAt(0)+colIndex)+(8-rowIdx) as Square;
                        console.log("moveTo: ", moveTo)
                        console.log("from: ", from, " ", "to: ", moveTo)
                        console.log("hii",chess.get(moveTo)?.color, " ", color)
                        if (chess.get(moveTo)?.color == color) {
                          console.log("iiiii")
                          setFrom(moveTo);
                          return;
                        }
                        try {
                          let newChess = new Chess(chess.fen())
                          newChess.move({from: from!, to: moveTo})
                          socket.send(JSON.stringify({
                            type: MOVE,
                            payload: {
                              from: from,
                              to: moveTo
                            }
                          }))
                          setFrom(null)
                          return;
                        } catch {
                          setFrom(null);
                        }

                      }}
                      style={{
                        width: (width - 2) / 8,
                        height: (width - 2) / 8,
                        justifyContent: "center",
                        alignItems: "center",
                        maxHeight: 80,
                        maxWidth: 80
                      }}
                    >

                      {piece && (
                        <FontAwesome6
                          name={`chess-${
                            piece.type === "k"
                              ? "king"
                              : piece.type === "q"
                              ? "queen"
                              : piece.type === "r"
                              ? "rook"
                              : piece.type === "b"
                              ? "bishop"
                              : piece.type === "n"
                              ? "knight"
                              : "pawn"
                          }`}
                          size={width > 640 ? 70 : (width - 2) / 10}   // responsive sizing
                          color={piece.color === "b" ? "#B048C2" : "#3DE3B4"}
                          
                        />
                      )}
                    </Pressable>
                  </ImageBackground>
                );
              }}
            />
          )}
        />
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  square: {
    justifyContent: "center",
    alignItems: "center",
  },
  piece: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  }
});