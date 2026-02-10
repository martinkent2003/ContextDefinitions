import { Icon } from "@/components/ui";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Colors from "@/constants/Themes";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UploadProvider } from "@/hooks/useUpload";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <UploadProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerTransparent:true,
        headerTitle:'',
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              library="FontAwesome"
              name= {focused? "home" : "home"}
              color={color}
              size={24}
            />
          ),
          headerRight: () => (
              <Pressable>
                {({ pressed }) => (
                  <Icon
                    library="FontAwesome"
                    name="user"
                    size={40}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon library="FontAwesome" name="plus" color={color} size={24} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({color, focused}) => (
            <Icon
              library="FontAwesome"
              name={focused ? "folder-open" : "folder"}
              color={color}
              size = {24}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
    </UploadProvider>
  );
}
