import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { GradientButton } from './GradientButton'
import { Wallet } from '@/src/hooks/useWallet'
import axios from 'axios'
import { REST_URL } from '@/src/config/config'
export function WalletConnect({
    wallet,
    fontsLoaded,
    setJwt,
    jwt,
    fetchBalance
}: {
    wallet: Wallet,
    fontsLoaded?: boolean,
    setJwt: (jwt: string | null) => void,
    jwt: string | null,
    fetchBalance: (publicKey: string | null, jwt: string | null) => Promise<void>
}) {
    const [jwtLogin, setJwtLogin] = useState(false);
    return (
        <GradientButton
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

                        const verifyRes = await axios.post(`${REST_URL}/verifyLogin`, {
                            publicKey: pubKey,
                            signature,
                            nonce,
                        });
                        setJwtLogin(false);
                        setJwt(verifyRes.data.token);
                        setJwtLogin(true);
                        await fetchBalance(pubKey, verifyRes.data.token);
                        console.log("----------------------------------")
                        console.log(verifyRes.data.token)
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
                            { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                        ]}>
                            {`${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`}
                        </Text>
                        <Ionicons name='exit-outline' size={28} color="#fff" />
                    </View>) :
                    (<Text style={[
                        styles.walletButtonText,
                        { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
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