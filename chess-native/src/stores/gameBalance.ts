import {create} from "zustand";
interface GameBalance {
    lamports: number,
    skr: number,
    setLamports: (lamports: number) => void,
    setSkr: (skr: number) => void,
}
export const gameBalance= create<GameBalance>((set) => ({
    lamports: 0,
    skr: 0,
    setLamports: (lamports) => set({lamports}),
    setSkr: (skr) => set({skr})
}))