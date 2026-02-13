import { Icon } from "@/components/ui";
import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";
import Colors from "@/constants/Themes";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import React from "react";
import { HomeProvider } from "@/hooks/useHome";
import { UploadProvider } from "@/hooks/useUpload";


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <HomeProvider>
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
              headerShown: false,
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
    </HomeProvider>
  );
}
