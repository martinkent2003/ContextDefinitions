import { SegmentedControl, View } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import { styles } from '../styles';
import SearchBar from './SearchBar';
import UserIcon from './UserIcon';

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
