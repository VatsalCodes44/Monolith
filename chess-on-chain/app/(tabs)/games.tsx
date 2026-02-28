import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Orbitron_900Black } from "@expo-google-fonts/orbitron";
import { Move } from "chess.js";

import { HeroSection } from "@/src/components/HeroSection";
import { TopContainer } from "@/src/components/TopContainer";
import { GradientButton } from "@/src/components/GradientButton";

export type GET_GAMES_RESPONSE_PAYLOAD = {
  games: {
    lamports: number;
    status: string;
    fen: string;
    history: Move[];
    winner: "w" | "b" | null;
    player1PublicKey: string;
    player2PublicKey: string;
    timer1: number;
    timer2: number;
    customGame: boolean;
    skr: number;
    id: string;
  }[];
};

interface Props {
  data: GET_GAMES_RESPONSE_PAYLOAD | null;
}

export default function GamesTab({ data }: Props) {
  const [fontsLoaded] = useFonts({
    Orbitron_900Black,
  });

  const [gameId, setGameId] = useState("");

  return (
    <TopContainer>
      {/* HERO SECTION (EMPTY FUNCTIONS) */}
      <HeroSection
        publicKey={null}
        isDevnet={false}
        fontsLoaded={fontsLoaded}
        title="LIVE ARENAS"
        tagline="Watch. Join. Conquer."
        showSol={false}
        fetchbalance={async () => { }}
        onPress={() => { }}
        lamports={0}
        skr={0}
      />

      {/* INPUT + FIXED BUTTONS */}
      <View style={styles.inputSection}>
        <TextInput
          placeholder="Enter Game ID..."
          placeholderTextColor="#6B7280"
          value={gameId}
          onChangeText={setGameId}
          style={styles.input}
        />

        <View style={styles.buttonRow}>
          <GradientButton
            text="SPECTATE"
            disabled={false}
            onPress={() => {
              console.log("Spectate:", gameId);
            }}
            fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
          />

          <GradientButton
            text="JOIN CUSTOM"
            disabled={false}
            onPress={() => {
              console.log("Join Custom:", gameId);
            }}
            fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
          />
        </View>
      </View>

      {/* GAMES LIST */}
      <ScrollView contentContainerStyle={styles.gamesContainer}>
        {data?.games?.map((game, index) => (
          <LinearGradient
            key={game.id}
            colors={["#B048C2", "#9082DB", "#3DE3B4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorderGradient}
          >
            <View style={styles.cardInner}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.gameTitle,
                    {
                      fontFamily: fontsLoaded
                        ? "Orbitron_900Black"
                        : "Roboto",
                    },
                  ]}
                >
                  {game.customGame ? "CUSTOM ARENA" : "OPEN ARENA"}
                </Text>

                <Text style={styles.subText}>
                  Stake: {game.lamports / 1e9} SOL
                </Text>

                <Text style={styles.subText}>
                  Status: {game.status}
                </Text>

                <Text style={styles.subText}>
                  Timer: {game.timer1}s vs {game.timer2}s
                </Text>

                {game.winner && (
                  <Text style={styles.winnerText}>
                    Winner: {game.winner === "w" ? "White" : "Black"}
                  </Text>
                )}
              </View>

              <GradientButton
                text="VIEW"
                onPress={() => {
                  console.log("Open Game:", game.id);
                }}
                fontFamily={fontsLoaded ? "Orbitron_900Black" : "Roboto"}
                disabled={false}
              />
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    </TopContainer>
  );
}

const styles = StyleSheet.create({
  inputSection: {
    marginBottom: 24,
    gap: 12,
  },

  input: {
    backgroundColor: "#16161A",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A2A30",
    color: "#FFFFFF",
    fontSize: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },

  gamesContainer: {
    gap: 16,
    paddingBottom: 40,
  },

  cardBorderGradient: {
    padding: 1.5,
    borderRadius: 16,
  },

  cardInner: {
    backgroundColor: "#16161A",
    borderRadius: 14.5,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  gameTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },

  subText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 2,
  },

  winnerText: {
    color: "#3DE3B4",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
});