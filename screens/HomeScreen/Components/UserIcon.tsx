import { Pressable } from 'react-native';
import { Icon, Text, View } from '@/components/ui';
import Colors from '@/constants/Themes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '../styles';

type Props = {
  onPress: () => void;
};

export default function UserIcon({ onPress }: Props) {
  const colorScheme = useColorScheme();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.userIcon, { opacity: pressed ? 0.5 : 1 }]}>
          <Icon
            library="FontAwesome"
            name="user"
            size={25}
            color={Colors[colorScheme ?? 'light'].text}
          />
          <Text style={styles.userIconText}>Profile</Text>
        </View>
      )}
    </Pressable>
  );
}
