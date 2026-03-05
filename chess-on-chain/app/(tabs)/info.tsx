import { Accordian } from "@/src/components/Accordian";
import { GradientButton } from "@/src/components/GradientButton";
import GradientCard2 from "@/src/components/GradientCard2";
import { Header } from "@/src/components/Header";
import { SegmentToggle } from "@/src/components/SegmentToggle";
import { TopContainer } from "@/src/components/TopContainer";
import { REST_URL } from "@/src/config/config";
import { GET_BALANCE_TYPE_TS } from "@/src/config/serverInputs";
import { useWallet } from "@/src/hooks/useWallet";
import { gameBalance } from "@/src/stores/gameBalance";
import { jwtStore } from "@/src/stores/jwt";
import { useWalletStore } from "@/src/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import { useCallback, useState } from "react";
import { StyleSheet, Text, Pressable, ScrollView, View, TouchableOpacity, TextInput } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export default function App() {

    const a1 = useSharedValue(false);
    const a2 = useSharedValue(false);
    const a3 = useSharedValue(false);
    const a4 = useSharedValue(false);
    const a5 = useSharedValue(false);
    const a6 = useSharedValue(false);
    const a7 = useSharedValue(false);
    const a8 = useSharedValue(false);
    const a9 = useSharedValue(false);
    const a10 = useSharedValue(false);

    const mode = "DEPOSIT"
    const [asset, setAsset] = useState<"SOL" | "SKR">("SOL")
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
    const [signature, setSignature] = useState("")

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

        try {


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


    const handleWithdraw = async () => {
        if (asset == "SOL") {
            await transferSol();
        }
        else {
            await transferSeeker();
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

            <View style={{
            marginTop: 40
            }}>
                <Header title={'FAQs'} tagline={''} />
            </View>

            <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            >

                {/* 1 */}
                <GradientButton
                marginBottom={8}
                disabled={false}
                onPress={() => {
                    a1.value = !a1.value
                    a2.value = false
                    a3.value = false
                    a4.value = false
                    a5.value = false
                    a6.value = false
                    a7.value = false
                    a8.value = false
                    a9.value = false
                    a10.value = false
                }}
                >
                <View style={styles.button}>
                    <Text style={styles.title}>What is Chess on Chain?</Text>
                </View>
                </GradientButton>

                <Accordian open={a1} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    Chess on Chain is a{" "}
                    <Text style={styles.highlight}>blockchain-powered chess platform</Text>{" "}
                    where players compete in{" "}
                    <Text style={styles.highlight}>skill-based matches</Text>{" "}
                    for <Text style={styles.highlight}>real crypto stakes</Text>.
                    </Text>

                    <Text style={styles.text}>
                    Players can join matches using{" "}
                    <Text style={styles.highlight}>SOL</Text> or{" "}
                    <Text style={styles.highlight}>SKR tokens</Text>{" "}
                    and compete <Text style={styles.highlight}>in real time</Text>.
                    </Text>

                    <Text style={styles.text}>Key features:</Text>

                    <Text style={styles.text}>
                    • Play real matches with <Text style={styles.highlight}>SOL stakes</Text>
                    </Text>

                    <Text style={styles.text}>
                    • Practice <Text style={styles.highlight}>unlimited bot games</Text>
                    </Text>

                    <Text style={styles.text}>
                    • Create <Text style={styles.highlight}>custom SKR matches</Text>
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Reconnect to games</Text> if disconnected in games tab
                    </Text>

                    <Text style={styles.text}>
                    • View <Text style={styles.highlight}>completed matches</Text> and boards
                    </Text>

                    <Text style={styles.text}>
                    All transactions are verified on the{" "}
                    <Text style={styles.highlight}>Solana blockchain</Text>.
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 2 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a1.value = false
                    a2.value = !a2.value
                    a3.value = false
                    a4.value = false
                    a5.value = false
                    a6.value = false
                    a7.value = false
                    a8.value = false
                    a9.value = false
                    a10.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>How do matches work?</Text>
                    </View>
                </GradientButton>

                <Accordian open={a2} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    Players select a <Text style={styles.highlight}>stake amount</Text>.
                    </Text>

                    <Text style={styles.text}>Available stakes:</Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>0.01 SOL</Text>
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>0.05 SOL</Text>
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>0.1 SOL</Text>
                    </Text>

                    <Text style={styles.text}>
                    Once two players join the same level, the{" "}
                    <Text style={styles.highlight}>match begins instantly</Text>.
                    </Text>

                    <Text style={styles.text}>
                    The winner receives the{" "}
                    <Text style={styles.highlight}>prize pool</Text>.
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 3 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a3.value = !a3.value
                    a1.value = a2.value = a4.value = a5.value = a6.value = a7.value = a8.value = a9.value = false
                    a10.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>What fees are charged?</Text>
                    </View>
                </GradientButton>

                <Accordian open={a3} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    The platform takes a{" "}
                    <Text style={styles.highlight}>5% fee</Text>{" "}
                    from each player in SOL matches.
                    </Text>

                    <Text style={styles.text}>
                    Example with <Text style={styles.highlight}>0.1 SOL</Text> each:
                    </Text>

                    <Text style={styles.text}>
                    Total pool: <Text style={styles.highlight}>0.2 SOL</Text>
                    </Text>

                    <Text style={styles.text}>
                    Platform fee: <Text style={styles.highlight}>0.01 SOL</Text>
                    </Text>

                    <Text style={styles.text}>
                    Winner receives: <Text style={styles.highlight}>0.19 SOL</Text>
                    </Text>

                    <Text style={styles.text}>
                    Custom matches using{" "}
                    <Text style={styles.highlight}>SKR tokens</Text>{" "}
                    have <Text style={styles.highlight}>ZERO platform fees</Text>.
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 4 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a4.value = !a4.value
                    a10.value = false
                    a1.value = a2.value = a3.value = a5.value = a6.value = a7.value = a8.value = a9.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>Wallet login flow</Text>
                    </View>
                </GradientButton>

                <Accordian open={a4} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    Chess on Chain uses a <Text style={styles.highlight}>secure wallet login process</Text>.
                    </Text>

                    <Text style={styles.text}>
                    When you click <Text style={styles.highlight}>Connect Wallet</Text>, the login happens in two steps:
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Step 1 — Wallet Connection</Text>
                    </Text>

                    <Text style={styles.text}>
                    The wallet opens and asks for permission to connect. Once approved, the platform receives your{" "}
                    <Text style={styles.highlight}>public wallet address</Text>.
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Step 2 — Identity Verification</Text>
                    </Text>

                    <Text style={styles.text}>
                    The backend sends a <Text style={styles.highlight}>unique message</Text> to your wallet.
                    You must <Text style={styles.highlight}>sign this message</Text> to prove that you own the wallet.
                    </Text>

                    <Text style={styles.text}>
                    This signed message is verified by the server and a{" "}
                    <Text style={styles.highlight}>secure session token</Text> is created.
                    </Text>

                    <Text style={styles.text}>
                    <Text style={styles.highlight}>Important:</Text>
                    </Text>

                    <Text style={styles.text}>
                    • Your <Text style={styles.highlight}>private key never leaves your wallet</Text>
                    </Text>

                    <Text style={styles.text}>
                    • The signature only <Text style={styles.highlight}>verifies ownership</Text>
                    </Text>

                    <Text style={styles.text}>
                    • No funds can move without <Text style={styles.highlight}>transaction approval</Text>
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 5 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a5.value = !a5.value
                    a10.value = false
                    a1.value = a2.value = a3.value = a4.value = a6.value = a7.value = a8.value = a9.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>Deposits & Withdrawals</Text>
                    </View>
                </GradientButton>

                <Accordian open={a5} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    You can deposit and withdraw{" "}
                    <Text style={styles.highlight}>SOL and SKR</Text>.
                    </Text>

                    <Text style={styles.text}>
                    Deposits update once the{" "}
                    <Text style={styles.highlight}>blockchain confirms</Text>.
                    </Text>

                    <Text style={styles.text}>
                    Withdrawals are sent directly to your{" "}
                    <Text style={styles.highlight}>connected wallet</Text>.
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 6 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a6.value = !a6.value
                    a10.value = false
                    a1.value = a2.value = a3.value = a4.value = a5.value = a7.value = a8.value = a9.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>What happens if I disconnect?</Text>
                    </View>
                </GradientButton>

                <Accordian open={a6} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    You can <Text style={styles.highlight}>rejoin the game</Text>.
                    </Text>

                    <Text style={styles.text}>
                    Your <Text style={styles.highlight}>board state</Text>,{" "}
                    <Text style={styles.highlight}>move history</Text>, and{" "}
                    <Text style={styles.highlight}>timers</Text> will be restored.
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 7 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a7.value = !a7.value
                    a10.value = false
                    a1.value = a2.value = a3.value = a4.value = a5.value = a6.value = a8.value = a9.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>Game Rules & Fair Play</Text>
                    </View>
                </GradientButton>

                <Accordian open={a7} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    All games follow <Text style={styles.highlight}>standard chess rules</Text>.
                    </Text>

                    <Text style={styles.text}>
                    The system validates:
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Legal moves</Text>
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Turn order</Text>
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Winner determination</Text>
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 8 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a8.value = !a8.value
                    a10.value = false
                    a1.value = a2.value = a3.value = a4.value = a5.value = a6.value = a7.value = a9.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>Is my wallet secure?</Text>
                    </View>
                </GradientButton>

                <Accordian open={a8} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    Chess on Chain uses{" "}
                    <Text style={styles.highlight}>secure wallet authentication</Text>.
                    </Text>

                    <Text style={styles.text}>
                    Your wallet signs a message to{" "}
                    <Text style={styles.highlight}>prove ownership</Text>.
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Private keys never leave your wallet</Text>
                    </Text>

                    <Text style={styles.text}>
                    • Transactions require{" "}
                    <Text style={styles.highlight}>wallet approval</Text>
                    </Text>

                    <Text style={styles.text}>
                    • Verified on the{" "}
                    <Text style={styles.highlight}>Solana blockchain</Text>
                    </Text>

                </GradientCard2>
                </Accordian>


                {/* 9 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a9.value = !a9.value
                    a10.value = false
                    a1.value = a2.value = a3.value = a4.value = a5.value = a6.value = a7.value = a8.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={styles.title}>Why deposit funds?</Text>
                    </View>
                </GradientButton>

                <Accordian open={a9} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    Deposits allow players to{" "}
                    <Text style={styles.highlight}>join matches instantly</Text>{" "}
                    without waiting for blockchain confirmations.
                    </Text>

                    <Text style={styles.text}>
                    Your funds can be{" "}
                    <Text style={styles.highlight}>withdrawn anytime</Text>.
                    </Text>

                </GradientCard2>
                </Accordian>

                {/* 10 */}
                <GradientButton
                marginBottom={8} 
                disabled={false}
                onPress={() => {
                    a10.value = !a10.value
                    a9.value = a1.value = a2.value = a3.value = a4.value = a5.value = a6.value = a7.value = a8.value = false
                }}
                >
                    <View style={styles.button}>
                        <Text style={{
                            color: "#c10000",
                            fontSize: 16,
                            fontWeight: "600",
                        }}>Payment sent but balance not updated</Text>
                    </View>
                </GradientButton>

                <Accordian open={a10} style={styles.accordion}>
                <GradientCard2 padding={2} marginBottom={8} alignItems="flex-start">

                    <Text style={styles.text}>
                    If you have sent a deposit but your{" "}
                    <Text style={styles.highlight}>balance is not updated</Text>, you can
                    manually verify the transaction.
                    </Text>

                    <Text style={styles.text}>
                    Simply provide the{" "}
                    <Text style={styles.highlight}>transaction signature</Text> of the payment
                    and the platform will attempt to verify it again.
                    </Text>

                    <Text style={styles.text}>
                    The backend will check the transaction directly on the{" "}
                    <Text style={styles.highlight}>Solana blockchain</Text>.
                    </Text>

                    <Text style={styles.text}>
                    The verification is performed based on the{" "}
                    <Text style={styles.highlight}>network mode you are currently using</Text>.
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Devnet mode</Text> → Transaction is checked on Devnet
                    </Text>

                    <Text style={styles.text}>
                    • <Text style={styles.highlight}>Mainnet mode</Text> → Transaction is checked on Mainnet
                    </Text>

                    <Text style={styles.text}>
                    If the transaction is found and confirmed, your{" "}
                    <Text style={styles.highlight}>deposit balance will be credited automatically</Text>.
                    </Text>

                    <Text style={styles.text}>
                    <Text style={styles.highlight}>Note:</Text> The transaction must be sent to
                    the platform's <Text style={styles.highlight}>official deposit wallet</Text>{" "}
                    and must exist on the <Text style={styles.highlight}>selected network</Text>.
                    </Text>

                     <SegmentToggle
                    options={["SOL", "SKR"]}
                    selected={asset}
                    onChange={setAsset}
                    />

                    <View style={{
                        flexDirection: "column",
                        alignItems: "stretch",
                        width: "100%",
                        padding: 4
                    }}>

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
                                placeholder="Enter Signature"
                                placeholderTextColor="#6B7280"
                                value={signature}
                                onChangeText={setSignature}
                                keyboardType="default"
                                style={styles.input}
                                cursorColor="#3DE3B4"
                            />
                        </View>
                        
                        <GradientButton
                        disabled={disabled} 
                        onPress={handleWithdraw} 
                        text={sending ? "PROCESSING ..." : `Verify Transaction`}
                        fontFamily="Orbitron_900Black"
                        />
                    </View>

                </GradientCard2>
                </Accordian>

            </ScrollView>

        </TopContainer>
    );
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


    buttonContainer: {
        padding: 14,
        backgroundColor: "#111",
        borderBottomWidth: 1,
        borderColor: "#333",
    },

    title: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },

    accordion: {
        width: "100%",
    },

    text: {
        color: "#cfcfcf",
        marginBottom: 6,
        lineHeight: 20,
    },

    highlight: {
        color: "#3DE3B4",
        fontWeight: "600",
    },

    button: {
        flex:1,
        justifyContent: "center",
        paddingLeft: 8,
        marginVertical: 2,
        width: "99%",
        backgroundColor: 'black',
        borderRadius: 12,
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