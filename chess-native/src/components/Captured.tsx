import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Move, PieceSymbol } from 'chess.js'
import { Piece } from './Piece'

export function Captured({
  moves,
  color,
}: {
  moves: Move[]
  color: "w" | "b"
}) {

  const opponentColor: "w" | "b" =
    color === "w" ? "b" : "w"

  // Pieces captured by current player
  const capturedByPlayer = moves
    .filter(m => m.captured && m.color === color)
    .map(m => ({
      type: m.captured as PieceSymbol,
      color: opponentColor
    }))

  // Pieces captured by opponent
  const capturedByOpponent = moves
    .filter(m => m.captured && m.color !== color)
    .map(m => ({
      type: m.captured as PieceSymbol,
      color: color
    }))

  const ICON_SIZE = 44
  const OVERLAP_AMOUNT = ICON_SIZE * 0.70

  const renderPieceStack = (
    pieces: Array<{ type: PieceSymbol; color: "w" | "b" }>
  ) => {
    if (pieces.length === 0) return null

    return (
      <View style={styles.stack}>
        {pieces.map((item, index) => (
          <View
            key={`${item.type}-${index}`}
            style={[
              styles.pieceContainer,
              index > 0 && { marginLeft: -OVERLAP_AMOUNT }
            ]}
          >
            <Piece
              piece={{
                type: item.type,
                color: item.color
              }}
              color={item.color}
              width={ICON_SIZE}
              rotation={"0deg"}
            />
          </View>
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Opponent captures on left */}
      <View style={styles.leftSection}>
        {renderPieceStack(capturedByOpponent)}
      </View>

      {/* Player captures on right */}
      <View style={styles.rightSection}>
        {renderPieceStack(capturedByPlayer)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 8,
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  stack: {
    flexDirection: "row",
    alignItems: "center",
  },
  pieceContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
})
