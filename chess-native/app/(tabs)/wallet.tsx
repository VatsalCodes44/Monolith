import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useFonts, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import { useWallet } from '@/src/hooks/useWallet'
import { useWalletStore } from '@/src/stores/wallet-store'
import { GradientCard } from '@/src/components/GradientCard'
import { GradientButton } from '@/src/components/GradientButton'

export const CONTROL_HEIGHT = 56

export default function Profile() {
  const [fontsLoaded] = useFonts({ Orbitron_900Black })
  const wallet = useWallet()
  const isDevnet = useWalletStore(s => s.isDevnet)

  const [asset, setAsset] = useState<"SOL" | "SEEKER">("SOL")
  const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT")
  const [amount, setAmount] = useState("")

  const solBalance = 0.2500
  const seekerBalance = 120

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}
          <View style={styles.hero}>
            <Text style={[
              styles.title,
              { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
            ]}>
              TREASURY
            </Text>

            <LinearGradient
              colors={['#B048C2', '#9082DB', '#3DE3B4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.line}
            />
          </View>

          {/* RPC MODE */}
          <View style={styles.rpcContainer}>
            <View style={[
              styles.rpcDot,
              { backgroundColor: isDevnet ? "#3DE3B4" : "#B048C2" }
            ]} />
            <Text style={styles.rpcText}>
              {isDevnet ? "DEVNET RPC" : "MAINNET RPC"}
            </Text>
          </View>

          {/* WALLET CARD */}
          <GradientCard>
            <Text style={styles.label}>CONNECTED WALLET</Text>
            <Text style={styles.pubKey}>
              {wallet.publicKey
                ? `${wallet.publicKey.slice(0,6)}...${wallet.publicKey.slice(-6)}`
                : "Wallet Not Connected"}
            </Text>
          </GradientCard>

          {/* BALANCE */}
          <View style={styles.balanceHero}>
            <Text style={styles.balanceLabel}>{asset} BALANCE</Text>
            <Text style={[
              styles.balanceBig,
              { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
            ]}>
              {asset === "SOL"
                ? `◎ ${solBalance.toFixed(4)}`
                : `${seekerBalance}`}
            </Text>
          </View>

          {/* TOGGLES */}
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

            <View style={{ marginTop: 20 }}>
              <GradientButton text={`${mode} ${asset}`} onPress={() => {}} />
            </View>
          </GradientCard>

        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

function SegmentToggle({
  options,
  selected,
  onChange
}: {
  options: string[],
  selected: string,
  onChange: (value: any) => void
}) {
  return (
    <View style={styles.segmentContainer}>
      {options.map(option => {
        const active = selected === option
        return (
          <TouchableOpacity
            key={option}
            style={{ flex: 1 }}
            onPress={() => onChange(option)}
            activeOpacity={0.9}
          >
            {active ? (
              <LinearGradient
                colors={['#B048C2', '#9082DB', '#3DE3B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.segmentActive}
              >
                <Text style={styles.segmentTextActive}>{option}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.segmentInactive}>
                <Text style={styles.segmentTextInactive}>{option}</Text>
              </View>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0F",
    paddingHorizontal: 22,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  hero: {
    alignItems: "center",
    paddingVertical: 32,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    letterSpacing: 4,
  },

  line: {
    height: 3,
    width: 120,
    borderRadius: 3,
    marginTop: 14,
  },

  rpcContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    marginBottom: 28,
  },

  rpcDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  rpcText: {
    color: "#9CA3AF",
    fontSize: 12,
    letterSpacing: 1.5,
  },

  label: {
    color: '#6B7280',
    fontSize: 11,
    letterSpacing: 1.8,
    marginBottom: 12,
  },

  pubKey: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  balanceHero: {
    alignItems: "center",
    marginBottom: 30,
  },

  balanceLabel: {
    color: '#6B7280',
    fontSize: 12,
    letterSpacing: 2,
  },

  balanceBig: {
    color: "#FFFFFF",
    fontSize: 36,
    marginTop: 10,
  },

  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1F",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2A2A30"
  },

  segmentActive: {
    height: CONTROL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentInactive: {
    height: CONTROL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentTextActive: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 2,
  },

  segmentTextInactive: {
    color: "#6B7280",
    fontSize: 12,
    letterSpacing: 2,
  },

  input: {
    height: CONTROL_HEIGHT,
    backgroundColor: '#1F1F24',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
})