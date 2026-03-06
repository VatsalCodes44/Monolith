import express from "express";
import { WebSocketServer } from 'ws';
import http from "http";
import { GameManager } from './GameManager.js';
import { prisma } from "./lib/prisma.js"
import nacl from "tweetnacl";
import { verifySolTransfer } from "./lib/verifySolTransfer.js";
import { verifySeekerTransfer } from "./lib/verifySeekerTransfer.js";
import jwt from "jsonwebtoken";
import { login, deposit, verifyLogin, getBalance, INIT_CUSTOM_GAME_TYPE, withdraw, PlayerProfile, LeaderboardPlayer } from "./types/type.js";
import { jwtVerification } from "./middlewares/jwtVerification.js";
import { CUSTOM_CREATED, INSUFFICIENT_FUNDS } from "./Messages.js";
import bs58 from "bs58";
import { Transaction, SystemProgram, Keypair, PublicKey, Connection, clusterApiUrl, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token"

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const gameManager = new GameManager();
const message = "Chess on chain wants you to sign this message: ";
let count = 0;
const loginHandler: Map<string, {
    nonce: string,
    createdAt: number,
}> = new Map();
const connection = new Connection((process.env.MAINNET_RPC_URL || clusterApiUrl("mainnet-beta")),"confirmed");
const keyPair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));
const SEEKER_MINT = new PublicKey(
    "SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3"
);

const leaderBoard: LeaderboardPlayer[] = [
    { rank: 1, wallet: "9x71BBUgeimK2dNma2bZM4ooPhNqnNFiuNzDCB7VtoEr", rating: 1620, wins: 210 },
    { rank: 2, wallet: "FjV88UW4FSqcDFw9XcuHD7VJW6M9Gq3b7KaruXyc7bvi", rating: 1580, wins: 198 },
    { rank: 3, wallet: "HaLdUZkgSWGRXiW93cQVDJuQKGKUYELxc58uytEkRygs", rating: 1500, wins: 176 },
    { rank: 4, wallet: "HaLdUZkgSWGRXiW93cQVDJuQKGKUYELxc58uytEkRygs", rating: 1450, wins: 160 },
]

setInterval(() => {
    for (const key of loginHandler.keys()) {
        const obj = loginHandler.get(key);
        if (obj && Date.now()-obj.createdAt >= 30000) {
            loginHandler.delete(key);
        }
    }
}, 10000)

app.use(express.json());
app.use(express.static('public')); 


const wss = new WebSocketServer({ server }, () => {
});

wss.on('connection', function connection(socket) {
    gameManager.addUser(socket);
    socket.on('error', console.error);

    socket.on("close", () => {
        gameManager.removeUser(socket);
    })
});

app.get("/", (req, res) => {
    res.json({ message: "Hello World" });
})

app.post('/getBalance', jwtVerification, async (req, res) => {

    const { network } = req.body;
    const userPublicKey = (req as any).user.publicKey;
    const user = await prisma.player.findUnique({
        where: { publicKey: userPublicKey }
    })
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        lamports: network === "MAINNET" ? user.mainnetLamports.toString() : user.devnetLamports.toString(),
        skr: user.skr.toString(),
    });
})

app.post("/getGames", jwtVerification, async (req, res) => {
    const publicKey = (req as any).user.publicKey as string;
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
    })

    const payload = games.map(g => ({
        ...g,
        lamports: Number(g.lamports),
        skr: Number(g.skr),
        timer1: Number(g.timer1),
        timer2: Number(g.timer2),
    }));
    res.json({ games: payload });
})

app.post("/deposit", jwtVerification, async (req, res) => {
    const parsed = deposit.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const { signature, network, asset } = parsed.data;
    const userPublicKey = (req as any).user.publicKey;


    try {
        if (asset == "SOL") {
            let verification = await verifySolTransfer(
                network,
                signature,
                userPublicKey
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
                        from: userPublicKey,
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
            let verification = await verifySeekerTransfer(
                signature,
                userPublicKey
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
    catch (error: any) {
    if (error.code === "P2002") {
        return res.status(400).json({ error: "Transaction already processed" });
    }

        console.error(error);
        return res.status(500).json({ error: "Deposit failed" });
    }
});

app.post("/withdraw", jwtVerification, async (req, res) => {
    const parsed = withdraw.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }


    const { amount, asset } = parsed.data;
    const userPublicKey = (req as any).user.publicKey;

    try {
        if (asset == "SOL") {

            try {
                const result = await prisma.player.updateMany({
                    where: {
                        publicKey: userPublicKey,
                        mainnetLamports: {
                            gte: amount
                        }
                    },
                    data: {
                        mainnetLamports: {
                            decrement: amount
                        }
                    }
                })
                if (result.count == 0) throw new Error("Insufficient Funds");
            }
            catch {
                res.status(400).send("Insufficient Funds")
                return;
            }

            let signature  = "";
            try {
                const solTx = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: keyPair.publicKey,
                        toPubkey: new PublicKey(userPublicKey),
                        lamports: amount
                    })
                )

                signature = await sendAndConfirmTransaction(
                    connection,
                    solTx,
                    [keyPair],
                )
            }
            catch {
                const result = await prisma.player.update({
                    where: {
                        publicKey: userPublicKey
                    },
                    data: {
                        mainnetLamports: {
                            increment: amount
                        }
                    }
                })
                res.status(400).send("Insufficient Funds")
                return;
            }

            if (signature == "") throw new Error("Error in transferring");

            res.send({
                amount,
                signature
            })
            return;
        }
        else if (asset == "SKR") {
            
            try {
                const result = await prisma.player.updateMany({
                    where: {
                        publicKey: userPublicKey,
                        skr: {
                            gte: amount
                        }
                    },
                    data: {
                        skr: {
                            decrement: amount
                        }
                    }
                })
                if (result.count == 0) throw new Error("Insufficient Funds");
            }
            catch {
                res.status(400).send("Insufficient Funds")
                return;
            }

            let signature  = "";
            try {

                const feePayerATA = getAssociatedTokenAddressSync(
                    SEEKER_MINT,
                    keyPair.publicKey,
                    false, 
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const recipientATA = getAssociatedTokenAddressSync(
                    SEEKER_MINT,
                    new PublicKey(userPublicKey),
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
                    connection,
                    keyPair,
                    SEEKER_MINT,
                    new PublicKey(userPublicKey)
                );

                const transferInstruction = createTransferInstruction(
                    feePayerATA, 
                    recipientATA, 
                    keyPair.publicKey,
                    amount, // amount
                    [], // multiSigners
                    TOKEN_PROGRAM_ID // programId
                );

                const transferBlockhash = await connection.getLatestBlockhash();

                let transferTransaction = new Transaction({
                    feePayer: keyPair.publicKey,
                    blockhash: transferBlockhash.blockhash,
                    lastValidBlockHeight: transferBlockhash.lastValidBlockHeight
                }).add(transferInstruction);

                signature = await sendAndConfirmTransaction(
                    connection,
                    transferTransaction,
                    [keyPair]
                );

            }
            catch (e) {
                console.log(e)
                const result = await prisma.player.updateMany({
                    where: {
                        publicKey: userPublicKey,
                    },
                    data: {
                        skr: {
                            increment: amount
                        }
                    }
                })
                res.status(400).send("failed")
                return;
            }

            if (signature == "") throw new Error("Error in transferring");

            res.send({
                amount,
                signature
            })
            return;
        }

    } 
    catch (error: any) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Transaction already processed" });
        }
    }
    res.status(400).send("error in transfering")
})

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
            update: {
            },
            create: {
                publicKey,
            }
        })
    }
    catch {
        res.status(400).json({ error: "error occured" })
        return;
    }
    const nonce = `${Math.floor(Math.random() * 10000000000)}`;
    loginHandler.set(publicKey, {
        nonce,
        createdAt: Date.now(),
    });
    res.status(200).json({ nonce: `${message}${nonce}` });
})

app.post("/verifyLogin", async (req, res) => {
    const parsed = verifyLogin.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const { publicKey, signature, nonce } = parsed.data;
    const storedNonce = loginHandler.get(publicKey);
    if (!storedNonce || `${message}${storedNonce.nonce}` !== nonce) {
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

        const token = jwt.sign(
            { publicKey },
            process.env.JWT_SECRET!,
        );
        return res.json({ token });

    } catch (e) {
        return res.status(400).json({ error: "Signature verification failed" });
    }
})

app.post("/deployCustom", jwtVerification, async (req, res) => {
    const parsed = INIT_CUSTOM_GAME_TYPE.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const { payload, type } = parsed.data;
    const { skr, opponentPublicKey } = payload;
    const userPublicKey = (req as any).user.publicKey as string;
    let gameId = null;
    let maxTries = 3;
    let retries = 0

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
                })
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
                })

                return game

            }, {
                isolationLevel: "Serializable",
                maxWait: 10000,
                timeout: 10000,
            })

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
    })
    return;

})

app.post("/stats", jwtVerification, async (req,res) => {
    const userPublicKey = (req as any).user.publicKey;

    const user = await prisma.player.findUnique({
        where: {
            publicKey: userPublicKey
        }
    })

    if (!user) {
        res.status(404).send("user not found");
        return;
    }
    
    let  devnetRank = await prisma.player.count({
        where: {
            devnetRating: {
                gt: user.devnetRating
            }
        }
    })
    let  mainnetRank = await prisma.player.count({
        where: {
            mainnetRating: {
                gt: user.mainnetRating
            }
        }
    })

    const mainnetProfile: PlayerProfile = {
        wallet: user.publicKey,
        rank: mainnetRank == 0 ? 10000 : mainnetRank,
        rating: user.mainnetRating,
        peak: user.peakMainnetRating,
        games: user.mainnetDraw + user.mainnetLoss + user.mainnetWins,
        wins: user.mainnetWins,
        draws: user.mainnetDraw,
        losses: user.mainnetLoss,
        solWon: (Number(user.mainnetSolWon)/LAMPORTS_PER_SOL).toFixed(2).toString(),
        solLost: (Number(user.mainnetSolLost)/LAMPORTS_PER_SOL).toFixed(2).toString(),
        skrUsed: (Number(user.skrUsed)/1_000_000).toFixed(2).toString(),
    }

    const devnetProfile: PlayerProfile = {
        wallet: user.publicKey,
        rank: devnetRank == 0 ? 10000 : devnetRank,
        rating: user.devnetRating,
        peak: user.peakDevnetRating,
        games: user.devnetDraw + user.devnetLoss + user.devnetWins,
        wins: user.devnetWins,
        draws: user.devnetDraw,
        losses: user.devnetLoss,
        solWon: (Number(user.devnetSolWon) / LAMPORTS_PER_SOL).toFixed(2),
        solLost: (Number(user.devnetSolLost) / LAMPORTS_PER_SOL).toFixed(2),
        skrUsed: (Number(user.skrUsed) / 1_000_000).toFixed(2),
    }

    res.send({
        mainnetProfile,
        devnetProfile,
        mainnetLeaderBoard: leaderBoard,
        devnetLeaderBoard: leaderBoard,
    })
})

server.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP + WS Server started on port ${PORT}`);
});
