import { FlatList, StyleSheet, Text, View, useWindowDimensions, ImageBackground, Pressable, Touchable, ViewStyle } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Chess, Color, Move, PieceSymbol, Square } from 'chess.js';
import { LinearGradient } from 'expo-linear-gradient';
import { MOVE, MOVE_CUSTOM } from "@/src/config/serverResponds";
import { Piece } from './Piece';
import { MOVE_CUSTOM_TYPE_TS, MOVE_TYPE_TS } from "@/src/config/serverInputs";
import { GameOver } from '@/app/(Game)/Game';

type Piece = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)

export function ChessBoard(
  { chess,
    socket,
    from,
    setFrom,
    color,
    prevFrom,
    prevTo,
    GameOver,
    gameStarted,
    playIllegalMoveSound,
    playCheckSound,
    network,
    sol,
    gameId,
    jwt,
    gameType,
    playMoveSound,
    spectator
  }: {
    chess: Chess,
    socket: WebSocket,
    from: Square | null,
    setFrom: React.Dispatch<React.SetStateAction<Square | null>>,
    color: "w" | "b",
    prevFrom: Square | null,
    prevTo: Square | null,
    GameOver: GameOver,
    gameStarted: boolean,
    playIllegalMoveSound: () => Promise<void>,
    playCheckSound: () => Promise<void>,
    network: "MAINNET" | "DEVNET",
    sol: "0.01" | "0.05" | "0.1",
    gameId: string | null,
    jwt: string | null,
    gameType: "NORMAL" | "CUSTOM",
    playMoveSound: () => Promise<void>,
    spectator: boolean
  }) {
  const { width, height } = useWindowDimensions();
  const [showPromotionOptions, setShowPromotionOptions] = useState(false)
  const [promotionPiece, setPromotionPiece] = useState<"q" | "r" | "b" | "k">("q");
  const [pendingPromotionMove, setPendingPromotionMove] = useState<{ from: Square, to: Square } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[] | null>(null);
  const boardSize = Math.min(width, 642);

  useEffect(() => {
    if (spectator) return;
    if (from) {
      const moves = chess.moves({
        square: from,
        verbose: true
      });

      const moveSquares = moves.map(move => move.to);
      setPossibleMoves(moveSquares);
    } else {
      setPossibleMoves(null);
    }
  }, [from]);

  const onPress = (piece: Piece, rowIdx: number, colIdx: number) => {
    if (spectator) return;
    if (GameOver.isGameOver || !gameStarted || !gameId || !jwt) return;
    if (chess.turn() != color) return;
    if (!piece && !from) return;
    if (!from && piece) {
      setFrom(piece.square);
      return;
    }

    const moveTo = String.fromCharCode('a'.charCodeAt(0) + colIdx) + (8 - rowIdx) as Square;

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
        setPendingPromotionMove({ from: from!, to: moveTo });
        setShowPromotionOptions(true);
        return;
      }
      const move = isPromotion ?
        newChess.move({ from: from!, to: moveTo, promotion: promotionPiece }) :
        newChess.move({ from: from!, to: moveTo });

      if (!from) return;
      if (gameType == "NORMAL") {
        const moveObj: MOVE_TYPE_TS = {
          type: MOVE,
          payload: {
            from: from,
            to: moveTo,
            sol,
            network,
            gameId,
            jwt
          },
          promotion: isPromotion ? promotionPiece : undefined
        }
        socket.send(JSON.stringify(moveObj))
      }
      else {
        const moveObj: MOVE_CUSTOM_TYPE_TS = {
          type: MOVE_CUSTOM,
          payload: {
            from: from,
            to: moveTo,
            jwt,
            gameId,
          },
          promotion: isPromotion ? promotionPiece : undefined
        }
        socket.send(JSON.stringify(moveObj))
      }

      setFrom(null)
      setShowPromotionOptions(false)
      return;

    } catch {

      playIllegalMoveSound()
      setFrom(moveTo);
      setFrom(null);
    }
  }

  const handlePromotionSelect = (selectedPiece: "q" | "r" | "b" | "k") => {
    if (spectator) return;
    if (!pendingPromotionMove || !gameId || !jwt) return;

    // Make the move with the selected promotion piece
    const moveObj: MOVE_TYPE_TS = {
      type: MOVE,
      payload: {
        from: pendingPromotionMove.from,
        to: pendingPromotionMove.to,
        gameId,
        network,
        sol,
        jwt
      },
      promotion: selectedPiece
    }
    socket.send(JSON.stringify(moveObj))

    // Clean up state
    setShowPromotionOptions(false);
    setPendingPromotionMove(null);
    setFrom(null);
  }

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

                    if (squareName === prevFrom || squareName === prevTo) {
                      return (
                        <PreviousTurn
                          playMoveSound={playMoveSound}
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
                      playCheckSound();
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
                        moves={possibleMoves}
                      />
                    );
                  }}
                />
              )}
            />
          </LinearGradient>
        </View>

        {showPromotionOptions &&
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}
          >
            <View
              style={{
                marginHorizontal: 28,
                width: '80%',
              }}
            >
              <LinearGradient
                colors={['#B048C2', '#9082DB', '#3DE3B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.gradient,
                  {
                    borderRadius: 20,
                    paddingVertical: 20,
                  },
                ]}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                >
                  Select the promotion piece
                </Text>

                <FlatList
                  horizontal
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'space-evenly',
                    paddingVertical: 4,
                  }}
                  data={[
                    { value: 'q' },
                    { value: 'r' },
                    { value: 'b' },
                    { value: 'n' },
                  ]}
                  keyExtractor={(item) => item.value}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    const pieceSize =
                      width > 640 ? 70 : (width - 2) / 10

                    const isSelected = promotionPiece === item.value

                    return (
                      <Pressable
                        onPress={() =>
                          handlePromotionSelect(
                            item.value as "q" | "r" | "b" | "k"
                          )
                        }
                        style={{
                          padding: 8,
                          borderRadius: 12,
                          backgroundColor: isSelected
                            ? 'rgba(255,255,255,0.2)'
                            : 'transparent',
                        }}
                      >
                        <Piece
                          piece={{
                            type: item.value as any,
                            color: color,
                          }}
                          width={pieceSize}
                          color={color}
                          rotation={"0deg"}
                        />
                      </Pressable>
                    )
                  }}
                />
              </LinearGradient>
            </View>
          </View>
        }
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


function PreviousTurn({
  width,
  onPress,
  piece,
  rowIdx,
  colIdx,
  color,
  squareName,
  prevFrom,
  playMoveSound,
}: {
  width: number;
  onPress: (piece: Piece, rowIdx: number, colIdx: number) => void;
  piece: Piece;
  rowIdx: number;
  colIdx: number;
  color: "b" | "w";
  squareName: string;
  prevFrom: Square | null;
  playMoveSound: () => Promise<void>;
}) {
  playMoveSound()
  const squareSize = Math.min(width, 640) / 8;
  const pieceSize = squareSize * 0.95;

  const isLight = (rowIdx + colIdx) % 2 === 0;
  const isFromSquare = squareName === prevFrom;

  const highlightColor = "#fff"

  const baseStyle: ViewStyle = {
    width: squareSize,
    height: squareSize,
    justifyContent: "center",
    alignItems: "center",
  };

  const highlightStyle: ViewStyle = {
    borderWidth: 5,
    borderColor: highlightColor,
    shadowColor: highlightColor,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  };

  const pressableStyle: ViewStyle = {
    width: squareSize,
    height: squareSize,
    justifyContent: "center",
    alignItems: "center",
  };

  const content = (
    <Pressable
      onPress={() => onPress(piece, rowIdx, colIdx)}
      style={pressableStyle}
    >
      {piece && (
        <Piece
          piece={piece}
          width={pieceSize}
          color={color}
        />
      )}
    </Pressable>
  );

  if (isLight) {
    return (
      <LinearGradient
        colors={["#B048C2", "#9082DB", "#3DE3B4"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, highlightStyle]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        baseStyle,
        { backgroundColor: "#1A1028" },
        highlightStyle,
      ]}
    >
      {content}
    </View>
  );
}


function Block({
  width,
  onPress,
  piece,
  rowIdx,
  colIdx,
  color,
  isLight,
  moves
}: {
  width: number;
  onPress: (piece: Piece, rowIdx: number, colIdx: number) => void;
  piece: Piece;
  rowIdx: number;
  colIdx: number;
  color: "b" | "w";
  isLight: boolean;
  moves: string[] | null
}) {
  const squareSize = Math.min(width, 640) / 8;
  const pieceSize = squareSize * 0.95;
  const squareName = String.fromCharCode("a".charCodeAt(0) + colIdx) +
    (8 - rowIdx);
  const isPossibleMove = moves?.includes(squareName);

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
              width: squareSize * 0.50, //.35 initially
              height: squareSize * 0.50,
              borderRadius: (squareSize * 0.50) / 2,
              backgroundColor: isLight
                ? "rgba(0,0,0,0.25)"
                : "rgba(255,255,255,0.25)"
            }}
          />
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
              width: squareSize * 0.50,
              height: squareSize * 0.50,
              borderRadius: (squareSize * 0.50) / 2,
              backgroundColor: isLight
                ? "rgba(0,0,0,0.25)"
                : "rgba(255,255,255,0.25)"
            }}
          />
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
