import {create} from "zustand";
interface Sol {
    sol: "0.01" | "0.05" | "0.1" | null,
    setSol: (sol: "0.01" | "0.05" | "0.1" | null) => void,
}
export const GameBet= create<Sol>((set) => ({
    sol: null,
    setSol: (sol) => set({sol})
}))