import { create } from 'zustand';
import { PieceType, PIECES } from './pieces';
import { createBag } from './randomizer';

type GridCell = string | null;
type Grid = GridCell[][];

interface State {
  grid: Grid;
  currentPiece: { type: PieceType; x: number; y: number; rotation: number } | null;
  queue: PieceType[];
  heldPiece: PieceType | null;
  canHold: boolean;
  isPaused: boolean;
  setGrid: (grid: Grid) => void;
  setCurrentPiece: (piece: State['currentPiece']) => void;
  setQueue: (queue: PieceType[]) => void;
  setHeldPiece: (piece: PieceType | null) => void;
  setCanHold: (canHold: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  hold: () => void;
  hardDrop: () => void;
  pause: () => void;
  resume: () => void;
  spawnPiece: () => void;
  lockPiece: () => void;
}

const initialGrid: Grid = Array(20).fill(null).map(() => Array(10).fill(null));

// Standard SRS wall kick tables (simplified for non-I and I pieces)
const wallKicks: { [key: string]: { [key: string]: [number, number][] } } = {
  'non-I': {
    '0-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '1-0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '1-2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '2-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '2-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '3-2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '3-0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '0-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  },
  'I': {
    '0-1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '1-0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '1-2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    '2-1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '2-3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '3-2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '3-0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '0-3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  },
};

const useStore = create<State>()((set, get) => ({
  grid: initialGrid,
  currentPiece: null,
  queue: [],
  heldPiece: null,
  canHold: true,
  isPaused: false,
  setGrid: (grid) => set({ grid }),
  setCurrentPiece: (piece) => set({ currentPiece: piece }),
  setQueue: (queue) => set({ queue }),
  setHeldPiece: (piece) => set({ heldPiece: piece }),
  setCanHold: (canHold) => set({ canHold }),
  setIsPaused: (isPaused) => set({ isPaused }),
  moveLeft: () => {
    const { currentPiece, grid } = get();
    if (!currentPiece || get().isPaused) return;
    const newX = currentPiece.x - 1;
    if (!checkCollision(currentPiece.type, newX, currentPiece.y, currentPiece.rotation, grid)) {
      set({ currentPiece: { ...currentPiece, x: newX } });
    }
  },
  moveRight: () => {
    const { currentPiece, grid } = get();
    if (!currentPiece || get().isPaused) return;
    const newX = currentPiece.x + 1;
    if (!checkCollision(currentPiece.type, newX, currentPiece.y, currentPiece.rotation, grid)) {
      set({ currentPiece: { ...currentPiece, x: newX } });
    }
  },
  moveDown: () => {
    const { currentPiece, grid } = get();
    if (!currentPiece || get().isPaused) return;
    const newY = currentPiece.y + 1;
    if (!checkCollision(currentPiece.type, currentPiece.x, newY, currentPiece.rotation, grid)) {
      set({ currentPiece: { ...currentPiece, y: newY } });
    } else {
      get().lockPiece();
    }
  },
  rotateCW: () => {
    const { currentPiece, grid } = get();
    if (!currentPiece || get().isPaused) return;
    const newRotation = (currentPiece.rotation + 1) % 4;
    rotateWithWallKicks(currentPiece, newRotation, grid, set);
  },
  rotateCCW: () => {
    const { currentPiece, grid } = get();
    if (!currentPiece || get().isPaused) return;
    const newRotation = (currentPiece.rotation + 3) % 4;
    rotateWithWallKicks(currentPiece, newRotation, grid, set);
  },
  hold: () => {
    const { currentPiece, heldPiece, canHold, queue, setCurrentPiece, setHeldPiece, setCanHold } = get();
    if (!currentPiece || !canHold || get().isPaused) return;
    if (!heldPiece) {
      setHeldPiece(currentPiece.type);
      setCurrentPiece(null);
      get().spawnPiece();
    } else {
      const temp = currentPiece.type;
      setCurrentPiece({ type: heldPiece, x: 3, y: 0, rotation: 0 });
      setHeldPiece(temp);
    }
    setCanHold(false);
  },
  hardDrop: () => {
    const { currentPiece, grid } = get();
    if (!currentPiece || get().isPaused) return;
    let newY = currentPiece.y;
    while (!checkCollision(currentPiece.type, currentPiece.x, newY + 1, currentPiece.rotation, grid)) {
      newY++;
    }
    set({ currentPiece: { ...currentPiece, y: newY } });
    get().lockPiece();
  },
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  spawnPiece: () => {
    const { queue, setQueue, setCurrentPiece } = get();
    let newQueue = [...queue];
    if (newQueue.length < 4) {
      newQueue = [...newQueue, ...createBag()];
    }
    const pieceType = newQueue.shift();
    setCurrentPiece({ type: pieceType, x: 3, y: 0, rotation: 0 });
    setQueue(newQueue);
    set({ canHold: true });
  },
  lockPiece: () => {
    const { currentPiece, grid, setGrid, spawnPiece } = get();
    if (!currentPiece) return;
    const piece = PIECES.find(p => p.type === currentPiece.type);
    const shape = piece.shapes[currentPiece.rotation];
    const newGrid = grid.map(row => [...row]);
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx]) {
          const gridX = currentPiece.x + dx;
          const gridY = currentPiece.y + dy;
          if (gridY >= 0 && gridY < 20 && gridX >= 0 && gridX < 10) {
            newGrid[gridY][gridX] = piece.color;
          }
        }
      }
    }
    const clearedGrid = clearLines(newGrid);
    setGrid(clearedGrid);
    spawnPiece();
  },
}));

function checkCollision(type: PieceType, x: number, y: number, rotation: number, grid: Grid): boolean {
  const piece = PIECES.find(p => p.type === type);
  const shape = piece.shapes[rotation];
  for (let dy = 0; dy < shape.length; dy++) {
    for (let dx = 0; dx < shape[dy].length; dx++) {
      if (shape[dy][dx]) {
        const gridX = x + dx;
        const gridY = y + dy;
        if (gridX < 0 || gridX >= 10 || gridY >= 20 || (gridY >= 0 && grid[gridY][gridX])) {
          return true;
        }
      }
    }
  }
  return false;
}

function rotateWithWallKicks(currentPiece: State['currentPiece'], newRotation: number, grid: Grid, set: (state: Partial<State>) => void) {
  const pieceType = currentPiece.type;
  const kickTable = pieceType === 'I' ? wallKicks['I'] : wallKicks['non-I'];
  const kickKey = `${currentPiece.rotation}-${newRotation}`;
  const kicks = kickTable[kickKey] || [];
  for (const [dx, dy] of kicks) {
    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;
    if (!checkCollision(pieceType, newX, newY, newRotation, grid)) {
      set({ currentPiece: { ...currentPiece, x: newX, y: newY, rotation: newRotation } });
      return;
    }
  }
}

function clearLines(grid: Grid): Grid {
  const newGrid = grid.filter(row => !row.every(cell => cell !== null));
  const linesCleared = 20 - newGrid.length;
  return [...Array(linesCleared).fill(null).map(() => Array(10).fill(null)), ...newGrid];
}

export default useStore;
