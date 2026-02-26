import { z } from "zod"
import { INIT_GAME, CHECK, GAME_OVER, MESSAGE, MOVE, TIME_OUT, RE_JOIN_GAME } from "./serverResponds"


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

export const getBalance = z.object({
    network: z.enum(["MAINNET", "DEVNET"]),
})

export type INIT_GAME_TYPE_TS = z.infer<typeof INIT_GAME_TYPE>;
export type INIT_GAME_TYPE_PAYLOAD_TS = z.infer<typeof INIT_GAME_TYPE>["payload"];
export type Re_JOIN_GAME_TYPE_TS = z.infer<typeof RE_JOIN_GAME>;
export type MOVE_TYPE_TS = z.infer<typeof MOVE_TYPE>;
export type MESSAGE_TYPE_TS = z.infer<typeof MESSAGE_TYPE>;
export type GET_BALANCE_TYPE_TS = z.infer<typeof getBalance>;
