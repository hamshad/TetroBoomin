import { Group, Rect, Line, Paint, LinearGradient, vec, RoundedRect } from '@shopify/react-native-skia';
import useStore from './store';

interface GridProps {
  cellSize: number;
}

export default function Grid({ cellSize }: GridProps) {
  const grid = useStore((state) => state.grid);

  // Optional: background for the grid
  const gridBgColor = "#181a20";

  return (
    <Group>
      {/* Grid background */}
      <Rect
        x={0}
        y={0}
        width={10 * cellSize}
        height={20 * cellSize}
        color={gridBgColor}
        opacity={1}
      />
      {/* Placed pieces with border, rounded corners, and highlight */}
      {grid.map((row, y) =>
        row.map((color, x) =>
          color ? (
            <Group key={`${x}-${y}`}>
              {/* Cell shadow/border */}
              <Rect
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                color="#000"
                opacity={0.25}
                style="stroke"
                strokeWidth={2}
              />
              {/* Main block */}
              <RoundedRect
                x={x * cellSize + 2}
                y={y * cellSize + 2}
                width={cellSize - 4}
                height={cellSize - 4}
                color={color}
                r={cellSize * 0.2} // rounded corners
              />
              {/* Highlight (simulated 3D effect) */}
              <RoundedRect
                x={x * cellSize + 2}
                y={y * cellSize + 2}
                width={cellSize - 4}
                height={(cellSize - 4) * 0.4}
                color="#fff"
                opacity={0.15}
                r={cellSize * 0.2} // rounded corners
              />
            </Group>
          ) : null
        )
      )}
      {/* Grid lines: more subtle, darker */}
      {Array.from({ length: 21 }).map((_, i) => (
        <Line
          key={`h${i}`}
          p1={{ x: 0, y: i * cellSize }}
          p2={{ x: 10 * cellSize, y: i * cellSize }}
          color="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <Line
          key={`v${i}`}
          p1={{ x: i * cellSize, y: 0 }}
          p2={{ x: i * cellSize, y: 20 * cellSize }}
          color="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
      ))}
    </Group>
  );
}
