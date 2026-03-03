import { useEffect, useRef } from "react"
import { StyleSheet, Text, View } from "react-native"

export function BotTimer({
    timer1,
    timer2,
    color,
    playLowOnTimeSound,
    fontsLoaded
}: {
    timer1: number,
    timer2: number,
    color: "w" | "b",
    playLowOnTimeSound: () => Promise<void>,
    fontsLoaded: boolean
}) {

    const leftTimer = color === "w" ? timer2 : timer1
    const rightTimer = color === "w" ? timer1 : timer2

    // 🔥 Prevent sound spam
    const leftLowPlayedRef = useRef(false)
    const rightLowPlayedRef = useRef(false)

    useEffect(() => {
        if (leftTimer <= 30000 && leftTimer > 0 && !leftLowPlayedRef.current) {
            playLowOnTimeSound()
            leftLowPlayedRef.current = true
        }

        if (rightTimer <= 30000 && rightTimer > 0 && !rightLowPlayedRef.current) {
            playLowOnTimeSound()
            rightLowPlayedRef.current = true
        }

        // Reset if time goes back above 30 sec (new game etc.)
        if (leftTimer > 30000) leftLowPlayedRef.current = false
        if (rightTimer > 30000) rightLowPlayedRef.current = false

    }, [leftTimer, rightTimer])

    return (
        <View style={styles.container}>
            {RenderTimer(leftTimer, fontsLoaded)}
            {RenderTimer(rightTimer, fontsLoaded)}
        </View>
    )
}

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
        .toString()
        .padStart(2, "0")

    return { minutes, seconds }
}

const RenderTimer = (time: number, fontsLoaded: boolean) => {
    const { minutes, seconds } = formatTime(time)
    const isLow = time <= 30000 && time > 0

    return (
        <Text
            style={[
                styles.timer,
                {
                    color: isLow ? "#ff2e2e" : "#ffffff",
                    fontFamily: fontsLoaded ? "Orbitron_900Black" : undefined
                }
            ]}
        >
            {minutes}:{seconds}
        </Text>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    timer: {
        fontSize: 22,
        letterSpacing: 2
    }
})