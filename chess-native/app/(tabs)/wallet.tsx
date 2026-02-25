import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useFonts, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import axios from "axios";
import { useWallet } from '@/src/hooks/useWallet'
import { useWalletStore } from '@/src/stores/wallet-store'
import { GradientCard } from '@/src/components/GradientCard'
import { TopContainer } from '@/src/components/TopContainer'
import { HeroSection } from '@/src/components/HeroSection'
import { SegmentToggle } from '@/src/components/SegmentToggle'
import { gameBalance } from '@/src/stores/gameBalance'
import { REST_URL } from '@/src/config/config'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { jwtStore } from '@/src/stores/jwt';

export default function Wallet() {
  const [fontsLoaded] = useFonts({ Orbitron_900Black })


  const displayFont = fontsLoaded ? "Orbitron_900Black" : "System"

  const [asset, setAsset] = useState<"SOL" | "SKR">("SOL")
  const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT")
  const [amount, setAmount] = useState<string>("")
  const isDevnet = useWalletStore(s => s.isDevnet)
  const wallet = useWallet()
  const setIsDevnet = useWalletStore(s => s.setIsDevnet)
  const lamports = gameBalance(s => s.lamports);
  const skr = gameBalance(s => s.skr);
  const setLamports = gameBalance(s => s.setLamports);
  const setSkr = gameBalance(s => s.setSkr);
  const jwt = jwtStore(s => s.jwt);

  let opacity = .95;
  if (!wallet.publicKey || !jwt) opacity = .5;
  else if (isDevnet) {
    if (mode == "DEPOSIT") {
      if (asset == "SOL") opacity = .95;
      else opacity = .5;
    }
    else {
      if (asset == "SOL") opacity = .95;
      else opacity = .5;
    }
  }
  else {
    opacity = .95;
  }

  const fetchBlance = async () => {
    if (!wallet.publicKey) return;
    try {
      const res = await axios.post(`${REST_URL}/getBalance`, {
        publicKey: wallet.publicKey,
        network: wallet.isDevnet ? "DEVNET" : "MAINNET"
      })
      const data = res.data;
      console.log(data)
      setLamports(parseInt(data.lamports));
      setSkr(parseInt(data.skr));
    }
    catch (e) {
      console.log(e)
    }
  }

  const transferSol = async () => {
    if (!wallet.publicKey || !jwt) return;
    try {
      const signature = await wallet.sendSOL(parseFloat(amount));
      if (!signature) return;
      const res = await axios.post(`${REST_URL}/deposit`, {
        publicKey: wallet.publicKey,
        network: wallet.isDevnet ? "DEVNET" : "MAINNET",
        asset,
        signature,
        jwt
      })
      const data = res.data;
      console.log(data)
      fetchBlance();
    }
    catch (e) {
      console.log(e)
    }
  }

  const transferSeeker = async () => {
    if (!wallet.publicKey || !jwt || isDevnet) return;
    try {
      const signature = await wallet.sendSKR(parseFloat(amount));
      if (!signature) return;
      const res = await axios.post(`${REST_URL}/deposit`, {
        publicKey: wallet.publicKey,
        network: wallet.isDevnet ? "DEVNET" : "MAINNET",
        asset,
        signature,
        jwt
      })
      const data = res.data;
      console.log(data)
      fetchBlance();
    }
    catch (e) {
      console.log(e)
    }
  }

  const handleDepositWithdraw = async () => {
    if (mode == "DEPOSIT") {
      if (asset == "SOL") {
        transferSol();
      }
      else {
        transferSeeker();
      }
    }
    else {
      // if(asset == "SOL") {
      //   withdrawSol();
      // }
      // else {
      //   withdrawSeeker();
      // }
    }
  }

  useEffect(() => {
    fetchBlance();
  }, [wallet.publicKey, wallet.isDevnet]);

  return (
    <TopContainer>

      <HeroSection
        wallet={wallet}
        lamports={lamports}
        fontsLoaded={fontsLoaded}
        fetchbalance={fetchBlance}
        onPress={() => {
          if (!wallet.publicKey) return
          setIsDevnet(!wallet.isDevnet)
        }}
        title="TREASURY"
      />

      {/* WALLET CARD */}
      <GradientCard>
        <Text style={styles.label}>CONNECTED WALLET</Text>
        {!wallet.publicKey && <Text style={styles.pubKey}>
          Wallet Not Connected
        </Text>}
        {wallet.publicKey && <Text style={[styles.pubKey,
        {
          fontFamily: displayFont
        }
        ]}>
          {wallet.publicKey}
        </Text>}
      </GradientCard>

      {/* BALANCE */}
      <LinearGradient
        colors={['rgba(176,72,194,0.08)', 'rgba(61,227,180,0.05)']}
        style={styles.balanceContainer}
      >
        <Text style={styles.balanceLabel}>{asset} BALANCE</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={[styles.balanceBig, { fontFamily: displayFont }]}>
            {asset === "SOL"
              ? `${(lamports / LAMPORTS_PER_SOL).toFixed(4)}`
              : `${skr / 1000000}`}
          </Text>
          <Text style={{
            fontFamily: displayFont,
            color: !isDevnet ? '#B048C2' : '#3DE3B4',
            fontSize: 18,
          }}>
            {asset === "SOL"
              ? `sol`
              : `skr`}
          </Text>
        </View>
      </LinearGradient>

      {/* SEGMENT TOGGLES */}
      <SegmentToggle
        options={["SOL", "SKR"]}
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
          keyboardType="numbers-and-punctuation"
          inputMode="decimal"
          value={amount}
          onChangeText={(value) => {
            // Normalize comma to dot
            const normalized = value.replace(",", ".");

            // Allow:
            // "", "0", "0.", ".5", "1.23"
            if (/^\d*\.?\d*$/.test(normalized)) {
              setAmount(normalized);
            }
          }}
          style={styles.input}
        />

        <TouchableOpacity
          activeOpacity={.5}
          style={[
            styles.actionButtonWrapper,
            { opacity }
          ]}
          onPress={handleDepositWithdraw}
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

    </TopContainer >
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
    fontSize: 18,
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