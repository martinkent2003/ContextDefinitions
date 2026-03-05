import { StyleSheet } from 'react-native'
import { Text, View } from '@components/ui'

export default function Library() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Have Words Here</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})
