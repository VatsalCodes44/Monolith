import { WebSocket } from "ws";
interface Message {
    from: "w" | "b";
    message: string;
}
export declare class Game {
    player1: WebSocket;
    player2: WebSocket;
    private board;
    private startTime;
    private timer1;
    private timer2;
    private lastMoveTimestamp;
    private messages;
    constructor(player1: WebSocket, player2: WebSocket);
    addMessage(socket: WebSocket, message: Message): void;
    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }, promotion: string | undefined): void;
}
export {};
//# sourceMappingURL=Game.d.ts.map