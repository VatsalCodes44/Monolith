import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { TopContainer } from "@/src/components/TopContainer";
import { GradientButton } from "@/src/components/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { HeroSection } from "@/src/components/HeroSection";
import { useWallet } from "@/src/hooks/useWallet";
import { gameBalance } from "@/src/stores/gameBalance";

export default function DeployCustom() {
    const wallet = useWallet();
    const lamports = gameBalance((s) => s.lamports);

    const [opponentKey, setOpponentKey] = useState("");
    const [skrAmount, setSkrAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDeploy = useCallback(async () => {
        ;
    }, []);

    return (
        <TopContainer>
            <HeroSection
                wallet={wallet}
                lamports={lamports}
                fontsLoaded={false}
                title="DEPLOY CUSTOM ARENA"
                tagline="Private duel. Zero platform tax. Pure on-chain execution."
                fetchbalance={() => { }}
                onPress={() => { }}
            />

            <LinearGradient
                colors={["#B048C2", "#9082DB", "#3DE3B4"]}
                style={styles.cardBorder}
            >
                <View style={styles.cardInner}>
                    <Text style={styles.label}>OPPONENT PUBLIC KEY</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="wallet-outline"
                            size={18}
                            color="#3DE3B4"
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            placeholder="Enter Solana wallet address…"
                            placeholderTextColor="#6B7280"
                            value={opponentKey}
                            onChangeText={(text) => {
                                setOpponentKey(text);
                            }}
                            style={styles.input}
                            cursorColor="#3DE3B4"
                            autoCorrect={false}
                            autoCapitalize="none"
                            autoComplete="off"
                        />
                    </View>

                    <Text style={styles.helperText}>
                        If no player joins the custom game within five minutes of its creation, the game will be automatically deleted.
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>STAKE IN SEEKER (SKR)</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="flash-outline"
                            size={18}
                            color="#B048C2"
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            placeholder="Enter SKR amount"
                            placeholderTextColor="#6B7280"
                            value={skrAmount}
                            onChangeText={(text) => {
                                setSkrAmount(text);
                            }}
                            keyboardType="numeric"
                            style={styles.input}
                            cursorColor="#B048C2"
                        />
                    </View>

                    <Text style={styles.helperText}>
                        Custom matches are exclusively settled in SKR.
                    </Text>

                    <View style={{ marginTop: 26 }}>
                        <GradientButton
                            text={loading ? "Deploying on-chain..." : "DEPLOY MATCH"}
                            onPress={handleDeploy}
                            fontFamily="System"
                        />
                        {loading && (
                            <ActivityIndicator
                                size="small"
                                color="#3DE3B4"
                                style={{ marginTop: 14 }}
                            />
                        )}
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.noticeContainer}>
                <LinearGradient
                    colors={["#B048C2", "#3DE3B4"]}
                    style={styles.noticeAccent}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.noticeTitle}>⚠ Important Notice</Text>
                    <Text style={styles.noticeText}>
                        Custom matches can only be deployed on{" "}
                        <Text style={styles.highlight}>Mainnet</Text>.{"\n\n"}
                        Entry is exclusively in{" "}
                        <Text style={styles.highlight}>Seeker (SKR)</Text> tokens.{"\n\n"}
                        <Text style={styles.highlight}>0% platform fee</Text> is deducted —
                        100% of the total stake goes to the winner.{"\n\n"}
                        Standard open arenas charge 5% from both players.
                    </Text>
                </View>
            </View>
        </TopContainer>
    );
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
        padding: 24,
    },
    label: {
        color: "#9CA3AF",
        fontSize: 11,
        letterSpacing: 1.8,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F1F24",
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: "#2A2A30",
    },
    input: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 14,
        letterSpacing: 1,
    },
    helperText: {
        color: "#6B7280",
        fontSize: 11,
        marginTop: 6,
    },
    divider: {
        height: 1,
        backgroundColor: "#2A2A30",
        marginVertical: 20,
    },
    noticeContainer: {
        flexDirection: "row",
        backgroundColor: "#121217",
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    noticeAccent: {
        width: 4,
        borderRadius: 2,
        marginRight: 14,
    },
    noticeTitle: {
        color: "#FFFFFF",
        fontSize: 14,
        marginBottom: 10,
        letterSpacing: 1,
    },
    noticeText: {
        color: "#9CA3AF",
        fontSize: 12,
        lineHeight: 20,
    },
    highlight: {
        color: "#3DE3B4",
        fontWeight: "600",
    },
});