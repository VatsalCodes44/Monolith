import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { gameBalance } from '@/src/stores/gameBalance'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function StatusBar({
    publicKey,
    isDevnet,
    networkPress,
    fontsLoaded,
    lamports,
    skr,
} : {
    publicKey: string | null,
    isDevnet: boolean,
    networkPress: () => Promise<void>,
    fontsLoaded: boolean,
    lamports: number,
    skr: number,
}) {
    const [showSol, setShowSol] = useState(true)
    return (
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
                onPress={networkPress}>
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
})