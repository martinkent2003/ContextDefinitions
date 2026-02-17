import { Keyboard, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHome } from '@/hooks/useHome';
import ProfileModal from './Modals/ProfileModal';
import { styles } from './styles';
import Header from './Components/Header';
import HomeFeed from './Components/HomeFeed';

export default function HomeScreen() {
  const { isProfileModalVisible, hideProfileModal } = useHome();

  return (
    <SafeAreaView style={styles.screen}>
      <Pressable style={styles.pressable} onPress={Keyboard.dismiss}>
        <Header />
        <HomeFeed />
        <ProfileModal visible={isProfileModalVisible} onClose={hideProfileModal} />
      </Pressable>
    </SafeAreaView>
  );
}
