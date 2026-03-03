import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { TopContainer } from "@/src/components/TopContainer";
import { GradientButton } from "@/src/components/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { gameBalance } from "@/src/stores/gameBalance";
import { isValidPublicKey } from "@/src/utils/isvalidPublicKey";
import { useWalletStore } from "@/src/stores/wallet-store";
import { GET_BALANCE_TYPE_TS, INIT_CUSTOM_GAME_TYPE_TS } from "@/src/config/serverInputs";
import { REST_URL } from "@/src/config/config";
import axios from "axios";
import { jwtStore } from "@/src/stores/jwt";
import { INIT_CUSTOM_GAME } from "@/src/config/serverResponds";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Header } from "@/src/components/Header";

export default function DeployCustom() {
    const fontsLoaded = true;
    const [opponentKey, setOpponentKey] = useState<string>("");
    const [isValidPubKey, setIsValidPubKey] = useState(true);
    const minSkr = 50;
    const [skrAmount, setSkrAmount] = useState<string>("0");
    const [loading, setLoading] = useState(false);
    const publicKey = useWalletStore(s => s.publicKey)
    const isDevnet = useWalletStore(s => s.isDevnet)
    const setIsDevnet = useWalletStore(s => s.setIsDevnet)
    const lamports = gameBalance(s => s.lamports)
    const setLamports = gameBalance(s => s.setLamports)
    const setSkr = gameBalance(s => s.setSkr)
    const skr = gameBalance(s => s.skr)
    const jwt = jwtStore(s => s.jwt)
    const [customState, setCustomState] = useState<"DEPLOY MATCH" | "DEPLOYING" | "DEPLOYED" | "ERROR IN DEPLOYING" | "INSUFFICIENT SKR">("DEPLOY MATCH")
    const [gameId, setGameId] = useState<string | null>(null)
    const [showSol, setShowSol] = useState(true);
    const fetchBalance = useCallback(async (
        publicKey: string | null,
        jwt: string | null,
        isDevnet: boolean
    ) => {
        console.log("🔥 fetchBalance called");
        console.log(publicKey, "2222222222222222", jwt)
        if (!publicKey || !jwt) return;
        try {
            const payload: GET_BALANCE_TYPE_TS = {
                network: isDevnet ? "DEVNET" : "MAINNET",
            };
            const res = await axios.post(`${REST_URL}/getBalance`, payload, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            const data = res.data;
            console.log("RAW DATA:", data.lamports, "-----------", data.skr);
            setLamports(Number(data.lamports));
            setSkr(Number(data.skr));
            console.log("STORE STATE:", gameBalance.getState().lamports);
        } catch (e) {
            console.log(e);
        }
    }, []);

    const disabled = () => {
        if (parseFloat(skrAmount) < minSkr) return true;
        if (!isValidPubKey) return true;
        return false;
    }

    const deployCustom = async () => {
        setCustomState("DEPLOYING");
        const body: INIT_CUSTOM_GAME_TYPE_TS = {
            type: INIT_CUSTOM_GAME,
            payload: {
                skr: parseFloat(skrAmount) * 1000000,
                opponentPublicKey: opponentKey,
            }
        }
        const res = await axios.post(`${REST_URL}/deployCustom`, body, {
            headers: { Authorization: `Bearer ${jwt}` },

        });
        if (res.status == 200) {
            setGameId(res.data.payload.gameId);
            setCustomState("DEPLOYED");
        }
        else {
            setCustomState("ERROR IN DEPLOYING");
        }
    }

    return (
        <TopContainer>
            <View style={styles.statusContainer}>
                <View style={styles.statusBar}>
                    <TouchableOpacity style={
                    {
                        backgroundColor: publicKey
                            ? (isDevnet
                                ? "#12372c91"
                                : "#391e3ca8")
                            : "#4f19196e",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#2A2A30',
                    }} 
                    onPress={async () => {
                        if (!publicKey) return;
                        setIsDevnet(!isDevnet)
                        await fetchBalance(publicKey, jwt, !isDevnet)
                    }}>
                        <View style={styles.statusItem}>
                            <View style={[
                                styles.statusDot,
                                {
                                    backgroundColor: publicKey ? (isDevnet ? "#3DE3B4" : "#B048C2") : "#f54444"
                                }
                            ]} />
                            <Text style={[
                                styles.statusText,
                                {
                                    color: publicKey ? (isDevnet ? "#3DE3B4" : "#B048C2") : "#f54444"
                                }
                            ]}>
                                {publicKey ? (isDevnet ? "DEVNET" : "MAINNET") : "WALLET NOT CONNECTED"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setShowSol(p => !p);
                    }} style={styles.balanceBadge}>
                        <Text style={[
                            styles.balanceText,
                            { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                        ]}>
                            {showSol ? `◎ ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} sol` : `◎ ${(skr / 1_000_000).toFixed(2)} skr`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    marginTop: 40
                }}>
                    <Header title={'DEPLOY CUSTOM ARENA'} tagline={'Private duel. Zero platform tax. Pure on-chain execution.'} fontsLoaded={fontsLoaded} />
                </View>

                <LinearGradient
                    colors={["#B048C2", "#9082DB", "#3DE3B4"]}
                    style={styles.cardBorder}
                >
                    <View style={styles.cardInner}>
                        <Text style={styles.label}>OPPONENT PUBLIC KEY</Text>

                        <View style={[
                            styles.inputContainer,
                            {
                                borderColor: "#B048C2",
                                borderWidth: 1,
                            }
                        ]}>
                            <Ionicons
                                name="wallet-outline"
                                size={18}
                                color="#B048C2"
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                placeholder="Enter Solana wallet address…"
                                placeholderTextColor="#6B7280"
                                value={opponentKey}
                                onChangeText={(text) => {
                                    if (text != "") {
                                        setIsValidPubKey(isValidPublicKey(text));
                                    }
                                    else {
                                        setIsValidPubKey(true)
                                    }
                                    setOpponentKey(text);
                                }}
                                style={styles.input}
                                cursorColor="#B048C2"
                                autoCorrect={false}
                                autoCapitalize="none"
                                autoComplete="off"
                            />
                        </View>

                        <Text style={[
                            styles.helperText,
                            {
                                color: !isValidPubKey ? "#dc4949ae" : "#6B7280"
                            }
                        ]}>
                            {!isValidPubKey ? "Please enter only valid PublicKey" : "If no player joins the custom game within five minutes of its creation, the game will be automatically deleted."}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.label}>STAKE IN SEEKER (SKR)</Text>

                        <View style={[
                            styles.inputContainer,
                            {
                                borderColor: "#3DE3B4",
                                borderWidth: 1,
                            }
                        ]}>
                            <Ionicons
                                name="flash-outline"
                                size={18}
                                color="#3DE3B4"
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                placeholder="Enter SKR amount"
                                placeholderTextColor="#6B7280"
                                value={skrAmount.toString()}
                                onChangeText={(text) => {
                                    // Normalize comma to dot
                                    const normalized = text.replace(",", ".");

                                    // Allow:
                                    // "", "0", "0.", ".5", "1.23"
                                    if (/^\d*\.?\d*$/.test(normalized)) {
                                        setSkrAmount(normalized);
                                    }
                                }}
                                keyboardType="number-pad"
                                style={styles.input}
                                cursorColor="#3DE3B4"
                            />
                        </View>

                        <Text style={[
                            styles.helperText,
                            {
                                color: parseFloat(skrAmount) > 0 && parseFloat(skrAmount) < minSkr ? "#dc4949ae" : "#6B7280"
                            }
                        ]}>
                            {parseFloat(skrAmount) > 0 && parseFloat(skrAmount) < minSkr
                                ? `Minimum amount is ${minSkr} SKR`
                                : "Custom matches are exclusively settled in SKR."}
                        </Text>

                        <View style={{
                            marginTop: 26,
                            gap: 10,
                            opacity: disabled() ? .5 : 1
                        }}>
                            <GradientButton
                                text={customState}
                                onPress={async () => {
                                    if (parseFloat(skrAmount) > skr) {
                                        setCustomState("INSUFFICIENT SKR")
                                        return;
                                    }
                                    await deployCustom();
                                }}
                                fontFamily="Orbitron_900Black"
                                disabled={disabled()}
                            />

                            {gameId && (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: "row",
                                        gap: 5,
                                        marginTop: 6 
                                    }}
                                    onPress={() => {
                                        Clipboard.setString(gameId)
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 12, 
                                        color: "#6B7280"                                      
                                    }}>
                                        Game ID: {gameId}
                                    </Text>
                                    <Ionicons
                                        name="copy-outline"
                                        size={18}
                                        color="#6B7280"
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
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
            </ScrollView>
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

    scrollContent: {
        paddingBottom: 32,
    },

    statusContainer: {
        alignItems: "center",
        width: "100%",
    },

    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 4,
        maxHeight: 40,
        backgroundColor: "#ffffff0"
    },

    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    statusText: {
        color: '#9CA3AF',
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    balanceBadge: {
        backgroundColor: '#1F1F24',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2A2A30',
    },

    balanceText: {
        color: '#FFFFFF',
        fontSize: 12,
        letterSpacing: 1,
    },

});