import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useTheme, getTheme } from '@/lib/theme';
import { storage } from '@/lib/openai';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = getTheme(theme);

  const reloadApp = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // For development
      if (__DEV__) {
        const DevSettings = require('react-native').DevSettings;
        DevSettings.reload();
      } else {
        // For production, we can use expo-updates or a similar approach
        Alert.alert(
          'App Refresh Required',
          'Please close and reopen the app to see the changes.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleResetData = async () => {
    const resetAction = async () => {
      try {
        // Clear all stored data
        await storage.clearAllData();
        
        // Show success message and reload
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Success',
            'All data has been reset successfully. The app will now refresh.',
            [
              {
                text: 'OK',
                onPress: reloadApp
              }
            ]
          );
        } else {
          reloadApp();
        }
      } catch (error) {
        console.error('Error resetting data:', error);
        if (Platform.OS !== 'web') {
          Alert.alert('Error', 'Failed to reset data. Please try again.');
        }
      }
    };

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Reset All Data',
        'This will permanently delete all your chat history, progress, and settings. This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset',
            onPress: resetAction,
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    } else {
      if (window.confirm('This will permanently delete all your chat history, progress, and settings. This action cannot be undone.')) {
        await resetAction();
      }
    }
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.secondaryBackground }]} 
      edges={['top']}
    >
      <View style={[styles.header, { 
        backgroundColor: colors.secondaryBackground,
        borderBottomColor: colors.border 
      }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.buttonsContainer}>
          <View style={[styles.buttonWrapper, { backgroundColor: colors.settingsBackground }]}>
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ 
                  false: colors.switchTrackInactive, 
                  true: colors.switchTrackActive 
                }}
                thumbColor={colors.switchThumb}
              />
            </View>
          </View>

          <View style={[styles.buttonWrapper, { backgroundColor: colors.settingsBackground }]}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleResetData}
            >
              <View style={styles.settingLabelContainer}>
                <Trash2 size={20} color="#FF4444" style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: '#FF4444' }]}>Reset All Data</Text>
              </View>
              <AlertTriangle size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>

          <View style={[styles.thankYouSection, { backgroundColor: colors.settingsBackground }]}>
            <Text style={[styles.thankYouTitle, { color: colors.text }]}>
              Thank you for using StudyFast!
            </Text>
            <Text style={[styles.thankYouText, { color: colors.secondaryText }]}>
              If you have any suggestions or feedback, please feel free to contact me at:
            </Text>
            <TouchableOpacity 
              onPress={() => window.open('https://ahmetdedeler.com', '_blank')}
            >
              <Text style={[styles.linkText, { color: colors.activeTab }]}>
                ahmetdedeler.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  buttonsContainer: {
    padding: 16,
    gap: 16,
  },
  buttonWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  thankYouSection: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});