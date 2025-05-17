import { Pressable, Text } from 'react-native';
import useStore from './store';

interface PauseButtonProps {
  className: string;
}

export default function PauseButton({ className }: PauseButtonProps) {
  const { isPaused, pause, resume } = useStore();
  return (
    <Pressable onPress={isPaused ? resume : pause} className={className}>
      <Text className="text-white text-lg">{isPaused ? 'Resume' : 'Pause'}</Text>
    </Pressable>
  );
}
