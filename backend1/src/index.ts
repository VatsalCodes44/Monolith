import express from "express";
import { WebSocketServer } from 'ws';
import http from "http";
import { GameManager } from './GameManager.js';
import { prisma } from "./lib/prisma.js"
import nacl from "tweetnacl";
import z from "zod";

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const gameManager = new GameManager();

app.use(express.json());

const wss = new WebSocketServer({ server }, () => {
    console.log(`Server started on port ${PORT}`);
});

wss.on('connection', function connection(socket) {
    gameManager.addUser(socket);
    socket.on('error', console.error);

    socket.on("close", () => {
        gameManager.removeUser(socket);
    })
});
app.post('/getBalance', async (req, res) => {

    const result = z.object({
        publicKey: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
    }).safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const { publicKey, network } = result.data;

    const user = await prisma.player.findUnique({
        where: {
            publicKey: publicKey
        }
    })
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    console.log(user)

    res.json({
        lamports: network === "MAINNET" ? user.mainnetLamports.toString() : user.devnetLamports.toString(),
        skr: user.skr.toString(),
    });
})

app.post("/getGames", async (req, res) => {
    const result = z.object({
        publicKey: z.string(),
        signature: z.string(),
        network: z.enum(["MAINNET", "DEVNET"]),
    }).safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const { publicKey, signature, network } = result.data;

    const verify = nacl.sign.detached.verify(Buffer.from(publicKey), Buffer.from(signature), Buffer.from(publicKey));
    if (!verify) {
        return res.status(400).json({ error: "Invalid signature" });
    }

    const games = await prisma.game.findMany({
        where: {
            OR: [
                { player1PublicKey: publicKey },
                { player2PublicKey: publicKey }
            ],
            network,
        },
        select: {
            lamports: true,
            status: true,
            fen: true,
            history: true,
            winner: true,
            player1PublicKey: true,
            player2PublicKey: true,
            timer1: true,
            timer2: true,
        }
    })
    res.json({ games });
})

server.listen(PORT, () => {
    console.log(`HTTP + WS Server started on port ${PORT}`);
});