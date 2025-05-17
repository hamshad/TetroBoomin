import { Canvas, Group, Rect, RoundedRect } from '@shopify/react-native-skia';
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

  // Optional: background for the hold panel
  const holdBgColor = "#191e2b";

  return (
    <Canvas style={{ width: holdSize, height: holdSize }}>
      {/* Hold background with rounded corners */}
      <RoundedRect
        x={0}
        y={0}
        width={holdSize}
        height={holdSize}
        color={holdBgColor}
        r={cellSize * 0.3}
        opacity={0.96}
      />
      <Group transform={[{ scale: 0.5 }, { translateX: holdSize / 4 }, { translateY: holdSize / 4 }]}>
        {shape.map((row, dy) =>
          row.map((cell, dx) =>
            cell ? (
              <Group key={`${dx}-${dy}`}>
                {/* Shadow/border for block */}
                <Rect
                  x={dx * cellSize}
                  y={dy * cellSize}
                  width={cellSize}
                  height={cellSize}
                  color="#000"
                  opacity={0.23}
                  style="stroke"
                  strokeWidth={1.5}
                />
                {/* Main block */}
                <RoundedRect
                  x={dx * cellSize + 1}
                  y={dy * cellSize + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  color={color}
                  r={cellSize * 0.18}
                />
                {/* Highlight for 3D effect */}
                <RoundedRect
                  x={dx * cellSize + 1}
                  y={dy * cellSize + 1}
                  width={cellSize - 2}
                  height={(cellSize - 2) * 0.45}
                  color="#fff"
                  opacity={0.15}
                  r={cellSize * 0.18}
                />
              </Group>
            ) : null
          )
        )}
      </Group>
    </Canvas>
  );
}
