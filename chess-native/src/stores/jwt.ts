import { create } from "zustand";
interface JWT {
    jwt: string | null,
    setJwt: (jwt: string | null) => void,
}
export const jwtStore = create<JWT>((set) => ({
    jwt: null,
    setJwt: (jwt) => set({ jwt })
}))