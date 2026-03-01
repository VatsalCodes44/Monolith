import { FlatList, StyleSheet, Text, View, useWindowDimensions, ImageBackground, Pressable, Touchable, ViewStyle } from 'react-native'
import React from 'react'
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { LinearGradient } from 'expo-linear-gradient';
import { Piece } from './Piece';

type Piece = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)

export function StaticChessBoard(
{ 
    chess,
    color
}: {
    chess: Chess,
    color: "b" | "w"

}) {
  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(width, 642);
  

  return (
    <View>
      <View style={{ position: 'relative' }}>
        <View style={{
          width: boardSize,
          height: boardSize,
          maxWidth: 642,
          maxHeight: 642,
          transform: [{ rotate: color == "b" ? "180deg" : "0deg" }]
        }}>
          <LinearGradient
            colors={color == "w" ? ["#B048C2", "#9082DB", "#3DE3B4"] : ["#3DE3B4", "#9082DB", "#B048C2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >

            <FlatList
              data={chess.board()}
              keyExtractor={(_, rowIdx) => rowIdx.toString()}
              scrollEnabled={false}
              renderItem={({ item: row, index: rowIdx }) => (
                <FlatList style={{ flexDirection: "row" }}
                  data={row}
                  keyExtractor={(_, colIdx) => `square-${rowIdx}-${colIdx}`}
                  scrollEnabled={false}
                  renderItem={({ item: piece, index: colIdx }) => {

                    const isLight = (rowIdx + colIdx) % 2 === 0;
                    const squareName = String.fromCharCode("a".charCodeAt(0) + colIdx) +
                      (8 - rowIdx);

                    return (
                      <Block color={color}
                        rowIdx={rowIdx}
                        colIdx={colIdx}
                        isLight={isLight}
                        piece={piece}
                        width={width}
                      />
                    );
                  }}
                />
              )}
            />
          </LinearGradient>
        </View>
      </View>
    </View>
  )
}


function Check({
  width,
  onPress,
  piece,
  rowIdx,
  colIdx,
  color,
}: {
  width: number;
  onPress: (piece: Piece, rowIdx: number, colIdx: number) => void;
  piece: Piece;
  rowIdx: number;
  colIdx: number;
  color: "b" | "w";
}) {

  const squareSize = Math.min(width, 640) / 8;
  const pieceSize = squareSize * 0.85;

  return (
    <View
      style={[
        styles.square,
        {
          width: squareSize,
          height: squareSize,
          backgroundColor: "#fe0000",
        },
      ]}
    >
      <Pressable
        onPress={() => {
          onPress(piece, rowIdx, colIdx);
        }}
        style={[
          styles.pressable,
          {
            width: squareSize,
            height: squareSize,
          },
        ]}
      >
        {piece && (
          <Piece
            piece={piece}
            width={pieceSize}
            color={color}
          />
        )}
      </Pressable>
    </View>
  );
}



function Block({
  width,
  piece,
  rowIdx,
  colIdx,
  color,
  isLight,
}: {
  width: number;
  piece: Piece;
  rowIdx: number;
  colIdx: number;
  color: "b" | "w";
  isLight: boolean;
}) {
  const squareSize = Math.min(width, 640) / 8;
  const pieceSize = squareSize * 0.95;
  const squareName = String.fromCharCode("a".charCodeAt(0) + colIdx) +
    (8 - rowIdx);

  const squareProps = isLight
    ? {
      style: [
        styles.square,
        {
          width: squareSize,
          height: squareSize,
          backgroundColor: "#1A1A1A", // 🔳 Light square
        },
      ],
    }
    : {
      colors: ["#9945FF", "#14F195"], // 🟪 Solana gradient
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      style: [
        styles.square,
        {
          width: squareSize,
          height: squareSize,
        },
      ],
    };

  return isLight ? (
    <LinearGradient
      colors={color == "w" ? ["#B048C2", "#9082DB", "#3DE3B4"] : ["#3DE3B4", "#9082DB", "#B048C2"]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: squareSize,
        height: squareSize,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        style={{
          width: squareSize,
          height: squareSize,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {piece && (
          <Piece piece={piece} width={pieceSize} color={color} />
        )}
      </Pressable>
    </LinearGradient>
  ) : (
    <View
      style={{
        width: squareSize,
        height: squareSize,
        backgroundColor: "#1A1028", // clean dark block
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        style={{
          width: squareSize,
          height: squareSize,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {piece && (
          <Piece piece={piece} width={pieceSize} color={color} />
        )}
      </Pressable>
    </View>
  );
}





const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  square: {
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 80,
    maxWidth: 80,
  },
  piece: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gradient: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressable: {
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 80,
    maxWidth: 80
  }
});
