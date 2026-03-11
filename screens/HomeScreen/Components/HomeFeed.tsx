import { useEffect, useState } from 'react'
import { Card, FadingScrollView } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import type { ReadingMetadata } from '@/types/readings'
import { styles } from '@screens/HomeScreen/styles'

export default function HomeFeed() {
  const { readings, handleCardPress } = useHome()
  const [feed, setFeed] = useState<ReadingMetadata[]>([])

  useEffect(() => {
    setFeed(readings)
  }, [readings])

  return (
    <FadingScrollView contentContainerStyle={styles.feed} keyboardDismissMode="on-drag">
      {feed.map((reading, index) => (
        <Card
          key={index}
          title={reading.title}
          subtitle={reading.genre}
          rating={reading.rating}
          body={reading.body}
          onPress={() => handleCardPress(reading)}
        />
      ))}
    </FadingScrollView>
  )
}
