import {create} from "zustand"
import { PublicKey as PK } from "@solana/web3.js"

interface RPC {
    isDevnet: boolean
    setIsDevnet: (isDevnet: boolean) => void
}
export const useRpc = create<RPC>((set) => ({
    isDevnet: true,
    setIsDevnet: (isDevnet) => set({isDevnet})
}))

interface Publickey {
    publicKey: PK | null,
    setPublicKey: (publicKey: PK | null) => void,

}
export const publicKeyStore = create<Publickey>((set) => ({
    publicKey: null,
    setPublicKey: (publicKey) => set({publicKey})
}))

