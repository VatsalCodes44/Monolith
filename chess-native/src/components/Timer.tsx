import { GameOver } from "@/app/(Game)/Game";
import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Timer({
    timer1,
    timer2,
    turn,
    fontsLoaded,
    gameStarted,
    GameOver,
    playLowOnTimeSound,
    color
}: {
    timer1: number,
    timer2: number,
    turn: "w" | "b",
    fontsLoaded: boolean,
    gameStarted: boolean,
    GameOver: GameOver,
    playLowOnTimeSound: () => Promise<void>,
    color: "w" | "b"
}) {

    const [t1, setT1] = useState(timer1)
    const [t2, setT2] = useState(timer2)
    
    const timer1Ref = useRef(timer1)
    const timer2Ref = useRef(timer2)
    const lastUpdateRef = useRef<number>(Date.now())
    const hasPlayedLowTimeSoundRef = useRef<boolean>(false)

    useEffect(() => {
        timer1Ref.current = timer1
        timer2Ref.current = timer2
        setT1(timer1)
        setT2(timer2)
        lastUpdateRef.current = Date.now()
        
        if (timer1 > 30_000 && timer2 > 30_000) {
            hasPlayedLowTimeSoundRef.current = false
        }
    }, [timer1, timer2])

    useEffect(() => {
        if (!gameStarted || GameOver.isGameOver) return

        lastUpdateRef.current = Date.now()

        const interval = setInterval(() => {
            const now = Date.now()
            const elapsed = now - lastUpdateRef.current
            
            if (turn === "w") {
                const actualTime = timer1Ref.current - elapsed
                setT1(Math.max(actualTime, 0))
            } else {
                const actualTime = timer2Ref.current - elapsed
                setT2(Math.max(actualTime, 0))
            }
        }, 100)

        return () => clearInterval(interval)

    }, [turn, gameStarted, GameOver.isGameOver])

    useEffect(() => {
        if (hasPlayedLowTimeSoundRef.current) return

        const currentTimer = turn === "w" ? t1 : t2
        
        if (currentTimer <= 30_000 && currentTimer > 0) {
            playLowOnTimeSound()
            hasPlayedLowTimeSoundRef.current = true
        }
    }, [t1, t2, turn])

    // ========== ADDED: Determine which timer goes on which side ==========
    // Current player's timer always on the right
    const leftTimer = color === "w" ? t2 : t1;
    const rightTimer = color === "w" ? t1 : t2;
    const isLeftLowTime = color === "w" ? t2 < 30_000 : t1 < 30_000;
    const isRightLowTime = color === "w" ? t1 < 30_000 : t2 < 30_000;

    return (
        <View style={styles.container}>
            {RenderTimer(leftTimer, isLeftLowTime, fontsLoaded)}
            {RenderTimer(rightTimer, isRightLowTime, fontsLoaded)}
        </View>
    )
}

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor(time / 1000 % 60).toString().padStart(2, "0");
    return { minutes, seconds };
}

const RenderTimer = (time: number, isLowTime: boolean, fontsLoaded: boolean) => {
    const { minutes, seconds } = formatTime(time);
    
    return (
        <View style={{flexDirection: "row"}}>
            {minutes.toString().split("").map((digit, idx) => (
                <Text
                    key={`min-${idx}`}
                    style={{
                        fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto",
                        color: isLowTime ? "#ff0000" : "#ffffff",
                        fontSize: 18,
                        fontVariant: ["tabular-nums"],
                        width: 16,
                        textAlign: "center",
                    }}
                >
                    {digit}
                </Text>
            ))}
            
            <Text
                style={{
                    fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto",
                    color: isLowTime ? "#ff0000" : "#ffffff",
                    fontSize: 18,
                    width: 8,
                    textAlign: "center",
                    paddingRight: 2
                }}
            >
                :
            </Text>

            {seconds.split("").map((digit, idx) => (
                <Text
                    key={`sec-${idx}`}
                    style={{
                        fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto",
                        color: isLowTime ? "#ff0000" : "#ffffff",
                        fontSize: 18,
                        fontVariant: ["tabular-nums"],
                        width: 16,
                        textAlign: "center",
                    }}
                >
                    {digit}
                </Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        height: "auto"
    },
})