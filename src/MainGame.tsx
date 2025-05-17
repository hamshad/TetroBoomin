import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
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

  // Swipe gestures for actions
  const swipeGestures = Gesture.Pan()
    .onEnd((e) => {
      if (isPaused) return;
      if (e.velocityY < -1000) runOnJS(hold)();
      else if (e.velocityY > 1000) runOnJS(hardDrop)();
      else if (e.velocityX > 1000) runOnJS(rotateCW)();
      else if (e.velocityX < -1000) runOnJS(rotateCCW)();
    });

  let previousCellsMoved = 0;
  const panGesture = Gesture.Pan()
    .onStart(() => {
      previousCellsMoved = 0;
    })
    .onUpdate((e) => {
      if (isPaused) return;
      const totalDeltaX = e.translationX;
      const cellsToMove = Math.round(totalDeltaX / cellSize);
      const deltaCells = cellsToMove - previousCellsMoved;
      if (deltaCells > 0) {
        for (let i = 0; i < deltaCells; i++) runOnJS(moveRight)();
      } else if (deltaCells < 0) {
        for (let i = 0; i < -deltaCells; i++) runOnJS(moveLeft)();
      }
      previousCellsMoved = cellsToMove;
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
