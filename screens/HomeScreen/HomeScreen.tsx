import { Keyboard, Pressable } from 'react-native';
import { useHome } from '@/hooks/useHome';
import ProfileModal from './Modals/ProfileModal';
import { styles } from './styles';
import Header from './Components/Header';
import HomeFeed from './Components/HomeFeed';

export default function HomeScreen() {
  const { isProfileModalVisible, hideProfileModal } = useHome();

  return (
    <Pressable style={styles.screen} onPress={Keyboard.dismiss}>
      <Header />
      <HomeFeed />
      <ProfileModal visible={isProfileModalVisible} onClose={hideProfileModal} />
    </Pressable>
  );
}
