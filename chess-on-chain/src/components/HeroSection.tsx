import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Header } from './Header';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function HeroSection({
    publicKey,
    isDevnet,
    fontsLoaded,
    onPress,
    title,
    tagline,
    fetchbalance,
    showSol,
    lamports,
    skr
}: {
    publicKey: string | null,
    isDevnet: boolean,
    fontsLoaded: boolean,
    onPress: () => void
    title: string,
    tagline?: string,
    fetchbalance: () => Promise<void>,
    showSol: boolean,
    lamports: number,
    skr: number
}) {
    return (
        <View style={styles.heroSection}>
            <View style={styles.statusBar}>
                <TouchableOpacity style={
                    {
                        backgroundColor: publicKey
                            ? (isDevnet
                                ? "rgba(18, 55, 44, 0.57)"
                                : "rgba(57, 30, 60, 0.66)")
                            : "rgba(79, 25, 25, 0.43)",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#2A2A30',
                    }
                } onPress={onPress}>
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
                <TouchableOpacity onPress={async () => {
                    await fetchbalance();
                }} style={styles.balanceBadge}>
                    <Text style={[
                        styles.balanceText,
                        { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                    ]}>
                        {showSol ? `◎ ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} sol` : `◎ ${(skr / 1000000).toFixed(4)} skr`}
                    </Text>
                </TouchableOpacity>
            </View>

            <Header title={title} tagline={tagline} fontsLoaded={fontsLoaded} />
        </View>
    )
}

const styles = StyleSheet.create({
    heroSection: {
        alignItems: "center",
        marginVertical: 16,
        width: "100%",
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 4,
        marginBottom: 16,
        maxHeight: 40,
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