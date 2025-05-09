import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign } from '@expo/vector-icons';
import { AppProvider } from '@/context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            display: 'none'
          }

        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile/profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <AntDesign size={20} color={color} name='user' />,
          }}
        />

        {[
          "session/[id]",
          "profile/[id]",

        ].map((pathname, index) => (
          <Tabs.Screen
            key={index}
            name={pathname}
            options={{
              href: null,
            }}
          />
        ))}

      </Tabs>
    </AppProvider>

  );
}
