import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { StatusBar } from './StatusBar';
import { Header } from './Header';
import { Wallet } from '@/src/hooks/useWallet';

export function HeroSection({
    wallet,
    lamports,
    fontsLoaded,
    onPress,
    title,
    tagline,
    fetchbalance
}: {
    wallet: Wallet,
    lamports: number,
    fontsLoaded: boolean,
    onPress: () => void
    title: string,
    tagline?: string,
    fetchbalance: () => void
}) {
    return (
        <View style={styles.heroSection}>
            <StatusBar
                wallet={wallet}
                onPress={onPress}
                lamports={lamports}
                fontsLoaded={fontsLoaded}
                fetchbalance={fetchbalance}
            />

            <Header title={title} tagline={tagline} />
        </View>
    )
}

const styles = StyleSheet.create({
    heroSection: {
        alignItems: "center",
        marginVertical: 16,
    },

})