import { WebSocket } from "ws";
import { INIT_GAME, RE_JOIN_GAME, MESSAGE, MOVE, INSUFFICIENT_FUNDS, INIT_CUSTOM_GAME, RE_JOIN_CUSTOM_GAME, MOVE_CUSTOM, MESSAGE_CUSTOM, CUSTOM_CREATED, JOIN_CUSTOM_GAME, CUSTOM_NOT_FOUND, CANNOT_JOIN_CUSTOM, ENTERED_ARENA, SPECTATE, ENTERED_SPECTATE, INVALID_GAMEID } from "./Messages.js";
import { Game } from "./Game.js";
import { INIT_GAME_TYPE, JOIN_CUSTOM_GAME_TYPE, Message, MESSAGE_CUSTOM_TYPE, MESSAGE_TYPE, MOVE_CUSTOM_TYPE, MOVE_TYPE, Re_JOIN_CUSTOM_GAME_TYPE, Re_JOIN_GAME_TYPE, SEPCTATE_GAME } from "./types/type.js";
import { prisma } from "./lib/prisma.js"
import jwt from "jsonwebtoken"
import { CustomGame } from "./CustomGame.js";

export class GameManager {

    private users: WebSocket[];

    private games: Map<string, Map<string, Game>>;
    private pendingUsers: Map<string, { socket: WebSocket, publicKey: string } | null>;
    private customGames: Map<string, CustomGame>;

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

        this.customGames = new Map();

        this.users = [];

        setInterval(() => this.garbageGamesCollectorAndPaymentSettler(), 20 * 1000);
    }

    addUser(socket: WebSocket) {
        if (!this.users.includes(socket)) {
            this.users.push(socket);
        }
        this.addHandler(socket)
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", async (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log(message)

                // only custom games can be spectated
                if (message.type == SPECTATE) {
                    const result = SEPCTATE_GAME.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const {gameId} = result.data.payload;
                    const game = this.customGames.get(gameId);
                    if (!game) {
                        socket.send(JSON.stringify({
                            type: INVALID_GAMEID,
                            payload: {}
                        }))
                        return;
                    }
                    game.spectators.push(socket);
                    socket.send(JSON.stringify({
                        type: ENTERED_SPECTATE,
                        payload: {
                           player1Pubkey: game.player1Pubkey,
                           player2Pubkey: game.player2Pubkey,
                           board: game.board.fen(),
                           timer1: game.timer1, 
                           timer2: game.timer2,
                           skr: Number(game.skr),
                           gameStarted: game.started
                        }
                    }))
                    return;
                }

                if (message.type === INIT_GAME) {
                    const result = INIT_GAME_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    const { network, sol, jwt } = payload;

                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }

                    // check if user is eligible
                    const eligible = await this.isEligible(publicKey, sol, network);
                    if (!eligible) throw new Error("Insufficient balance");

                    const pendingUser = this.pendingUsers.get(`${network}-${sol}`);
                    if (pendingUser) {
                        this.pendingUsers.set(`${network}-${sol}`, null);
                        await this.addGame(pendingUser.socket, socket, pendingUser.publicKey, publicKey, network, sol);
                    }
                    else {
                        this.pendingUsers.set(`${network}-${sol}`, { socket, publicKey });
                    }
                    return;
                }

                if (message.type == RE_JOIN_GAME) {
                    const result = Re_JOIN_GAME_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    const { gameId, network, sol, jwt } = payload;

                    // -------------------------------------
                    const key = this.getGameKey(network, sol);
                    console.log("KEY:", key);
                    console.log("ALL KEYS IN MAP:", [...this.games.keys()])
                    console.log("GAMES IN THIS KEY:", [...(this.games.get(key)?.keys() ?? [])])
                    const abc = this.games.get(key)?.get(gameId);
                    console.log("GAME FOUND:", abc)
                    // -------------------------------------
                    
                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
                    const game = this.games.get(this.getGameKey(network, sol))?.get(gameId);
                    if (!game) return;
                    if (game.player1Pubkey == publicKey) {
                        game.player1 = socket;
                        const response = {
                            type: RE_JOIN_GAME,
                            payload: {
                                color: "w",
                                board: game.board.fen(),
                                timer1: game.timer1,
                                timer2: game.timer2,
                                gameId,
                                network,
                                sol,
                                opponentPubkey: game.player2Pubkey,
                            }
                        }
                        game.player1.send(JSON.stringify(response));

                    }
                    else if (game.player2Pubkey == publicKey) {
                        game.player2 = socket;
                        const response = {
                            type: RE_JOIN_GAME,
                            payload: {
                                color: "b",
                                board: game.board.fen(),
                                timer1: game.timer1,
                                timer2: game.timer2,
                                gameId,
                                network,
                                sol,
                                opponentPubkey: game.player1Pubkey,
                            }
                        }
                        game.player2.send(JSON.stringify(response));
                    }
                    return;
                }

                if (message.type == MOVE) {
                    const result = MOVE_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload, promotion } = result.data;
                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(payload.jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
                    this.games.get(this.getGameKey(payload.network, payload.sol))?.get(payload.gameId)?.makeMove(socket, { from: payload.from, to: payload.to }, promotion);
                    return;
                }

                if (message.type == MESSAGE) {
                    const result = MESSAGE_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(payload.jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
                    this.games.get(this.getGameKey(payload.network, payload.sol))?.get(payload.gameId)?.addMessage(socket, { from: payload.from, message: payload.message });
                    return;
                }

                if (message.type === JOIN_CUSTOM_GAME) {
                    console.log(JOIN_CUSTOM_GAME)
                    const result = JOIN_CUSTOM_GAME_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    const { gameId, jwt } = payload;

                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }

                    const fetchGame = await prisma.game.findUnique({
                        where: {
                            id: gameId
                        }
                    })

                    if (!fetchGame) {
                        socket.send(JSON.stringify({
                            type: CUSTOM_NOT_FOUND,
                            payload: {
                                gameId
                            }
                        }))
                        return;
                    }

                    const gameExists = this.customGames.get(gameId);

                    if ( gameExists ) {
                        if (gameExists.started) {
                            console.log("h")
                            if (fetchGame.player1PublicKey == publicKey) {
                                gameExists.player1 = socket;
                                socket.send(JSON.stringify({
                                    type: ENTERED_ARENA,
                                    payload: {
                                        skr: gameExists.skr,
                                        color: "w",
                                        board: gameExists.board.fen(),
                                        timer1: gameExists.timer1,
                                        timer2: gameExists.timer2,
                                        gameId,
                                        opponentPubkey: gameExists.player2Pubkey,
                                        gameStarted: true
                                    }
                                }))
                                return;
                            }
                            else if (fetchGame.player2PublicKey == publicKey) {
                                gameExists.player2 = socket;
                                socket.send(JSON.stringify({
                                    type: ENTERED_ARENA,
                                    payload: {
                                        skr: gameExists.skr,
                                        color: "b",
                                        board: gameExists.board.fen(),
                                        timer1: gameExists.timer1,
                                        timer2: gameExists.timer2,
                                        gameId,
                                        opponentPubkey: gameExists.player1Pubkey,
                                        gameStarted: true
                                    }
                                }))
                                return;
                            }
                        }
                        else {
                            if (fetchGame.player1PublicKey == publicKey) {
                                gameExists.player1 = socket;
                                socket.send(JSON.stringify({
                                    type: ENTERED_ARENA,
                                    payload: {
                                        skr: gameExists.skr,
                                        color: "w",
                                        board: gameExists.board.fen(),
                                        timer1: gameExists.timer1,
                                        timer2: gameExists.timer2,
                                        gameId,
                                        opponentPubkey: gameExists.player2Pubkey,
                                    }
                                }))
                                gameExists.startGame()
                                return;
                            }
                            else if (fetchGame.player2PublicKey == publicKey) {
                                const result = await this.deductSkr(publicKey, fetchGame.skr)
                                if (result.success) {
                                    gameExists.player2 = socket;
                                    socket.send(JSON.stringify({
                                        type: ENTERED_ARENA,
                                        payload: {
                                            skr: gameExists.skr,
                                            color: "b",
                                            board: gameExists.board.fen(),
                                            timer1: gameExists.timer1,
                                            timer2: gameExists.timer2,
                                            gameId,
                                            opponentPubkey: gameExists.player1Pubkey,
                                        }
                                    }))
                                gameExists.startGame();
                                }
                                else {
                                    socket.send(JSON.stringify({
                                        type: INSUFFICIENT_FUNDS,
                                        payload: {}
                                    }))
                                    return;
                                }
                            }
                        }
                    }
                    else {
                        if (fetchGame.player1PublicKey == publicKey) {
                            const createCustom = this.customGames.set(gameId, new CustomGame(
                                fetchGame.player1PublicKey,
                                fetchGame.player2PublicKey,
                                gameId,
                                Number(fetchGame.skr),
                            ))
                            const newGame = this.customGames.get(gameId);
                            newGame!.player1 = socket;
                            socket.send(JSON.stringify({
                                type: ENTERED_ARENA,
                                payload: {
                                    skr: newGame!.skr,
                                    color: "w",
                                    board: newGame!.board.fen(),
                                    timer1: newGame!.timer1,
                                    timer2: newGame!.timer2,
                                    gameId,
                                    opponentPubkey: newGame!.player2Pubkey,
                                    gameStarted: false
                                }
                            }))
                        }
                        else if (fetchGame.player2PublicKey == publicKey) {
                            const result = await this.deductSkr(publicKey, fetchGame.skr)
                            if (result.success) {
                                const createCustom = this.customGames.set(gameId, new CustomGame(
                                    fetchGame.player1PublicKey,
                                    fetchGame.player2PublicKey,
                                    gameId,
                                    Number(fetchGame.skr),
                                ))
                                const newGame = this.customGames.get(gameId);
                                newGame!.player2 = socket;
                                socket.send(JSON.stringify({
                                    type: ENTERED_ARENA,
                                    payload: {
                                        skr: newGame!.skr,
                                        color: "b",
                                        board: newGame!.board.fen(),
                                        timer1: newGame!.timer1,
                                        timer2: newGame!.timer2,
                                        gameId,
                                        opponentPubkey: newGame!.player2Pubkey,
                                        gameStarted: false
                                    }
                                }))
                            }
                            else {
                                socket.send(JSON.stringify({
                                    type: INSUFFICIENT_FUNDS,
                                    payload: {}
                                }))
                            }
                        }
                    }
                }

                if (message.type == RE_JOIN_CUSTOM_GAME) {
                    const result = Re_JOIN_CUSTOM_GAME_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    const { gameId, jwt } = payload;

                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }

                    const game = this.customGames.get(gameId)
                    if (!game) return;
                    if (game.player1Pubkey == publicKey) {
                        game.player1 = socket;
                        const response = {
                            type: RE_JOIN_CUSTOM_GAME,
                            payload: {
                                color: "w",
                                board: game.board.fen(),
                                timer1: game.timer1,
                                timer2: game.timer2,
                                gameId,
                                skr: game.skr,
                                opponentPubkey: game.player2Pubkey,
                            }
                        }
                        game.player1.send(JSON.stringify(response));

                    }
                    else if (game.player2Pubkey == publicKey) {
                        game.player2 = socket;
                        const response = {
                            type: RE_JOIN_CUSTOM_GAME,
                            payload: {
                                color: "b",
                                board: game.board.fen(),
                                timer1: game.timer1,
                                timer2: game.timer2,
                                gameId,
                                skr: game.skr,
                                opponentPubkey: game.player1Pubkey,
                            }
                        }
                        game.player2.send(JSON.stringify(response));
                    }
                    return;
                }

                if (message.type == MOVE_CUSTOM) {
                    const result = MOVE_CUSTOM_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload, promotion } = result.data;
                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(payload.jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
                    const { from, to, gameId } = payload;
                    this.customGames.get(gameId)?.makeMove(socket, { from: from, to: to }, promotion);
                }

                if (message.type == MESSAGE_CUSTOM) {
                    const result = MESSAGE_CUSTOM_TYPE.safeParse(message);
                    if (!result.success) {
                        return;
                    }
                    const { payload } = result.data;
                    let publicKey: string;
                    try {
                        publicKey = this.jwtVerification(payload.jwt).publicKey;
                    }
                    catch (err) {
                        return;
                    }
                    this.customGames.get(payload.gameId)?.addMessage(socket, { from: payload.from, message: payload.message });
                    return;
                }
            }
            catch (error) {
                console.error("Error handling WebSocket message:", error);
            }
        })
    }

    private async addGame(player1: WebSocket, player2: WebSocket, player1PublicKey: string, player2PublicKey: string, network: "MAINNET" | "DEVNET", sol: "0.01" | "0.05" | "0.1") {
        let gameId = null;
        let maxTries = 3;
        let retries = 0
        let insufficientBalanceError: "player1" | "player2" | null = null;
        while (maxTries > retries) {
            try {
                const tx = await prisma.$transaction(async (tx) => {
                    const stake: bigint =
                        sol === "0.01"
                            ? 10_000_000n
                            : sol === "0.05"
                                ? 50_000_000n
                                : 100_000_000n;

                    const result1 = await tx.player.updateMany({
                        where: {
                            publicKey: player1PublicKey,
                            ...(network === "MAINNET" ? { mainnetLamports: { gte: stake } } : { devnetLamports: { gte: stake } })
                        },
                        data: {
                            ...(network === "MAINNET" ? { mainnetLamports: { decrement: stake } } : { devnetLamports: { decrement: stake } })
                        }
                    })
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
                    })
                    if (result2.count == 0) {
                        throw new Error("insufficient_balance_player2");
                    }

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
        this.games.get(this.getGameKey(network, sol))?.set(gameId, new Game(player1, player2, player1PublicKey, player2PublicKey, network, sol, gameId))
    }

    private async deductSkr(
        publicKey: string,
        skr: bigint
    ): Promise<{
        success: boolean,
        error: string | null
    }> {
        let maxTries = 3;
        let retries = 0
        let success = false;

        while (maxTries > retries) {
            try {
                const result = await prisma.player.updateMany({
                    where: {
                        publicKey,
                        skr: { gte: skr }
                    },
                    data: {
                        skr: { decrement: skr }
                    }
                })

                if (result.count == 0) {
                    throw new Error("insufficient_balance");
                }

                success = true;
                break;
            }
            catch (err) {
                console.error("Database error creating game:", err);
                if (err instanceof Error && (err.message == "insufficient_balance")) {
                    return {
                        success: false,
                        error: "insufficient_balance"
                    };
                }
                retries++;
            }
        }
        return {
            success,
            error: null
        };
    }

    private getGameKey(network: "MAINNET" | "DEVNET", sol: "0.01" | "0.05" | "0.1"): string {
        return `${network}-${sol}`;
    }

    private async isEligible(
        publicKey: string,
        sol: "0.01" | "0.05" | "0.1",
        network: "MAINNET" | "DEVNET"
    ) {
        const stake: bigint =
            sol === "0.01"
                ? 10_000_000n
                : sol === "0.05"
                    ? 50_000_000n
                    : 100_000_000n;

        const result = await prisma.player.findUnique({
            where: {
                publicKey,
            },
            select: {
                mainnetLamports: true,
                devnetLamports: true
            }
        })

        if (!result) return false;
        return network === "MAINNET" ? result.mainnetLamports >= stake : result.devnetLamports >= stake;
    }

    private async isCustomGameEligible(
        publicKey: string,
        skr: number
    ) {

        const result = await prisma.player.findUnique({
            where: {
                publicKey,
            },
            select: {
                skr: true
            }
        })

        if (!result) return false;
        return result.skr >= skr;
    }

    public removeUser(socket: WebSocket) {
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
        for (const game of this.customGames.values()) {
            if (game.player1 === socket || game.player2 === socket) {
                game.handleDisconnect(socket);
                return;
            }
        }
    }

    private async garbageGamesCollectorAndPaymentSettler() {
        for (const gamesMap of this.games.values()) {
            for (const game of gamesMap.values()) {
                const ended = await game.updateTimerAndCheckTimeout();
                if (ended) {
                    gamesMap.delete(game.gameId);
                }
            }
        }
        for (const game of this.customGames.values()) {
            const ended = await game.updateTimerAndCheckTimeout();
            if (ended) {
                this.customGames.delete(game.gameId);
            }
        }
    }

    private jwtVerification(token: string) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            publicKey: string
        };
        return {
            publicKey: decoded.publicKey
        }
    }
}

