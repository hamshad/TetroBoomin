import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import { PIECES } from './pieces';
import useStore from './store';

interface NextPiecesProps {
  cellSize: number;
}

export default function NextPieces({ cellSize }: NextPiecesProps) {
  const queue = useStore((state) => state.queue.slice(0, 3));
  const nextHeight = cellSize * 12; // 3 pieces, 4 cells each, scaled down
  const nextWidth = cellSize * 4;

  return (
    <Canvas style={{ width: nextWidth, height: nextHeight }}>
      {queue.map((type, index) => {
        const piece = PIECES.find(p => p.type === type);
        const shape = piece.shapes[0];
        const color = piece.color;
        return (
          <Group key={index} transform={[{ translateY: index * cellSize * 4 }, { scale: 0.5 }, { translateX: nextWidth / 4 }]}>
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
        );
      })}
    </Canvas>
  );
}
