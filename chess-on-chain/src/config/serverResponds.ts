import { Move, Square } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const TIME_OUT = "time_out";
export const CHECK = "check";
export const MESSAGE = "message";
export const RE_JOIN_GAME = "re_join_game";
export const INSUFFICIENT_FUNDS = "Insufficient Funds";

export const INIT_CUSTOM_GAME = "init_custom_game";
export const JOIN_CUSTOM_GAME = "join_custom_game";
export const MOVE_CUSTOM = "move_custom";
export const MESSAGE_CUSTOM = "message_custom";
export const RE_JOIN_CUSTOM_GAME = "re_join_custom_game";
export const CUSTOM_CREATED = "custom_created";
export const CUSTOM_NOT_FOUND = "custom_not_found";

export type INIT_GAME_RESPONSE_PAYLOAD = {
    color: "b" | "w",
    board: string,
    timer1: number,
    timer2: number,
    gameId: string,
    network: "MAINNET" | "DEVNET",
    sol: "0.01" | "0.05" | "0.1",
    opponentPubkey: string,
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

export type Re_JOIN_GAME_RESPONSE_PAYLOAD = {
    color: "b" | "w",
    board: string,
    timer1: number,
    timer2: number,
    gameId: string,
    network: "MAINNET" | "DEVNET",
    sol: "0.01" | "0.05" | "0.1",
    opponentPubkey: string,
}

export type JOIN_CUSTOM_GAME_Response_Payload = {
    color: "b" | "w",
    board: string,
    timer1: number,
    timer2: number,
    gameId: string,
    skr: number,
    opponentPubkey: string,
}

export type RE_JOIN_CUSTOM_GAME_RESPONSE_PAYLOAD = {
    color: "b" | "w",
    board: string,
    timer1: number,
    timer2: number,
    gameId: string,
    skr: number,
    opponentPubkey: string,
}

export type GET_GAMES_RESPONSE_PAYLOAD = {
    games: {
        lamports: number,
        status: string,
        fen: string,
        history: Move[],
        winner: "w" | "b" | null,
        player1PublicKey: string,
        player2PublicKey: string,
        timer1: number,
        timer2: number,
        customGame: boolean,
        skr: number,
        id: string,
    }[],
}