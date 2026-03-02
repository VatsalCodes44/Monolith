import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

export default function GradientCard2({ padding, children }: { padding: number, children: React.ReactNode }) {
  return (
    <LinearGradient
        colors={["#B048C2", "#9082DB", "#3DE3B4"]}
        style={styles.cardBorder}
    >
        <ImageBackground
        source={require("../../assets/image/card.jpg")} // local image
        resizeMode="cover"
        style={[styles.cardInner, {padding}]}>
            {children}
        </ImageBackground>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
    cardBorder: {
        padding: 2,
        borderRadius: 16,
        borderWidth: 6,
        marginBottom: 28,
    },

    cardInner: {
        borderRadius: 16,
        margin: 2,
        alignItems: 'center',
        gap: 8,
        overflow: "hidden",
        borderWidth: 6
    },
})