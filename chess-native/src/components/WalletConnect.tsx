import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { GradientButton } from './GradientButton'
import { Wallet } from '../hooks/useWallet'

export function WalletConnect({
    wallet,
    fontsLoaded
}: {
    wallet: Wallet,
    fontsLoaded?: boolean
}) {
  return (
    <GradientButton 
        onPress={() => {
            !wallet.publicKey ? wallet.connect() : wallet.disconnect()
        }}
    >
        <View style={styles.walletButtonInner}>
            {wallet.publicKey ? 
            (<View style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10
            }}>
            <Text style={[
                styles.walletButtonText,
                { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
            ]}>
                {`${wallet.publicKey.slice(0,4)}...${wallet.publicKey.slice(-4)}`}
            </Text>
            <Ionicons name='exit-outline' size={28} color="#fff" />
            </View>) : 
            (<Text style={[
                styles.walletButtonText,
                { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
            ]}>
            CONNECT SOLANA WALLET
            </Text>)}
        </View>
    </GradientButton>
  )
}

const styles = StyleSheet.create({
    walletButtonInner: {
        flex: 1,
        backgroundColor: '#0D0D0F',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
        width: "99%"
    },

    walletButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        letterSpacing: 2,
        textAlignVertical: "center"
    },
})