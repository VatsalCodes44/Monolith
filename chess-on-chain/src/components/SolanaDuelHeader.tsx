import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
    player1Pubkey: string | null; // Right side
    player2Pubkey: string | null; // Left side
    turnColor: "b" | "w";
    myColor: "b" | "w";
    stake: string;
    fontsLoaded: boolean;
}

const shortenKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

export const SolanaDuelHeader: React.FC<Props> = ({
    player1Pubkey,
    player2Pubkey,
    turnColor,
    myColor,
    stake,
    fontsLoaded
}) => {
    const isMyTurn = (turnColor === myColor);

    // Assume:
    // If I am white → I am player1 (RIGHT)
    // If I am black → I am player2 (LEFT)

    const isPlayer1Me = myColor === "w";
    const isPlayer2Me = myColor === "b";

    const highlightPlayer1 = isPlayer1Me && isMyTurn;
    const highlightPlayer2 = isPlayer2Me && isMyTurn;

    const renderAvatar = (highlight: boolean, iconColor: string) => {
        if (highlight) {
            return (
                <LinearGradient
                    colors={["#3DE3B4", "#B048C2"]}
                    style={styles.avatarOuter}
                >
                    <View style={styles.avatarInner}>
                        <Ionicons name="person" size={20} color={iconColor} />
                    </View>
                </LinearGradient>
            );
        }

        return (
            <View style={[styles.avatarOuter, styles.inactiveBorder]}>
                <View style={styles.avatarInner}>
                    <Ionicons name="person" size={20} color={iconColor} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Player 2 - LEFT */}
            <View style={styles.playerContainer}>
                {renderAvatar(highlightPlayer2, "#B048C2")}
                <Text style={[
                    styles.pubkeyText,
                    {
                        fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto"
                    }
                ]}>
                    {player2Pubkey ? shortenKey(player2Pubkey) : "Finding..."}
                </Text>
            </View>

            <View style={styles.vsContainer}>
                <Text style={{
                    fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto",
                    color: "#ffffff",
                    fontSize: 18,
                }}>
                    {stake}
                </Text>
            </View>

            {/* Player 1 - RIGHT */}
            <View style={styles.playerContainer}>
                <Text style={[
                    styles.pubkeyText,
                    {
                        fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto"
                    }
                ]}>
                    {player1Pubkey ? shortenKey(player1Pubkey) : "Finding..."}
                </Text>
                {renderAvatar(highlightPlayer1, "#3DE3B4")}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#000000",
        paddingHorizontal: 10,
        marginBottom: 5,
        alignItems: "center",
    },
    playerContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    avatarOuter: {
        width: 40,
        height: 40,
        borderRadius: 20,
        padding: 3,
    },
    inactiveBorder: {
        borderWidth: 2,
        borderColor: "#333",
    },
    avatarInner: {
        flex: 1,
        backgroundColor: "#000000",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    pubkeyText: {
        marginTop: 6,
        color: "#ffffff",
        fontSize: 12,
        opacity: 0.7,
    },
    vsContainer: {
        alignItems: "center",
        justifyContent: "center",
    },

});