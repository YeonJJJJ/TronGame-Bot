class FraudBot {
  constructor(name, linkedBike) {
    this.name = name;
    this.linkedBike = linkedBike;
    this.matrix = [];
    this.direction = null; 
  }

  createMatrix(arena) {
    const size = arena.gridSize;
    const { x, y } = this.linkedBike;

    if (!this.direction) {
      this.direction = (x < size / 2 && y < size / 2)
        ? "DOWN_RIGHT"   
        : "UP_LEFT";     
    }

    this.matrix = [];

    for (let j = 0; j < size; j++) {
      this.matrix[j] = [];
      for (let i = 0; i < size; i++) {
        let isDiagonal = false;

        if (this.direction === "DOWN_RIGHT") {
          isDiagonal = (i === j);
        } else {
          isDiagonal = (i + j === size - 1);
        }

        if (isDiagonal) {
          this.matrix[j][i] = 100;
        } else if (
          isDiagonal ||
          (this.direction === "DOWN_RIGHT" && (i === j - 1 || i === j + 1)) ||
          (this.direction === "UP_LEFT" && (i + j === size - 2 || i + j === size))
        ) {
          this.matrix[j][i] = 30;
        } else {
          this.matrix[j][i] = 0;
        }
      }
    }
    return this.matrix;
  }

  getMove(arena, game) {
    const x = this.linkedBike.x;
    const y = this.linkedBike.y;

    const enemy = game.getOtherPlayer().linkedBike;

    const moves = arena.getLegalMoves(x, y, true);
    const safeMoves = moves.filter(m => !m.collision);

    if (safeMoves.length === 0) {
      return [x, y];
    }

    const matrix = this.createMatrix(arena);

    let bestScore = -Infinity;
    let bestMove = null;

    for (const move of safeMoves) {
      const spaceScore = arena.getAvailableTilesNumber(
        move.xMove,
        move.yMove
      );

      const matrixScore =
        matrix[move.yMove]?.[move.xMove] || 0;

      const totalScore = spaceScore + matrixScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMove = move;
      }
    }

    return [bestMove.xMove, bestMove.yMove];
  }
}
