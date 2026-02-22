import { WebSocket } from "ws";
import { INIT_GAME, RE_JOIN_GAME, MESSAGE, MOVE } from "./Messages.js";
import { Game } from "./Game.js";
import { INIT_GAME_TYPE, Message, MESSAGE_TYPE, MOVE_TYPE } from "./types/type.js";
import { prisma } from "./lib/prisma.js"
import bs58 from "bs58";
import nacl from "tweetnacl";

export class GameManager {

    private users: WebSocket[];

    private games: Map<string, Map<string, Game>>;
    private pendingUsers: Map<string, { socket: WebSocket, publicKey: string } | null>;

    constructor() {
        this.games = new Map([
            ['MAINNET-0.01', new Map<string, Game>()],
            ['MAINNET-0.05', new Map<string, Game>()],
            ['MAINNET-0.1', new Map<string, Game>()],
            ['DEVNET-0.01', new Map<string, Game>()],
            ['DEVNET-0.05', new Map<string, Game>()],
            ['DEVNET-0.1', new Map<string, Game>()]
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

    addUser(socket: WebSocket) {
        if (!this.users.includes(socket)) {
            this.users.push(socket);
        }
        this.addHandler(socket)
    }

    removeUser(socket: WebSocket) {
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
                const pendingUser = this.pendingUsers.get(`${network}-${sol}`);
                const verify = this.verifySignature(publicKey, payload.signature, publicKey);
                if (!verify) return;
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
                if (!verify) return;
                this.games.get(`${payload.network}-${payload.sol}`)?.get(payload.gameId)?.makeMove(socket, { from: payload.from, to: payload.to }, promotion);
            }

            if (message.type == MESSAGE) {
                const result = MESSAGE_TYPE.safeParse(message);
                if (!result.success) {
                    return;
                }
                const { payload } = result.data;
                const verify = this.verifySignature(payload.publicKey, payload.signature, payload.publicKey);
                if (!verify) return;
                this.games.get(`${payload.network}-${payload.sol}`)?.get(payload.gameId)?.addMessage(socket, { from: payload.from, message: payload.message });
            }
        })
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
        this.games.get(`${network}-${sol}`)?.set(game.id, new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, game.id))
    }

    private verifySignature(
        publicKey: string,
        signature: string,
        message: string
    ) {
        const messageBytes = new TextEncoder().encode(message);

        const publicKeyBytes = bs58.decode(publicKey);

        const signatureBytes = Buffer.from(signature, "base64");

        return nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );
    }
}

