import { Chess, Move, Square } from "chess.js";

export interface GameOver {
  winner: "b" | "w" | null,
  gameOverType: "checkmate" | "stalemate" | "draw" | "time_out" | null,
  isGameOver: boolean
}

export interface Message {
  from: "w" | "b",
  message: string,
}

export interface GAME_STATE {
    chess: Chess,
    color: "w" | "b",
    from: Square | null,
    prevFrom: Square | null,
    prevTo: Square | null,
    moves: Move[],
    timer1: number,
    timer2: number,
    opponentPubkey: string | null,
    gameover: GameOver,

}