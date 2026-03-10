import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

export default function GradientCard2({ 
    padding,
    children,
    alignItems="center", 
    marginBottom=28 
}: { 
    padding: number, 
    children: React.ReactNode, 
    alignItems?: "center" | "flex-start",
    marginBottom?: number
}) {
  return (
    <Animated.View 
    entering={FadeIn.duration(200).delay(50).springify()}
    exiting={FadeOut.duration(200).delay(50).springify()}
    >
        <LinearGradient
            colors={["#B048C2", "#9082DB", "#3DE3B4"]}
            style={[
                styles.cardBorder,
                {
                    marginBottom
                }
            ]}
        >
            <ImageBackground
            source={require("../../assets/image/card.jpg")} // local image
            resizeMode="cover"
            style={[styles.cardInner, {
                padding,
                alignItems 
            }]}>
                {children}
            </ImageBackground>
        </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
    cardBorder: {
        padding: 2,
        borderRadius: 16,
        borderWidth: 6,
    },

    cardInner: {
        borderRadius: 16,
        margin: 2,
        gap: 8,
        overflow: "hidden",
        borderWidth: 6
    },
})