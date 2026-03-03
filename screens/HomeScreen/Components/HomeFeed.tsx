import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Card, FadingScrollView } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import { useReading } from '@/hooks/useReading';
import { styles } from '@screens/HomeScreen/styles';
import { ReadingMetadata } from '@/types/readings';
import { Alert } from 'react-native';
import { useLoading } from '@/hooks/useLoading';

export default function HomeFeed() {
  const { readings } = useHome();
  const { handleReadingChange } = useReading();
  const [feed, setFeed] = useState<ReadingMetadata[]>([]);
  const {showLoading, hideLoading}= useLoading()
  const router = useRouter();

  useEffect(() => {
    setFeed(readings);
  }, [readings]);

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
            const success = await handleReadingChange(reading);
            if (success) {router.push('/(private)/reading');}
            else {
              Alert.alert("File was not found \n" + reading.title)
              hideLoading()
            }
          }}
        />
      ))}
    </FadingScrollView>
  );
}
