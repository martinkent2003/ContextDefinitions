import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Card, FadingScrollView } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import { useReading } from '@/hooks/useReading';
import { styles } from '@screens/HomeScreen/styles';
import { ReadingMetadata } from '@/types/readings';

export default function HomeFeed() {
  const { readings } = useHome();
  const { setSelection, handleReadingChange } = useReading();
  const [feed, setFeed] = useState<ReadingMetadata[]>([]);
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
          onPress={() => {
            setSelection(null);
            handleReadingChange(reading);
            router.push('/(private)/reading');
          }}
        />
      ))}
    </FadingScrollView>
  );
}
