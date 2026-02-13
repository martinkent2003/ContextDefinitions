import { View } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import { styles } from '../styles';
import UserIcon from './UserIcon';

export default function Header() {
  const { showProfileModal } = useHome();

  return (
    <View style={styles.header}>
      <UserIcon onPress={showProfileModal} />
    </View>
  );
}
