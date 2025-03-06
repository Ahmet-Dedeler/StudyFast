import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, getTheme } from '@/lib/theme';
import { UserProfile, storage } from '@/lib/openai';
import { User, BookOpen, Pencil } from 'lucide-react-native';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const colors = getTheme(theme);
  const [profile, setProfile] = useState<UserProfile>({
    educationLevel: 'high_school',
    learningStyle: '',
    interests: [],
    additionalInfo: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const savedProfile = await storage.getUserProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
  };

  const handleSave = async () => {
    await storage.saveUserProfile(profile);
    setIsEditing(false);
  };

  const educationLevels = [
    { id: 'high_school', label: 'High School' },
    { id: 'university', label: 'University' },
    { id: 'professional', label: 'Professional' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.secondaryBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Learning Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.assistantBubble }]}>
          <View style={styles.sectionHeader}>
            <User size={24} color={colors.activeTab} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Education Level</Text>
          </View>
          
          <View style={styles.educationLevels}>
            {educationLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelButton,
                  { 
                    backgroundColor: profile.educationLevel === level.id ? colors.activeTab : 'transparent',
                    borderColor: colors.activeTab,
                  },
                ]}
                onPress={() => isEditing && setProfile({ ...profile, educationLevel: level.id as UserProfile['educationLevel'] })}
                disabled={!isEditing}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    { color: profile.educationLevel === level.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.assistantBubble }]}>
          <View style={styles.sectionHeader}>
            <BookOpen size={24} color={colors.activeTab} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Style</Text>
          </View>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={profile.learningStyle}
            onChangeText={(text) => setProfile({ ...profile, learningStyle: text })}
            placeholder="How do you learn best? (e.g., visual, hands-on, examples)"
            placeholderTextColor={colors.secondaryText}
            editable={isEditing}
            multiline
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.assistantBubble }]}>
          <View style={styles.sectionHeader}>
            <Pencil size={24} color={colors.activeTab} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Information</Text>
          </View>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border,
                height: 120,
              },
            ]}
            value={profile.additionalInfo}
            onChangeText={(text) => setProfile({ ...profile, additionalInfo: text })}
            placeholder="Share any other information that might help your teachers (e.g., goals, challenges, interests)"
            placeholderTextColor={colors.secondaryText}
            editable={isEditing}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.editButton,
            { backgroundColor: colors.activeTab }
          ]}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  educationLevels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 45,
  },
  editButton: {
    marginTop: 8,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});