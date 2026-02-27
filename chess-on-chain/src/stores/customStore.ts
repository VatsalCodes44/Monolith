import { create } from "zustand";
interface SkrStore {
    skr: number | null,
    setSkr: (skr: number | null) => void,
}
export const skrStore = create<SkrStore>((set) => ({
    skr: null,
    setSkr: (skr) => set({ skr })
}))

interface CustomGameIdStore {
    customGameId: string | null,
    setCustomGameId: (customGameId: string | null) => void,
}

export const customGameIdStore = create<CustomGameIdStore>((set) => ({
    customGameId: null,
    setCustomGameId: (customGameId) => set({ customGameId })
}))