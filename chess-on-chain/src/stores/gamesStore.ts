import { create } from "zustand";
import { GET_GAMES_RESPONSE_PAYLOAD } from "../config/serverResponds";
interface GAMES {
    games: GET_GAMES_RESPONSE_PAYLOAD[],
    setGames: (games: GET_GAMES_RESPONSE_PAYLOAD[]) => void,
}
export const gamesStore = create<GAMES>((set) => ({
    games: [],
    setGames: (games) => set({ games })
}))