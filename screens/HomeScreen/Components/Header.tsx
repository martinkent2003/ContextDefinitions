import { OptionsMenuList, SegmentedControl, View } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import SearchBar from '@screens/HomeScreen/Components/SearchBar'
import { styles } from '@screens/HomeScreen/styles'

const SEGMENTS = ['Feed', 'Private']

export default function Header() {
  const { selectedSegment, setSelectedSegment } = useHome()

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <SearchBar />
        <OptionsMenuList />
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
