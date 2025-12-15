class FraudBot {
  constructor(name, linkedBike) {
    this.name = name;
    this.linkedBike = linkedBike;
    this.diagDir = null; 
  }

  createAdaptiveDiagonalMatrix(arena) {
    const size = arena.gridSize;
    const { x, y } = this.linkedBike;

    if (!this.diagDir) {
      this.diagDir =
        x <= size / 2 && y <= size / 2 ? "DOWN_RIGHT" : "UP_LEFT";
    }

    const mat = [];

    for (let j = 0; j < size; j++) {
      mat[j] = [];
      for (let i = 0; i < size; i++) {
        let diag = false;
        let nearDiag = false;

        if (this.diagDir === "DOWN_RIGHT") {
          diag = i === j;
          nearDiag = i === j - 1 || i === j + 1;
        } else {
          diag = i + j === size - 1;
          nearDiag = i + j === size - 2 || i + j === size;
        }

        const tile = arena.grid[i * size + j];
        const occupied = tile.content === "Wall" || tile.content === "Player";

        if (diag) mat[j][i] = occupied ? 20 : 80;
        else if (nearDiag) mat[j][i] = occupied ? 10 : 30;
        else mat[j][i] = 0;
      }
    }

    return mat;
  }

  createDefensiveMatrix(arena, enemy) {
    const size = arena.gridSize;
    const self = this.linkedBike;
    const mat = [];

    for (let y = 0; y < size; y++) {
      mat[y] = [];
      for (let x = 0; x < size; x++) {
        const dEnemy = Math.abs(x - enemy.x) + Math.abs(y - enemy.y);
        const dSelf = Math.abs(x - self.x) + Math.abs(y - self.y);

        mat[y][x] = Math.max(0, size - dEnemy - dSelf / 2);
      }
    }

    return mat;
  }

  getMove(arena, game) {
    const x = this.linkedBike.x;
    const y = this.linkedBike.y;
    const enemy = game.getOtherPlayer().linkedBike;

    const moves = arena.getLegalMoves(x, y, true);
    const safeMoves = moves.filter(m => !m.collision);

    if (safeMoves.length === 0) return [x, y];

    const diagMat = this.createAdaptiveDiagonalMatrix(arena);
    const defMat = this.createDefensiveMatrix(arena, enemy);

    let bestScore = -Infinity;
    let bestMove = null;

    for (const m of safeMoves) {
      const spaceScore = arena.getAvailableTilesNumber(m.xMove, m.yMove);
      const diagScore = diagMat[m.yMove]?.[m.xMove] || 0;
      const defScore = defMat[m.yMove]?.[m.xMove] || 0;

      const totalScore = spaceScore + diagScore + defScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMove = m;
      }
    }

    return [bestMove.xMove, bestMove.yMove];
  }
}