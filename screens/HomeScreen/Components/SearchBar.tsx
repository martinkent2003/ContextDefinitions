import { Icon, Input } from '@/components/ui'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@screens/HomeScreen/styles'

export default function SearchBar() {
  const iconColor = useThemeColor({}, 'textTertiary')

  return (
    <Input
      placeholder="Search..."
      size="sm"
      leftIcon={
        <Icon library="Ionicons" name="search-outline" size={15} color={iconColor} />
      }
      containerStyle={styles.searchBar}
    />
  )
}
