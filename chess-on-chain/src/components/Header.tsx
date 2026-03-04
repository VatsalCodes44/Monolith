import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
export function Header({ title, tagline }: { title: string, tagline?: string }) {
    return (
        <Animated.View 
        entering={ZoomIn.duration(200).delay(50).springify()} 
        exiting={ZoomOut.duration(200).delay(50).springify()} 
        style={{ alignItems: "center", marginBottom: 16 }}>
            <Text style={[
                styles.appTitle,
                { fontFamily: "Orbitron_900Black" }
            ]}>
                {title}
            </Text>

            {<LinearGradient
                colors={['#B048C2', '#9082DB', '#3DE3B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentLine}
            />}

            {tagline && <Text style={styles.tagline}>
                {tagline}
            </Text>}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    appTitle: {
        color: "#FFFFFF",
        fontSize: 33,
        letterSpacing: 2,
        textAlign: "center",
        marginBottom: 20,
        textShadowColor: '#000',
        textShadowOffset: { width: 4, height: 4 },
        textShadowRadius: 8,
    },

    accentLine: {
        height: 3,
        width: 120,
        borderRadius: 2,
        marginBottom: 20,
    },

    tagline: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
        textAlign: "center",
        marginBottom: 2,
        lineHeight: 22,
    },

    microText: {
        color: "#6B7280",
        fontSize: 11,
        letterSpacing: 1,
        textAlign: "center",
        textTransform: "uppercase",
    },
})