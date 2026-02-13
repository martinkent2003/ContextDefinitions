import { useEffect } from 'react';
import { View } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import ProfileModal from './Modals/ProfileModal';
import { styles } from './styles';
import Header from './Components/Header';
import HomeFeed from './Components/HomeFeed';

export default function HomeScreen() {
  const { isProfileModalVisible, hideProfileModal, fetchFeed } = useHome();

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <View style={styles.screen}>
      <Header />
      <HomeFeed />
      <ProfileModal visible={isProfileModalVisible} onClose={hideProfileModal} />
    </View>
  );
}
