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

export function ChessBoard({board, socket, fen}: {board: Board, socket: WebSocket, fen: string}) {
  const { width, height } = useWindowDimensions();
  const [from, setFrom] = useState<string | undefined>(undefined)
  
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
          data={board}
          keyExtractor={(_, rowIdx) => rowIdx.toString()}
          scrollEnabled={false}
          renderItem={({ item: row, index: rowIdx }) => (
            <FlatList style={{flexDirection: "row"}}
              data={row}
              keyExtractor={(_, colIdx) => `square-${rowIdx}-${colIdx}`}
              scrollEnabled={false}
              renderItem={({ item: square, index: colIndex }) => {
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
                        maxWidth: 80
                      },
                    ]}
                    >
<Pressable
  onPress={() => {
    console.log("Clicked:", square?.square, "from:", from);
console.log("Current FEN:", fen);

    if (!square) return;

    if (!from) {
      setFrom(square.square);
      return;
    }

    const moveTo = square.square;

    if (from === moveTo) {
      setFrom(undefined);
      return;
    }

    const game = new Chess(fen);

    let isValid = false;

    try {
      game.move({ from, to: moveTo });
      isValid = true;
    } catch {
      isValid = false;
    }

    if (!isValid) {
      setFrom(undefined);
      return;
    }

    // ✅ SEND MOVE TO SERVER
    socket.send(
      JSON.stringify({
        type: MOVE,
        payload: {
          from,
          to: moveTo,
        },
      })
    );

    setFrom(undefined);
  }}
>

                      {square && (
                        <FontAwesome6
                          name={`chess-${
                            square.type === "k"
                              ? "king"
                              : square.type === "q"
                              ? "queen"
                              : square.type === "r"
                              ? "rook"
                              : square.type === "b"
                              ? "bishop"
                              : square.type === "n"
                              ? "knight"
                              : "pawn"
                          }`}
                          size={width > 640 ? 70 : (width - 2) / 10}   // responsive sizing
                          color={square.color === "b" ? "#B048C2" : "#3DE3B4"}
                          
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