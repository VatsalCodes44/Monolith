import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./Messages.js";
import { Game } from "./Game.js";
export class GameManager {
    games;
    pendingUser;
    users;
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        if (!this.users.includes(socket)) {
            this.users.push(socket);
        }
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(s => s !== socket);
        // stop the game here because the user left 
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            console.log(message);
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    // is there is a pending user start a game
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (message.type == MOVE) {
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.move);
                }
            }
        });
    }
}
//# sourceMappingURL=GameManager.js.map