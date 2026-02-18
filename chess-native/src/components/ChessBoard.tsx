import { FlatList, StyleSheet, Text, View, useWindowDimensions, ImageBackground, Pressable, Touchable  } from 'react-native'
import React, { useState } from 'react'
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { MOVE } from '../config/serverResponds';
import { GameOver } from '@/app/(Game)/Game';

type Piece = ({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)
      
export function ChessBoard(
  {chess, 
   socket, 
   fen, 
   from, 
   setFrom, 
   color, 
   prevFrom, 
   prevTo,
   GameOver,
   isCheck,
   gameStarted,
   playIllegalMoveSound,
  }:{
    chess: Chess, 
    socket: WebSocket, 
    fen: string,
    from: Square | null,
    setFrom:  React.Dispatch<React.SetStateAction<Square | null>>,
    color: "w" | "b",
    prevFrom: Square | null,
    prevTo: Square | null,
    GameOver: GameOver,
    isCheck: boolean,
    gameStarted: boolean,
    playIllegalMoveSound: () => Promise<void>
  }) {
  const { width, height } = useWindowDimensions();
  const [showPromotionOptions, setShowPromotionOptions] = useState(false)
  const [promotionPiece, setPromotionPiece] = useState<"q" | "r" | "b" | "k">("q");

  const onPress = (piece: Piece, rowIdx: number, colIdx: number) => {
    if (GameOver.isGameOver || !gameStarted) return;
    if (!piece && !from) return;
    if (!from && piece) {
      setFrom(piece.square);
      return;
    }

    const moveTo = String.fromCharCode('a'.charCodeAt(0)+colIdx)+(8-rowIdx) as Square;

    if (chess.get(moveTo)?.color == color) {
      setFrom(moveTo);
      return;
    }

    try {
      let newChess = new Chess(chess.fen())
      let fromPiece = newChess.get(from!)

      // checking for pawn promotion
      const isPromotion =
        fromPiece?.type === "p" &&
        ((fromPiece.color === "w" && moveTo[1] === "8") || 
        (fromPiece.color === "b" && moveTo[1] === "1"));
      if (isPromotion && !showPromotionOptions) {
        setShowPromotionOptions(true);
        return;
      }
      const move = isPromotion ? 
      newChess.move({from: from!, to: moveTo, promotion: "q"}) :
      newChess.move({from: from!, to: moveTo});
      
      socket.send(JSON.stringify({
        type: MOVE,
        payload: {
          from: from,
          to: moveTo
        },
        promotion: isPromotion ? promotionPiece : undefined
      }))

      setFrom(null)
      setShowPromotionOptions(false)
      return;

    } catch {

      playIllegalMoveSound()
      setFrom(moveTo);
      setFrom(null);
    }
  }
  return (
    <View>
      <View style={{
        width: width, 
        height: width,
        maxWidth: 642,
        maxHeight: 642,
        transform: [{rotate: color == "b" ? "180deg" : "0deg"}]
      }}>
        <LinearGradient
          colors={['#B048C2', '#9082DB', '#3DE3B4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
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
                renderItem={({ item: piece, index: colIdx }) => {

                  const isLight = (rowIdx + colIdx) % 2 === 0;
                  const squareName =  String.fromCharCode("a".charCodeAt(0) + colIdx) +
                    (8 - rowIdx);

                  if (squareName === prevFrom || squareName === prevTo){
                    return (
                      <PreviousTurn 
                      width={width}
                      piece={piece}
                      onPress={onPress}
                      prevFrom={prevFrom}
                      colIdx={colIdx}
                      rowIdx={rowIdx}
                      color={color}
                      squareName={squareName}
                      />
                    )
                  }

                  const loser = GameOver.winner === "w" ? "b" : "w";

                  const isKingInDanger =
                    piece?.type === "k" &&
                    (
                      // CHECKMATE
                      (GameOver.isGameOver &&
                        GameOver.gameOverType === "checkmate" &&
                        piece.color === chess.turn()) 
                        
                      ||

                      // NORMAL CHECK
                      (!GameOver.isGameOver &&
                        chess.inCheck() &&
                        piece.color === chess.turn())
                    );

                  if (isKingInDanger) {
                    return (
                      <Check
                        width={width}
                        onPress={onPress}
                        piece={piece}
                        color={color}
                        colIdx={colIdx}
                        rowIdx={rowIdx}
                      />
                    );
                  }

                  return (
                    <Block color={color}
                    rowIdx={rowIdx}
                    colIdx={colIdx}
                    isLight={isLight}
                    onPress={onPress}
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
      {showPromotionOptions && 
        <View style={{
          marginHorizontal: 28
        }}>
          <LinearGradient
          colors={['#B048C2', '#9082DB', '#3DE3B4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              borderRadius: 100,
              marginTop: 18
            }
          ]}
          >
            <FlatList
              horizontal
              contentContainerStyle={
                {
                  flexGrow: 1,
                  justifyContent: "space-evenly",
                  paddingVertical: 4
                }
              }
              data={["chess-queen", "chess-rook", "chess-bishop", "chess-knight"]}
              keyExtractor={item => item}
              scrollEnabled={false}
              renderItem={({item}) => {
                return(
                  <Pressable onPress={() => {
                    setPromotionPiece(item[6] as "q" | "r" | "b" | "k")
                  }}>
                    <FontAwesome5 name={item} size={width > 640 ? 70 : (width - 2) / 10} color={promotionPiece[0] == item[6] ? color == "b" ? "#553227" : "#fbfbfb" : (color == "b" ? "#fbfbfb" : "#553227")} />
                  </Pressable> 
                )
              }}
            />
          </LinearGradient>
        </View>
      }
    </View>
  )
}

function Check ({
  width, 
  onPress, 
  piece, 
  rowIdx, 
  colIdx, 
  color
} : {
  width: number, 
  onPress: (piece: Piece, rowIdx: number, colIdx: number) => void, 
  piece: Piece, 
  rowIdx: number, 
  colIdx: number, 
  color: "b" | "w"
}) {
  return (
    <View
      style={[
        styles.square,
        {
          width: (width - 2) / 8,
          height: (width - 2) / 8,
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
            width: (width - 2) / 8,
            height: (width - 2) / 8,
          },
        ]}
      >
        {piece && (
          <PieceIcon piece={piece} width={width} color={color} />
        )}
      </Pressable>
    </View>
  )
}

function PreviousTurn ({
  width,
  onPress,
  piece,
  rowIdx,
  colIdx,
  color,
  squareName,
  prevFrom,
}: {
  width: number, 
  onPress: (piece: Piece, rowIdx: number, colIdx: number) => void, 
  piece: Piece, 
  rowIdx: number, 
  colIdx: number, 
  color: "b" | "w",
  squareName: string,
  prevFrom: Square | null
}) {
  return (
    <View
      style={[
        styles.square,
        {   
          width: (width - 2) / 8,
          height: (width - 2) / 8,
          backgroundColor: squareName == prevFrom ? "#3DE3B4" : "#B048C2"
        },
      ]}
      >
      <Pressable
        onPress={ () => {
          onPress(piece, rowIdx, colIdx)
        }}
        style={[styles.pressable, {
          width: (width - 2) / 8,
          height: (width - 2) / 8,
        }]}
      >

        {piece && (
          <PieceIcon piece={piece} width={width} color={color}/>
        )}
      </Pressable>
    </View>
  )
}

function Block ({
  width, 
  onPress, 
  piece, 
  rowIdx, 
  colIdx, 
  color,
  isLight
} : {
  width: number, 
  onPress: (piece: Piece, rowIdx: number, colIdx: number) => void, 
  piece: Piece, 
  rowIdx: number, 
  colIdx: number, 
  color: "b" | "w",
  isLight: boolean
}) {
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
        },
      ]}
      >
      <Pressable
        onPress={ () => {
          onPress(piece, rowIdx, colIdx)
        }}
        style={[styles.pressable, {
          width: (width - 2) / 8,
          height: (width - 2) / 8,
        }]}
      >

        {piece && (
          <PieceIcon piece={piece} width={width} color={color} />
        )}
      </Pressable>
    </ImageBackground>
  )
}


function PieceIcon ({
  piece, 
  width, 
  color} : {
    piece: Piece, 
    width: number, 
    color: "w" | "b"
  }){
  return (
    <View style={{
        justifyContent: "center",
        transform: [{ rotate: color === "b" ? "180deg" : "0deg" }]
      }}>
      {piece&& <FontAwesome5
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
        color={piece.color === "b" ? "#75483a" : "#e5e5e5"}
        
      />}
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