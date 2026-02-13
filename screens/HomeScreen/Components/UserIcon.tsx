import { Pressable } from 'react-native';
import { Icon, Text, View } from '@/components/ui';
import Colors from '@/constants/Themes';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
  onPress: () => void;
};

export default function UserIcon({ onPress }: Props) {
  const colorScheme = useColorScheme();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={{ alignItems: 'center', opacity: pressed ? 0.5 : 1 }}>
          <Icon
            library="FontAwesome"
            name="user"
            size={30}
            color={Colors[colorScheme ?? 'light'].text}
          />
          <Text>Profile</Text>
        </View>
      )}
    </Pressable>
  );
}
