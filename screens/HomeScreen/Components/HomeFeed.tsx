import { useEffect, useState } from 'react';
import { Card, ScrollView } from '@/components/ui';
import { useHome } from '@/hooks/useHome';
import { styles } from '../styles';
import { ReadingMetadata } from '@/types/readings';

export default function HomeFeed() {
  const { readings } = useHome();
  const [feed, setFeed] = useState<ReadingMetadata[]>([]);

  useEffect(() => {
    setFeed(readings);
  }, [readings]);

  return (
    <ScrollView contentContainerStyle={styles.feed}>
      {feed.map((reading, index) => (
        <Card
          key={index}
          title={reading.title}
          subtitle={reading.genre}
          rating={reading.rating}
          body={reading.body}
        />
      ))}
    </ScrollView>
  );
}
