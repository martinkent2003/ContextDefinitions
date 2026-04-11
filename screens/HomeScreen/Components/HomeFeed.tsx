import { useEffect, useState } from 'react'
import { RefreshControl } from 'react-native'
import { Card, FadingScrollView, ScrollView } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import { useReading } from '@/hooks/useReading'
import type { ReadingMetadata } from '@/types/readings'
import { styles } from '@screens/HomeScreen/styles'

export default function HomeFeed() {
  const { readings, handleCardPress, isRefreshing, pullRefresh } = useHome()
  const { cachedReadingIds } = useReading()
  const [feed, setFeed] = useState<ReadingMetadata[]>([])

  useEffect(() => {
    setFeed(readings)
  }, [readings])

  return (
    <ScrollView
      contentContainerStyle={styles.feed}
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={pullRefresh} />
      }
    >
      {feed.map((reading, index) => (
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
