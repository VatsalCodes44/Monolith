import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function index() {
  return (
    <SafeAreaView style={styles.container}>
        <Text>
            SeekMate
        </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    "container": {
        flex: 1,
        backgroundColor: "#191919"
    }
})