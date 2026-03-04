import { FlatList, StyleSheet, Text, View, useWindowDimensions, ImageBackground, Pressable, Touchable, ViewStyle } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Chess, Color, Move, PieceSymbol, Square } from 'chess.js';
import { LinearGradient } from 'expo-linear-gradient';
import { MOVE, MOVE_CUSTOM } from "@/src/config/serverResponds";
import { Piece } from './Piece';
import { MOVE_CUSTOM_TYPE_TS, MOVE_TYPE_TS } from "@/src/config/serverInputs";
import { GAME_STATE } from '../config/game';
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
type Piece = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)

export function ChessBoard(
  {
    socket,
    gameStarted,
    playIllegalMoveSound,
    playCheckSound,
    network,
    sol,
    gameId,
    jwt,
    gameType,
    spectator,
    gameState,
    setGameState
  }: {
    socket: WebSocket,
    gameStarted: boolean,
    playIllegalMoveSound: () => Promise<void>,
    playCheckSound: () => Promise<void>,
    network: "MAINNET" | "DEVNET",
    sol: "0.01" | "0.05" | "0.1",
    gameId: string | null,
    jwt: string | null,
    gameType: "NORMAL" | "CUSTOM",
    spectator: boolean,
    gameState: GAME_STATE,
    setGameState: React.Dispatch<React.SetStateAction<GAME_STATE>>,
  }) {
  const { width, height } = useWindowDimensions();
  const [showPromotionOptions, setShowPromotionOptions] = useState(false)
  const [promotionPiece, setPromotionPiece] = useState<"q" | "r" | "b" | "k">("q");
  const [pendingPromotionMove, setPendingPromotionMove] = useState<{ from: Square, to: Square } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[] | null>(null);
  const boardSize = Math.min(width, 642);

  useEffect(() => {
    if (spectator) return;
    if (gameState.from) {
      const moves = gameState.chess.moves({
        square: gameState.from,
        verbose: true
      });

      const moveSquares = moves.map(move => move.to);
      setPossibleMoves(moveSquares);
    } else {
      setPossibleMoves(null);
    }
  }, [gameState.from]);

  const onPress = (piece: Piece, rowIdx: number, colIdx: number) => {
     console.log("onPress:", {
        isGameOver: gameState.gameover.isGameOver,
        gameStarted,
        gameId,
        jwt: !!jwt
    })
    if (spectator) return;
    if (gameState.gameover.isGameOver || !gameStarted || !gameId || !jwt) return;
    if (gameState.chess.turn() != gameState.color) return;
    if (!piece && !gameState.from) return;
    if (!gameState.from && piece) {
      setGameState(p => ({...p, from: piece.square}));
      return;
    }

    const moveTo = String.fromCharCode('a'.charCodeAt(0) + colIdx) + (8 - rowIdx) as Square;

    if (gameState.chess.get(moveTo)?.color == gameState.color) {
      setGameState(p => ({...p, from: moveTo}))
      return;
    }

    try {
      let newChess = new Chess(gameState.chess.fen())
      let fromPiece = newChess.get(gameState.from!)

      // checking for pawn promotion
      const isPromotion =
        fromPiece?.type === "p" &&
        ((fromPiece.color === "w" && moveTo[1] === "8") ||
          (fromPiece.color === "b" && moveTo[1] === "1"));
      if (isPromotion && !showPromotionOptions) {
        setPendingPromotionMove({ from: gameState.from!, to: moveTo });
        setShowPromotionOptions(true);
        return;
      }
      const move = isPromotion ?
        newChess.move({ from: gameState.from!, to: moveTo, promotion: promotionPiece }) :
        newChess.move({ from: gameState.from!, to: moveTo });

      if (!gameState.from) return;
      if (gameType == "NORMAL") {
        const moveObj: MOVE_TYPE_TS = {
          type: MOVE,
          payload: {
            from: gameState.from,
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
            from: gameState.from,
            to: moveTo,
            jwt,
            gameId,
          },
          promotion: isPromotion ? promotionPiece : undefined
        }
        socket.send(JSON.stringify(moveObj))
      }

      setGameState(p => ({...p, from: null}));
      setShowPromotionOptions(false)
      return;

    } catch {

      playIllegalMoveSound()      
      setGameState(p => ({...p, from: null}));
    }
  }

  const handlePromotionSelect = (selectedPiece: "q" | "r" | "b" | "k") => {
    if (spectator) return;
    if (!pendingPromotionMove || !gameId || !jwt) return;

    // Make the move with the selected promotion piece
    if (gameType === "NORMAL") {
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
        };

        socket.send(JSON.stringify(moveObj));
      } else {
        const moveObj: MOVE_CUSTOM_TYPE_TS = {
          type: MOVE_CUSTOM,
          payload: {
            from: pendingPromotionMove.from,
            to: pendingPromotionMove.to,
            gameId,
            jwt
          },
          promotion: selectedPiece
        };

        socket.send(JSON.stringify(moveObj));
      }

    // Clean up state
    setShowPromotionOptions(false);
    setPendingPromotionMove(null);
    setGameState(p => ({...p, from: null}));
  }

  return (
    <Animated.View
    entering={ZoomIn.duration(200).delay(50).springify()} 
    exiting={ZoomOut.duration(200).delay(50).springify()} 
    >
      <View style={{ position: 'relative' }}>
        <View style={{
          width: boardSize,
          height: boardSize,
          maxWidth: 642,
          maxHeight: 642,
          transform: [{ rotate: gameState.color == "b" ? "180deg" : "0deg" }]
        }}>
          <LinearGradient
            colors={gameState.color == "w" ? ["#B048C2", "#9082DB", "#3DE3B4"] : ["#3DE3B4", "#9082DB", "#B048C2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >

            <FlatList
              data={gameState.chess.board()}
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
                      <Block color={gameState.color}
                        rowIdx={rowIdx}
                        colIdx={colIdx}
                        isLight={isLight}
                        onPress={onPress}
                        piece={piece}
                        width={width}
                        moves={possibleMoves}
                        chess={gameState.chess}
                        prevFrom={gameState.prevFrom}
                        prevTo={gameState.prevTo}
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
                            color: gameState.color,
                          }}
                          width={pieceSize}
                          color={gameState.color}
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
    </Animated.View>
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
