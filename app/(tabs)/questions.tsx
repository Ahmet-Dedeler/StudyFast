import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PERSONAS } from '@/lib/personas';
import { useTheme, getTheme } from '@/lib/theme';
import { CircleHelp as HelpCircle } from 'lucide-react-native';

export default function QuestionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getTheme(theme);

  const handleQuestionPress = (personaId: string, question: string) => {
    // Navigate to the index tab and force an immediate update
    router.replace({
      pathname: '/(tabs)',
      params: {
        screen: 'index',
        personaId,
        question,
        timestamp: Date.now().toString(),
        immediate: 'true' // Add this flag to force immediate switch
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.secondaryBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Common Questions</Text>
      </View>

      <ScrollView style={styles.content}>
        {PERSONAS.map((persona) => (
          <View key={persona.id} style={styles.subjectSection}>
            <View style={styles.subjectHeader}>
              <Image source={{ uri: persona.avatar }} style={styles.teacherAvatar} />
              <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: colors.text }]}>{persona.subject}</Text>
                <Text style={[styles.teacherName, { color: colors.secondaryText }]}>with {persona.name}</Text>
              </View>
            </View>

            <View style={[styles.questionsContainer, { backgroundColor: colors.assistantBubble }]}>
              {persona.sampleQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.questionItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleQuestionPress(persona.id, question)}
                >
                  <HelpCircle size={20} color={colors.activeTab} style={styles.questionIcon} />
                  <Text style={[styles.questionText, { color: colors.text }]}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
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
  subjectSection: {
    marginBottom: 24,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  subjectInfo: {
    marginLeft: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
  },
  teacherName: {
    fontSize: 14,
  },
  questionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  questionIcon: {
    marginRight: 12,
  },
  questionText: {
    fontSize: 16,
    flex: 1,
  },
});