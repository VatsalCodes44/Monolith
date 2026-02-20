import {z} from "zod"
import { INIT_GAME, CHECK, GAME_OVER, MESSAGE, MOVE, TIME_OUT, RE_JOIN_GAME } from "./serverResponds"

const INIT_GAME_TYPE = z.object({
    type: z.literal(INIT_GAME),
    payload: z.object({
        publicKey: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"])
    })
})

const Re_JOIN_GAME_TYPE = z.object({
    type: z.literal(RE_JOIN_GAME),
    payload: z.object({
        gameId: z.string(),
        playerPublicKey: z.string(),
        signature: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"])
    })
})

const MOVE_TYPE = z.object({
    type: z.literal(MOVE),
    payload: z.object({
        gameId: z.string(),
        from: z.string(),
        to: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"])
    }),
    promotion: z.string().optional()
})

const MESSAGE_TYPE = z.object({
    type: z.literal(MESSAGE),
    payload: z.object({
        from: z.enum(["w", "b"]),
        message: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
        sol: z.enum(["0.01", "0.05", "0.1"]),
        gameId: z.string()
    })
})


type INIT_GAME_TYPE_TS = z.infer<typeof INIT_GAME_TYPE>;
type Re_JOIN_GAME_TYPE_TS = z.infer<typeof INIT_GAME_TYPE>;
type MOVE_TYPE_TS = z.infer<typeof INIT_GAME_TYPE>;
type MESSAGE_TYPE_TS = z.infer<typeof INIT_GAME_TYPE>;
