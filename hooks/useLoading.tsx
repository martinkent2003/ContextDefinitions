import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors, spacing, radii, typography, shadows } from "@/constants/Themes";
import { useColorScheme } from "@/hooks/useColorScheme";

// ---- Public types ----
export type LoadingStyle = "book" | "text" | "typing";

type LoadingContextType = {
  isLoading: boolean;
  loadingMessage: string | null;
  loadingStyle: LoadingStyle;
  showLoading: (message?: string, style?: LoadingStyle) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

// ---- Multilingual greetings for the rotating text animation ----
const ROTATING_PHRASES = [
  { text: "Loading...", lang: "English" },
  { text: "Cargando...", lang: "Spanish" },
  { text: "Chargement...", lang: "French" },
  { text: "Laden...", lang: "German" },
  { text: "Caricamento...", lang: "Italian" },
  { text: "Carregando...", lang: "Portuguese" },
  { text: "読み込み中...", lang: "Japanese" },
  { text: "로딩 중...", lang: "Korean" },
  { text: "加载中...", lang: "Chinese" },
  { text: "Загрузка...", lang: "Russian" },
  { text: "Yükleniyor...", lang: "Turkish" },
  { text: "Memuat...", lang: "Indonesian" },
];

// ═══════════════════════════════════════════════════════
// Animation 1: Book page flip
// ═══════════════════════════════════════════════════════
const PAGE_WIDTH = 70;
const PAGE_HEIGHT = 90;

function BookAnimation({ tintColor, cardBg }: { tintColor: string; cardBg: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-180, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${rotation.value}deg` },
    ],
  }));

  const pageLines = (
    <>
      <View style={[bookStyles.line, { backgroundColor: tintColor, opacity: 0.2, width: '80%' }]} />
      <View style={[bookStyles.line, { backgroundColor: tintColor, opacity: 0.15, width: '60%' }]} />
      <View style={[bookStyles.line, { backgroundColor: tintColor, opacity: 0.2, width: '70%' }]} />
      <View style={[bookStyles.line, { backgroundColor: tintColor, opacity: 0.15, width: '50%' }]} />
      <View style={[bookStyles.line, { backgroundColor: tintColor, opacity: 0.2, width: '75%' }]} />
    </>
  );

  return (
    <View style={bookStyles.bookContainer}>
      <View
        style={[bookStyles.page, bookStyles.leftPage, { backgroundColor: cardBg, borderColor: tintColor }]}
      >
        {pageLines}
      </View>
      <View
        style={[bookStyles.page, bookStyles.rightPage, { backgroundColor: cardBg, borderColor: tintColor }]}
      >
        {pageLines}
      </View>
      <Animated.View
        style={[
          bookStyles.page,
          bookStyles.flippingPage,
          { backgroundColor: cardBg, borderColor: tintColor },
          flipStyle,
        ]}
      >
        {pageLines}
      </Animated.View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// Animation 2: Rotating multilingual text
// ═══════════════════════════════════════════════════════
function RotatingTextAnimation({ tintColor, textColor }: { tintColor: string; textColor: string }) {
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out, swap text, fade in
      opacity.value = withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(1, { duration: 300 }),
      );
      // Change phrase at the midpoint of the fade
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const phrase = ROTATING_PHRASES[index];

  return (
    <View style={rotatingStyles.container}>
      <Animated.View style={[rotatingStyles.textWrapper, fadeStyle]}>
        <Text style={[rotatingStyles.phrase, { color: textColor }]}>
          {phrase.text}
        </Text>
        <Text style={[rotatingStyles.lang, { color: tintColor }]}>
          {phrase.lang}
        </Text>
      </Animated.View>
      {/* Dots showing progress through the list */}
      <View style={rotatingStyles.dotsRow}>
        {ROTATING_PHRASES.map((_, i) => (
          <View
            key={i}
            style={[
              rotatingStyles.dot,
              { backgroundColor: i === index ? tintColor : tintColor + "40" },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// Animation 3: Typing effect
// ═══════════════════════════════════════════════════════
function TypingAnimation({ message, textColor, tintColor }: { message: string; textColor: string; tintColor: string }) {
  const displayText = message || "Loading...";
  const [visibleCount, setVisibleCount] = useState(0);
  const cursorOpacity = useSharedValue(1);

  // Typing forward then resetting
  useEffect(() => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      setVisibleCount(charIndex);

      if (charIndex > displayText.length) {
        // Pause at full text, then restart
        setTimeout(() => {
          charIndex = 0;
          setVisibleCount(0);
        }, 1200);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [displayText]);

  // Blinking cursor
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 }),
      ),
      -1,
    );
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <View style={typingStyles.container}>
      <View style={typingStyles.textRow}>
        <Text style={[typingStyles.typed, { color: textColor }]}>
          {displayText.slice(0, visibleCount)}
        </Text>
        <Animated.Text style={[typingStyles.cursor, { color: tintColor }, cursorStyle]}>
          |
        </Animated.Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// Provider + Hook
// ═══════════════════════════════════════════════════════
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [loadingStyle, setLoadingStyle] = useState<LoadingStyle>("book");
  const colorScheme = useColorScheme() ?? "light";

  const showLoading = useCallback((message?: string, style?: LoadingStyle) => {
    setLoadingMessage(message ?? null);
    setLoadingStyle(style ?? "book");
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(null);
  }, []);

  const cardBg = Colors[colorScheme].cardBackground;
  const textColor = Colors[colorScheme].text;
  const tintColor = Colors[colorScheme].tint;

  const renderAnimation = () => {
    switch (loadingStyle) {
      case "text":
        return <RotatingTextAnimation tintColor={tintColor} textColor={textColor} />;
      case "typing":
        return <TypingAnimation message={loadingMessage ?? ""} textColor={textColor} tintColor={tintColor} />;
      case "book":
      default:
        return <BookAnimation tintColor={tintColor} cardBg={cardBg} />;
    }
  };

  // For typing style, the message is rendered inside the animation itself
  const showMessageBelow = loadingStyle !== "typing" && !!loadingMessage;

  return (
    <LoadingContext.Provider
      value={{ isLoading, loadingMessage, loadingStyle, showLoading, hideLoading }}
    >
      {children}

      {isLoading && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <View style={[styles.card, { backgroundColor: cardBg }, shadows.md]}>
            {renderAnimation()}
            {showMessageBelow && (
              <Text style={[styles.message, { color: textColor }]}>
                {loadingMessage}
              </Text>
            )}
          </View>
        </Animated.View>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// ═══════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    minWidth: 200,
    gap: spacing.md,
  },
  message: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});

const bookStyles = StyleSheet.create({
  bookContainer: {
    width: PAGE_WIDTH * 2 + 4,
    height: PAGE_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    borderWidth: 1.5,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
  },
  leftPage: {
    borderTopLeftRadius: radii.sm,
    borderBottomLeftRadius: radii.sm,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rightPage: {
    borderTopRightRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  flippingPage: {
    position: "absolute",
    right: 0,
    borderTopRightRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    transformOrigin: "left center",
    backfaceVisibility: "hidden",
  },
  line: {
    height: 3,
    borderRadius: 2,
  },
});

const rotatingStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    gap: spacing.md,
  },
  textWrapper: {
    alignItems: "center",
    gap: spacing.xs,
  },
  phrase: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    textAlign: "center",
  },
  lang: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

const typingStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    minWidth: 180,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typed: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fonts.mono,
  },
  cursor: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
});
