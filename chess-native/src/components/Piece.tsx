import React from "react";
import { View } from "react-native";
import { Piece as PieceType } from "chess.js";

import { BK } from "./pieces/bK";
import { BQ } from "./pieces/bQ";
import { BR } from "./pieces/bR";
import { BB } from "./pieces/bB";
import { BN } from "./pieces/bN";
import { BP } from "./pieces/bP";

import { WK } from "./pieces/wK";
import { WQ } from "./pieces/wQ";
import { WR } from "./pieces/wR";
import { WB } from "./pieces/wB";
import { WN } from "./pieces/wN";
import { WP } from "./pieces/wP";

interface PieceIconProps {
  piece: PieceType;
  width: number;
  color: "w" | "b"; // player perspective
  rotation?: string
}

const pieceMap = {
  wk: WK,
  wq: WQ,
  wr: WR,
  wb: WB,
  wn: WN,
  wp: WP,
  bk: BK,
  bq: BQ,
  br: BR,
  bb: BB,
  bn: BN,
  bp: BP,
};

export function Piece({ piece, width, color, rotation }: PieceIconProps) {
  const key = `${piece.color}${piece.type}` as keyof typeof pieceMap;
  const Component = pieceMap[key];

  if (!Component) return null;

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        transform: [{ rotate: rotation ? rotation : (color === "b" ? "180deg" : "0deg") }],
      }}
    >
      <Component width={width} height={width} />
    </View>
  );
}
