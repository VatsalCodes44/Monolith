import { z } from "zod"
import { INIT_GAME, CHECK, GAME_OVER, MESSAGE, MOVE, TIME_OUT, RE_JOIN_GAME, INIT_CUSTOM_GAME, RE_JOIN_CUSTOM_GAME, MOVE_CUSTOM, MESSAGE_CUSTOM, JOIN_CUSTOM_GAME } from "./serverResponds"


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

export const INIT_CUSTOM_GAME_TYPE = z.object({ // http request (jwt will be in header)
    type: z.literal(INIT_CUSTOM_GAME),
    payload: z.object({
        skr: z.number(),
        opponentPublicKey: z.string(),
    })
})

export const Re_JOIN_CUSTOM_GAME_TYPE = z.object({
    type: z.literal(RE_JOIN_CUSTOM_GAME),
    payload: z.object({
        gameId: z.string(),
        jwt: z.string()
    })
})

export const MOVE_CUSTOM_TYPE = z.object({
    type: z.literal(MOVE_CUSTOM),
    payload: z.object({
        jwt: z.string(),
        gameId: z.string(),
        from: z.string(),
        to: z.string()
    }),
    promotion: z.string().optional()
})

export const MESSAGE_CUSTOM_TYPE = z.object({
    type: z.literal(MESSAGE_CUSTOM),
    payload: z.object({
        from: z.enum(["w", "b"]),
        message: z.string(),
        gameId: z.string(),
        jwt: z.string(),
    })
})

export const JOIN_CUSTOM_GAME_TYPE = z.object({ // websocket request
    type: z.literal(JOIN_CUSTOM_GAME),
    payload: z.object({
        gameId: z.string(),
        jwt: z.string(),
    })
})

export type INIT_GAME_TYPE_TS = z.infer<typeof INIT_GAME_TYPE>;
export type INIT_GAME_TYPE_PAYLOAD_TS = z.infer<typeof INIT_GAME_TYPE>["payload"];
export type Re_JOIN_GAME_TYPE_TS = z.infer<typeof Re_JOIN_GAME_TYPE>;
export type MOVE_TYPE_TS = z.infer<typeof MOVE_TYPE>;
export type MESSAGE_TYPE_TS = z.infer<typeof MESSAGE_TYPE>;
export type GET_BALANCE_TYPE_TS = z.infer<typeof getBalance>;

export type INIT_CUSTOM_GAME_TYPE_TS = z.infer<typeof INIT_CUSTOM_GAME_TYPE>;
export type Re_JOIN_CUSTOM_GAME_TYPE_TS = z.infer<typeof Re_JOIN_CUSTOM_GAME_TYPE>;
export type MOVE_CUSTOM_TYPE_TS = z.infer<typeof MOVE_CUSTOM_TYPE>;
export type MESSAGE_CUSTOM_TYPE_TS = z.infer<typeof MESSAGE_CUSTOM_TYPE>;
export type JOIN_CUSTOM_GAME_TYPE_TS = z.infer<typeof JOIN_CUSTOM_GAME_TYPE>;
