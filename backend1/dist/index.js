import express from "express";
import { WebSocketServer } from 'ws';
import http from "http";
import { GameManager } from './GameManager.js';
const app = express();
const PORT = 8080;
const server = http.createServer(app);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const wss = new WebSocketServer({ server }, () => {
    console.log(`Server started on port ${PORT}`);
});
server.listen(PORT, () => {
    console.log(`HTTP + WS Server started on port ${PORT}`);
});
const gameManager = new GameManager();
wss.on('connection', function connection(socket) {
    gameManager.addUser(socket);
    socket.on('error', console.error);
    socket.on("close", () => {
        gameManager.removeUser(socket);
    });
});
