import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme, getTheme } from '@/lib/theme';
import { ACHIEVEMENTS, storage } from '@/lib/openai';
import { PERSONAS } from '@/lib/personas';
import { ChartBar as BarChart2, Award } from 'lucide-react-native';

export default function ProgressScreen() {
  const { theme } = useTheme();
  const colors = getTheme(theme);
  const [messageCounts, setMessageCounts] = useState({});

  // Load and update message counts
  useEffect(() => {
    const loadMessageCounts = async () => {
      const counts = await storage.getMessageCounts();
      setMessageCounts(counts);
    };

    loadMessageCounts();

    // Set up an interval to refresh counts periodically
    const interval = setInterval(loadMessageCounts, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total teachers chatted with
  const teachersChatted = Object.values(messageCounts).filter(count => count > 0).length;

  // Calculate total messages
  const totalMessages = Object.values(messageCounts).reduce((sum: number, count: number) => sum + count, 0);

  // Get current achievement level and progress
  const getCurrentAchievementAndProgress = (messageCount: number) => {
    // Always start with the first achievement level
    const firstLevel = ACHIEVEMENTS[0];
    
    // If no messages, show progress towards first achievement
    if (messageCount === 0) {
      return {
        current: firstLevel,
        next: firstLevel,
        progress: 0
      };
    }

    // If we haven't reached the first achievement yet
    if (messageCount < firstLevel.messageCount) {
      return {
        current: firstLevel,
        next: firstLevel,
        progress: (messageCount / firstLevel.messageCount) * 100
      };
    }

    // Find the highest achieved level
    let currentLevel = 0;
    for (let i = 0; i < ACHIEVEMENTS.length; i++) {
      if (messageCount >= ACHIEVEMENTS[i].messageCount) {
        currentLevel = i;
      } else {
        break;
      }
    }

    const currentAchievement = ACHIEVEMENTS[currentLevel];
    const nextAchievement = ACHIEVEMENTS[currentLevel + 1] || currentAchievement;

    // Calculate progress to next level
    const messagesInCurrentLevel = messageCount - currentAchievement.messageCount;
    const messagesNeededForNextLevel = nextAchievement.messageCount - currentAchievement.messageCount;
    const progress = (messagesInCurrentLevel / messagesNeededForNextLevel) * 100;

    return {
      current: currentAchievement,
      next: nextAchievement,
      progress: Math.min(Math.max(progress, 0), 100) // Ensure progress is between 0 and 100
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.secondaryBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Progress</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: colors.assistantBubble }]}>
          <View style={styles.summaryHeader}>
            <Award size={24} color={colors.activeTab} />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Learning Summary</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{teachersChatted}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Teachers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{totalMessages}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Messages</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <BarChart2 size={20} color={colors.activeTab} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Subject Progress</Text>
        </View>
        
        {PERSONAS.map(persona => {
          const messageCount = messageCounts[persona.id] || 0;
          const { current, next, progress } = getCurrentAchievementAndProgress(messageCount);
          
          return (
            <View 
              key={persona.id} 
              style={[styles.progressCard, { backgroundColor: colors.secondaryBackground }]}
            >
              <Text style={[styles.subjectName, { color: colors.text }]}>
                {persona.subject} {messageCount > 0 && current.badge}
              </Text>
              <Text style={[styles.teacherName, { color: colors.secondaryText }]}>with {persona.name}</Text>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { backgroundColor: colors.border }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.activeTab,
                      width: `${progress}%` 
                    }
                  ]} 
                />
                <Text style={[styles.progressText, { color: colors.text }]}>
                  {messageCount} / {next.messageCount} messages
                </Text>
              </View>
              
              <View style={styles.levelInfo}>
                <Text style={[styles.achievementText, { color: colors.secondaryText }]}>
                  {current.title} {current.badge}
                </Text>
                {current !== next && (
                  <Text style={[styles.nextLevelText, { color: colors.secondaryText }]}>
                    Next: {next.title} {next.badge}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        
        <View style={[styles.achievementsSection, { backgroundColor: colors.assistantBubble }]}>
          <Text style={[styles.achievementsTitle, { color: colors.text }]}>Achievement Levels</Text>
          
          {ACHIEVEMENTS.map((achievement) => (
            <View 
              key={achievement.level} 
              style={[styles.achievementItem, { borderBottomColor: colors.border }]}
            >
              <Award size={24} color={colors.activeTab} />
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, { color: colors.text }]}>
                  {achievement.title} {achievement.badge}
                </Text>
                <Text style={[styles.achievementDesc, { color: colors.secondaryText }]}>
                  Send {achievement.messageCount} messages
                </Text>
              </View>
            </View>
          ))}
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
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
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
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
  },
  teacherName: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
    position: 'relative',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 5,
    width: '100%',
  },
  progressFill: {
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 5,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: -5,
    fontSize: 14,
    fontWeight: '600',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  achievementText: {
    fontSize: 14,
  },
  nextLevelText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  achievementsSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  achievementInfo: {
    marginLeft: 12,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementDesc: {
    fontSize: 14,
  },
});