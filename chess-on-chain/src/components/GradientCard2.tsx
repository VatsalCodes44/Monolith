import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

export default function GradientCard2({ padding, children }: { padding: number, children: React.ReactNode }) {
  return (
    <LinearGradient
        colors={["#B048C2", "#9082DB", "#3DE3B4"]}
        style={styles.cardBorder}
    >
        <View style={[
            styles.cardInner,
            {
                padding
            }
        ]}>
            {children}
        </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
    cardBorder: {
        padding: 1.5,
        borderRadius: 18,
        marginBottom: 28,
    },

    cardInner: {
        backgroundColor: "#16161A",
        borderRadius: 16,
        padding: 0,
    },
})