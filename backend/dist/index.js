import express from "express";
import { WebSocketServer } from 'ws';
import http from "http";
import { GameManager } from './GameManager.js';
import { prisma } from "./lib/prisma.js";
import nacl from "tweetnacl";
import { verifySolTransfer } from "./lib/verifySolTransfer.js";
import { verifySeekerTransfer } from "./lib/verifySeekerTransfer.js";
import jwt from "jsonwebtoken";
import { login, deposit, verifyLogin, INIT_CUSTOM_GAME_TYPE } from "./types/type.js";
import { jwtVerification } from "./middlewares/jwtVerification.js";
import { CUSTOM_CREATED, INSUFFICIENT_FUNDS } from "./Messages.js";
import bs58 from "bs58";
const app = express();
const PORT = 8080;
const server = http.createServer(app);
const gameManager = new GameManager();
const message = "Chess on chain wants you to sign this message: ";
let count = 0;
const loginHandler = new Map();
app.use(express.json());
const wss = new WebSocketServer({ server }, () => {
});
wss.on('connection', function connection(socket) {
    count++;
    console.log(count);
    gameManager.addUser(socket);
    socket.on('error', console.error);
    socket.on("close", () => {
        gameManager.removeUser(socket);
    });
});
app.get("/", (req, res) => {
    res.json({ message: "Hello World" });
});
app.post('/getBalance', jwtVerification, async (req, res) => {
    const { network } = req.body;
    const userPublicKey = req.user.publicKey;
    console.log(network);
    const user = await prisma.player.findUnique({
        where: { publicKey: userPublicKey }
    });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    console.log(({
        lamports: network === "MAINNET" ? user.mainnetLamports.toString() : user.devnetLamports.toString(),
        skr: user.skr.toString(),
    }));
    res.json({
        lamports: network === "MAINNET" ? user.mainnetLamports.toString() : user.devnetLamports.toString(),
        skr: user.skr.toString(),
    });
});
app.post("/getGames", jwtVerification, async (req, res) => {
    const publicKey = req.user.publicKey;
    console.log("hii");
    const games = await prisma.game.findMany({
        where: {
            OR: [
                { player1PublicKey: publicKey },
                { player2PublicKey: publicKey }
            ],
        },
        take: 10,
        orderBy: {
            createdAt: "desc"
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
            customGame: true,
            skr: true,
            id: true,
            network: true
        }
    });
    const payload = games.map(g => ({
        ...g,
        lamports: Number(g.lamports),
        skr: Number(g.skr),
        timer1: Number(g.timer1),
        timer2: Number(g.timer2),
    }));
    console.log(payload);
    res.json({ games: payload });
});
app.post("/deposit", jwtVerification, async (req, res) => {
    const parsed = deposit.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const { signature, network, asset } = parsed.data;
    const userPublicKey = req.user.publicKey;
    try {
        // Verify on-chain first
        if (asset == "SOL") {
            let verification = await verifySolTransfer(network, signature, userPublicKey);
            if (!verification.success) {
                return res.status(400).json({ error: "Invalid transaction" });
            }
            await prisma.$transaction(async (tx) => {
                // Prevent replay (race-condition safe)
                await tx.transactions.create({
                    data: {
                        signature,
                        network,
                        amount: verification.lamports,
                        from: userPublicKey,
                        to: verification.to,
                        asset: "SOL"
                    },
                });
                // Dynamic balance field
                const balanceField = network === "DEVNET"
                    ? { devnetLamports: { increment: verification.lamports } }
                    : { mainnetLamports: { increment: verification.lamports } };
                const createField = network === "DEVNET"
                    ? { devnetLamports: verification.lamports }
                    : { mainnetLamports: verification.lamports };
                await tx.player.upsert({
                    where: { publicKey: userPublicKey },
                    update: balanceField,
                    create: {
                        publicKey: userPublicKey,
                        ...createField,
                    },
                });
            });
        }
        else if (asset == "SKR") {
            let verification = await verifySeekerTransfer(signature, userPublicKey);
            if (!verification.success) {
                return res.status(400).json({ error: "Invalid transaction" });
            }
            await prisma.$transaction(async (tx) => {
                // Prevent replay (race-condition safe)
                await tx.transactions.create({
                    data: {
                        signature,
                        network,
                        amount: verification.amount,
                        from: userPublicKey,
                        to: verification.to,
                        asset: "SKR",
                    },
                });
                await tx.player.upsert({
                    where: { publicKey: userPublicKey },
                    update: {
                        skr: {
                            increment: verification.amount
                        }
                    },
                    create: {
                        publicKey: userPublicKey,
                        skr: verification.amount,
                    },
                });
            });
        }
        return res.json({ success: true });
    }
    catch (error) {
        // Unique constraint = replay
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Transaction already processed" });
        }
        console.error(error);
        return res.status(500).json({ error: "Deposit failed" });
    }
});
app.post("/login", async (req, res) => {
    const parsed = login.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const { publicKey } = parsed.data;
    try {
        const user = await prisma.player.upsert({
            where: {
                publicKey: publicKey
            },
            update: {},
            create: {
                publicKey,
            }
        });
    }
    catch {
        res.status(400).json({ error: "error occured" });
        return;
    }
    const nonce = `${Math.floor(Math.random() * 10000000000)}`;
    loginHandler.set(publicKey, nonce);
    res.status(200).json({ nonce: `${message}${nonce}` });
});
app.post("/verifyLogin", async (req, res) => {
    const parsed = verifyLogin.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const { publicKey, signature, nonce } = parsed.data;
    const storedNonce = loginHandler.get(publicKey);
    if (!storedNonce || `${message}${storedNonce}` !== nonce) {
        return res.status(400).json({ error: "Invalid nonce" });
    }
    try {
        const message = new TextEncoder().encode(nonce);
        const sig = Buffer.from(signature, "base64");
        const pubKey = bs58.decode(publicKey);
        const isValid = nacl.sign.detached.verify(message, sig, pubKey);
        if (!isValid) {
            return res.status(400).json({ error: "Invalid signature" });
        }
        loginHandler.delete(publicKey);
        const token = jwt.sign({ publicKey }, process.env.JWT_SECRET);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "Signature verification failed" });
    }
});
app.post("/deployCustom", jwtVerification, async (req, res) => {
    const parsed = INIT_CUSTOM_GAME_TYPE.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const { payload, type } = parsed.data;
    const { skr, opponentPublicKey } = payload;
    const userPublicKey = req.user.publicKey;
    let gameId = null;
    let maxTries = 3;
    let retries = 0;
    while (maxTries > retries) {
        try {
            const tx = await prisma.$transaction(async (tx) => {
                const result1 = await tx.player.updateMany({
                    where: {
                        publicKey: userPublicKey,
                        skr: {
                            gte: skr
                        }
                    },
                    data: {
                        skr: {
                            decrement: skr
                        }
                    }
                });
                if (result1.count == 0) {
                    throw new Error("insufficient_balance");
                }
                const game = await tx.game.create({
                    data: {
                        player1PublicKey: userPublicKey,
                        player2PublicKey: opponentPublicKey,
                        customGame: true,
                        skr,
                        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        status: "IN_PROGRESS",
                        network: "MAINNET",
                    },
                    select: {
                        id: true
                    }
                });
                return game;
            }, {
                isolationLevel: "Serializable",
                maxWait: 10000,
                timeout: 10000,
            });
            gameId = tx.id;
            break;
        }
        catch (err) {
            console.error("Database error creating game:", err);
            if (err instanceof Error && (err.message == "insufficient_balance")) {
                res.send({
                    type: INSUFFICIENT_FUNDS,
                    payload: {
                        publicKey: userPublicKey
                    }
                });
                return;
            }
            retries++;
        }
    }
    if (!gameId) {
        res.send({
            type: "ERROR",
            payload: {}
        });
        return;
    }
    res.send({
        type: CUSTOM_CREATED,
        payload: {
            gameId,
            publicKey: userPublicKey,
            opponentPublicKey,
            skr,
            network: "MAINNET",
        }
    });
    return;
});
server.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP + WS Server started on port ${PORT}`);
});
