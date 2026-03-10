import { TopContainer } from "@/src/components/TopContainer";
import { Header } from "@/src/components/Header";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Easing, TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useProfileLeaderBoardStore } from "@/src/stores/profileAndLeaderBoard";
import { PlayerProfile, LeaderboardPlayer } from "@/src/config/serverResponds";
import { useWalletStore } from "@/src/stores/wallet-store";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { REST_URL } from "@/src/config/config";
import { jwtStore } from "@/src/stores/jwt";
import { GET_BALANCE_TYPE_TS } from "@/src/config/serverInputs";
import { gameBalance } from "@/src/stores/gameBalance";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useFocusEffect } from "expo-router";

const CYBER = {
  bg: "#02010A",
  card: "#07060F",
  neonCyan: "#00F5FF",
  neonPink: "#FF2CF1",
  neonPurple: "#8A2CFF",
  neonGreen: "#00FFA3",
  neonYellow: "#FFE600",
  neonRed: "#FF003C",
  border: "#1A1A2E",
  borderBright: "#2A2A4A",
  textDim: "#5A5A7A",
  textMid: "#9A9AB0",
};


export default function LeaderboardProfile() {
  const devnetProfile   = useProfileLeaderBoardStore(s => s.devnetProfile);
  const mainnetProfile  = useProfileLeaderBoardStore(s => s.mainnetProfile);
  const devnetLB        = useProfileLeaderBoardStore(s => s.devnetLeaderboard);
  const mainnetLB       = useProfileLeaderBoardStore(s => s.mainnetLeaderboard);

  const setDevnetProfile   = useProfileLeaderBoardStore(s => s.setDevnetProfile);
  const setMainnetProfile  = useProfileLeaderBoardStore(s => s.setMainnetProfile);
  const setDevnetLB        = useProfileLeaderBoardStore(s => s.setDevnetLeaderboard);
  const setMainnetLB       = useProfileLeaderBoardStore(s => s.setMainnetLeaderboard);

  const isDevnet = useWalletStore(s => s.isDevnet);
  const publicKey = useWalletStore(s => s.publicKey);
  const jwt = jwtStore(s => s.jwt)

  const [showSol, setShowSol] = useState(true)
  const setIsDevnet = useWalletStore(s => s.setIsDevnet)
  const setLamports = gameBalance(s => s.setLamports);
  const lamports = gameBalance(s => s.lamports);
  const setSkr = gameBalance(s => s.setSkr);
  const skr = gameBalance(s => s.skr);

  const profile: PlayerProfile | null = isDevnet ? devnetProfile  : mainnetProfile;
  const leaderboard: LeaderboardPlayer[]  = isDevnet ? devnetLB   : mainnetLB;

  const fetchData = useCallback(async () => {
    if (!publicKey || !jwt) return;
    const res = await axios.post(`${REST_URL}/stats`, {}, {
        headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = res.data;
    if (res.status == 200) {
      setDevnetLB(data.devnetLeaderBoard);
      setMainnetLB(data.mainnetLeaderBoard);
      setDevnetProfile(data.devnetProfile);
      setMainnetProfile(data.mainnetProfile)
    }
  }, [publicKey, jwt])

  const fetchBalance = useCallback(async (
    publicKey: string | null,
    jwt: string | null,
    isDevnet: boolean
  ) => {
    if (!publicKey || !jwt) return;
    try {
        const payload: GET_BALANCE_TYPE_TS = {
            network: isDevnet ? "DEVNET" : "MAINNET",
        };
        const res = await axios.post(`${REST_URL}/getBalance`, payload, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = res.data;
        setLamports(Number(data.lamports));
        setSkr(Number(data.skr));
    } catch (e) {
        console.log(e);
    }
  }, []);

  useFocusEffect(() => {
    fetchData()
  })

  const totalGames = profile.wins + profile.losses + profile.draws;
  const winPct  = totalGames > 0 ? Math.round((profile.wins   / totalGames) * 100) : 0;
  const lossPct = totalGames > 0 ? Math.round((profile.losses / totalGames) * 100) : 0;
  const drawPct = 100 - winPct - lossPct;
  const winRate = totalGames > 0 ? `${winPct}%` : "N/A";

  return (
    <TopContainer>
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
            disabled={!publicKey}
            onPress={async () => {
                if (!publicKey) return;
                setIsDevnet(!isDevnet)
                await fetchBalance(publicKey, jwt, !isDevnet)
            }}>
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
                    { fontFamily:"Orbitron_900Black" }
                ]}>
                    {showSol ? `◎ ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} sol` : `◎ ${(skr / 1_000_000).toFixed(2)} skr`}
                </Text>
            </TouchableOpacity>
        </View>
      </View>
      
      <View style={{
        marginTop: 40
      }}>
        <Header title="PLAYER PROFILE" tagline="Competitive performance" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ─── HERO ─── */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <View style={styles.heroOuter}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <LinearGradient
              colors={["#00F5FF", "#FF2CF1", "#8A2CFF"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.heroTopBar}
            />

            <LinearGradient colors={["#0A091A", "#04040E"]} style={styles.heroInner}>
              <View style={styles.scanlines} pointerEvents="none" />

              {/* Network badge */}
              <View style={styles.tierBadge}>
                <LinearGradient
                  colors={isDevnet ? ["#00F5FF", "#8A2CFF"] : ["#FFE600", "#FF8C00"]}
                  style={styles.tierGrad}
                >
                  <Text style={styles.tierText}>{isDevnet ? "DEVNET" : "MAINNET"}</Text>
                </LinearGradient>
              </View>

              {/* Wallet */}
              <Text style={styles.wallet}>{profile.wallet}</Text>

              <View style={styles.ratingWrap}>
                <LinearGradient
                  colors={["#FF2CF1", "#8A2CFF"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.ratingBadge}
                >
                  <View style={styles.ratingGlitch}>
                    <Text style={styles.rating}>{profile.rating}</Text>
                    <Text style={styles.ratingGhost}>{profile.rating}</Text>
                  </View>
                  <Text style={styles.ratingLabel}>RATING</Text>
                </LinearGradient>
                <View style={styles.ratingHalo} />
              </View>

              {/* Meta row */}
              <View style={styles.heroMeta}>
                <MetaStat label="GLOBAL RANK" value={`#${profile.rank}`} color={CYBER.neonGreen} />
                <View style={styles.metaDivider} />
                <MetaStat label="PEAK RATING" value={profile.peak} color={CYBER.neonCyan} />
                <View style={styles.metaDivider} />
                <MetaStat label="WIN RATE" value={winRate} color={CYBER.neonGreen} />
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["#8A2CFF", "#FF2CF1", "#00F5FF"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.heroBottomBar}
            />
          </View>
        </Animated.View>


        {/* ─── PERFORMANCE ─── */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <SectionTitle title="PERFORMANCE" icon="◈" />

          <View style={styles.glowCard}>
            <LinearGradient colors={["#0D0C1A", "#04040E"]} style={styles.perfCard}>
              <LinearGradient
                colors={["#00F5FF", "#FF2CF1"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.cardTopBar}
              />

              <View style={styles.barLegend}>
                <LegendDot color={CYBER.neonGreen}  label={`WIN ${winPct}%`} />
                <LegendDot color={CYBER.neonPurple} label={`DRAW ${drawPct}%`} />
                <LegendDot color={CYBER.neonPink}   label={`LOSS ${lossPct}%`} />
              </View>

              <View style={styles.barTrack}>
                {winPct > 0 && (
                  <LinearGradient
                    colors={["#00FFA3", "#00F5FF"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ flex: winPct, borderRadius: 6 }}
                  />
                )}
                {winPct > 0 && drawPct > 0 && <View style={{ width: 3 }} />}
                {drawPct > 0 && (
                  <View style={{ flex: drawPct, backgroundColor: "#8A2CFF", borderRadius: 6 }} />
                )}
                {drawPct > 0 && lossPct > 0 && <View style={{ width: 3 }} />}
                {lossPct > 0 && (
                  <LinearGradient
                    colors={["#FF2CF1", "#FF003C"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ flex: lossPct, borderRadius: 6 }}
                  />
                )}
              </View>

              <View style={styles.wdlRow}>
                <Text style={[styles.wdlNum, { color: CYBER.neonGreen }]}>{profile.wins}W</Text>
                <Text style={[styles.wdlNum, { color: CYBER.neonPurple }]}>{profile.draws}D</Text>
                <Text style={[styles.wdlNum, { color: CYBER.neonPink }]}>{profile.losses}L</Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>


        {/* ─── GAME STATS ─── */}
        <Animated.View entering={FadeInDown.delay(260).springify()}>
          <SectionTitle title="GAME STATS" icon="▸" />
          <View style={styles.grid}>
            <StatCard label="GAMES"  value={profile.games}   color="#00F5FF" icon="◈" delay={0} />
            <StatCard label="WINS"   value={profile.wins}    color="#00FFA3" icon="▲" delay={60} />
            <StatCard label="LOSSES" value={profile.losses}  color="#FF2CF1" icon="▼" delay={120} />
            <StatCard label="DRAWS"  value={profile.draws}   color="#8A2CFF" icon="◆" delay={180} />
          </View>
        </Animated.View>


        {/* ─── ARENA ECONOMY ─── */}
        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <SectionTitle title="ARENA ECONOMY" icon="◎" />
          <View style={styles.grid3}>
            <EconCard label="SOL WON"  value={profile.solWon}  prefix="◎" color="#00FFA3" delay={0} />
            <EconCard label="SOL LOST" value={profile.solLost} prefix="◎" color="#FF003C" delay={60} />
            <EconCard label="SKR USED" value={profile.skrUsed} prefix=""  color="#00F5FF" delay={120} />
          </View>
        </Animated.View>


        {/* ─── LEADERBOARD ─── */}
        <Animated.View entering={FadeInDown.delay(420).springify()}>
          <SectionTitle title="GLOBAL LEADERBOARD" icon="⬡" />

          {leaderboard.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>NO LEADERBOARD DATA</Text>
            </View>
          ) : (
            <View style={styles.table}>
              <LinearGradient colors={["#0F0E1E", "#07060F"]} style={styles.tableHeader}>
                <LinearGradient
                  colors={["#00F5FF", "#8A2CFF", "#FF2CF1"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.tableHeaderBar}
                />
                <Text style={[styles.headerCell, { width: 44 }]}>#</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>PLAYER</Text>
                <Text style={[styles.headerCell, { width: 74, textAlign: "right" }]}>RATING</Text>
                <Text style={[styles.headerCell, { width: 60, textAlign: "right" }]}>WINS</Text>
              </LinearGradient>

              {leaderboard.map((p, i) => (
                <Animated.View key={`${p.wallet}-${i}`} entering={FadeInUp.delay(480 + i * 80).springify()}>
                  <LinearGradient
                    colors={i % 2 === 0 ? ["#0D0C1C", "#07060F"] : ["#0A0918", "#05040C"]}
                    style={[
                      styles.tableRow,
                      p.wallet === profile.wallet && styles.tableRowHighlight,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        i === 0 ? ["#FFE600", "#FF8C00"] :
                        i === 1 ? ["#C0C0C0", "#8A8A8A"] :
                        i === 2 ? ["#CD7F32", "#8B4513"] :
                                  ["#1A1A2E", "#0F0E1A"]
                      }
                      style={styles.rankBadge}
                    >
                      <Text style={[
                        styles.rankBadgeText,
                        { color: i < 3 ? "#000" : CYBER.neonCyan },
                      ]}>{p.rank}</Text>
                    </LinearGradient>

                    <Text style={[
                      styles.playerText,
                      { flex: 1 },
                      p.wallet === profile.wallet && { color: CYBER.neonYellow },
                    ]}>{p.wallet.slice(0,4)+"..."+p.wallet.slice(-4)}</Text>
                    <Text style={[styles.ratingCell, { width: 74, textAlign: "right" }]}>{p.rating}</Text>
                    <Text style={[styles.winsCell,   { width: 60, textAlign: "right" }]}>{p.wins}</Text>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </TopContainer>
  );
}


export function LoadingScreen() {
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.25,
    transform: [{ scale: 0.9 + pulse.value * 0.2 }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrap}>

      {/* spinner + halo */}
      <View style={styles.spinnerWrap}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <View style={styles.spinnerRing}>
          <ActivityIndicator color={CYBER.neonCyan} size="large" />
        </View>
      </View>

      <Animated.Text
        entering={FadeInDown.delay(200).springify()}
        style={styles.loadTitle}
      >
        SYNCING DATA
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(320).springify()}
        style={styles.loadSub}
      >
        fetching player profile & leaderboard...
      </Animated.Text>

      {/* decorative dots */}
      <Animated.View
        entering={FadeInDown.delay(440).springify()}
        style={styles.dotsRow}
      >
        {[CYBER.neonCyan, CYBER.neonPurple, CYBER.neonPink].map((c, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: c, shadowColor: c }]} />
        ))}
      </Animated.View>

    </Animated.View>
  );
}


/* ─── NO WALLET ─── */
export function NoWalletScreen() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrap}>

      {/* icon card */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <LinearGradient
          colors={["#0D0C1A", "#04040E"]}
          style={styles.iconCard}
        >
          <LinearGradient
            colors={[CYBER.neonCyan, CYBER.neonPink]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.iconCardBar}
          />
          {/* corner accents */}
          <View style={[styles.corner, styles.cTL]} />
          <View style={[styles.corner, styles.cTR]} />
          <View style={[styles.corner, styles.cBL]} />
          <View style={[styles.corner, styles.cBR]} />

          <Text style={styles.iconGlyph}>◈</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).springify()}
        style={styles.noWalletTitle}
      >
        NO WALLET CONNECTED
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(300).springify()}
        style={styles.noWalletSub}
      >
        Connect your Solana wallet to view{"\n"}your profile and leaderboard statstyles.
      </Animated.Text>

      {/* hint pill */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <LinearGradient
          colors={["#0D0C1A", "#07060F"]}
          style={styles.hintPill}
        >
          <View style={[styles.hintDot, { backgroundColor: CYBER.neonGreen, shadowColor: CYBER.neonGreen }]} />
          <Text style={styles.hintText}>Use the wallet icon in the header to connect</Text>
        </LinearGradient>
      </Animated.View>

    </Animated.View>
  );
}


function MetaStat({ label, value, color = "#FFF" }: { label: string; value: any; color?: string }) {
  return (
    <View style={styles.metaBox}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, { color }]}>{value}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color, shadowColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <LinearGradient colors={["#00F5FF", "#FF2CF1"]} style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StatCard({ label, value, color, delay, icon }: {
  label: string; value: any; color: string; delay: number; icon: string;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.statCard}>
      <LinearGradient colors={["#0D0C1A", "#04040E"]} style={styles.statInner}>
        <View style={[styles.statTopLine, { backgroundColor: color }]} />
        <View style={[styles.iconCircle, { borderColor: color, shadowColor: color }]}>
          <Text style={{ color, fontSize: 14 }}>{icon}</Text>
        </View>
        <Text style={[styles.statValue, { color, textShadowColor: color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function EconCard({ label, value, prefix, color, delay }: {
  label: string; value: string; prefix: string; color: string; delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.econCard}>
      <LinearGradient colors={["#0D0C1A", "#04040E"]} style={styles.econInner}>
        <View style={[styles.econTopLine, { backgroundColor: color }]} />
        <Text style={[styles.econPrefix, { color, textShadowColor: color }]}>{prefix}</Text>
        <Text style={[styles.econValue, { color, textShadowColor: color }]}>{value}</Text>
        <Text style={styles.econLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
}



const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  loadingText: {
    color: "#00F5FF",
    fontFamily: "Orbitron_900Black",
    fontSize: 12,
    letterSpacing: 4,
    textShadowColor: "#00F5FF",
    textShadowRadius: 10,
  },

  emptyWrap: {
    padding: 30,
    alignItems: "center",
  },

  emptyText: {
    color: "#5A5A7A",
    fontFamily: "Orbitron_900Black",
    fontSize: 11,
    letterSpacing: 3,
  },

  heroOuter: {
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A4A",
    overflow: "hidden",
    position: "relative",
  },

  heroTopBar: {
    height: 3,
    width: "100%",
  },

  heroBottomBar: {
    height: 2,
    width: "100%",
  },

  heroInner: {
    padding: 26,
    alignItems: "center",
    gap: 16,
  },

  scanlines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: "transparent",
  },

  corner: {
    position: "absolute",
    width: 14,
    height: 14,
    zIndex: 10,
  },

  cornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#00F5FF",
  },

  cornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#FF2CF1",
  },

  cornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FF2CF1",
  },

  cornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#00F5FF",
  },

  tierBadge: {
    borderRadius: 6,
    overflow: "hidden",
  },

  tierGrad: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 6,
  },

  tierText: {
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: "Orbitron_900Black",
    color: "#000",
  },

  wallet: {
    color: "#5A5A7A",
    fontSize: 11,
    letterSpacing: 3,
  },

  ratingWrap: {
    position: "relative",
    alignItems: "center",
  },

  ratingHalo: {
    position: "absolute",
    width: 160,
    height: 90,
    borderRadius: 80,
    backgroundColor: "#FF2CF1",
    opacity: 0.12,
    zIndex: -1,
  },

  ratingBadge: {
    borderRadius: 18,
    paddingHorizontal: 44,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF2CF133",
  },

  ratingGlitch: {
    position: "relative",
    alignItems: "center",
  },

  rating: {
    fontSize: 52,
    fontFamily: "Orbitron_900Black",
    color: "#FFF",
    textShadowColor: "#FF2CF1",
    textShadowRadius: 16,
  },

  ratingGhost: {
    position: "absolute",
    fontSize: 52,
    fontFamily: "Orbitron_900Black",
    color: "#00F5FF",
    opacity: 0.15,
    left: 2,
    top: 1,
  },

  ratingLabel: {
    color: "#9A9AB0",
    fontSize: 9,
    letterSpacing: 4,
    marginTop: 2,
  },

  heroMeta: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
  },

  metaBox: {
    alignItems: "center",
  },

  metaLabel: {
    color: "#5A5A7A",
    fontSize: 9,
    letterSpacing: 1.5,
  },

  metaValue: {
    fontFamily: "Orbitron_900Black",
    fontSize: 15,
    textShadowRadius: 8,
  },

  metaDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#2A2A4A",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 30,
    marginBottom: 14,
  },

  sectionIcon: {
    color: "#FF2CF1",
    fontSize: 14,
    textShadowColor: "#FF2CF1",
    textShadowRadius: 8,
  },

  sectionAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },

  sectionTitle: {
    color: "#00F5FF",
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: "Orbitron_900Black",
    textShadowColor: "#00F5FF",
    textShadowRadius: 10,
  },

  glowCard: {
    shadowColor: "#FF2CF1",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderRadius: 20,
  },

  perfCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A4A",
    padding: 20,
    gap: 14,
    overflow: "hidden",
  },

  cardTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  barLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  legendItem: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  legendLabel: {
    color: "#9A9AB0",
    fontSize: 10,
  },

  barTrack: {
    flexDirection: "row",
    height: 14,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#0A0918",
  },

  wdlRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
  },

  wdlNum: {
    fontFamily: "Orbitron_900Black",
    fontSize: 16,
    textShadowRadius: 8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statCard: {
    width: "47.5%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A4A",
    overflow: "hidden",
  },

  statInner: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },

  statTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },

  statValue: {
    fontSize: 28,
    fontFamily: "Orbitron_900Black",
    textShadowRadius: 10,
  },

  statLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#7A7A8C",
  },

  grid3: {
    flexDirection: "row",
    gap: 10,
  },

  econCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A4A",
    overflow: "hidden",
  },

  econInner: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
  },

  econTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },

  econPrefix: {
    fontFamily: "Orbitron_900Black",
    fontSize: 16,
    textShadowRadius: 8,
  },

  econValue: {
    fontSize: 22,
    fontFamily: "Orbitron_900Black",
    textShadowRadius: 10,
  },

  econLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#7A7A8C",
  },

  table: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A4A",
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
    gap: 10,
    position: "relative",
  },

  tableHeaderBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  headerCell: {
    color: "#5A5A7A",
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: "Orbitron_900Black",
  },

  tableRow: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#1A1A2E",
    gap: 10,
  },

  tableRowHighlight: {
    borderLeftWidth: 2,
    borderLeftColor: "#FFE600",
  },

  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  rankBadgeText: {
    fontFamily: "Orbitron_900Black",
    fontSize: 12,
  },

  playerText: {
    color: "#D0D0E8",
    fontSize: 12,
    letterSpacing: 1,
  },

  ratingCell: {
    color: "#00F5FF",
    fontFamily: "Orbitron_900Black",
    fontSize: 13,
    textShadowColor: "#00F5FF",
    textShadowRadius: 6,
  },

  winsCell: {
    color: "#00FFA3",
    fontFamily: "Orbitron_900Black",
    fontSize: 13,
    textShadowColor: "#00FFA3",
    textShadowRadius: 6,
  },

  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 32,
  },

  /* Loading */

  spinnerWrap: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },

  halo: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#00F5FF",
  },

  spinnerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#2A2A4A",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07060F",
  },

  loadTitle: {
    fontFamily: "Orbitron_900Black",
    fontSize: 16,
    color: "#00F5FF",
    letterSpacing: 4,
    textShadowColor: "#00F5FF",
    textShadowRadius: 12,
  },

  loadSub: {
    fontSize: 11,
    color: "#5A5A7A",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: -8,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  /* No Wallet */

  iconCard: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A2A4A",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  iconCardBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  iconGlyph: {
    fontSize: 38,
    color: "#FF2CF1",
    textShadowColor: "#FF2CF1",
    textShadowRadius: 16,
  },

  cTL: {
    top: 5,
    left: 5,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: "#00F5FF",
  },

  cTR: {
    top: 5,
    right: 5,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "#FF2CF1",
  },

  cBL: {
    bottom: 5,
    left: 5,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: "#FF2CF1",
  },

  cBR: {
    bottom: 5,
    right: 5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "#00F5FF",
  },

  noWalletTitle: {
    fontFamily: "Orbitron_900Black",
    fontSize: 14,
    color: "#FF2CF1",
    letterSpacing: 3,
    textShadowColor: "#FF2CF1",
    textShadowRadius: 10,
    textAlign: "center",
  },

  noWalletSub: {
    fontSize: 12,
    color: "#5A5A7A",
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 20,
    marginTop: -6,
  },

  hintPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1A1A2E",
    marginTop: 4,
  },

  hintDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  hintText: {
    fontSize: 10,
    color: "#9A9AB0",
    letterSpacing: 0.5,
  },

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
});