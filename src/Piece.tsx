import { Group, Rect, RoundedRect } from '@shopify/react-native-skia';
import { PIECES } from './pieces';
import useStore from './store';

interface PieceProps {
  cellSize: number;
  type: 'current' | 'ghost';
}

export default function Piece({ cellSize, type }: PieceProps) {
  const currentPiece = useStore((state) => state.currentPiece);
  const grid = useStore((state) => state.grid);

  if (!currentPiece) return null;

  const piece = PIECES.find(p => p.type === currentPiece.type);
  const shape = piece.shapes[currentPiece.rotation];
  const color = piece.color;
  const opacity = type === 'ghost' ? 0.23 : 1;

  // Calculate ghost piece position
  let y = currentPiece.y;
  if (type === 'ghost') {
    while (!checkCollision(currentPiece.type, currentPiece.x, y + 1, currentPiece.rotation, grid)) {
      y++;
    }
  }

  return (
    <Group>
      {shape.map((row, dy) =>
        row.map((cell, dx) =>
          cell ? (
            <Group key={`${dx}-${dy}`}>
              {/* Shadow/border for block */}
              <Rect
                x={(currentPiece.x + dx) * cellSize}
                y={(y + dy) * cellSize}
                width={cellSize}
                height={cellSize}
                color="#000"
                opacity={type === 'ghost' ? 0.12 : 0.28}
                style="stroke"
                strokeWidth={2}
              />
              {/* Main block */}
              <RoundedRect
                x={(currentPiece.x + dx) * cellSize + 2}
                y={(y + dy) * cellSize + 2}
                width={cellSize - 4}
                height={cellSize - 4}
                color={color}
                opacity={opacity}
                r={cellSize * 0.20}
              />
              {/* Highlight for 3D effect */}
              <RoundedRect
                x={(currentPiece.x + dx) * cellSize + 2}
                y={(y + dy) * cellSize + 2}
                width={cellSize - 4}
                height={(cellSize - 4) * 0.43}
                color="#fff"
                opacity={type === 'ghost' ? 0.08 : 0.15}
                r={cellSize * 0.20}
              />
            </Group>
          ) : null
        )
      )}
    </Group>
  );
}

function checkCollision(type: string, x: number, y: number, rotation: number, grid: string[][] | null[][]): boolean {
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
