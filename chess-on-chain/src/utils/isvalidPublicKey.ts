import { PublicKey } from "@solana/web3.js";

export function isValidPublicKey(value: string): boolean {
    try {
        new PublicKey(value);
        return true;
    } catch (err) {
        return false;
    }
}