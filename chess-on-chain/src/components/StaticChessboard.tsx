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
                        chess={chess}
                        moves={null}
                        onPress={() => {}}
                        prevFrom={""}
                        prevTo={""}
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



function Block({
  width,
  onPress,
  piece,
  rowIdx,
  colIdx,
  color,
  isLight,
  moves,
  chess,
  prevFrom,
  prevTo,
}: {
  width: number;
  onPress: (piece: any, rowIdx: number, colIdx: number) => void;
  piece: any;
  rowIdx: number;
  colIdx: number;
  color: "b" | "w";
  isLight: boolean;
  moves: string[] | null;
  chess: Chess;
  prevFrom: string | null;
  prevTo: string | null;
}) {
  const squareSize = Math.min(width, 640) / 8;
  const pieceSize = squareSize * 0.95;

  const squareName =
    String.fromCharCode("a".charCodeAt(0) + colIdx) + (8 - rowIdx);

  const isPossibleMove = moves?.includes(squareName);

  const isKingInCheck =
    chess.inCheck() &&
    piece?.type === "k" &&
    piece?.color === chess.turn();

  const isPreviousSquare =
    squareName === prevFrom || squareName === prevTo;

  const baseStyle: ViewStyle = {
    width: squareSize,
    height: squareSize,
    justifyContent: "center",
    alignItems: "center",
  };

  const borderStyle: ViewStyle = isPreviousSquare
    ? {
        borderWidth: 6,
        borderColor: "#ffffff",
      }
    : {};

  const backgroundColor = isKingInCheck
    ? "#fe0000"
    : !isLight
    ? "#1A1028"
    : undefined;

  const renderContent = () => (
    <Pressable
      onPress={() => onPress(piece, rowIdx, colIdx)}
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

      {isPossibleMove && (
        <View
          style={{
            position: "absolute",
            width: squareSize * 0.5,
            height: squareSize * 0.5,
            borderRadius: (squareSize * 0.5) / 2,
            backgroundColor: isLight
              ? "rgba(0,0,0,0.25)"
              : "rgba(255,255,255,0.25)",
          }}
        />
      )}
    </Pressable>
  );

  // 🌈 Light square
  if (isLight && !isKingInCheck) {
    return (
      <LinearGradient
        colors={
          color === "w"
            ? ["#B048C2", "#9082DB", "#3DE3B4"]
            : ["#3DE3B4", "#9082DB", "#B048C2"]
        }
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, borderStyle]}
      >
        {renderContent()}
      </LinearGradient>
    );
  }

  // 🌑 Dark square OR 🔴 Check square
  return (
    <View
      style={[
        baseStyle,
        { backgroundColor },
        borderStyle,
      ]}
    >
      {renderContent()}
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
