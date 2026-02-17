import {create} from "zustand";
import {Chess} from "chess.js"

interface Connection {
    socket: WebSocket | null;
    setSocket: (socket: WebSocket)=>void,
    removeSocket: () => void
}
export const socketConnection = create<Connection>((set) => ({
    socket: null,
    setSocket: (socket: WebSocket) => set(() => ({socket})),
    removeSocket: () => set(() => ({socket: null}))
}));

interface Game {
    chess: Chess | null;
    color: "black" | "white" | null;
    setColor: (color: "black" | "white" | null) => void;
    setChess: (chess: Chess) => void;
    removeChess: () => void;
}
export const gameState = create<Game>((set) => ({
    chess: null,
    // chess: new Chess(),
    color: null,
    setColor: (color: "black" | "white" | null) => set({color}),
    setChess: (chess: Chess) => set({chess}),
    removeChess: () => set({chess: null})
}))