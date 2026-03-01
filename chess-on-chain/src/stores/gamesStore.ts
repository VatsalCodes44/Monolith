import { create } from "zustand";
import { GET_GAMES_RESPONSE_PAYLOAD } from "../config/serverResponds";
interface JWT {
    games: GET_GAMES_RESPONSE_PAYLOAD[],
    setJwt: (games: GET_GAMES_RESPONSE_PAYLOAD[]) => void,
}
export const gamesStore = create<JWT>((set) => ({
    games: [],
    setJwt: (games) => set({ games })
}))