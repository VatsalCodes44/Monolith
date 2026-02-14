import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager.js';
const PORT = 8080;
const wss = new WebSocketServer({ port: PORT }, () => {
    console.log(`Server started on port ${PORT}`);
});
const gameManager = new GameManager();
wss.on('connection', function connection(socket) {
    gameManager.addUser(socket);
    socket.on('error', console.error);
    socket.on("close", () => {
        gameManager.removeUser(socket);
    });
});
//# sourceMappingURL=index.js.map