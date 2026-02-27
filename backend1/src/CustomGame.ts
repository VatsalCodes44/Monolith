import { WebSocket } from "ws";
import { INIT_GAME } from "./Messages.js";
import { prisma } from "./lib/prisma.js"
import { Game } from "./Game.js";

export class CustomGame extends Game {
    public skr: number;
    public started = false;
    constructor(
        player1Pubkey: string,
        player2Pubkey: string,
        gameId: string,
        skr: number
    ) {
        // sol variable of parent class is of no use in the custom game as the currency will be skr
        // similarly network variable is of no use
        super(null, null, player1Pubkey, player2Pubkey, "MAINNET", "0.01", gameId, true);
        this.skr = skr;
    }

    protected async settlePaymentAndGameEnd(gameOverType: "CHECKMATE" | "STALEMATE" | "DRAW" | "TIME_OUT", winner: "w" | "b" | null, gameId: string) {
        const maxTries = 3;
        let retries = 0;
        while (retries < maxTries) {
            try {
                if (gameOverType != "DRAW" && winner != null && gameOverType != "STALEMATE") {
                    await prisma.$transaction(async (tx) => {

                        const result = await tx.game.updateMany({
                            where: {
                                id: gameId,
                                status: "IN_PROGRESS",
                                customGame: true
                            },
                            data: {
                                status: gameOverType,
                                fen: this.board.fen(),
                                timer1: this.timer1,
                                timer2: this.timer2,
                                winner,
                                history: JSON.stringify(this.board.history({ verbose: true })),
                            }
                        })

                        if (result.count == 0) {
                            throw new Error("Game not found or already settled");
                        }

                        const totalStake = this.skr * 2;

                        if (winner == "w") {
                            await tx.player.update({
                                where: {
                                    publicKey: this.player1Pubkey
                                },
                                data: {
                                    skr: {
                                        increment: totalStake
                                    }
                                }
                            })
                        }
                        else {

                            await tx.player.update({
                                where: {
                                    publicKey: this.player2Pubkey
                                },
                                data: {
                                    skr: {
                                        increment: totalStake
                                    }
                                }
                            })
                        }

                    }, {
                        maxWait: 10000,
                        timeout: 10000,
                        isolationLevel: "Serializable"
                    });

                    break;
                }
                else {
                    await prisma.$transaction(async (tx) => {
                        const result = await tx.game.updateMany({
                            where: {
                                id: gameId,
                                status: "IN_PROGRESS",
                                customGame: true
                            },
                            data: {
                                status: gameOverType,
                                fen: this.board.fen(),
                                timer1: this.timer1,
                                timer2: this.timer2,
                                winner,
                                history: JSON.stringify(this.board.history({ verbose: true })),
                            }
                        })

                        if (result.count == 0) {
                            throw new Error("Game not found or already settled");
                        }

                        await tx.player.update({
                            where: {
                                publicKey: this.player1Pubkey
                            },
                            data: {
                                skr: {
                                    increment: this.skr
                                }
                            }
                        })

                        await tx.player.update({
                            where: {
                                publicKey: this.player2Pubkey
                            },
                            data: {
                                skr: {
                                    increment: this.skr
                                }
                            }
                        })
                    }, {
                        maxWait: 10000,
                        timeout: 10000,
                        isolationLevel: "Serializable"
                    })
                }

                break;
            }
            catch (err) {
                console.log(err);
                retries++;
            }
        }

        if (maxTries == retries) throw new Error("Failed to settle game after multiple retries");
    }

    // In the normal game the game only starts when both players have joined the game
    // But in the custom game the game starts as soon as the first player joins the game
    // and the timer starts from that moment, to avoid this we will call the start game when 
    // the second player joins the game.
    public startGame() {
        if (this.started) return;
        if (this.player1 == null || this.player2 == null) return;
        this.started = true;
        this.timer1 = 10 * 60 * 1000;
        this.timer2 = 10 * 60 * 1000;
        this.lastMoveTimestamp = Date.now();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "w",
                board: this.board.fen(),
                timer1: this.timer1,
                timer2: this.timer2,
                gameId: this.gameId,
                skr: this.skr,
                opponentPubkey: this.player2Pubkey
            }
        }));

        this.player2?.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "b",
                board: this.board.fen(),
                timer1: this.timer1,
                timer2: this.timer2,
                gameId: this.gameId,
                skr: this.skr,
                opponentPubkey: this.player1Pubkey,
            }
        }));
    }
}