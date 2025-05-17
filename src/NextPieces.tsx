import { Canvas, Group, Rect, Paint, RoundedRect } from '@shopify/react-native-skia';
import { PIECES } from './pieces';
import useStore from './store';

interface NextPiecesProps {
  cellSize: number;
}

export default function NextPieces({ cellSize }: NextPiecesProps) {
  const queue = useStore((state) => state.queue); // No .slice()
  const nextQueue = queue.slice(0, 3); // slice here, not in selector
  const nextHeight = cellSize * 12; // 3 pieces, 4 cells each, scaled down
  const nextWidth = cellSize * 4;

  // Optional: background for the preview area
  const previewBgColor = "#191e2b";

  return (
    <Canvas style={{ width: nextWidth, height: nextHeight }}>
      {/* Preview background with rounded corners */}
      <RoundedRect
        x={0}
        y={0}
        width={nextWidth}
        height={nextHeight}
        color={previewBgColor}
        r={cellSize * 0.3}
        opacity={0.96}
      />
      {nextQueue.map((type, index) => {
        const piece = PIECES.find(p => p.type === type);
        const shape = piece.shapes[0];
        const color = piece.color;
        return (
          <Group
            key={index}
            transform={[
              { translateY: index * cellSize * 4 + cellSize * 0.5 },
              { scale: 0.5 },
              { translateX: nextWidth / 4 },
            ]}
          >
            {shape.map((row, dy) =>
              row.map((cell, dx) =>
                cell ? (
                  <Group key={`${dx}-${dy}`}>
                    {/* Cell shadow/border */}
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
                    {/* Highlight (3D effect) */}
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
        );
      })}
    </Canvas>
  );
}
