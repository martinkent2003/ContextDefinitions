import { Icon, Input } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@screens/HomeScreen/styles'

export default function SearchBar() {
  const iconColor = useThemeColor({}, 'textTertiary')
  const { searchQuery, handleSearchChange } = useHome()

  return (
    <Input
      placeholder="Search..."
      size="sm"
      value={searchQuery}
      onChangeText={handleSearchChange}
      leftIcon={
        <Icon library="Ionicons" name="search-outline" size={15} color={iconColor} />
      }
      containerStyle={styles.searchBar}
    />
  )
}
