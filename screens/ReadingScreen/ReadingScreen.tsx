import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { styles } from "@screens/ReadingScreen/styles";
import Header from "@screens/ReadingScreen/Components/Header";
import ReadingContent from "@screens/ReadingScreen/Components/ReadingContent";
import WordsSheet from "@screens/ReadingScreen/Components/WordsSheet";

export default function ReadingScreen() {
  const router = useRouter();
  const { id, title, genre, body } = useLocalSearchParams<{
    id: string;
    title: string;
    genre: string;
    body: string;
  }>();

  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }]}>
      <Header title={title ?? ""} onBack={() => router.back()} />
      <ReadingContent genre={genre} body={body} />
      <WordsSheet />
    </SafeAreaView>
  );
}
