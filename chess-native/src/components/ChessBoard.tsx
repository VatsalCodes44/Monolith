import { FlatList, StyleSheet, Text, View, useWindowDimensions, ImageBackground  } from 'react-native'
import React from 'react'
import { Color, PieceSymbol, Square } from 'chess.js';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

type Board = ({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)[][]

export function ChessBoard({board}: {board: Board}) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={{width: width, height: width}}>
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
                      },
                    ]}
                  >
                    {square && (
                      <FontAwesome5
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
                        size={(width - 2) / 10}   // responsive sizing
                        color={square.color === "b" ? "#B048C2" : "#3DE3B4"}
                      />
)}
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