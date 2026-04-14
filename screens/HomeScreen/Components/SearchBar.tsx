import { useRef } from 'react'
import { Icon, Input } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@screens/HomeScreen/styles'

export default function SearchBar() {
  const iconColor = useThemeColor({}, 'textTertiary')
  const { handleSearch } = useHome()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChangeText = (text: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (text.trim().length === 0) {
      handleSearch('')
      return
    }

    if (text.trim().length < 2) return

    searchTimer.current = setTimeout(() => {
      handleSearch(text.trim())
    }, 300)
  }

  return (
    <Input
      placeholder="Search..."
      size="sm"
      onChangeText={handleChangeText}
      autoCorrect={false}
      autoComplete="off"
      leftIcon={
        <Icon library="Ionicons" name="search-outline" size={15} color={iconColor} />
      }
      containerStyle={styles.searchBar}
    />
  )
}
