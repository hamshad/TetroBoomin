import { PIECES, PieceType } from './pieces';

export function createBag(): PieceType[] {
  const bag = PIECES.map(p => p.type);
  shuffle(bag);
  return bag;
}

function shuffle(array: PieceType[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
