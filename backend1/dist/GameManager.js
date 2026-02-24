import { INIT_GAME, MESSAGE, MOVE, INSUFFICIENT_FUNDS } from "./Messages.js";
import { Game } from "./Game.js";
import { INIT_GAME_TYPE, MESSAGE_TYPE, MOVE_TYPE } from "./types/type.js";
import { prisma } from "./lib/prisma.js";
import jwt from "jsonwebtoken";
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
        setInterval(() => this.garbageGamesCollectorAndPaymentSettler(), 20 * 1000);
    }
    addUser(socket) {
        if (!this.users.includes(socket)) {
            this.users.push(socket);
        }
        this.addHandler(socket);
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
                    const { network, sol, jwt } = payload;
                    let publicKey;
                    try {
                        publicKey = this.jwtVerification(jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
                    // check if user is eligible
                    const eligible = await this.isEligible(publicKey, sol, network);
                    if (!eligible)
                        throw new Error("Insufficient balance");
                    const pendingUser = this.pendingUsers.get(`${network}-${sol}`);
                    if (pendingUser) {
                        this.pendingUsers.set(`${network}-${sol}`, null);
                        await this.addGame(pendingUser.socket, socket, pendingUser.publicKey, publicKey, network, sol);
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
                    let publicKey;
                    try {
                        publicKey = this.jwtVerification(payload.jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
                    this.games.get(this.getGameKey(payload.network, payload.sol))?.get(payload.gameId)?.makeMove(socket, { from: payload.from, to: payload.to }, promotion);
                }
                if (message.type == MESSAGE) {
                    const result = MESSAGE_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    let publicKey;
                    try {
                        publicKey = this.jwtVerification(payload.jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
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
        let insufficientBalanceError = null;
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
                            ...(network === "MAINNET" ? { mainnetLamports: { gte: stake } } : { devnetLamports: { gte: stake } })
                        },
                        data: {
                            ...(network === "MAINNET" ? { mainnetLamports: { decrement: stake } } : { devnetLamports: { decrement: stake } })
                        }
                    });
                    if (result1.count == 0) {
                        throw new Error("insufficient_balance_player1");
                    }
                    const result2 = await tx.player.updateMany({
                        where: {
                            publicKey: player2PublicKey,
                            ...(network === "MAINNET" ? { mainnetLamports: { gte: stake } } : { devnetLamports: { gte: stake } })
                        },
                        data: {
                            ...(network === "MAINNET" ? { mainnetLamports: { decrement: stake } } : { devnetLamports: { decrement: stake } })
                        }
                    });
                    if (result2.count == 0) {
                        throw new Error("insufficient_balance_player2");
                    }
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
                if (err instanceof Error && (err.message == "insufficient_balance_player2" || err.message == "insufficient_balance_player1")) {
                    insufficientBalanceError = (err.message == "insufficient_balance_player2" ? "player2" : "player1");
                    if (insufficientBalanceError == "player1") {
                        player1.send(JSON.stringify({ type: INSUFFICIENT_FUNDS, payload: {} }));
                    }
                    else {
                        player2.send(JSON.stringify({ type: INSUFFICIENT_FUNDS, payload: {} }));
                    }
                    break;
                }
                retries++;
            }
        }
        if (insufficientBalanceError == "player1") {
            this.pendingUsers.set(this.getGameKey(network, sol), { socket: player2, publicKey: player2PublicKey });
        }
        if (!gameId) {
            return;
        }
        this.games.get(this.getGameKey(network, sol))?.set(gameId, new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, gameId));
    }
    getGameKey(network, sol) {
        return `${network}-${sol}`;
    }
    async isEligible(publicKey, sol, network) {
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
                mainnetLamports: true,
                devnetLamports: true
            }
        });
        if (!result)
            return false;
        return network === "MAINNET" ? result.mainnetLamports >= stake : result.devnetLamports >= stake;
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
    async garbageGamesCollectorAndPaymentSettler() {
        for (const gamesMap of this.games.values()) {
            for (const game of gamesMap.values()) {
                const ended = await game.updateTimerAndCheckTimeout();
                if (ended) {
                    gamesMap.delete(game.gameId);
                }
            }
        }
    }
    jwtVerification(token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {
            publicKey: decoded.publicKey
        };
    }
}
