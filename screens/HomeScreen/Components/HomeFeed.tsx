import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Card, FadingScrollView } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import { styles } from '../styles';
import { ReadingMetadata } from '@/types/readings';

export default function HomeFeed() {
  const { readings } = useHome();
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
          onPress={() => router.push({
            pathname: '/(private)/reading',
            params: { id: reading.id, title: reading.title, genre: reading.genre, body: reading.body },
          })}
        />
      ))}
    </FadingScrollView>
  );
}
