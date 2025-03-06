import { Tabs } from 'expo-router';
import { BookOpen, Settings, GraduationCap, User, CircleHelp as HelpCircle, Code } from 'lucide-react-native';
import { useTheme, getTheme } from '@/lib/theme';

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = getTheme(theme);
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.activeTab,
        tabBarInactiveTintColor: colors.inactiveTab,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: colors.tabBarBorder,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Study',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: 'Questions',
          tabBarIcon: ({ color, size }) => (
            <HelpCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <GraduationCap size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      {isDevelopment && (
        <Tabs.Screen
          name="debug"
          options={{
            title: 'Debug',
            tabBarIcon: ({ color, size }) => (
              <Code size={size} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}