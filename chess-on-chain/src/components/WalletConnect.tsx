import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { GradientButton } from './GradientButton'
import { Wallet } from '@/src/hooks/useWallet'
import axios, { AxiosResponse } from 'axios'
import { REST_URL } from '@/src/config/config'
import { pushNotification } from '../utils/notifications'
export function WalletConnect({
    wallet,
    setJwt,
    jwt,
    fetchBalance
}: {
    wallet: Wallet,
    setJwt: (jwt: string | null) => void,
    jwt: string | null,
    fetchBalance: (publicKey: string | null, jwt: string | null, isDevnet: boolean) => Promise<void>
}) {
    const [jwtLogin, setJwtLogin] = useState(false);
    return (
        <GradientButton
            disabled={false}
            onPress={async () => {
                try {

                    if (!wallet.publicKey) {
                        const pubKey = await wallet.connect();

                        const loginRes = await axios.post(`${REST_URL}/login`, {
                            publicKey: pubKey,
                        });
                        setJwtLogin(true);
                        const { nonce } = loginRes.data;

                        const signature = await wallet.signMessage(nonce, pubKey);

                        let verifyRes: AxiosResponse<any, any, {}> | null = null;
                        for (let i = 0; i < 3; i++) {
                            try {
                                verifyRes = await axios.post(`${REST_URL}/verifyLogin`, {
                                    publicKey: pubKey,
                                    signature,
                                    nonce,
                                });
                                if (verifyRes?.status === 200) break;
                            } catch (e) {
                                if (i < 2) await new Promise(r => setTimeout(r, 500));
                            }
                        }
                        if (!verifyRes) throw new Error("verifyLogin failed after 3 attempts");
                        setJwtLogin(false);
                        setJwt(verifyRes.data.token);
                        setJwtLogin(true);
                        await fetchBalance(pubKey, verifyRes.data.token, wallet.isDevnet);
                        await pushNotification(
                            "Wallet connected successfully",
                            `publickey: ${pubKey}`,
                            {
                                type: "login"
                            }
                        )
                    }
                    else {
                        wallet.disconnect();
                        setJwt(null);
                        setJwtLogin(false);
                    }

                } catch (error) {
                    console.error("Wallet Connect Error:", error);
                }
            }}
        >
            <View style={styles.walletButtonInner}>
                {wallet.publicKey && jwt ?
                    (<View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 10
                    }}>
                        <Text style={[
                            styles.walletButtonText,
                            { fontFamily: "Orbitron_900Black" }
                        ]}>
                            {`${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`}
                        </Text>
                        <Ionicons name='exit-outline' size={28} color="#fff" />
                    </View>) :
                    (<Text style={[
                        styles.walletButtonText,
                        { fontFamily: "Orbitron_900Black" }
                    ]}>
                        {jwtLogin ? "Logging In..." : "CONNECT SOLANA WALLET"}
                    </Text>)}
            </View>
        </GradientButton>
    )
}

const styles = StyleSheet.create({
    walletButtonInner: {
        flex: 1,
        backgroundColor: '#0D0D0F',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
        width: "99%"
    },

    walletButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        letterSpacing: 2,
        textAlignVertical: "center",
        marginHorizontal: 16
    },
})