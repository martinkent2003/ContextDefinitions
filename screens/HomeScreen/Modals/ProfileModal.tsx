import { Button, View } from '@/components/ui';
import { signOut } from '@/services/auth';
import { useLoading } from '@/hooks/useLoading';
import { StatusBar } from 'expo-status-bar';
import { Alert, Modal, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ProfileModal({ visible, onClose }: Props) {
  const { showLoading, hideLoading } = useLoading();
  const backgroundColor = useThemeColor({}, "background");

  async function logOut() {
    showLoading("Signing out...", "typing");
    const { error } = await signOut();
    if (error) Alert.alert(error.message);
    hideLoading();
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, {backgroundColor}]}>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button variant="secondary" size="lg" onPress={onClose}>Close</Button>
          </View>
          <View style={[styles.verticallySpaced]}>
            <Button variant="danger" size="lg" onPress={() => logOut()}>Sign Out</Button>
          </View>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          {Platform.OS === 'ios' && <StatusBar style="light" />}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
