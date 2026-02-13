import { View } from "@/components/ui";
import { spacing, radii } from "@/constants/Themes";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";

type Props = {
  imageUris: string[];
};

export default function ImageCarousel({ imageUris }: Props) {
  const tint = useThemeColor({}, "tint");
  const border = useThemeColor({}, "border");
  const { width } = useWindowDimensions();
  const imageWidth = width - spacing.md * 2;
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / imageWidth);
    setActiveIndex(index);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={imageUris}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(uri, index) => `${uri}-${index}`}
        renderItem={({ item }) => (
          <Zoomable>
            <Image
              source={{ uri: item }}
              style={{
                width: imageWidth,
                height: imageWidth,
                borderRadius: radii.lg,
                marginHorizontal: spacing.md,
              }}
              resizeMode="contain"
            />
          </Zoomable>
        )}
      />
      {imageUris.length > 1 && (
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: spacing.sm }}>
          {imageUris.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: index === activeIndex ? tint : border,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
