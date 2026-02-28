import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFonts, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GameBet } from '@/src/stores/gameBet';
import { WP } from '@/src/components/pieces/wP';
import { WN } from '@/src/components/pieces/wN';
import { WK } from '@/src/components/pieces/wK';
import { useWalletStore } from '@/src/stores/wallet-store';
import { useWallet } from '@/src/hooks/useWallet';
import { WalletConnect } from '@/src/components/WalletConnect';
import axios from "axios";
import { REST_URL } from '@/src/config/config';
import { gameBalance } from '@/src/stores/gameBalance';
import { HeroSection } from '@/src/components/HeroSection';
import { TopContainer } from '@/src/components/TopContainer';
import { GradientButton } from '@/src/components/GradientButton';
import { GET_BALANCE_TYPE_TS } from '@/src/config/serverInputs';
import { jwtStore } from '@/src/stores/jwt';

export default function Index() {
  const [fontsLoaded] = useFonts({
    Orbitron_900Black,
  });


  const wallet = useWallet();
  const setIsDevnet = useWalletStore(s => s.setIsDevnet)
  const setSol = GameBet(s => s.setSol)
  const setLamports = gameBalance(s => s.setLamports);
  const lamports = gameBalance(s => s.lamports);
  const setSkr = gameBalance(s => s.setSkr);
  const skr = gameBalance(s => s.skr);
  const jwt = jwtStore(s => s.jwt);
  const setJwt = jwtStore(s => s.setJwt);
  const stakeOptions = [
    {
      amount: 0.01,
      piece: <WP height={56} width={56} />,
      label: "PAWN",
      subtitle: "Entry Arena"
    },
    {
      amount: 0.05,
      piece: <WN height={56} width={56} />,
      label: "KNIGHT",
      subtitle: "Tactical Play"
    },
    {
      amount: 0.1,
      piece: <WK height={56} width={56} />,
      label: "KING",
      subtitle: "High Stakes"
    }
  ];

  const fetchBalance = useCallback(async (
    publicKey: string | null,
    jwt: string | null
  ) => {
    console.log("🔥 fetchBalance called");
    console.log(publicKey, "2222222222222222", jwt)
    if (!publicKey || !jwt) return;
    try {
      const payload: GET_BALANCE_TYPE_TS = {
        network: wallet.isDevnet ? "DEVNET" : "MAINNET",
      };
      const res = await axios.post(`${REST_URL}/getBalance`, payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = res.data;
      console.log("RAW DATA:", data.lamports, "-----------", data.skr);
      setLamports(Number(data.lamports));
      setSkr(Number(data.skr));
      console.log("STORE STATE:", gameBalance.getState().lamports);
    } catch (e) {
      console.log(e);
    }
  }, [wallet.isDevnet]); // re-creates when isDevnet changes

  return (
    <TopContainer>
      <HeroSection
        publicKey={wallet.publicKey}
        isDevnet={wallet.isDevnet}
        fontsLoaded={fontsLoaded}
        title='CHESS on CHAIN'
        tagline='Instant Deposit. Instant Withdraw.'
        showSol={true}
        fetchbalance={async () => {
          fetchBalance(wallet.publicKey, jwt)
        }}
        onPress={async () => {
          if (!wallet.publicKey) return;
          setIsDevnet(!wallet.isDevnet)
          await fetchBalance(wallet.publicKey, jwt)
        }}
        lamports={lamports}
        skr={skr}
      />

      <View style={styles.stakeSection}>
        {stakeOptions.map((option, index) => (
          <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorderGradient}
            key={index}
          >
            <View style={styles.cardInner}>
              {/* Chess Piece */}
              <View style={styles.pieceSection}>
                <View style={styles.pieceCircle}>
                  {option.piece}
                </View>
                <Text style={[
                  styles.pieceLabel,
                  { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                ]}>
                  {option.label}
                </Text>
              </View>

              {/* Stake Info */}
              <View style={styles.stakeInfo}>
                <Text style={[
                  styles.stakeAmount,
                  { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                ]}>
                  {option.amount} SOL
                </Text>
                <Text style={styles.stakeSubtitle}>
                  {option.subtitle}
                </Text>
              </View>

              {/* CTA Button */}
              <GradientButton
                onPress={async () => {
                  console.log("hello")
                  if (!wallet.publicKey || !jwt) return;
                  setSol(option.amount == 0.1 ? "0.1" : (option.amount == 0.05 ? "0.05" : "0.01"))
                  router.push("/Game");
                }}
                text="ENTER ARENA"
                fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
              />
            </View>
          </LinearGradient>
        ))}
      </View>

      {/* ACTION SECTION */}
      <View style={styles.actionSection}>
        {/* Dual Buttons */}
        <View style={styles.dualButtonRow}>
          <GradientButton
            text="DEPLOY CUSTOM"
            onPress={() => {
              router.push("/DeployCustom")
            }}
            fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
          />

          <GradientButton
            text="JOIN OPEN ARENA"
            onPress={() => {
            }}
            fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
          />
        </View>

        {/* Wallet Button */}
        <WalletConnect
          wallet={wallet}
          fontsLoaded={fontsLoaded}
          setJwt={setJwt}
          jwt={jwt}
          fetchBalance={fetchBalance}
        />
      </View>
    </TopContainer>
  )
}

const styles = StyleSheet.create({
  // ===== STAKE SECTION =====
  stakeSection: {
    gap: 16,
    marginBottom: 32,
  },

  stakeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  cardBorderGradient: {
    padding: 1.5,
    borderRadius: 16,
  },

  cardInner: {
    backgroundColor: '#16161A',
    borderRadius: 14.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  pieceSection: {
    alignItems: 'center',
    gap: 8,
  },

  pieceCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1F1F24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A30',
  },

  pieceLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    letterSpacing: 1.5,
  },

  stakeInfo: {
    flex: 1,
    gap: 4,
  },

  stakeAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 2,
  },

  stakeSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  securedText: {
    color: '#4B5563',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },


  // ===== ACTION SECTION =====
  actionSection: {
    gap: 12,
    marginBottom: 16,
  },

  dualButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },

})
