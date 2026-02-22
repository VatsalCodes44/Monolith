import {create} from "zustand";

interface Signature {
    signature: string | null,
    setSignature: (signature: string | null) => void
}

export const signedPubkey = create<Signature>((set) => ({
    signature: null,
    setSignature: (signature) => set({signature})
}))

