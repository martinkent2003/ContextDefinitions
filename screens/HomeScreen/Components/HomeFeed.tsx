import { RefreshControl } from 'react-native'
import { Card, FadingScrollView, ScrollView } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import { useReading } from '@/hooks/useReading'
import { styles } from '@screens/HomeScreen/styles'

export default function HomeFeed() {
  const { readings, handleCardPress, isRefreshing, pullRefresh } = useHome()
  const { cachedReadingIds } = useReading()

  return (
    <ScrollView
      style={styles.feedScroll}
      contentContainerStyle={styles.feed}
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={pullRefresh} />
      }
    >
      {readings.map((reading, index) => (
        <Card
          key={index}
          title={reading.title}
          subtitle={reading.genre}
          rating={reading.rating}
          body={reading.body}
          isCached={cachedReadingIds.includes(reading.id)}
          onPress={() => handleCardPress(reading)}
        />
      ))}
    </ScrollView>
  )
}
