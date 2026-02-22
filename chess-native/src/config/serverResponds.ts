import { Move, Square } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const TIME_OUT = "time_out";
export const CHECK = "check";
export const MESSAGE = "message";
export const RE_JOIN_GAME = "re_join_game";

export type INIT_GAME_RESPONSE_PAYLOAD = {
    color : "b" | "w",
    board: string,
    timer1: number,
    timer2: number,
    gameId: string,
    network: "MAINNET" | "DEVNET",
    sol: "0.01" | "0.05" | "0.1"
}

export type MOVE_RESPONSE_PAYLOAD = {
    move: {
        from: Square | null,
        to: Square | null,
    }
    board: string,
    timer1: number,
    timer2: number,
    history: Move[]
}

export type GAME_OVER_RESPONSE_PAYLOAD = MOVE_RESPONSE_PAYLOAD & {
    winner: "w" | "b" | null,
    gameOverType: "checkmate" | "stalemate" | "draw",
}

export type GAME_OVER_TIMEOUT_RESPONSE_PAYLOAD = MOVE_RESPONSE_PAYLOAD & {
    winner: "b" | "w",
    gameOverType: "time_out",
}

export type message_payload = {
    from: "b" | "w",
    message: string
}