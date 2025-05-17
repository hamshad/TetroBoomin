import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainGame } from './src/MainGame';

function App(): React.JSX.Element {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1 }}>
        <MainGame />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}


export default App;
