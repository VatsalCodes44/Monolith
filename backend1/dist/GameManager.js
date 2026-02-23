import { INIT_GAME, MESSAGE, MOVE } from "./Messages.js";
import { Game } from "./Game.js";
import { INIT_GAME_TYPE, MESSAGE_TYPE, MOVE_TYPE } from "./types/type.js";
import { prisma } from "./lib/prisma.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
export class GameManager {
    users;
    games;
    pendingUsers;
    constructor() {
        this.games = new Map([
            ['MAINNET-0.01', new Map()],
            ['MAINNET-0.05', new Map()],
            ['MAINNET-0.1', new Map()],
            ['DEVNET-0.01', new Map()],
            ['DEVNET-0.05', new Map()],
            ['DEVNET-0.1', new Map()]
        ]);
        this.pendingUsers = new Map([
            ['MAINNET-0.01', null],
            ['MAINNET-0.05', null],
            ['MAINNET-0.1', null],
            ['DEVNET-0.01', null],
            ['DEVNET-0.05', null],
            ['DEVNET-0.1', null]
        ]);
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
        for (const [key, pending] of this.pendingUsers) {
            if (pending?.socket === socket) {
                this.pendingUsers.set(key, null);
                return;
            }
        }
        for (const gamesMap of this.games.values()) {
            for (const game of gamesMap.values()) {
                if (game.player1 === socket || game.player2 === socket) {
                    game.handleDisconnect(socket);
                    return;
                }
            }
        }
    }
    addHandler(socket) {
        socket.on("message", async (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log(message);
                if (message.type === INIT_GAME) {
                    const result = INIT_GAME_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    const { network, sol, publicKey } = payload;
                    // check if user is eligible
                    const eligible = await this.isEligible(publicKey, sol);
                    if (!eligible)
                        throw new Error("Insufficient balance");
                    const verify = this.verifySignature(publicKey, payload.signature, publicKey);
                    if (!verify)
                        return;
                    const pendingUser = this.pendingUsers.get(`${network}-${sol}`);
                    if (pendingUser) {
                        await this.addGame(pendingUser.socket, socket, pendingUser.publicKey, publicKey, network, sol);
                        this.pendingUsers.set(`${network}-${sol}`, null);
                    }
                    else {
                        this.pendingUsers.set(`${network}-${sol}`, { socket, publicKey });
                    }
                }
                if (message.type == MOVE) {
                    const result = MOVE_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload, promotion } = result.data;
                    const verify = this.verifySignature(payload.publicKey, payload.signature, payload.publicKey);
                    if (!verify)
                        return;
                    this.games.get(this.getGameKey(payload.network, payload.sol))?.get(payload.gameId)?.makeMove(socket, { from: payload.from, to: payload.to }, promotion);
                }
                if (message.type == MESSAGE) {
                    const result = MESSAGE_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    const verify = this.verifySignature(payload.publicKey, payload.signature, payload.publicKey);
                    if (!verify)
                        return;
                    this.games.get(this.getGameKey(payload.network, payload.sol))?.get(payload.gameId)?.addMessage(socket, { from: payload.from, message: payload.message });
                }
            }
            catch (error) {
                console.error("Error handling WebSocket message:", error);
            }
        });
    }
    async addGame(player1, player2, player1PublicKey, player2PublicKey, network, sol) {
        let gameId = null;
        let maxTries = 3;
        let retries = 0;
        while (maxTries > retries) {
            try {
                const tx = await prisma.$transaction(async (tx) => {
                    const stake = sol === "0.01"
                        ? 10000000n
                        : sol === "0.05"
                            ? 50000000n
                            : 100000000n;
                    const game = await tx.game.create({
                        data: {
                            player1PublicKey,
                            player2PublicKey,
                            network,
                            lamports: sol === "0.01" ? 10000000 : sol === "0.05" ? 50000000 : 100000000,
                            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                            status: "IN_PROGRESS",
                        },
                        select: {
                            id: true
                        }
                    });
                    const result1 = await tx.player.updateMany({
                        where: {
                            publicKey: player1PublicKey,
                            lamports: {
                                gte: stake
                            }
                        },
                        data: {
                            lamports: {
                                decrement: stake
                            }
                        }
                    });
                    if (result1.count == 0)
                        throw new Error("failed to deduct stake from player1");
                    const result2 = await tx.player.updateMany({
                        where: {
                            publicKey: player2PublicKey,
                            lamports: {
                                gte: stake
                            }
                        },
                        data: {
                            lamports: {
                                decrement: stake
                            }
                        }
                    });
                    if (result2.count == 0)
                        throw new Error("failed to deduct stake from player2");
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
                retries++;
            }
        }
        if (!gameId) {
            throw new Error("Failed to create game");
        }
        this.games.get(this.getGameKey(network, sol))?.set(gameId, new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, gameId));
    }
    verifySignature(publicKey, signature, message) {
        const messageBytes = new TextEncoder().encode(message);
        const publicKeyBytes = bs58.decode(publicKey);
        const signatureBytes = Buffer.from(signature, "base64");
        return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    }
    getGameKey(network, sol) {
        return `${network}-${sol}`;
    }
    async isEligible(publicKey, sol) {
        const stake = sol === "0.01"
            ? 10000000n
            : sol === "0.05"
                ? 50000000n
                : 100000000n;
        const result = await prisma.player.findUnique({
            where: {
                publicKey,
            },
            select: {
                lamports: true
            }
        });
        if (!result || result.lamports < stake)
            return false;
        return true;
    }
}
