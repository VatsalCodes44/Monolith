import { GameOver } from "@/app/(Game)/Game";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Timer({timer1,
    timer2, 
    color, 
    turn, 
    fontsLoaded, 
    gameStarted,
    GameOver,
    setGameOver,
    playLowOnTimeSound
}: {
    timer1: number,
    timer2: number,
    color: "w" | "b",
    turn: "w" | "b",
    fontsLoaded: boolean, 
    gameStarted: boolean,
    GameOver: GameOver,
    setGameOver: React.Dispatch<React.SetStateAction<GameOver>>,
    playLowOnTimeSound: () => Promise<void>
}) {
    const [t1, setT1] = useState(timer1)
    const [t2, setT2] = useState(timer2)
    // Timer countdown
    useEffect(() => {
        if (GameOver.isGameOver || !gameStarted) return;
        if (t1 <= 0 || t2 <= 0) {
            setGameOver({
                gameOverType: "time_out",
                isGameOver: true,
                winner: t1 <= 0 ? color : (color == "b" ? "w" : "b")
            })
        }
        if (t1 <= 30 || t1 <= 10) {
            playLowOnTimeSound()
            setGameOver({
                gameOverType: "time_out",
                isGameOver: true,
                winner: t1 <= 0 ? color : (color == "b" ? "w" : "b")
            })
        }
        
        let interval = setInterval(() => {
            if (color === turn) {
                setT1(t => t - 1000)
            } else {
                setT2(t => t - 1000)
            }
        }, 1000)

        return () => {
            clearInterval(interval);
        }
    }, [color, turn, gameStarted, GameOver.isGameOver, t1, t2])
    
    

    

    return (
        <View style={styles.container}>
            {RenderTimer(t2, t2 < 30 * 1000, fontsLoaded)}
            {RenderTimer(t1, t1 < 30 * 1000, fontsLoaded)}
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