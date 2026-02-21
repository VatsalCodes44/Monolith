import {create} from "zustand"

interface Wallet {
    isDevnet: boolean,
    publicKey: string | null,
    setIsDevnet: (isDevnet: boolean) => void,
    setPublicKey: (publicKey: string | null) => void,
}
export const useWalletStore = create<Wallet>((set) => ({
    isDevnet: true,
    publicKey: null,
    setIsDevnet: (isDevnet) => set({isDevnet}),
    setPublicKey: (publicKey) => set({publicKey})
}))

