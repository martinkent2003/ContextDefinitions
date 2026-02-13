import { Button, View } from '@/components/ui';
import { signOut } from '@/services/auth';
import { useLoading } from '@/hooks/useLoading';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform, StyleSheet } from 'react-native';

export default function ModalScreen() {
  const { showLoading, hideLoading } = useLoading()

  async function logOut(){
    showLoading("Signing out...", "typing")
    const { error } = await signOut()
    if (error) Alert.alert(error.message)
    hideLoading()
  }

  return (
    <View style={styles.container}>
      <View style = {[styles.verticallySpaced, styles.mt20]}>
        <Button variant='danger' size = 'lg' onPress={()=> logOut()}>Sign Out</Button>
      </View>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
    verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
    margin: 20,
  },
  mt20: {
    marginTop: 20,
  },
});
