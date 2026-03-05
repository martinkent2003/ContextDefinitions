import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { Card, FadingScrollView } from '@/components/ui'
import { useHome } from '@/hooks/useHome'
import { useLoading } from '@/hooks/useLoading'
import { useReading } from '@/hooks/useReading'
import type { ReadingMetadata } from '@/types/readings'
import { styles } from '@screens/HomeScreen/styles'

export default function HomeFeed() {
  const { readings } = useHome()
  const { handleReadingChange } = useReading()
  const [feed, setFeed] = useState<ReadingMetadata[]>([])
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

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
          onPress={async () => {
            showLoading()
            const success = await handleReadingChange(reading)
            if (success) {
              router.push('/(private)/reading')
            } else {
              Alert.alert('File was not found \n' + reading.title)
              hideLoading()
            }
          }}
        />
      ))}
    </FadingScrollView>
  )
}
