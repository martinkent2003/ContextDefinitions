import { Keyboard, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHome } from '@/hooks/useHome';
import ProfileModal from '@screens/HomeScreen/Modals/ProfileModal';
import { styles } from '@screens/HomeScreen/styles';
import Header from '@screens/HomeScreen/Components/Header';
import HomeFeed from '@screens/HomeScreen/Components/HomeFeed';

export default function HomeScreen() {
  const { isProfileModalVisible, hideProfileModal } = useHome();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Pressable style={styles.pressable} onPress={Keyboard.dismiss}>
        <Header />
        <HomeFeed />
        <ProfileModal visible={isProfileModalVisible} onClose={hideProfileModal} />
      </Pressable>
    </SafeAreaView>
  );
}
