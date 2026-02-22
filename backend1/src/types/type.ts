import { INIT_GAME, RE_JOIN_GAME, MOVE, MESSAGE } from "../Messages.js"
import z from "zod"
export interface Message {
    from: "w" | "b",
    message: string,
}


export const INIT_GAME_TYPE = z.object({
    type: z.literal(INIT_GAME),
    payload: z.object({
        publicKey: z.string(),
        signature: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"])
    })
})

export const Re_JOIN_GAME_TYPE = z.object({
    type: z.literal(RE_JOIN_GAME),
    payload: z.object({
        gameId: z.string(),
        playerPublicKey: z.string(),
        signature: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"])
    })
})

export const MOVE_TYPE = z.object({
    type: z.literal(MOVE),
    payload: z.object({
        publicKey: z.string(),
        gameId: z.string(),
        signature: z.string(),
        from: z.string(),
        to: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"])
    }),
    promotion: z.string().optional()
})

export const MESSAGE_TYPE = z.object({
    type: z.literal(MESSAGE),
    payload: z.object({
        from: z.enum(["w", "b"]),
        publicKey: z.string(),
        signature: z.string(),
        message: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"]),
        gameId: z.string()
    })
})
