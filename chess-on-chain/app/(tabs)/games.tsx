import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TopContainer } from "@/src/components/TopContainer";
import { GradientButton } from "@/src/components/GradientButton";
import { gameBalance } from "@/src/stores/gameBalance";
import { useWalletStore } from "@/src/stores/wallet-store";
import { GET_BALANCE_TYPE_TS, INIT_CUSTOM_GAME_TYPE_TS } from "@/src/config/serverInputs";
import { REST_URL } from "@/src/config/config";
import axios from "axios";
import { jwtStore } from "@/src/stores/jwt";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Header } from "@/src/components/Header";
import GradientCard2 from "@/src/components/GradientCard2";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { gamesStore } from "@/src/stores/gamesStore";
import { JoinSpectate } from "@/src/components/JoinSpectate";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Gesture, RefreshControl } from 'react-native-gesture-handler';
import { PullToRefresh } from "@/src/components/Gestures/PullToRefresh";



export default function Games() {
    const [showSol, setShowSol] = useState(true)
    const publicKey = useWalletStore(s => s.publicKey)
    const isDevnet = useWalletStore(s => s.isDevnet)
    const setIsDevnet = useWalletStore(s => s.setIsDevnet)
    const lamports = gameBalance(s => s.lamports)
    const setLamports = gameBalance(s => s.setLamports)
    const setSkr = gameBalance(s => s.setSkr)
    const skr = gameBalance(s => s.skr)
    const jwt = jwtStore(s => s.jwt)
    const setGames = gamesStore(s => s.setGames)
    const games = gamesStore(s => s.games)
    const isFocused = useIsFocused()
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (isDevnet && isFocused) {
            setIsDevnet(false)
            fetchBalance(publicKey, jwt, false)
        }
        if (jwt && isFocused) {
            getGames();
        }
    }, [isFocused])

    const fetchBalance = useCallback(async (
        publicKey: string | null,
        jwt: string | null,
        isDevnet: boolean
    ) => {
        if (!publicKey || !jwt) return;
        try {
            const payload: GET_BALANCE_TYPE_TS = {
                network: isDevnet ? "DEVNET" : "MAINNET",
            };
            const res = await axios.post(`${REST_URL}/getBalance`, payload, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            const data = res.data;
            setLamports(Number(data.lamports));
            setSkr(Number(data.skr));
        } catch (e) {
            console.log(e);
        }
    }, []);


    const getGames = useCallback(async () => {
        setIsRefreshing(true);
        const res = await axios.post(`${REST_URL}/getGames`, {}, {
            headers: { Authorization: `Bearer ${jwt}` },
        })
        setGames(res.data.games)
        setIsRefreshing(false);
    }, [jwt, publicKey])

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
                    disabled={!publicKey}
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
                            { fontFamily:"Orbitron_900Black" }
                        ]}>
                            {showSol ? `◎ ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} sol` : `◎ ${(skr / 1_000_000).toFixed(2)} skr`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{
                marginTop: 40
            }}>
                <Header title={'LIVE ARENAS'} tagline={'Watch. Join. Conquer.'} />
            </View>

            <JoinSpectate/>

            <View style={{
                flex: 1,
            }}>
                <Text style={{
                    fontFamily: "Orbitron_900Black",
                    fontSize: 18,
                    color: "#ffffff",
                }}>
                    GAMES
                </Text>
                <View style={styles.divider} />
                <FlatList 
                refreshControl={
                    <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={getGames}
                    tintColor="#3DE3B4"
                    colors={["#B048C2"]}
                    />
                }
                data={games}
                keyExtractor={(game) => game.id}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                style={{
                    flex: 1, 
                    paddingTop: 15,
                }}
                renderItem={({ item }) => {
                    const IN_PROGRESS = item.status === "IN_PROGRESS";

                    let statusColor: string;
                    if (item.status == "IN_PROGRESS") statusColor = "#12372c91";
                    else if (item.status == "CHECKMATE") statusColor = "#4f19196e";
                    else statusColor = "#391e3ca8";

                    let statusTextColor: string;
                    if (item.status == "IN_PROGRESS") statusTextColor = "#3DE3B4";
                    else if (item.status == "CHECKMATE") statusTextColor = "#f54444";
                    else statusTextColor = "#B048C2";

                    const stakeText = item.customGame
                        ? `${(item.skr * 2) / 1_000_000} SKR`
                        : `${(item.lamports * 2) / LAMPORTS_PER_SOL} SOL`;

                    return (
                        <Animated.View 
                        entering={FadeInDown.delay(50).duration(200).springify()}
                        exiting={FadeOutDown.delay(50).duration(200).springify()}
                        >
                            <GradientCard2 padding={20}>
                                <View style={styles.gameCardInner}>
                                    <View style={styles.gameHeaderRow}>
                                        <Text style={styles.gameTitle}>
                                            {item.customGame ? "CUSTOM ARENA" : "OPEN ARENA"}
                                        </Text>

                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: item.network == "MAINNET" ? "#391e3ca8" : "#12372c91"}
                                        ]}>
                                            <Text style={[
                                                styles.statusBadgeText,
                                                { color: item.network == "MAINNET" ? "#B048C2" : "#3DE3B4"}
                                            ]}>
                                                {item.network}
                                            </Text>
                                        </View>

                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: statusColor }
                                        ]}>
                                            <Text style={[
                                                styles.statusBadgeText,
                                                { color: statusTextColor}
                                            ]}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{
                                        flexDirection: "row",
                                        gap: 10,
                                        alignItems: "center"
                                    }}>
                                        <Text style={styles.stakeText}>
                                        ◎ {stakeText}
                                        </Text>

                                        {item.winner && (
                                        <Text style={[
                                            styles.winnerText,
                                            {
                                                color: item.winner == "w" && item.player1PublicKey == publicKey ? "#3DE3B4" : "#f54444"
                                            }
                                        ]}>
                                            {item.winner == "w" && item.player1PublicKey == publicKey ? "VICTORY" : "DEFEAT"}
                                        </Text>
                                        )}
                                    </View>

                                    {/* CTA */}
                                    <View style={{ marginTop: 14 }}>
                                    <GradientButton
                                        text={ IN_PROGRESS ? "JOIN MATCH" : "VIEW FINAL POSITION"}
                                        onPress={() => {
                                            if (IN_PROGRESS) {
                                                if (item.customGame){
                                                    router.push({
                                                        pathname: "/JoinCustom/[gameId]",
                                                        params: {
                                                            gameId: item.id,
                                                        },
                                                    })
                                                }
                                                else {
                                                    router.push({
                                                        pathname: "/Game/[gameId]",
                                                        params: {
                                                            gameId: item.id,
                                                            sol: ((item.lamports)/LAMPORTS_PER_SOL).toString(),
                                                            network: item.network
                                                        }
                                                    })
                                                }
                                            }
                                            else {
                                                router.push({
                                                    pathname: "/FinalPosition/[gameId]",
                                                    params: {gameId: item.id},
                                                });
                                            }
                                        }}
                                        fontFamily="Orbitron_900Black"
                                        disabled={false}
                                    />
                                    </View>

                                </View>
                            </GradientCard2>
                        </Animated.View>
                    );
                    }}
                />
            </View>
        </TopContainer>
    )
}


const styles = StyleSheet.create({
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

    scrollContent: {
        paddingBottom: 32,
    },

    gameCardInner: {
        borderRadius: 16,
        padding: 0,
    },

    gameHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    gameTitle: {
        fontFamily: "Orbitron_900Black",
        fontSize: 13,
        letterSpacing: 1.5,
        color: "#FFFFFF",
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    statusBadgeText: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1,
    },

    stakeText: {
        color: "#B048C2",
        fontSize: 14,
        fontWeight: "bold",
        textShadowColor: '#ffffff',
        textShadowOffset: { width: .5, height: .5 },
        textShadowRadius: 1,
    },

    playersRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    playerText: {
        color: "#FFFFFF",
        fontSize: 12,
    },

    vsText: {
        color: "#6B7280",
        fontSize: 11,
    },

    timerText: {
        color: "#9CA3AF",
        fontSize: 11,
        marginTop: 6,
    },

    winnerText: {
        fontSize: 12,
    },

    divider: {
        height: 1,
        backgroundColor: "#2A2A30",
        marginTop: 10,
    },
});