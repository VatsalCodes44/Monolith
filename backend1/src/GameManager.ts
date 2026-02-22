import { WebSocket } from "ws";
import { INIT_GAME, RE_JOIN_GAME, MESSAGE, MOVE } from "./Messages.js";
import { Game } from "./Game.js";
import { INIT_GAME_TYPE, Message, MESSAGE_TYPE, MOVE_TYPE } from "./types/type.js";
import { prisma } from "./lib/prisma.js"
import bs58 from "bs58";
import nacl from "tweetnacl";

export class GameManager {
    private _0_01SolGame: Game[];
    private _0_05SolGame: Game[];
    private _0_1SolGame: Game[];
    private _0_01SolDevnetGame: Game[];
    private _0_05SolDevnetGame: Game[];
    private _0_1SolDevnetGame: Game[];

    private pendingUser0_01Sol: { socket: WebSocket, publicKey: string } | null;
    private pendingUser0_05Sol: { socket: WebSocket, publicKey: string } | null;
    private pendingUser0_1Sol: { socket: WebSocket, publicKey: string } | null;
    private pendingUser0_01SolDevnet: { socket: WebSocket, publicKey: string } | null;
    private pendingUser0_05SolDevnet: { socket: WebSocket, publicKey: string } | null;
    private pendingUser0_1SolDevnet: { socket: WebSocket, publicKey: string } | null;

    private users: WebSocket[];

    constructor() {
        this._0_01SolGame = []
        this._0_05SolGame = []
        this._0_1SolGame = []
        this._0_01SolDevnetGame = []
        this._0_05SolDevnetGame = []
        this._0_1SolDevnetGame = []
        this.pendingUser0_01Sol = null;
        this.pendingUser0_05Sol = null;
        this.pendingUser0_1Sol = null;
        this.pendingUser0_01SolDevnet = null;
        this.pendingUser0_05SolDevnet = null;
        this.pendingUser0_1SolDevnet = null;
        this.users = [];
    }

    addUser(socket: WebSocket) {
        if (!this.users.includes(socket)) {
            this.users.push(socket);
        }
        this.addHandler(socket)
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(s => s !== socket);
        let foundedSocket = false;

        if (this.pendingUser0_01Sol?.socket == socket) {
            this.pendingUser0_01Sol = null;
            foundedSocket = true;
            return;
        }

        if (this.pendingUser0_05Sol?.socket == socket) {
            this.pendingUser0_05Sol = null;
            foundedSocket = true;
            return;
        }

        if (this.pendingUser0_1Sol?.socket == socket) {
            this.pendingUser0_1Sol = null;
            foundedSocket = true;
            return;
        }

        if (this.pendingUser0_01SolDevnet?.socket == socket) {
            this.pendingUser0_01SolDevnet = null;
            foundedSocket = true;
            return;
        }

        if (this.pendingUser0_05SolDevnet?.socket == socket) {
            this.pendingUser0_05SolDevnet = null;
            foundedSocket = true;
            return;
        }

        if (this.pendingUser0_1SolDevnet?.socket == socket) {
            this.pendingUser0_1SolDevnet = null;
            foundedSocket = true;
            return;
        }

        this._0_01SolDevnetGame = this._0_01SolDevnetGame.filter(g => {
            if (g.player1 !== socket && g.player2 !== socket) {
                return true;
            }
            else {
                foundedSocket = true;
                return false;
            }
        });
        if (foundedSocket) return;

        this._0_05SolDevnetGame = this._0_05SolDevnetGame.filter(g => {
            if (g.player1 !== socket && g.player2 !== socket) {
                return true;
            }
            else {
                foundedSocket = true;
                return false;
            }
        });
        if (foundedSocket) return;

        this._0_1SolDevnetGame = this._0_1SolDevnetGame.filter(g => {
            if (g.player1 !== socket && g.player2 !== socket) {
                return true;
            }
            else {
                foundedSocket = true;
                return false;
            }
        });
        if (foundedSocket) return;

        this._0_01SolGame = this._0_01SolGame.filter(g => {
            if (g.player1 !== socket && g.player2 !== socket) {
                return true;
            }
            else {
                foundedSocket = true;
                return false;
            }
        });
        if (foundedSocket) return;

        this._0_05SolGame = this._0_05SolGame.filter(g => {
            if (g.player1 !== socket && g.player2 !== socket) {
                return true;
            }
            else {
                foundedSocket = true;
                return false;
            }
        });
        if (foundedSocket) return;

        this._0_1SolGame = this._0_1SolGame.filter(g => {
            if (g.player1 !== socket && g.player2 !== socket) {
                return true;
            }
            else {
                foundedSocket = true;
                return false;
            }
        });
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());
            console.log(message)

            if (message.type === INIT_GAME) {
                const result = INIT_GAME_TYPE.safeParse(message);
                if (!result.success) {
                    return;
                }
                const { payload } = result.data;
                const { network, sol, publicKey } = payload;
                const pendingUser = this.pendingUserExist(network, sol);
                const verify = this.verifySignature(publicKey, payload.signature, publicKey);
                if (!verify) return;
                if (pendingUser) {
                    await this.addGame(pendingUser.socket, socket, pendingUser.publicKey, publicKey, network, sol);
                }
                else {
                    this.addPendingUser(network, sol, socket, publicKey);
                }
            }

            if (message.type == MOVE) {
                const result = MOVE_TYPE.safeParse(message);
                if (!result.success) {
                    return;
                }
                const { payload, promotion } = result.data;
                this.makeMove(socket, payload.gameId, payload.from, payload.to, payload.network, payload.sol, promotion);
            }

            if (message.type == MESSAGE) {
                const result = MESSAGE_TYPE.safeParse(message);
                if (!result.success) {
                    return;
                }
                const { payload } = result.data;
                this.sendMessage(socket, payload.gameId, { message: payload.message, from: payload.from }, payload.network, payload.sol)
            }
        })
    }

    private pendingUserExist(network: "MAINNET" | "DEVNET", sol: "0.01" | "0.05" | "0.1") {
        if (network === "MAINNET") {
            if (sol === "0.01" && this.pendingUser0_01Sol) {
                return this.pendingUser0_01Sol;
            }
            else if (sol === "0.05" && this.pendingUser0_05Sol) {
                return this.pendingUser0_05Sol;
            }
            else if (sol === "0.1" && this.pendingUser0_1Sol) {
                return this.pendingUser0_1Sol;
            }
        }
        else {
            if (sol === "0.01" && this.pendingUser0_01SolDevnet) {
                return this.pendingUser0_01SolDevnet;
            }
            else if (sol === "0.05" && this.pendingUser0_05SolDevnet) {
                return this.pendingUser0_05SolDevnet;
            }
            else if (sol === "0.1" && this.pendingUser0_1SolDevnet) {
                return this.pendingUser0_1SolDevnet;
            }
        }
        return undefined;
    }

    private addPendingUser(network: "MAINNET" | "DEVNET", sol: "0.01" | "0.05" | "0.1", socket: WebSocket, publicKey: string) {
        if (network === "MAINNET") {
            if (sol === "0.01") {
                this.pendingUser0_01Sol = { socket, publicKey };
            }
            else if (sol === "0.05") {
                this.pendingUser0_05Sol = { socket, publicKey };
            }
            else {
                this.pendingUser0_1Sol = { socket, publicKey };
            }
        }
        else {
            if (sol === "0.01") {
                this.pendingUser0_01SolDevnet = { socket, publicKey };
            }
            else if (sol === "0.05") {
                this.pendingUser0_05SolDevnet = { socket, publicKey };
            }
            else {
                this.pendingUser0_1SolDevnet = { socket, publicKey };
            }
        }
    }

    private async addGame(player1: WebSocket, player2: WebSocket, player1PublicKey: string, player2PublicKey: string, network: "MAINNET" | "DEVNET", sol: "0.01" | "0.05" | "0.1") {
        const game = await prisma.game.create({
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
        })
        if (network === "MAINNET") {
            if (sol === "0.01") {
                this._0_01SolGame.push(new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, game.id));
            }
            else if (sol === "0.05") {
                this._0_05SolGame.push(new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, game.id));
            }
            else {
                this._0_1SolGame.push(new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, game.id));
            }
        }
        else {
            if (sol === "0.01") {
                this._0_01SolDevnetGame.push(new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, game.id));
            }
            else if (sol === "0.05") {
                this._0_05SolDevnetGame.push(new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, game.id));
            }
            else {
                this._0_1SolDevnetGame.push(new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, game.id));
            }
        }
    }

    private makeMove(socket: WebSocket, gameId: string, from: string, to: string, network: "MAINNET" | "DEVNET", sol: "0.01" | "0.05" | "0.1", promotion: string | undefined) {
        if (network === "MAINNET") {
            if (sol === "0.01") {
                this._0_01SolGame.find(g => g.gameId === gameId)?.makeMove(socket, { from, to }, promotion);
            }
            else if (sol === "0.05") {
                this._0_05SolGame.find(g => g.gameId === gameId)?.makeMove(socket, { from, to }, promotion);
            }
            else {
                this._0_1SolGame.find(g => g.gameId === gameId)?.makeMove(socket, { from, to }, promotion);
            }
        }
        else {
            if (sol === "0.01") {
                this._0_01SolDevnetGame.find(g => g.gameId === gameId)?.makeMove(socket, { from, to }, promotion);
            }
            else if (sol === "0.05") {
                this._0_05SolDevnetGame.find(g => g.gameId === gameId)?.makeMove(socket, { from, to }, promotion);
            }
            else {
                this._0_1SolDevnetGame.find(g => g.gameId === gameId)?.makeMove(socket, { from, to }, promotion);
            }
        }
    }

    private sendMessage(socket: WebSocket, gameId: string, message: Message, network: "MAINNET" | "DEVNET", sol: "0.01" | "0.05" | "0.1") {
        if (network === "MAINNET") {
            if (sol === "0.01") {
                this._0_01SolGame.find(g => g.gameId === gameId)?.addMessage(socket, message);
            }
            else if (sol === "0.05") {
                this._0_05SolGame.find(g => g.gameId === gameId)?.addMessage(socket, message);
            }
            else {
                this._0_1SolGame.find(g => g.gameId === gameId)?.addMessage(socket, message);
            }
        }
        else {
            if (sol === "0.01") {
                this._0_01SolDevnetGame.find(g => g.gameId === gameId)?.addMessage(socket, message);
            }
            else if (sol === "0.05") {
                this._0_05SolDevnetGame.find(g => g.gameId === gameId)?.addMessage(socket, message);
            }
            else {
                this._0_1SolDevnetGame.find(g => g.gameId === gameId)?.addMessage(socket, message);
            }
        }
    }

    private verifySignature(
        publicKey: string,
        signature: string,
        message: string
    ) {
        const messageBytes = new TextEncoder().encode(message);

        // ✅ Public key is base58 (correct)
        const publicKeyBytes = bs58.decode(publicKey);

        // ✅ Signature is base64 (correct for Solana signMessages)
        const signatureBytes = Buffer.from(signature, "base64");

        return nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );
    }
}

