import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useFonts, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import axios from "axios";
import { useWallet } from '@/src/hooks/useWallet'
import { useWalletStore } from '@/src/stores/wallet-store'
import { GradientCard } from '@/src/components/GradientCard'
import { TopContainer } from '@/src/components/TopContainer'
import { SegmentToggle } from '@/src/components/SegmentToggle'
import { gameBalance } from '@/src/stores/gameBalance'
import { REST_URL } from '@/src/config/config'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { jwtStore } from '@/src/stores/jwt';
import { Header } from '@/src/components/Header';
import GradientCard2 from '@/src/components/GradientCard2';
import { GradientButton } from '@/src/components/GradientButton';
import { Ionicons } from '@expo/vector-icons';
import { GET_BALANCE_TYPE_TS } from '@/src/config/serverInputs';

export default function Wallet() {
    const displayFont = "Orbitron_900Black"
    const [asset, setAsset] = useState<"SOL" | "SKR">("SOL")
    const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT")
    const [amount, setAmount] = useState<string>("")
    const isDevnet = useWalletStore(s => s.isDevnet)
    const wallet = useWallet()
    const setIsDevnet = useWalletStore(s => s.setIsDevnet)
    const lamports = gameBalance(s => s.lamports);
    const skr = gameBalance(s => s.skr);
    const setLamports = gameBalance(s => s.setLamports);
    const setSkr = gameBalance(s => s.setSkr);
    const jwt = jwtStore(s => s.jwt);
    const [showSol, setShowSol] = useState(true)
    const [sending, setSending] = useState(false);

    let disabled = false;
    if (sending) {
        disabled = true;
    }
    else if (!wallet.publicKey || !jwt) {
        disabled = true;
    } 
    else if (isDevnet) {
        // On devnet ONLY deposit SOL is allowed
        if (!(mode === "DEPOSIT" && asset === "SOL")) {
            disabled = true;
        }
    }

    const showDevnetRestriction =
    isDevnet && !(mode === "DEPOSIT" && asset === "SOL");

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
        }
    }, []);

    const transferSol = async () => {
        setSending(true)
        if (!wallet.publicKey || !jwt) return;

        const parsedAmount = parseFloat(amount);

        if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        return;
        }

        try {
            const signature = await wallet.sendSOL(parsedAmount);
            if (!signature) return;


            await axios.post(
                `${REST_URL}/deposit`,
                {
                    network: wallet.isDevnet ? "DEVNET" : "MAINNET",
                    asset,
                    signature,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );

            await fetchBalance(wallet.publicKey, jwt, isDevnet);
        } catch (e) {
            console.log(e);
        }
        finally {
            setSending(false)
        }
    };

    const transferSeeker = async () => {
        setSending(true)
        if (!wallet.publicKey || !jwt || isDevnet) return;
        try {
            const signature = await wallet.sendSKR(parseFloat(amount));
            if (!signature) return;
            const res = await axios.post(
                `${REST_URL}/deposit`,
                {
                    network: wallet.isDevnet ? "DEVNET" : "MAINNET",
                    asset,
                    signature,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );
            const data = res.data;
            await fetchBalance(wallet.publicKey, jwt, isDevnet);
        }
        catch (e) {
            console.log(e)
        }
        finally{
            setSending(false)
        }
    }

    const withdraw = async () => {
        setSending(true);
        if (!wallet.publicKey || !jwt) return;

        const parsedAmount = parseFloat(amount);

        if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
            return;
        }

        try {

            await axios.post(
                `${REST_URL}/withdraw`,
                {
                    asset,
                    amount: asset == "SKR" ? parsedAmount*1_000_000 : parsedAmount*LAMPORTS_PER_SOL,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
        );

        await fetchBalance(wallet.publicKey, jwt, isDevnet);
        } catch (e) {
            console.log(e);
        }
        finally {
            setSending(false)
        }
    }

    const handleDepositWithdraw = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return;
        }
        if (mode == "DEPOSIT") {
            if (asset == "SOL") {
                await transferSol();
            }
            else {
                await transferSeeker();
            }
        }
        else {
            await withdraw();
        }
    }

    return (
        <TopContainer>
        <View style={styles.statusContainer}>
            <View style={styles.statusBar}>
            <TouchableOpacity style={
            {
                backgroundColor: wallet.publicKey
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
                if (!wallet.publicKey) return
                setIsDevnet(!wallet.isDevnet)
                await fetchBalance(wallet.publicKey, jwt, !wallet.isDevnet)
            }}>
                <View style={styles.statusItem}>
                <View style={[
                    styles.statusDot,
                    {
                        backgroundColor: wallet.publicKey ? (isDevnet ? "#3DE3B4" : "#B048C2") : "#f54444"
                    }
                ]} />
                <Text style={[
                    styles.statusText,
                    {
                        color: wallet.publicKey ? (isDevnet ? "#3DE3B4" : "#B048C2") : "#f54444"
                    }
                ]}>
                    {wallet.publicKey ? (isDevnet ? "DEVNET" : "MAINNET") : "WALLET NOT CONNECTED"}
                </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => {
                setShowSol(p => !p);
            }} style={styles.balanceBadge}>
                <Text style={[
                    styles.balanceText,
                    { fontFamily: "Orbitron_900Black"}
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
            <Header title={'TREASURY'} tagline={''} />
            </View>

        {/* WALLET CARD */}
            <GradientCard2 padding={10}>
            <Text style={styles.label}>CONNECTED WALLET</Text>
                {!wallet.publicKey && <Text style={styles.pubKey}>
                Wallet Not Connected
            </Text>}
            {wallet.publicKey && <Text style={[
                styles.pubKey,
                {
                    fontFamily: displayFont
                }
            ]}>
            {wallet.publicKey}
            </Text>}
            </GradientCard2>

        {/* BALANCE */}
            <LinearGradient
            colors={['rgba(176,72,194,0.08)', 'rgba(61,227,180,0.05)']}
            style={styles.balanceContainer}
            >
            <Text style={styles.balanceLabel}>CHESS ON CHAIN BALANCE</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={[styles.balanceBig, { fontFamily: displayFont }]}>
                {asset === "SOL"
                ? `${(lamports / LAMPORTS_PER_SOL).toFixed(4)}`
                : `${skr / 1000000}`}
            </Text>
            <Text style={{
                fontFamily: displayFont,
                color: !isDevnet ? '#B048C2' : '#3DE3B4',
                fontSize: 18,
            }}>
                {asset === "SOL"
                ? `sol`
                : `skr`}
            </Text>
            </View>
            </LinearGradient>

        {/* SEGMENT TOGGLES */}
            <SegmentToggle
            options={["SOL", "SKR"]}
            selected={asset}
            onChange={setAsset}
            />

            <SegmentToggle
            options={["DEPOSIT", "WITHDRAW"]}
            selected={mode}
            onChange={setMode}
            />

        {/* ACTION CARD */}
            <GradientCard2 padding={10}>
            <View style={{
                flexDirection: "column",
                alignItems: "stretch",
                width: "100%"
            }}>
                <Text style={styles.label}>{mode} {asset} {showDevnetRestriction && "(DEVNET: ONLY SOL DEPOSIT ALLOWED)"}</Text>

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
                        placeholder="Enter amount"
                        placeholderTextColor="#6B7280"
                        value={amount.toString()}
                        onChangeText={(text) => {
                            // Normalize comma to dot
                            const normalized = text.replace(",", ".");

                            // Allow:
                            // "", "0", "0.", ".5", "1.23"
                            if (/^\d*\.?\d*$/.test(normalized)) {
                                setAmount(normalized);
                            }
                        }}
                        keyboardType="number-pad"
                        style={styles.input}
                        cursorColor="#3DE3B4"
                    />
                </View>
                
                <GradientButton
                disabled={disabled} 
                onPress={handleDepositWithdraw} 
                text={sending ? "PROCESSING ..." : `${mode} ${asset}`}
                fontFamily="Orbitron_900Black"
                />
            </View>
            </GradientCard2>
        </ScrollView>
        </TopContainer >
    )
}


const styles = StyleSheet.create({

  label: {
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 2.2,
    marginBottom: 12,
    textTransform: 'uppercase',
    fontWeight: '900'
  },

  pubKey: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.5,
  },

  /* ===== BALANCE ===== */

  balanceContainer: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#121217',
    paddingVertical: 16,
    alignItems: 'center',
  },

  balanceLabel: {
    color: '#6B7280',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  balanceBig: {
    fontSize: 18,
    color: "#fff"
  },

  balanceAmount: {
    color: '#fff',
    fontSize: 40,
    letterSpacing: 1,
  },

  /* ===== INPUT ===== */

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    letterSpacing: 1,
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
    marginBottom: 16
  },

  /* ===== BUTTON ===== */

  actionButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },

  actionButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
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