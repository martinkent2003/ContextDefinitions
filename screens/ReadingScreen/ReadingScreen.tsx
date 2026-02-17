import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { styles } from "./styles";
import Header from "./Components/Header";
import ReadingContent from "./Components/ReadingContent";
import WordsSheet from "./Components/WordsSheet";

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
