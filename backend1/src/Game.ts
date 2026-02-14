import {WebSocket} from "ws";
import {Chess} from "chess.js"
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
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }

    public makeMove(socket: WebSocket, move: {from: string, to: string}) {
        // validation of move using zod
        // make sure is this user move
        // is this move valid
        // update the board
        // push the move
        // check id the game is over
        // send the updated board to both the player
        
        // validating only the correct user makes the move whose turn is this
        if (this.board.turn() === "w" && socket !== this.player1) {
            return;
        }

        if (this.board.turn() === "b" && socket !== this.player2) {
            return;
        }




        try {
            this.board.move(move)
        }
        catch (e) {
    
            return;
        }



        // check if the game is over
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }))
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }))
            return;
        }

        if (this.board.isCheck()){
            if (this.board.turn() === "w") {
                this.player1.send(JSON.stringify({
                    type: CHECK,
                    playload: move
                }))
            }
            else {
                this.player2.send(JSON.stringify({
                    type: CHECK,
                    payload: move
                }))
            }
            return;
        }


        if (this.board.turn() === "w") {
            this.player1.send(JSON.stringify({
                type: MOVE,
                playload: move
            }))
        }
        else {
    
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }
    }
}