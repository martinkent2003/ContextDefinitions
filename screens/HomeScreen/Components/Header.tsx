import { SegmentedControl, View } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import { styles } from '@screens/HomeScreen/styles';
import SearchBar from '@screens/HomeScreen/Components/SearchBar';
import UserIcon from '@screens/HomeScreen/Components/UserIcon';

const SEGMENTS = ['Feed', 'Private'];

export default function Header() {
  const { showProfileModal, selectedSegment, setSelectedSegment } = useHome();

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <SearchBar />
        <UserIcon onPress={showProfileModal} />
      </View>
      <SegmentedControl
        segments={SEGMENTS}
        selected={selectedSegment}
        onSelect={setSelectedSegment}
        size="sm"
        style={styles.segmentedControl}
      />
    </View>
  );
}
