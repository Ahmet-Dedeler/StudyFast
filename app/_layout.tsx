import { useEffect, useState } from 'react';
import { Stack, Redirect, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeContext, ThemeMode, getTheme } from '@/lib/theme';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from '@/lib/theme';
import { DefaultTheme, DarkTheme } from '@/lib/theme';
import { Colors } from '@/lib/theme';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

function RootLayoutNav() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeContext.Provider>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}

function TabBarIcon(props: {
  name: React.ComponentType<{ size?: number; color?: string }> | undefined;
  color?: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export function AppLayout() {
  const colorScheme = 'light'; // Replace with actual color scheme

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs screenOptions={{ tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color }) => <TabBarIcon name="chatbubbles" color={color} />,
          }}
        />
        <Tabs.Screen
          name="flashcards"
          options={{
            title: 'Flashcards',
            tabBarIcon: ({ color }) => <TabBarIcon name="card" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          }}
        />
        <Tabs.Screen
          name="test-api"
          options={{
            title: 'Test API',
            tabBarIcon: ({ color }) => <TabBarIcon name="code-working" color={color} />,
            href: process.env.NODE_ENV === 'development' ? '/test-api' : null,
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}