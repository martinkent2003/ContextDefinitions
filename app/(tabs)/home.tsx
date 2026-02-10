import { StyleSheet } from 'react-native';

import { Card, ScrollView, View } from '@/components/ui';
import { spacing } from '@/constants/Themes';
import { insertSampleReadings } from '@/services/readings';

export default function Home() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Card title = "Winnie The Pooh" subtitle="Childrens" rating="34" body ="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies nulla a enim mattis rhoncus. Nunc vehicula eu ex eget tristique. Aliquam ut nibh fermentum, molestie mi et, iaculis purus. Phasellus aliquam feugiat sem, ut semper risus egestas vel. Nunc urna arcu, venenatis at vehicula nec, auctor vel sapien. Suspendisse sit amet nulla lectus. Nunc ut odio leo. Vivamus sit amet justo nec magna tincidunt volutpat. Praesent feugiat dolor at magna rhoncus, at rhoncus purus fermentum..." onPress={()=>{insertSampleReadings()}}></Card>
        <Card title = "Student Eating Habits" subtitle="Health" rating="143" body ="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies nulla a enim mattis rhoncus. Nunc vehicula eu ex eget tristique. Aliquam ut nibh fermentum, molestie mi et, iaculis purus. Phasellus aliquam feugiat sem, ut semper risus egestas vel. Nunc urna arcu, venenatis at vehicula nec, auctor vel sapien. Suspendisse sit amet nulla lectus. Nunc ut odio leo. Vivamus sit amet justo nec magna tincidunt volutpat. Praesent feugiat dolor at magna rhoncus, at rhoncus purus fermentum..."></Card>
        <Card title = "Gators Win National Championship" subtitle="Sports" rating="300" body ="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies nulla a enim mattis rhoncus. Nunc vehicula eu ex eget tristique. Aliquam ut nibh fermentum, molestie mi et, iaculis purus. Phasellus aliquam feugiat sem, ut semper risus egestas vel. Nunc urna arcu, venenatis at vehicula nec, auctor vel sapien. Suspendisse sit amet nulla lectus. Nunc ut odio leo. Vivamus sit amet justo nec magna tincidunt volutpat. Praesent feugiat dolor at magna rhoncus, at rhoncus purus fermentum..."></Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: spacing.xs,
    padding:spacing.sm,
    margin:spacing.xs,
    paddingTop:spacing.xxxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
