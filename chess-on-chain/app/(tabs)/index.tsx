import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ImageBackground } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useFonts, Orbitron_900Black, Orbitron_800ExtraBold } from '@expo-google-fonts/orbitron'
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GameBet } from '@/src/stores/gameBet';
import { WP } from '@/src/components/pieces/wP';
import { WN } from '@/src/components/pieces/wN';
import { WK } from '@/src/components/pieces/wK';
import { useWalletStore } from '@/src/stores/wallet-store';
import { useWallet } from '@/src/hooks/useWallet';
import { WalletConnect } from '@/src/components/WalletConnect';
import axios from "axios";
import { REST_URL } from '@/src/config/config';
import { gameBalance } from '@/src/stores/gameBalance';
import { TopContainer } from '@/src/components/TopContainer';
import { GradientButton } from '@/src/components/GradientButton';
import { GET_BALANCE_TYPE_TS } from '@/src/config/serverInputs';
import { jwtStore } from '@/src/stores/jwt';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Header } from '@/src/components/Header';

export default function Index() {
    const [fontsLoaded] = useFonts({
        Orbitron_900Black,
    });

    const [showSol, setShowSol] = useState(true)
    const wallet = useWallet();
    const setIsDevnet = useWalletStore(s => s.setIsDevnet)
    const setSol = GameBet(s => s.setSol)
    const setLamports = gameBalance(s => s.setLamports);
    const lamports = gameBalance(s => s.lamports);
    const setSkr = gameBalance(s => s.setSkr);
    const skr = gameBalance(s => s.skr);
    const jwt = jwtStore(s => s.jwt);
    const setJwt = jwtStore(s => s.setJwt);
    const disabled = () => {
        if (!wallet.publicKey) return true;
        if (!jwt) return true;
        return false;
    }
    const stakeOptions: {
        amount: "0.01" | "0.05" | "0.1",
        piece: React.JSX.Element,
        label: string,
        subtitle: string
    }[] = [
        {
            amount: "0.01",
            piece: <WP height={56} width={56} />,
            label: "PAWN",
            subtitle: "Entry Arena"
        },
        {
            amount: "0.05",
            piece: <WN height={56} width={56} />,
            label: "KNIGHT",
            subtitle: "Tactical Play"
        },
        {
            amount: "0.1",
            piece: <WK height={56} width={56} />,
            label: "KING",
            subtitle: "High Stakes"
        }
    ];

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

    return (
        <TopContainer>
            <View style={styles.statusContainer}>
                <View style={styles.statusBar}>
                    <TouchableOpacity style={
                    {
                        backgroundColor: wallet.publicKey
                            ? (wallet.isDevnet
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
                        if (!wallet.publicKey) return;
                        setIsDevnet(!wallet.isDevnet)
                        await fetchBalance(wallet.publicKey, jwt, !wallet.isDevnet)
                    }}>
                        <View style={styles.statusItem}>
                            <View style={[
                                styles.statusDot,
                                {
                                    backgroundColor: wallet.publicKey ? (wallet.isDevnet ? "#3DE3B4" : "#B048C2") : "#f54444"
                                }
                            ]} />
                            <Text style={[
                                styles.statusText,
                                {
                                    color: wallet.publicKey ? (wallet.isDevnet ? "#3DE3B4" : "#B048C2") : "#f54444"
                                }
                            ]}>
                                {wallet.publicKey ? (wallet.isDevnet ? "DEVNET" : "MAINNET") : "WALLET NOT CONNECTED"}
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
                    <Header title={'CHESS on CHAIN'} tagline={'Instant Deposit. Instant Withdraw.'} fontsLoaded={fontsLoaded} />
                </View>
                
                <View style={styles.stakeSection}>
                {stakeOptions.map((option, index) => (
                    <LinearGradient
                    colors={['#B048C2', '#9082DB', '#3DE3B4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardBorderGradient}
                    key={index}
                    >
                    <ImageBackground
                    source={require("../../assets/image/card.jpg")}
                    resizeMode="cover"
                    style={styles.cardInner}>
                        {/* Chess Piece */}
                        <View
                        style={styles.pieceSection}>
                            <View style={styles.pieceCircle}>
                                {option.piece}
                            </View>
                            <Text style={[
                                styles.pieceLabel,
                                { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                            ]}>
                                {option.label}
                            </Text>
                        </View>

                        {/* Stake Info */}
                        <View style={styles.stakeInfo}>
                            <Text style={[
                                styles.stakeAmount,
                                { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                            ]}>
                                {option.amount} SOL
                            </Text>
                            <Text style={styles.stakeSubtitle}>
                                {option.subtitle}
                            </Text>
                        </View>

                        {/* CTA Button */}
                        <GradientButton
                        onPress={async () => {
                            console.log("hello")
                            if (!wallet.publicKey || !jwt) return;
                            setSol(option.amount)
                            router.push({
                                pathname: "/Game/[gameId]",
                                params: {
                                    gameId: "null",
                                    sol: option.amount,
                                    network: wallet.isDevnet ? "DEVNET" : "MAINNET"
                                }
                            });
                        }}
                        text="ENTER ARENA"
                        fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
                        disabled={disabled()}
                        />
                    </ImageBackground>
                    </LinearGradient>
                ))}
                </View>

                {/* ACTION SECTION */}
                <View style={styles.actionSection}>
                {/* Dual Buttons */}
                <View style={styles.dualButtonRow}>
                    <GradientButton
                    text="DEPLOY CUSTOM"
                    disabled={disabled()}
                    onPress={() => {
                        router.push("/DeployCustom")
                    }}
                    fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
                    />

                    <GradientButton
                    text="BOT"
                    disabled={disabled()}
                    onPress={() => {
                        router.push("/Bot");
                    }}
                    fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
                    />
                </View>

                {/* Wallet Button */}
                <WalletConnect
                    wallet={wallet}
                    fontsLoaded={fontsLoaded}
                    setJwt={setJwt}
                    jwt={jwt}
                    fetchBalance={fetchBalance}
                />
                </View>
            </ScrollView>
        </TopContainer>
    )
}

const styles = StyleSheet.create({
  // ===== STAKE SECTION =====
    stakeSection: {
        gap: 16,
        marginBottom: 32,
    },

    stakeCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },

    cardBorderGradient: {
        padding: 2,
        borderRadius: 16,
        borderWidth: 6,
    },

    cardInner: {
        borderRadius: 16,
        margin: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        overflow: "hidden",
        borderWidth: 6
    },

    pieceSection: {
        alignItems: 'center',
        gap: 8,
    },

    pieceCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#1F1F24',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A2A30',
    },

    pieceLabel: {
        color: '#9CA3AF',
        fontSize: 10,
        letterSpacing: 1.5,
    },

    stakeInfo: {
        flex: 1,
        gap: 4,
    },

    stakeAmount: {
        color: '#FFFFFF',
        fontSize: 14,
        letterSpacing: 1,
        marginBottom: 2,
    },

    stakeSubtitle: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    securedText: {
        color: '#4B5563',
        fontSize: 10,
        letterSpacing: 0.5,
        marginTop: 2,
    },


    // ===== ACTION SECTION =====
    actionSection: {
        gap: 12,
        marginBottom: 16,
    },

    dualButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 4,
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

})
