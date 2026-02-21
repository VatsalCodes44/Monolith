import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MESSAGE, MOVE, TIME_OUT } from "./Messages.js";
export class Game {
    player1;
    player2;
    player1Pubkey;
    player2Pubkey;
    board;
    startTime;
    timer1;
    timer2;
    lastMoveTimestamp;
    messages;
    gameId;
    network;
    sol;
    constructor(player1, player2, player1Pubkey, player2Pubkey, network, sol, gameId) {
        this.player1 = player1;
        this.player2 = player2;
        this.player1Pubkey = player1Pubkey;
        this.player2Pubkey = player2Pubkey;
        this.network = network;
        this.sol = sol;
        this.timer1 = (10 * 60 * 1000);
        this.timer2 = (10 * 60 * 1000);
        this.board = new Chess();
        this.startTime = new Date();
        this.lastMoveTimestamp = Date.now();
        this.gameId = gameId;
        this.messages = [];
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "w",
                board: this.board.fen(),
                timer1: this.timer1,
                timer2: this.timer2
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "b",
                board: this.board.fen(),
                timer1: this.timer1,
                timer2: this.timer2
            }
        }));
    }
    addMessage(socket, message) {
        if (socket === this.player1) {
            this.messages.push({
                from: "w",
                message: message.message
            });
            this.player2?.send(JSON.stringify({
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
            this.player1?.send(JSON.stringify({
                type: MESSAGE,
                payload: {
                    from: "b",
                    message: message.message
                }
            }));
        }
    }
    makeMove(socket, move, promotion) {
        // validating only the correct user makes the move whose turn is this
        if (this.board.turn() === "w" && socket !== this.player1) {
            return;
        }
        if (this.board.turn() === "b" && socket !== this.player2) {
            return;
        }
        const now = Date.now();
        const timeSpent = now - this.lastMoveTimestamp;
        if (this.board.turn() === "w") {
            this.timer1 -= timeSpent;
        }
        else {
            this.timer2 -= timeSpent;
        }
        this.lastMoveTimestamp = now;
        if (this.timer1 <= 0 || this.timer2 <= 0) {
            const winner = this.timer1 <= 0 ? "b" : "w";
            const payload = {
                winner,
                gameOverType: "time_out",
                board: this.board.fen(),
                timer1: this.timer1,
                timer2: this.timer2,
                history: this.board.history({ verbose: true }),
                move: {
                    ...move
                }
            };
            this.player1?.send(JSON.stringify({
                type: TIME_OUT,
                payload
            }));
            this.player2?.send(JSON.stringify({
                type: TIME_OUT,
                payload
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
            timer2: this.timer2,
            history: this.board.history({ verbose: true })
        };
        console.log(payload);
        // check if the game is over
        if (this.board.isGameOver()) {
            let gameOverType;
            if (this.board.isCheckmate()) {
                gameOverType = "checkmate";
            }
            else if (this.board.isStalemate()) {
                gameOverType = "stalemate";
            }
            else {
                gameOverType = "draw";
            }
            let winner = null;
            if (gameOverType === "checkmate") {
                winner = this.board.turn() === "w" ? "b" : "w";
            }
            const finalPayload = {
                winner,
                gameOverType,
                ...payload
            };
            this.player1?.send(JSON.stringify({
                type: GAME_OVER,
                payload: finalPayload
            }));
            this.player2?.send(JSON.stringify({
                type: GAME_OVER,
                payload: finalPayload
            }));
            return;
        }
        // normal case we can check it on client side
        // if (this.board.isCheck()) {
        //     this.player1.send(JSON.stringify({
        //         type: CHECK,
        //         payload
        //     }));
        //     this.player2.send(JSON.stringify({
        //         type: CHECK,
        //         payload
        //     }));
        //     return;
        // }
        this.player1?.send(JSON.stringify({
            type: MOVE,
            payload
        }));
        this.player2?.send(JSON.stringify({
            type: MOVE,
            payload
        }));
    }
}
