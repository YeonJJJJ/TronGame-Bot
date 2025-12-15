function arenaToMatrix(arena) {
  const size = arena.gridSize;
  const matrix = [];

  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {

      if (x === y) {
        matrix[y][x] = 10;  
      }
      else if (x === y - 1 || x === y + 1) {
        matrix[y][x] = 5;  
      }
      else {
        matrix[y][x] = 0;   
      }
    }
  }
  return matrix;
}

class FraudBot {
  constructor(name, linkedBike) {
    this.name = name;
    this.linkedBike = linkedBike;
  }

  getMove(arena) {
    const x = this.linkedBike.x;
    const y = this.linkedBike.y;

    const legalMoves = arena.getLegalMoves(x, y, false);

    if (!legalMoves || legalMoves.length === 0) {
      return [x, y];
    }

    const matrix = arenaToMatrix(arena);

    for (const move of legalMoves) {
      if (matrix[move.yMove][move.xMove] === 10) {
        return [move.xMove, move.yMove];
      }
    }

    let bestScore = -Infinity;
    let bestMove = null;

    for (const move of legalMoves) {
      const available = arena.getAvailableTilesNumber(move.xMove, move.yMove);

      if (available > bestScore) {
        bestScore = available;
        bestMove = move; 
      }
    }

    if (!bestMove) {
      const fallback = legalMoves[0];
      return [fallback.xMove, fallback.yMove];
    }

    return [bestMove.xMove, bestMove.yMove];

  }
}