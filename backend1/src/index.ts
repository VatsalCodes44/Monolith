import express from "express";
import { WebSocketServer } from 'ws';
import http from "http";
import { GameManager } from './GameManager.js';
import { prisma } from "./lib/prisma.js"
import nacl from "tweetnacl";
import z from "zod";
import { Connection } from "@solana/web3.js";
import { verifySolTransfer } from "./lib/verifySolTransfer.js";
import { verifySeekerTransfer } from "./lib/verifySeekerTransfer.js";
import jwt from "jsonwebtoken";
import { login, deposit, verifyLogin } from "./types/type.js";
import { jwtVerification } from "./middlewares/jwtVerification.js";

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const gameManager = new GameManager();
const mainnetConnection = new Connection(process.env.MAINNET_RPC_URL!)
const devnetConnection = new Connection(process.env.DEVNET_RPC_URL!)

const loginHandler: Map<string, string> = new Map();

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

app.post("/getGames", jwtVerification, async (req, res) => {
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

app.post("/deposit", jwtVerification, async (req, res) => {
    const parsed = deposit.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const { publicKey, signature, network, asset } = parsed.data;

    try {
        // Verify on-chain first

        if (asset == "SOL") {
            let verification = await verifySolTransfer(
                network,
                signature,
                publicKey
            );

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
                        from: publicKey,
                        to: verification.to,
                        asset: "SOL"
                    },
                });

                // Dynamic balance field
                const balanceField =
                    network === "DEVNET"
                        ? { devnetLamports: { increment: verification.lamports } }
                        : { mainnetLamports: { increment: verification.lamports } };

                const createField =
                    network === "DEVNET"
                        ? { devnetLamports: verification.lamports }
                        : { mainnetLamports: verification.lamports };

                await tx.player.upsert({
                    where: { publicKey },
                    update: balanceField,
                    create: {
                        publicKey,
                        ...createField,
                    },
                });
            });
        }
        else if (asset == "SKR") {
            let verification = await verifySeekerTransfer(
                signature,
                publicKey
            );

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
                        from: publicKey,
                        to: verification.to,
                        asset: "SKR",
                    },
                });


                await tx.player.upsert({
                    where: { publicKey },
                    update: {
                        skr: {
                            increment: verification.amount
                        }
                    },
                    create: {
                        publicKey,
                        skr: verification.amount,
                    },
                });
            });
        }



        return res.json({ success: true });

    } catch (error: any) {

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
    const user = await prisma.player.upsert({
        where: {
            publicKey: publicKey
        },
        update: {
        },
        create: {
            publicKey,
        }
    })
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const nonce = Math.floor(Math.random() * 1000000).toString();
    loginHandler.set(publicKey, nonce);
    res.json({ nonce });
})

app.post("/verifyLogin", jwtVerification, async (req, res) => {
    const parsed = verifyLogin.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const { publicKey, signature, nonce } = parsed.data;
    const storedNonce = loginHandler.get(publicKey);
    if (!storedNonce || storedNonce !== nonce) {
        return res.status(400).json({ error: "Invalid nonce" });
    }
    const verify = nacl.sign.detached.verify(Buffer.from(nonce), Buffer.from(signature), Buffer.from(publicKey));
    if (!verify) {
        return res.status(400).json({ error: "Invalid signature" });
    }
    loginHandler.delete(publicKey);
    const token = jwt.sign({ publicKey }, process.env.JWT_SECRET!);
    res.json({ token });
})

server.listen(PORT, () => {
    console.log(`HTTP + WS Server started on port ${PORT}`);
});
