import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import { PIECES } from './pieces';
import useStore from './store';

interface HoldPieceProps {
  cellSize: number;
}

export default function HoldPiece({ cellSize }: HoldPieceProps) {
  const heldPiece = useStore((state) => state.heldPiece);
  if (!heldPiece) return null;

  const piece = PIECES.find(p => p.type === heldPiece);
  const shape = piece.shapes[0];
  const color = piece.color;
  const holdSize = cellSize * 4;

  return (
    <Canvas style={{ width: holdSize, height: holdSize }}>
      <Group transform={[{ scale: 0.5 }, { translateX: holdSize / 4 }, { translateY: holdSize / 4 }]}>
        {shape.map((row, dy) =>
          row.map((cell, dx) =>
            cell ? (
              <Rect
                key={`${dx}-${dy}`}
                x={dx * cellSize}
                y={dy * cellSize}
                width={cellSize}
                height={cellSize}
                color={color}
              />
            ) : null
          )
        )}
      </Group>
    </Canvas>
  );
}
