import { StyleSheet, Text, View } from "react-native";

export function StaticTimer({
    timer1,
    timer2,
    turn,
    fontsLoaded,
    color,
}: {
    timer1: number,
    timer2: number,
    turn: "w" | "b",
    fontsLoaded: boolean,
    color: "w" | "b"
}) {

    const leftTimer = color === "w" ? timer2 : timer1;
    const rightTimer = color === "w" ? timer1 : timer2;
    const isLeftLowTime = color === "w" ? timer2 < 30_000 : timer1 < 30_000;
    const isRightLowTime = color === "w" ? timer1 < 30_000 : timer2 < 30_000;

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
        <View style={{ flexDirection: "row" }}>
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