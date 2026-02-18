import { Icon } from "@/components/ui";
import Colors from "@/constants/Themes";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import React from "react";


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        animation:'shift'
      }}
      detachInactiveScreens={true}
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
          )
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
            library="FontAwesome"
            name="plus"
            color={color}
            size={24} />
          )
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
          )
        }}
      />
    </Tabs>
  );
}
