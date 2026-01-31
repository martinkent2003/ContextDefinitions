import { View } from '@/components/ui';
import { signOut } from '@/services/auth';
import { Button } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';

export default function ModalScreen() {
  const[loading, setLoading] = useState(false)
  
  async function logOut(){
    setLoading(true)
    const { error } = await signOut()
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style = {[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign out" disabled ={loading} onPress={()=> logOut()}/>
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
