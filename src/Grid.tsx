import { Group, Rect, Line } from '@shopify/react-native-skia';
import useStore from './store';

interface GridProps {
  cellSize: number;
}

export default function Grid({ cellSize }: GridProps) {
  const grid = useStore((state) => state.grid);

  return (
    <Group>
      {/* Render placed pieces */}
      {grid.map((row, y) =>
        row.map((color, x) =>
          color ? (
            <Rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              color={color}
            />
          ) : null
        )
      )}
      {/* Grid lines */}
      {Array.from({ length: 21 }).map((_, i) => (
        <Line
          key={`h${i}`}
          p1={{ x: 0, y: i * cellSize }}
          p2={{ x: 10 * cellSize, y: i * cellSize }}
          color="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <Line
          key={`v${i}`}
          p1={{ x: i * cellSize, y: 0 }}
          p2={{ x: i * cellSize, y: 20 * cellSize }}
          color="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      ))}
    </Group>
  );
}
