import { SegmentedControl, View } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import SearchBar from '@screens/HomeScreen/Components/SearchBar'
import UserIcon from '@screens/HomeScreen/Components/UserIcon'
import { styles } from '@screens/HomeScreen/styles'

const SEGMENTS = ['Feed', 'Private']

export default function Header() {
  const { showProfileModal, selectedSegment, setSelectedSegment } = useHome()

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
  )
}
