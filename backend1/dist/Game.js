import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { CHECK, GAME_OVER, INIT_GAME, MESSAGE, MOVE, TIME_OUT } from "./Messages.js";
export class Game {
    player1;
    player2;
    board;
    startTime;
    timer1;
    timer2;
    lastMoveTimestamp;
    messages;
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.timer1 = (10 * 60 * 1000) + 2000;
        this.timer2 = (10 * 60 * 1000) + 2000;
        this.board = new Chess();
        this.startTime = new Date();
        this.lastMoveTimestamp = Date.now();
        this.messages = [];
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
    addMessage(socket, message) {
        if (socket === this.player1) {
            this.messages.push({
                from: "w",
                message: message.message
            });
            this.player2.send(JSON.stringify({
                type: MESSAGE,
                payload: {
                    from: "w",
                    message: message.message
                }
            }));
        }
        else {
            this.messages.push({
                from: "b",
                message: message.message
            });
            this.player1.send(JSON.stringify({
                type: MESSAGE,
                payload: {
                    from: "b",
                    message: message.message
                }
            }));
        }
    }
    makeMove(socket, move, promotion) {
        // validation of move using zod
        // make sure is this user move
        // is this move valid
        // update the board
        // push the move
        // check id the game is over
        // send the updated board to both the player
        // validating only the correct user makes the move whose turn is this
        const now = Date.now();
        const timeSpent = now - this.lastMoveTimestamp;
        if (this.board.turn() === "w" && socket !== this.player1) {
            return;
        }
        else {
            this.timer1 -= timeSpent;
        }
        if (this.board.turn() === "b" && socket !== this.player2) {
            return;
        }
        else {
            this.timer2 -= timeSpent;
        }
        this.lastMoveTimestamp = now;
        if (this.timer1 <= 0 || this.timer2 <= 0) {
            const gameOverType = "time_out";
            this.player1.send(JSON.stringify({
                type: TIME_OUT,
                payload: {
                    winner: this.timer1 <= 0 ? "w" : "b",
                    gameOverType,
                }
            }));
            this.player2.send(JSON.stringify({
                type: TIME_OUT,
                payload: {
                    winner: this.timer1 <= 0 ? "w" : "b",
                    gameOverType,
                }
            }));
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
            board: this.board.fen(),
            timer1: this.timer1,
            timer2: this.timer2
        };
        console.log(payload);
        // check if the game is over
        if (this.board.isGameOver() || this.timer1 <= 0 || this.timer2 <= 0) {
            const gameOverType = this.board.isCheckmate() ?
                "checkmate" :
                (this.board.isStalemate() ?
                    "stalemate" :
                    "draw");
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: gameOverType == "checkmate" ? this.board.turn() === "w" ? "w" : "b" : null,
                    gameOverType,
                    ...payload
                }
            }));
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "b" : "w",
                    gameOverType,
                    ...payload
                }
            }));
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
//# sourceMappingURL=Game.js.map