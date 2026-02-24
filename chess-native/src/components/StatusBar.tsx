import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Wallet } from '../hooks/useWallet';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function StatusBar({
    wallet,
    onPress,
    lamports,
    fontsLoaded,
    fetchbalance
}: {
    wallet: Wallet,
    onPress: () => void,
    lamports: number,
    fontsLoaded: boolean,
    fetchbalance: () => void
}) {
    return (
        <View style={styles.statusBar}>
            <TouchableOpacity style={{
                padding: 6
            }} onPress={onPress}>
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
            <TouchableOpacity onPress={fetchbalance} style={styles.balanceBadge}>
                <Text style={[
                    styles.balanceText,
                    { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                ]}>
                    {`◎ ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} sol`}
                </Text>
            </TouchableOpacity>
        </View>

    )
}

const styles = StyleSheet.create({
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 4,
        marginBottom: 16,
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