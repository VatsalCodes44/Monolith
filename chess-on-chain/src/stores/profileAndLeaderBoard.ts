import { create } from "zustand"
import { LeaderboardPlayer, PlayerProfile } from "../config/serverResponds"

interface ProfileStore {
  mainnetProfile: PlayerProfile
  devnetProfile: PlayerProfile
  mainnetLeaderboard: LeaderboardPlayer[]
  devnetLeaderboard: LeaderboardPlayer[]
  
  setMainnetProfile: (profile: PlayerProfile) => void
  setDevnetProfile: (profile: PlayerProfile) => void
  setMainnetLeaderboard: (players: LeaderboardPlayer[]) => void
  setDevnetLeaderboard: (players: LeaderboardPlayer[]) => void
}

export const useProfileLeaderBoardStore = create<ProfileStore>((set) => ({
  mainnetProfile: {
    draws: 0,
    games: 0,
    losses: 0,
    peak: 100,
    rank: 10000000,
    rating: 100,
    skrUsed: "0",
    solLost: "0",
    solWon: "0",
    wallet: "Wallet Not Connected",
    wins: 0
  },
  devnetProfile: {
    draws: 0,
    games: 0,
    losses: 0,
    peak: 100,
    rank: 10000000,
    rating: 100,
    skrUsed: "0",
    solLost: "0",
    solWon: "0",
    wallet: "Wallet Not Connected",
    wins: 0
  },
  mainnetLeaderboard: [],
  devnetLeaderboard: [],

  setMainnetProfile: (profile) =>
    set({ mainnetProfile: profile }),

  setDevnetProfile: (profile) =>
    set({ devnetProfile: profile }),

  setMainnetLeaderboard: (players) =>
    set({ mainnetLeaderboard: players }),

  setDevnetLeaderboard: (players) =>
    set({ devnetLeaderboard: players }),
}))