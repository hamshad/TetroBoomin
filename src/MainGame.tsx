import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import useStore from './store';
import Grid from './Grid';
import Piece from './Piece';
import HoldPiece from './HoldPiece';
import NextPieces from './NextPieces';
import PauseButton from './PauseButton';

export function MainGame() {
  const { width, height } = useWindowDimensions();
  const cellSize = Math.min(width / 18, height / 22); // Adjust for layout
  const gridWidth = cellSize * 10;
  const gridHeight = cellSize * 20;

  const {
    isPaused,
    moveLeft,
    moveRight,
    moveDown,
    rotateCW,
    rotateCCW,
    hold,
    hardDrop,
    spawnPiece,
  } = useStore();

  // Initialize game
  useEffect(() => {
    spawnPiece();
  }, [spawnPiece]);

  // Game loop
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        moveDown();
      }, 1000); // Move down every second
      return () => clearInterval(interval);
    }
  }, [isPaused, moveDown]);

  // Swipe gestures
  const swipeGestures = Gesture.Pan()
    .onEnd((e) => {
      if (isPaused) return;
      if (e.velocityY < -1000) hold();
      else if (e.velocityY > 1000) hardDrop();
      else if (e.velocityX > 1000) rotateCW();
      else if (e.velocityX < -1000) rotateCCW();
    });

  // Pan gesture for horizontal movement
  let initialGestureX = 0;
  let initialPieceX = 0;
  const panGesture = Gesture.Pan()
    .onStart((e) => {
      if (isPaused) return;
      initialGestureX = e.x;
      initialPieceX = useStore.getState().currentPiece?.x || 0;
    })
    .onUpdate((e) => {
      if (isPaused) return;
      const deltaX = e.x - initialGestureX;
      const moveCells = Math.round(deltaX / cellSize);
      const newX = initialPieceX + moveCells;
      const clampedX = Math.max(0, Math.min(10 - 4, newX)); // Assuming max piece width is 4
      if (newX < initialPieceX) moveLeft();
      else if (newX > initialPieceX) moveRight();
      useStore.getState().setCurrentPiece({
        ...useStore.getState().currentPiece!,
        x: clampedX,
      });
    });

  const composedGestures = Gesture.Simultaneous(swipeGestures, panGesture);

  return (
    <GestureDetector gesture={composedGestures}>
      <View className="flex-1 bg-gray-900 flex-row justify-center items-center">
        <View className="w-1/4 p-2">
          <HoldPiece cellSize={cellSize} />
        </View>
        <View>
          <Canvas style={{ width: gridWidth, height: gridHeight }}>
            <Grid cellSize={cellSize} />
            <Piece cellSize={cellSize} type="ghost" />
            <Piece cellSize={cellSize} type="current" />
          </Canvas>
        </View>
        <View className="w-1/4 p-2">
          <NextPieces cellSize={cellSize} />
        </View>
        <PauseButton className="absolute top-4 right-4 p-2 bg-gray-800 rounded" />
      </View>
    </GestureDetector>
  );
}
