import {create} from "zustand";
// import {Chess} from "chess.js"

// interface Connection {
//     socket: WebSocket | null;
//     setSocket: (socket: WebSocket)=>void,
//     removeSocket: () => void
// }
// export const socketConnection = create<Connection>((set) => ({
//     socket: null,
//     setSocket: (socket: WebSocket) => set(() => ({socket})),
//     removeSocket: () => set(() => ({socket: null}))
// }));

// interface Game {
//     chess: Chess | null;
//     color: "black" | "white" | null;
//     sol: number;
//     setSol: (sol: number) => void;
//     setColor: (color: "black" | "white" | null) => void;
//     setChess: (chess: Chess) => void;
//     removeChess: () => void;
// }
// export const gameState = create<Game>((set) => ({
//     chess: null,
//     sol: 0,
//     setSol: (sol: number) => set({sol}),
//     color: null,
//     setColor: (color: "black" | "white" | null) => set({color}),
//     setChess: (chess: Chess) => set({chess}),
//     removeChess: () => set({chess: null})
// }))

interface Sol {
    sol: number,
    setSol: (sol: number) => void,
}
export const GameBet= create<Sol>((set) => ({
    sol: 0,
    setSol: (sol: number) => set({sol})
}))