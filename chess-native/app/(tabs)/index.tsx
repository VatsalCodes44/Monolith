import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons';
import { signedPubkey } from '@/src/stores/gameStore';

export default function index() {
  const [fontsLoaded] = useFonts({
    Orbitron_900Black,
  });

  const wallet = useWallet();
  const setIsDevnet = useWalletStore(s => s.setIsDevnet)
  const setSol = GameBet(s => s.setSol)
  const pubKeySignature = signedPubkey(s => s.signature);
  const setPubKeySignature = signedPubkey(s => s.setSignature);
  const stakeOptions = [
    { 
      amount: 0.01, 
      piece: <WP height={56} width={56}/>, 
      label: "PAWN",
      subtitle: "Entry Arena"
    },
    { 
      amount: 0.05, 
      piece: <WN height={56} width={56}/>, 
      label: "KNIGHT",
      subtitle: "Tactical Play"
    },
    { 
      amount: 0.1, 
      piece: <WK height={56} width={56}/>, 
      label: "KING",
      subtitle: "High Stakes"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          {/* Network and Balance Status Bar */}
          <View style={styles.statusBar}>
            <TouchableOpacity onPress={() => {
              if (!wallet.publicKey) return;
              setIsDevnet(!wallet.isDevnet)
            }}>
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
            <View style={styles.balanceBadge}>
              <Text style={[
                styles.balanceText,
                { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
              ]}>
                ◎ 0.0000
              </Text>
            </View>
          </View>

          <Text style={[
            styles.appTitle,
            { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
          ]}>
            CHESS on CHAIN
          </Text>
          
          <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentLine}
          />
          
          <Text style={styles.tagline}>
            Instant Deposit. Instant Withdraw.
          </Text>
          
          <Text style={styles.microText}>
            Secured by Solana • Instant Finality
          </Text>
        </View>

        <View style={styles.stakeSection}>
          {stakeOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.stakeCard}
              activeOpacity={0.9}
              onPress={async () => {
                if (!wallet.publicKey) return;
                if (!signedPubkey) {
                  const signature = await wallet.signMessage(wallet.publicKey)
                  setPubKeySignature(signature);
                }
                setSol(option.amount == 0.1 ? "0.01" : (option.amount == 0.05 ? "0.05" : "0.01"))
                router.push("/Game");
              }}
            >
              {/* Gradient Border Effect */}
              <LinearGradient
                colors={['#B048C2', '#9082DB', '#3DE3B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardBorderGradient}
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
                  <TouchableOpacity 
                    style={styles.enterButton}
                    onPress={async () => {
                      if(!wallet.publicKey) return;
                      if (!signedPubkey) {
                        const signature = await wallet.signMessage(wallet.publicKey)
                        setPubKeySignature(signature);
                      }
                      setSol(option.amount == 0.1 ? "0.01" : (option.amount == 0.05 ? "0.05" : "0.01"))
                      router.push("/Game");
                    }}
                  >
                    <LinearGradient
                      colors={['#B048C2', '#9082DB', '#3DE3B4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.enterButtonGradient}
                    >
                      <Text style={[
                        styles.enterButtonText,
                        { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                      ]}>
                        ENTER ARENA
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACTION SECTION */}
        <View style={styles.actionSection}>
          {/* Dual Buttons */}
          <View style={styles.dualButtonRow}>
            <TouchableOpacity 
              style={styles.dualButton}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#B048C2', '#9082DB', '#3DE3B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dualButtonGradient}
              >
                <Text style={[
                  styles.dualButtonText,
                  { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                ]}>
                  DEPLOY CUSTOM
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dualButton}
              activeOpacity={0.85}
            >
              <View style={styles.solidButton}>
                <Text style={[
                  styles.dualButtonText,
                  { fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto" }
                ]}>
                  JOIN OPEN ARENA
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Wallet Button */}
          <TouchableOpacity 
            style={styles.walletButtonContainer}
            activeOpacity={0.85}
            onPress={() => {
              !wallet.publicKey ? wallet.connect() : wallet.disconnect()
            }}
          >
            <LinearGradient
              colors={['#B048C2', '#9082DB', '#3DE3B4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.walletButtonGradient}
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
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0F",
  },
  
  scrollContent: {
    paddingBottom: 32,
  },

  // ===== HERO SECTION =====
  heroSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 32,
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
  
  appTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 16,
  },
  
  accentLine: {
    height: 3,
    width: 120,
    borderRadius: 2,
    marginBottom: 20,
  },
  
  tagline: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  
  microText: {
    color: "#6B7280",
    fontSize: 11,
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },

  // ===== STAKE SECTION =====
  stakeSection: {
    paddingHorizontal: 20,
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    fontSize: 16,
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
  
  enterButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  enterButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  
  enterButtonText: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 1.2,
  },

  // ===== ACTION SECTION =====
  actionSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  
  dualButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  dualButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    height: 52,
  },
  
  dualButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  solidButton: {
    flex: 1,
    backgroundColor: '#1F1F24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
  
  dualButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  
  walletButtonContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 58,
  },
  
  walletButtonGradient: {
    flex: 1,
    padding: 2,
  },
  
  walletButtonInner: {
    flex: 1,
    backgroundColor: '#0D0D0F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  walletButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 2,
    textAlignVertical: "center"
  },
})
