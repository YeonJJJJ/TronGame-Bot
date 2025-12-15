class FraudBot {
  constructor(name, linkedBike) {
    this.name = name;
    this.linkedBike = linkedBike;
    this.diagDir = null;
  }

  createAdaptiveMatrix(arena) {
    const size = arena.gridSize;
    const playerX = this.linkedBike.x;
    const playerY = this.linkedBike.y;

    if (!this.diagDir) {
      if (playerX < size / 2 && playerY < size / 2) this.diagDir = "DOWN_RIGHT";
      else if (playerX >= size / 2 && playerY >= size / 2) this.diagDir = "UP_LEFT";
    }

    const matrix = [];

    for (let y = 0; y < size; y++) {
      matrix[y] = [];
      for (let x = 0; x < size; x++) {
        let isDiagonal = false;
        let isNearDiagonal = false;

        switch (this.diagDir) {
          case "DOWN_RIGHT":
            isDiagonal = x === y;
            isNearDiagonal = x === y - 1 || x === y + 1;
            break;
          case "UP_LEFT":
            isDiagonal = x + y === size - 1;
            isNearDiagonal = x + y === size - 2 || x + y === size;
            break;
        }

        matrix[y][x] = isDiagonal ? 80 : isNearDiagonal ? 30 : 10;
      }
    }

    return matrix;
  }

  createDefensiveMatrix(arena, enemy) {
    const size = arena.gridSize;
    const player = this.linkedBike;
    const matrix = [];

    for (let y = 0; y < size; y++) {
      matrix[y] = [];
      for (let x = 0; x < size; x++) {
        const distanceToEnemy = Math.abs(x - enemy.x) + Math.abs(y - enemy.y);
        const distanceToSelf = Math.abs(x - player.x) + Math.abs(y - player.y);
        matrix[y][x] = Math.max(0, size - distanceToEnemy - distanceToSelf / 2);
      }
    }
    return matrix;
  }

  cloneArena(arena) {
    return {
      gridSize: arena.gridSize,
      grid: arena.grid.map(cell => ({ ...cell })),
      getLegalMoves: arena.getLegalMoves.bind(arena),
      getAvailableTilesNumber: arena.getAvailableTilesNumber.bind(arena)
    };
  }

  clonePlayer(player) {
    return { x: player.x, y: player.y };
  }

  simulateMove(cloneArena, clonePlayer, newX, newY) {
    const size = cloneArena.gridSize;
    cloneArena.grid[clonePlayer.y * size + clonePlayer.x].content = "Wall";
    clonePlayer.x = newX;
    clonePlayer.y = newY;
    cloneArena.grid[newY * size + newX].content = "Player";
  }

  predictEnemyMove(arena, enemy) {
    const clonedArena = this.cloneArena(arena);
    const clonedEnemy = this.clonePlayer(enemy);
    const possibleMoves = arena
      .getLegalMoves(clonedEnemy.x, clonedEnemy.y, true)
      .filter(move => !move.collision);

    if (!possibleMoves.length) return null;

    let bestMove = possibleMoves[0];
    let bestScore = -Infinity;

    for (const move of possibleMoves) {
      this.simulateMove(clonedArena, clonedEnemy, move.xMove, move.yMove);
      const spaceScore = clonedArena.getAvailableTilesNumber(move.xMove, move.yMove);
      if (spaceScore > bestScore) {
        bestScore = spaceScore;
        bestMove = move;
      }
    }

    return bestMove;
  }

  getMove(arena, game) {
    const playerX = this.linkedBike.x;
    const playerY = this.linkedBike.y;
    const enemyBike = game.getOtherPlayer().linkedBike;

    const possibleMoves = arena.getLegalMoves(playerX, playerY, true).filter(move => !move.collision);
    if (!possibleMoves.length) return [playerX, playerY];

    const adaptiveMatrix = this.createAdaptiveMatrix(arena);
    const defensiveMatrix = this.createDefensiveMatrix(arena, enemyBike);
    const predictedEnemyMove = this.predictEnemyMove(arena, enemyBike);

    let bestMove = possibleMoves[0];
    let bestScore = -Infinity;

    const isRedPlayer = playerX > arena.gridSize / 2 && playerY > arena.gridSize / 2;

    for (const move of possibleMoves) {
      const spaceScore = arena.getAvailableTilesNumber(move.xMove, move.yMove);
      const diagScore = adaptiveMatrix[move.yMove]?.[move.xMove] || 0;
      const defScore = defensiveMatrix[move.yMove]?.[move.xMove] || 0;

      let penalty = 0;
      if (predictedEnemyMove && move.xMove === predictedEnemyMove.x && move.yMove === predictedEnemyMove.y) {
        penalty = 50;
      }

      const totalScore = spaceScore * 2 + defScore + diagScore * (isRedPlayer ? 2 : 1) - penalty;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMove = move;
      }
    }

    return [bestMove.xMove, bestMove.yMove];
  }
}
