import { TopContainer } from "@/src/components/TopContainer";
import { Header } from "@/src/components/Header";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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

  const profile = {
    wallet: "7fK...a91",
    rank: 42,
    rating: 1380,
    peak: 1420,
    games: 48,
    wins: 27,
    losses: 15,
    draws: 6,
    winrate: "56%",
    solWon: "1.24",
    solLost: "0.73",
    skrUsed: "350",
    tier: "SILVER II",
  };

  const leaderboard = [
    { rank: 1, wallet: "7fK...a91", rating: 1620, wins: 210 },
    { rank: 2, wallet: "3A9...pp2", rating: 1580, wins: 198 },
    { rank: 3, wallet: "9Hd...23d", rating: 1500, wins: 176 },
    { rank: 4, wallet: "AK2...3sD", rating: 1450, wins: 160 },
  ];

  const totalGames = profile.wins + profile.losses + profile.draws;
  const winPct  = Math.round((profile.wins   / totalGames) * 100);
  const lossPct = Math.round((profile.losses / totalGames) * 100);
  const drawPct = 100 - winPct - lossPct;

  return (
    <TopContainer>
      <Header title="PLAYER PROFILE" tagline="Competitive performance" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ─── HERO ─── */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <View style={styles.heroOuter}>
            {/* Corner accents */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <LinearGradient
              colors={["#00F5FF", "#FF2CF1", "#8A2CFF"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.heroTopBar}
            />
            <LinearGradient
              colors={["#0A091A", "#04040E"]}
              style={styles.heroInner}
            >
              {/* Scanline overlay */}
              <View style={styles.scanlines} pointerEvents="none" />

              {/* Rating badge */}
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
                {/* Glow halo */}
                <View style={styles.ratingHalo} />
              </View>

              {/* Meta row */}
              <View style={styles.heroMeta}>
                <MetaStat label="GLOBAL RANK" value={`#${profile.rank}`} color={CYBER.neonGreen} />
                <View style={styles.metaDivider} />
                <MetaStat label="PEAK" value={profile.peak} color={CYBER.neonCyan} />
                <View style={styles.metaDivider} />
                <MetaStat label="WIN RATE" value={profile.winrate} color={CYBER.neonGreen} />
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
                <LegendDot color={CYBER.neonGreen} label={`WIN ${winPct}%`} />
                <LegendDot color={CYBER.neonPurple} label={`DRAW ${drawPct}%`} />
                <LegendDot color={CYBER.neonPink} label={`LOSS ${lossPct}%`} />
              </View>

              {/* Segmented bar */}
              <View style={styles.barTrack}>
                <LinearGradient
                  colors={["#00FFA3", "#00F5FF"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ flex: winPct, borderRadius: 6 }}
                />
                <View style={{ width: 3 }} />
                <View style={{ flex: drawPct, backgroundColor: "#8A2CFF", borderRadius: 6 }} />
                <View style={{ width: 3 }} />
                <LinearGradient
                  colors={["#FF2CF1", "#FF003C"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ flex: lossPct, borderRadius: 6 }}
                />
              </View>

              {/* W / D / L counts */}
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

          <View style={styles.table}>
            {/* Header */}
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
              <Animated.View key={i} entering={FadeInUp.delay(480 + i * 80).springify()}>
                <LinearGradient
                  colors={i % 2 === 0 ? ["#0D0C1C", "#07060F"] : ["#0A0918", "#05040C"]}
                  style={styles.tableRow}
                >
                  {/* Rank badge with colour per tier */}
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
                      { color: i < 3 ? "#000" : CYBER.neonCyan }
                    ]}>{p.rank}</Text>
                  </LinearGradient>

                  <Text style={[styles.playerText, { flex: 1 }]}>{p.wallet}</Text>
                  <Text style={[styles.ratingCell, { width: 74, textAlign: "right" }]}>{p.rating}</Text>
                  <Text style={[styles.winsCell,  { width: 60, textAlign: "right" }]}>{p.wins}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </TopContainer>
  );
}


/* ─── SUB-COMPONENTS ─── */

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
        {/* Top glow line */}
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


/* ─── STYLES ─── */

const styles = StyleSheet.create({

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },

  /* HERO */
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
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03,
    backgroundColor: "transparent",
  },

  /* Corner accents */
  corner: {
    position: "absolute",
    width: 14,
    height: 14,
    zIndex: 10,
  },
  cornerTL: {
    top: 6, left: 6,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: "#00F5FF",
  },
  cornerTR: {
    top: 6, right: 6,
    borderTopWidth: 2, borderRightWidth: 2,
    borderColor: "#FF2CF1",
  },
  cornerBL: {
    bottom: 6, left: 6,
    borderBottomWidth: 2, borderLeftWidth: 2,
    borderColor: "#FF2CF1",
  },
  cornerBR: {
    bottom: 6, right: 6,
    borderBottomWidth: 2, borderRightWidth: 2,
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

  handle: {
    fontFamily: "Orbitron_900Black",
    fontSize: 22,
    color: "#FFF",
    letterSpacing: 4,
    textShadowColor: "#00F5FF",
    textShadowRadius: 14,
  },
  wallet: {
    color: "#5A5A7A",
    fontSize: 18,
    letterSpacing: 3,
    marginTop: -8,
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
  metaBox: { alignItems: "center" },
  metaLabel: { color: "#5A5A7A", fontSize: 9, letterSpacing: 1.5 },
  metaValue: { fontFamily: "Orbitron_900Black", fontSize: 15, textShadowRadius: 8 },
  metaDivider: { width: 1, height: 36, backgroundColor: "#2A2A4A" },

  /* SECTION TITLE */
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
    fontSize: 18,
    letterSpacing: 3,
    fontFamily: "Orbitron_900Black",
    textShadowColor: "#00F5FF",
    textShadowRadius: 10,
  },

  /* PERFORMANCE */
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
    top: 0, left: 0, right: 0,
    height: 2,
  },
  barLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: { flexDirection: "row", gap: 6, alignItems: "center" },
  legendDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOpacity: 0.9, shadowRadius: 6,
  },
  legendLabel: { color: "#9A9AB0", fontSize: 10 },

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

  /* STAT GRID */
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
    top: 0, left: 0, right: 0,
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

  /* ECON GRID */
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
    top: 0, left: 0, right: 0,
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

  /* TABLE */
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
    top: 0, left: 0, right: 0,
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
});