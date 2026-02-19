import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Move } from 'chess.js'
import { Piece } from './Piece'   // 👈 using your real pieces

export function MoveHistory({ moves }: { moves: Move[] }) {
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (moves.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true })
    }
  }, [moves])

  return (
    <View>
      <FlatList
        data={moves}
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {

          const piece = {
            square: item.to,
            type: item.piece,
            color: item.color
          }

          return (
            <View style={styles.moveItem}>
              <Text style={styles.moveNumber}>
                {index + 1}.
              </Text>

              <Piece
                piece={piece}
                width={40}     // 👈 same visual size as old icon
                color={item.color}
                rotation={"0deg"}
              />

              <Text style={styles.moveText}>
                {item.to}
              </Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  moveItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginRight: 8,
  },
  moveNumber: {
    color: "#888",
    fontSize: 12,
  },
  moveText: {
    color: "#ffffff",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
})
