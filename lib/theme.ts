import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const lightTheme = {
  background: '#FFF8EE',
  secondaryBackground: '#F5EBD8',
  text: '#3A2E21',
  secondaryText: '#6B5C4A',
  border: '#D9C9B0',
  userBubble: '#8C6D46',
  userText: '#FFFFFF',
  assistantBubble: '#E9DCC8',
  assistantText: '#3A2E21',
  inputBackground: '#FFFFFF',
  tabBar: '#F5EBD8',
  tabBarBorder: '#D9C9B0',
  activeTab: '#8C6D46',
  inactiveTab: '#A99B85',
  settingsBackground: '#FFFFFF',
  switchTrackActive: '#A3845B',
  switchTrackInactive: '#D9C9B0',
  switchThumb: '#FFFFFF',
};

export const darkTheme = {
  background: '#2A2018',
  secondaryBackground: '#3A2E21',
  text: '#F5EBD8',
  secondaryText: '#BFB09B',
  border: '#5C4C3A',
  userBubble: '#A3845B',
  userText: '#FFFFFF',
  assistantBubble: '#4A3C2E',
  assistantText: '#F5EBD8',
  inputBackground: '#3A2E21',
  tabBar: '#3A2E21',
  tabBarBorder: '#5C4C3A',
  activeTab: '#D9B77F',
  inactiveTab: '#BFB09B',
  settingsBackground: '#4A3C2E',  // Made darker for better contrast
  switchTrackActive: '#D9B77F',   // Matched with activeTab
  switchTrackInactive: '#5C4C3A',
  switchThumb: '#F5EBD8',
};

export const getTheme = (mode: ThemeMode) => {
  return mode === 'light' ? lightTheme : darkTheme;
};