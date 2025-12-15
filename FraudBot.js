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
    //console.warn("Aucun mouvement possible !");
    return [x, y];
  }

  let bestScore = -Infinity;
  let bestMoves = []; 

  for (const move of legalMoves) {
    const available = arena.getAvailableTilesNumber(move.xMove, move.yMove);
    /*console.log(
      `Move (${move.xMove}, ${move.yMove}) → ${available} cases disponibles`
    );*/

    if (available > bestScore) {
      bestScore = available;
      bestMoves = [move];
    } else if (available === bestScore) {
      bestMoves.push(move);
    }
  }

  if (bestMoves.length === 0) {
    //console.warn("Aucun move valide, choix aléatoire");
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return [randomMove.xMove, randomMove.yMove];
  }

  const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

  /*console.log(
    "Meilleur(s) move(s) :",
    bestMoves,
    "→ choisi :",
    chosenMove,
    "score =",
    bestScore
  );*/

  return [chosenMove.xMove, chosenMove.yMove];
}

}