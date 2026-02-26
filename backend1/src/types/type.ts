import { INIT_GAME, RE_JOIN_GAME, MOVE, MESSAGE } from "../Messages.js"
import z from "zod"
export interface Message {
    from: "w" | "b",
    message: string,
}


export const INIT_GAME_TYPE = z.object({
    type: z.literal(INIT_GAME),
    payload: z.object({
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"]),
        jwt: z.string()
    })
})

export const Re_JOIN_GAME_TYPE = z.object({
    type: z.literal(RE_JOIN_GAME),
    payload: z.object({
        gameId: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"]),
        jwt: z.string()
    })
})

export const MOVE_TYPE = z.object({
    type: z.literal(MOVE),
    payload: z.object({
        jwt: z.string(),
        gameId: z.string(),
        from: z.string(),
        to: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"]),
    }),
    promotion: z.string().optional()
})

export const MESSAGE_TYPE = z.object({
    type: z.literal(MESSAGE),
    payload: z.object({
        // publicKey: z.string(),
        // signature: z.string(),
        from: z.enum(["w", "b"]),
        message: z.string(),
        gameId: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"]),
        jwt: z.string(),
    })
})

export const login = z.object({
    publicKey: z.string()
})

export const deposit = z.object({
    signature: z.string(),
    network: z.enum(["MAINNET", "DEVNET"]),
    asset: z.enum(["SOL", "SKR"]),
})

export const verifyLogin = z.object({
    publicKey: z.string(),
    signature: z.string(),
    nonce: z.string(),
})

export const verifyJwt = z.object({
    token: z.string(),
})

export const getBalance = z.object({
    network: z.enum(["MAINNET", "DEVNET"]),
})