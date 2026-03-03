import { Chess, Move } from "chess.js"

const pieceValues: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}

/**
 * Positive score  -> Advantage White
 * Negative score  -> Advantage Black
 */
function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    // If it's checkmate and it's White's turn,
    // that means Black delivered mate → bad for White
    return game.turn() === "w" ? -99999 : 99999
  }

  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
    return 0
  }

  let total = 0
  const board = game.board()

  for (let row of board) {
    for (let square of row) {
      if (square) {
        const value = pieceValues[square.type]
        total += square.color === "w" ? value : -value
      }
    }
  }

  return total
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {

  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game)
  }

  const moves = game.moves({ verbose: true })

  if (isMaximizing) {
    let maxEval = -Infinity

    for (let move of moves) {
      game.move(move)
      const evalScore = minimax(game, depth - 1, alpha, beta, false)
      game.undo()

      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)

      if (beta <= alpha) break
    }

    return maxEval
  } else {
    let minEval = Infinity

    for (let move of moves) {
      game.move(move)
      const evalScore = minimax(game, depth - 1, alpha, beta, true)
      game.undo()

      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)

      if (beta <= alpha) break
    }

    return minEval
  }
}

export function getBestMove(game: Chess, depth = 2): Move | null {
  const moves = game.moves({ verbose: true })

  if (moves.length === 0) return null

  const isMaximizing = game.turn() === "w"

  let bestMove: Move | null = null
  let bestValue = isMaximizing ? -Infinity : Infinity

  for (let move of moves) {
    game.move(move)

    const value = minimax(
      game,
      depth - 1,
      -Infinity,
      Infinity,
      !isMaximizing
    )

    game.undo()

    if (isMaximizing) {
      if (value > bestValue) {
        bestValue = value
        bestMove = move
      }
    } else {
      if (value < bestValue) {
        bestValue = value
        bestMove = move
      }
    }
  }

  return bestMove
}