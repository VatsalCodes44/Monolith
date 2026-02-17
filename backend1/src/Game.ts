import { WebSocket } from "ws";
import { Chess } from "chess.js"
import { CHECK, GAME_OVER, INIT_GAME, MOVE } from "./Messages.js";
export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "w",
                board: this.board.fen()
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "b",
                board: this.board.fen()
            }
        }));
    }

    public makeMove(socket: WebSocket, move: { from: string, to: string }, promotion: string | undefined) {
        // validation of move using zod
        // make sure is this user move
        // is this move valid
        // update the board
        // push the move
        // check id the game is over
        // send the updated board to both the player

        // validating only the correct user makes the move whose turn is this
        console.log(move)
        if (this.board.turn() === "w" && socket !== this.player1) {
            return;
        }

        if (this.board.turn() === "b" && socket !== this.player2) {
            return;
        }

        try {
            let result;
            if (promotion) {
                result = this.board.move({ ...move, promotion });
            }
            else {
                result = this.board.move(move);
            }
        }
        catch (e) {
            return;
        }

        const payload = {
            move,
            board: this.board.fen()
        };

        // check if the game is over
        if (this.board.isGameOver()) {
            const gameOverType = this.board.isCheckmate() ? "checkmate" : (this.board.isStalemate() ? "stalemate" : "draw");
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: gameOverType == "checkmate" ? this.board.turn() === "w" ? "w" : "b" : null,
                    gameOverType,
                    ...payload
                }
            }))
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "b" : "w",
                    gameOverType,
                    ...payload
                }
            }))
            return;
        }

        if (this.board.isCheck()) {
            this.player1.send(JSON.stringify({
                type: CHECK,
                payload
            }));

            this.player2.send(JSON.stringify({
                type: CHECK,
                payload
            }));
            return;
        }
        // Do NOT return.
        // Then continue and send MOVE update.


        this.player1.send(JSON.stringify({
            type: MOVE,
            payload
        }));

        this.player2.send(JSON.stringify({
            type: MOVE,
            payload
        }));

    }
}