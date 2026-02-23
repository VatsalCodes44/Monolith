import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useFonts, Orbitron_900Black } from '@expo-google-fonts/orbitron'

import { useWallet } from '@/src/hooks/useWallet'
import { useWalletStore } from '@/src/stores/wallet-store'
import { GradientCard } from '@/src/components/GradientCard'
import { TopContainer } from '@/src/components/TopContainer'
import { HeroSection } from '@/src/components/HeroSection'
import { SegmentToggle } from '@/src/components/SegmentToggle'

export default function Profile() {
  const [fontsLoaded] = useFonts({ Orbitron_900Black })

  const wallet = useWallet()
  const setIsDevnet = useWalletStore(s => s.setIsDevnet)

  const displayFont = fontsLoaded ? "Orbitron_900Black" : "System"

  const [asset, setAsset] = useState<"SOL" | "SEEKER">("SOL")
  const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT")
  const [amount, setAmount] = useState("")

  const solBalance = 0.2500
  const seekerBalance = 120

  return (
    <TopContainer>

      <HeroSection
        wallet={wallet}
        lamports={solBalance}
        fontsLoaded={fontsLoaded}
        onPress={() => {
          if (!wallet.publicKey) return
          setIsDevnet(!wallet.isDevnet)
        }}
        title="TREASURY"
      />

      {/* WALLET CARD */}
      <GradientCard>
        <Text style={styles.label}>CONNECTED WALLET</Text>
        <Text style={styles.pubKey}>
          {wallet.publicKey
            ? `${wallet.publicKey.slice(0, 6)}...${wallet.publicKey.slice(-6)}`
            : "Wallet Not Connected"}
        </Text>
      </GradientCard>

      {/* BALANCE */}
      <LinearGradient
        colors={['rgba(176,72,194,0.08)', 'rgba(61,227,180,0.05)']}
        style={styles.balanceContainer}
      >
        <Text style={styles.balanceLabel}>{asset} BALANCE</Text>
        <Text style={[styles.balanceBig, { fontFamily: displayFont }]}>
          {asset === "SOL"
            ? `${solBalance.toFixed(4)} sol`
            : `${seekerBalance} skr`}
        </Text>
      </LinearGradient>

      {/* SEGMENT TOGGLES */}
      <SegmentToggle
        options={["SOL", "SEEKER"]}
        selected={asset}
        onChange={setAsset}
      />

      <SegmentToggle
        options={["DEPOSIT", "WITHDRAW"]}
        selected={mode}
        onChange={setMode}
      />

      {/* ACTION CARD */}
      <GradientCard>
        <Text style={styles.label}>{mode} {asset}</Text>

        <TextInput
          placeholder="0.00"
          placeholderTextColor="#6B7280"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.actionButtonWrapper}
          onPress={() => { }}
        >
          <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButton}
          >
            <Text
              allowFontScaling={false}
              style={[styles.actionButtonText, {
                fontFamily: displayFont,
                color: "#fff"
              }]}
            >
              {mode} {asset}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </GradientCard>

    </TopContainer>
  )
}


const styles = StyleSheet.create({

  label: {
    color: '#8B8F97',
    fontSize: 11,
    letterSpacing: 2.2,
    marginBottom: 12,
    textTransform: 'uppercase',
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
    fontSize: 36,
    color: "#fff"
  },

  balanceAmount: {
    color: '#fff',
    fontSize: 40,
    letterSpacing: 1,
  },

  /* ===== INPUT ===== */

  inputWrapper: {
    marginBottom: 22,
    position: 'relative',
  },

  input: {
    backgroundColor: '#18181F',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    paddingRight: 60,
    color: '#FFFFFF',
    fontSize: 20,
  },

  inputSymbol: {
    position: 'absolute',
    right: 18,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: '#8B8F97',
    fontSize: 12,
    letterSpacing: 1,
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
})