import {
    FlatList,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
    Pressable,
    ViewStyle
} from "react-native"
import React, { useEffect, useRef, useState } from "react"
import { Chess, Color, Move, PieceSymbol, Square } from "chess.js"
import { LinearGradient } from "expo-linear-gradient"
import { Audio } from "expo-av"
import { Piece } from "@/src/components/Piece"
import { GAME_STATE } from "@/src/config/game"
import { getBestMove } from "@/src/utils/minimax"

type PieceType = {
    square: Square
    type: PieceSymbol
    color: Color
} | null

type GameOverType = "checkmate" | "stalemate" | "draw" | "time_out" | null

function getGameOver(chess: Chess): {
    isGameOver: boolean
    winner: "w" | "b" | null
    gameOverType: GameOverType
} {
    if (chess.isCheckmate()) {
        const winner: "w" | "b" = chess.turn() === "w" ? "b" : "w"
        return { isGameOver: true, winner, gameOverType: "checkmate" }
    }
    if (chess.isStalemate()) {
        return { isGameOver: true, winner: null, gameOverType: "stalemate" }
    }
    if (chess.isDraw() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition()) {
        return { isGameOver: true, winner: null, gameOverType: "draw" }
    }
    return { isGameOver: false, winner: null, gameOverType: null }
}

function cloneChess(source: Chess): Chess {
    const clone = new Chess()
    const history = source.history({ verbose: true })
    for (const move of history) {
        clone.move(move)
    }
    return clone
}

export function BotBoard({
    gameStarted,
    spectator,
    gameState,
    setGameState,
    playIllegalMoveSound,
    playCheckSound,
    playMoveSound,
    setShowGameOver,
    showGameOver
}: {
    gameStarted: boolean,
    spectator: boolean,
    gameState: GAME_STATE,
    setGameState: React.Dispatch<React.SetStateAction<GAME_STATE>>,
    playIllegalMoveSound: () => Promise<void>,
    playCheckSound: () => Promise<void>,
    playMoveSound: () => Promise<void>,
    setShowGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    showGameOver: boolean
}) {
    const { width } = useWindowDimensions()
    const boardSize = Math.min(width, 642)

    const [showPromotionOptions, setShowPromotionOptions] = useState(false)
    const [pendingPromotionMove, setPendingPromotionMove] =
        useState<{ from: Square; to: Square } | null>(null)
    const [possibleMoves, setPossibleMoves] = useState<string[] | null>(null)

    // Derived primitive turn state so bot useEffect fires reliably
    const [turn, setTurn] = useState<"w" | "b">(gameState.chess.turn())

    // Sync turn whenever chess instance changes
    useEffect(() => {
        setTurn(gameState.chess.turn())
    }, [gameState.chess])

    // Possible moves highlight
    useEffect(() => {
        if (spectator) return
        if (gameState.from) {
            const moves: Move[] = gameState.chess.moves({ square: gameState.from, verbose: true })
            setPossibleMoves(moves.map((m: Move) => m.to))
        } else {
            setPossibleMoves(null)
        }
    }, [gameState.from])

    // BOT AUTO MOVE — depends on primitive `turn` so fires reliably
    useEffect(() => {
        if (spectator) return
        if (!gameStarted) return
        if (gameState.gameover.isGameOver) return
        if (turn === gameState.color) return

        const timeout = setTimeout(() => {
            const newChess = cloneChess(gameState.chess)
            const bestMove = getBestMove(newChess, 2)
            if (!bestMove) return

            newChess.move(bestMove)
            const gameover = getGameOver(newChess)

            setGameState((p: GAME_STATE) => ({
                ...p,
                chess: newChess,
                prevFrom: bestMove.from,
                prevTo: bestMove.to,
                moves: newChess.history({ verbose: true }),
                gameover: gameover.isGameOver ? gameover : p.gameover
            }))

            if (newChess.isCheckmate()){
                setShowGameOver(true);
            }
            else if (newChess.isGameOver()){
                setShowGameOver(true);
            }
            else if (newChess.inCheck()) {
                playCheckSound();
            }
            else {
                playMoveSound();
            }
        }, 800)

        return () => clearTimeout(timeout)
    }, [turn, gameStarted, gameState.gameover.isGameOver])

    const onPress = (piece: PieceType, rowIdx: number, colIdx: number) => {
        if (spectator) return
        if (!gameStarted) return
        if (gameState.gameover.isGameOver) return
        if (gameState.chess.turn() !== gameState.color) return
        if (!piece && !gameState.from) return

        const moveTo = (String.fromCharCode("a".charCodeAt(0) + colIdx) + (8 - rowIdx)) as Square

        if (!gameState.from && piece) {
            setGameState((p: GAME_STATE) => ({ ...p, from: piece.square }))
            return
        }

        if (gameState.chess.get(moveTo)?.color === gameState.color) {
            setGameState((p: GAME_STATE) => ({ ...p, from: moveTo }))
            return
        }

        try {
            const newChess = cloneChess(gameState.chess)
            const fromPiece = newChess.get(gameState.from!)

            const isPromotion =
                fromPiece?.type === "p" &&
                ((fromPiece.color === "w" && moveTo[1] === "8") ||
                    (fromPiece.color === "b" && moveTo[1] === "1"))

            if (isPromotion && !showPromotionOptions) {
                setPendingPromotionMove({ from: gameState.from!, to: moveTo })
                setShowPromotionOptions(true)
                return
            }

            newChess.move({ from: gameState.from!, to: moveTo })
            const gameover = getGameOver(newChess)

            setGameState((p: GAME_STATE) => ({
                ...p,
                chess: newChess,
                from: null,
                prevFrom: gameState.from,
                prevTo: moveTo,
                moves: newChess.history({ verbose: true }),
                gameover: gameover.isGameOver ? gameover : p.gameover
            }))

            if (newChess.isCheckmate()){
                setShowGameOver(true);
            }
            else if (newChess.isGameOver()){
                setShowGameOver(true);
            }
            else if (newChess.inCheck()) {
                playCheckSound();
            }
            else {
                playMoveSound();
            }
            setShowPromotionOptions(false)
        } catch {
            playIllegalMoveSound()
            setGameState((p: GAME_STATE) => ({ ...p, from: null }))
        }
    }

    const handlePromotionSelect = (piece: "q" | "r" | "b" | "n") => {
        if (!pendingPromotionMove) return

        const newChess = cloneChess(gameState.chess)
        newChess.move({
            from: pendingPromotionMove.from,
            to: pendingPromotionMove.to,
            promotion: piece,
        })

        const gameover = getGameOver(newChess)

        setGameState((p: GAME_STATE) => ({
            ...p,
            chess: newChess,
            from: null,
            prevFrom: pendingPromotionMove.from,
            prevTo: pendingPromotionMove.to,
            moves: newChess.history({ verbose: true }),
            gameover: gameover.isGameOver ? gameover : p.gameover
        }))

        if (newChess.isCheckmate()){
            setShowGameOver(true);
        }
        else if (newChess.isGameOver()){
            setShowGameOver(true);
        }
        else if (newChess.inCheck()) {
            playCheckSound();
        }
        else {
            playMoveSound();
        }
        setShowPromotionOptions(false)
        setPendingPromotionMove(null)
    }

    return (
        <View>
            <View style={{ position: "relative" }}>
                <View style={{
                    width: boardSize,
                    height: boardSize,
                    maxWidth: 642,
                    maxHeight: 642,
                    transform: [{ rotate: gameState.color === "b" ? "180deg" : "0deg" }]
                }}>
                    <LinearGradient
                        colors={gameState.color === "w"
                            ? ["#B048C2", "#9082DB", "#3DE3B4"]
                            : ["#3DE3B4", "#9082DB", "#B048C2"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        <FlatList
                            data={gameState.chess.board()}
                            keyExtractor={(_, i) => i.toString()}
                            scrollEnabled={false}
                            renderItem={({ item: row, index: rowIdx }) => (
                                <FlatList
                                    style={{ flexDirection: "row" }}
                                    data={row}
                                    keyExtractor={(_, colIdx) => `square-${rowIdx}-${colIdx}`}
                                    scrollEnabled={false}
                                    renderItem={({ item: piece, index: colIdx }) => {
                                        const isLight = (rowIdx + colIdx) % 2 === 0
                                        const squareName =
                                            String.fromCharCode("a".charCodeAt(0) + colIdx) + (8 - rowIdx)

                                        return (
                                            <Block
                                                width={width}
                                                onPress={onPress}
                                                piece={piece}
                                                rowIdx={rowIdx}
                                                colIdx={colIdx}
                                                color={gameState.color}
                                                isLight={isLight}
                                                moves={possibleMoves}
                                                chess={gameState.chess}
                                                prevFrom={gameState.prevFrom}
                                                prevTo={gameState.prevTo}
                                            />
                                        )
                                    }}
                                />
                            )}
                        />
                    </LinearGradient>
                </View>

                {showPromotionOptions && (
                    <View style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.7)"
                    }}>
                        <View style={{ marginHorizontal: 28, width: "80%" }}>
                            <LinearGradient
                                colors={["#B048C2", "#9082DB", "#3DE3B4"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.gradient, { borderRadius: 20, paddingVertical: 20 }]}
                            >
                                <Text style={{
                                    color: "#fff",
                                    fontSize: 16,
                                    marginBottom: 16,
                                    textAlign: "center"
                                }}>
                                    Select the promotion piece
                                </Text>
                                <FlatList
                                    horizontal
                                    contentContainerStyle={{
                                        flexGrow: 1,
                                        justifyContent: "space-evenly",
                                        paddingVertical: 4
                                    }}
                                    data={[
                                        { value: "q" }, { value: "r" },
                                        { value: "b" }, { value: "n" }
                                    ]}
                                    keyExtractor={item => item.value}
                                    scrollEnabled={false}
                                    renderItem={({ item }) => {
                                        const pieceSize = width > 640 ? 70 : (width - 2) / 10
                                        return (
                                            <Pressable
                                                onPress={() => handlePromotionSelect(item.value as "q" | "r" | "b" | "n")}
                                                style={{ padding: 8, borderRadius: 12 }}
                                            >
                                                <Piece
                                                    piece={{ type: item.value as PieceSymbol, color: gameState.color }}
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
                )}
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
    gradient: {
        paddingVertical: 2,
        paddingHorizontal: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    square: {
        justifyContent: "center",
        alignItems: "center",
        maxHeight: 80,
        maxWidth: 80,
    },
    pressable: {
        justifyContent: "center",
        alignItems: "center",
        maxHeight: 80,
        maxWidth: 80,
    }
})