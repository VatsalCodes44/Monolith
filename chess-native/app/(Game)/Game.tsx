import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {ChessBoard} from "@/components/ChessBoard"
export default function Game() {
  return (
    <SafeAreaView>
      <View>
          <ChessBoard />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})