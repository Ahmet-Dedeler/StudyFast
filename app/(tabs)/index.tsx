import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { useOpenAI, AI_MODELS, AIModel, storage } from '@/lib/openai';
import { PERSONAS, Persona } from '@/lib/personas';
import { useTheme, getTheme } from '@/lib/theme';
import { useLocalSearchParams } from 'expo-router';
import ModelSelector from '@/components/ModelSelector';
import PersonaSelector from '@/components/PersonaSelector';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

type ChatHistory = {
  [personaId: string]: {
    messages: Message[];
    model: AIModel;
  };
};

export default function StudyScreen() {
  const params = useLocalSearchParams<{ personaId?: string; question?: string; timestamp?: string; immediate?: string }>();
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [selectedPersona, setSelectedPersona] = useState<Persona>(
    params.personaId ? PERSONAS.find(p => p.id === params.personaId)! : PERSONAS[0]
  );
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { sendMessage } = useOpenAI();
  const { theme } = useTheme();
  const colors = getTheme(theme);
  const lastParamsRef = useRef({ personaId: '', question: '', timestamp: '' });
  const isProcessingRef = useRef(false);
  const chatHistoryInitializedRef = useRef<Set<string>>(new Set());

  // Initialize chat history for a persona
  const initializePersonaChat = async (personaId: string) => {
    if (chatHistoryInitializedRef.current.has(personaId)) {
      return;
    }

    const persona = PERSONAS.find(p => p.id === personaId)!;
    const savedChats = await storage.getChats(personaId);

    if (savedChats.length > 0) {
      const messagesWithDates = savedChats.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      setChatHistory(prev => {
        // Don't overwrite any existing messages that might have been added
        const existingMessages = prev[personaId]?.messages || [];
        return {
          ...prev,
          [personaId]: {
            messages: existingMessages.length > 0 ? existingMessages : messagesWithDates,
            model: selectedModel,
          },
        };
      });
    } else {
      setChatHistory(prev => {
        // Don't overwrite any existing messages that might have been added
        const existingMessages = prev[personaId]?.messages || [];
        const welcomeMessage = {
          id: '1',
          text: `Hello! I'm ${persona.name}. How can I help you with ${persona.subject} today?`,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        return {
          ...prev,
          [personaId]: {
            messages: existingMessages.length > 0 ? existingMessages : [welcomeMessage],
            model: selectedModel,
          },
        };
      });
    }

    chatHistoryInitializedRef.current.add(personaId);
  };

  // Handle incoming question from params
  useEffect(() => {
    const handleParams = async () => {
      const { personaId, question, timestamp, immediate } = params;

      // Skip if no personaId or question
      if (!personaId || !question) {
        return;
      }

      // Skip if already processing this exact request
      if (
        isProcessingRef.current &&
        personaId === lastParamsRef.current.personaId &&
        question === lastParamsRef.current.question &&
        timestamp === lastParamsRef.current.timestamp
      ) {
        return;
      }

      // Update last processed params
      lastParamsRef.current = { personaId, question, timestamp };
      isProcessingRef.current = true;

      try {
        // Find and set the target persona
        const targetPersona = PERSONAS.find(p => p.id === personaId);
        if (targetPersona) {
          setSelectedPersona(targetPersona);
        }

        // Initialize chat history for this persona if needed
        if (!chatHistoryInitializedRef.current.has(personaId)) {
          await initializePersonaChat(personaId);
        }

        // Create the user message
        const userMessage: Message = {
          id: Date.now().toString(),
          text: question,
          sender: 'user',
          timestamp: new Date(),
        };

        // Update chat history with the user message
        setChatHistory(prev => {
          const existingMessages = prev[personaId]?.messages || [];
          return {
            ...prev,
            [personaId]: {
              model: selectedModel,
              messages: [...existingMessages, userMessage],
            },
          };
        });

        // Increment message count
        await storage.incrementMessageCount(personaId);

        // Get user profile
        const userProfile = await storage.getUserProfile();

        // Send message to AI
        const response = await sendMessage(
          question,
          selectedModel.id,
          selectedPersona.systemPrompt,
          userProfile
        );

        // Add AI response to chat history
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'assistant',
          timestamp: new Date(),
        };

        setChatHistory(prev => ({
          ...prev,
          [personaId]: {
            ...prev[personaId],
            messages: [...(prev[personaId]?.messages || []), assistantMessage],
          },
        }));

        // Save updated chat history
        await storage.saveChats(personaId, [
          ...(chatHistory[personaId]?.messages || []),
          userMessage,
          assistantMessage,
        ]);

      } catch (error) {
        console.error('Error processing question:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    handleParams();
  }, [params.personaId, params.question, params.timestamp]);

  // Initialize chat history for selected persona
  useEffect(() => {
    if (selectedPersona) {
      initializePersonaChat(selectedPersona.id);
    }
  }, [selectedPersona.id]);

  // Get current messages for the selected persona
  const messages = chatHistory[selectedPersona.id]?.messages || [];

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || inputText;
    if (messageText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    // Update chat history and message count
    const newMessages = [...(messages || []), userMessage];
    setChatHistory(prev => ({
      ...prev,
      [selectedPersona.id]: {
        ...prev[selectedPersona.id],
        messages: newMessages,
      },
    }));
    
    // Increment message count immediately
    await storage.incrementMessageCount(selectedPersona.id);
    
    // Save chat history
    await storage.saveChats(selectedPersona.id, newMessages);
    
    setInputText('');
    setIsLoading(true);

    try {
      // Get user profile for context
      const userProfile = await storage.getUserProfile();
      
      const response = await sendMessage(
        messageText, 
        selectedModel.id,
        selectedPersona.systemPrompt,
        userProfile
      );
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setChatHistory(prev => ({
        ...prev,
        [selectedPersona.id]: {
          ...prev[selectedPersona.id],
          messages: updatedMessages,
        },
      }));
      
      // Save updated chat history
      await storage.saveChats(selectedPersona.id, updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, errorMessage];
      setChatHistory(prev => ({
        ...prev,
        [selectedPersona.id]: {
          ...prev[selectedPersona.id],
          messages: updatedMessages,
        },
      }));
      
      // Save updated chat history
      await storage.saveChats(selectedPersona.id, updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    
    setChatHistory(prev => ({
      ...prev,
      [selectedPersona.id]: {
        ...prev[selectedPersona.id],
        model: model,
      },
    }));
  };

  const handlePersonaChange = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View
        style={[
          styles.messageBubble,
          isUser 
            ? [styles.userBubble, { backgroundColor: colors.userBubble }] 
            : [styles.assistantBubble, { backgroundColor: colors.assistantBubble }],
        ]}>
        {!isUser && (
          <View style={styles.teacherIconContainer}>
            <Image 
              source={{ uri: selectedPersona.avatar }} 
              style={styles.teacherIcon} 
            />
          </View>
        )}
        <View style={isUser ? styles.userTextContainer : styles.assistantTextContainer}>
          <Text 
            style={[
              styles.messageText, 
              isUser 
                ? [styles.userText, { color: colors.userText }] 
                : [styles.assistantText, { color: colors.assistantText }]
            ]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, { color: isUser ? colors.userText : colors.secondaryText, opacity: 0.7 }]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  // Handle Enter key press
  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === 'Enter') {
      Keyboard.dismiss();
      handleSend();
    }
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      edges={['top', 'right', 'left']}
    >
      <View style={styles.contentContainer}>
        <View style={[styles.header, { 
          backgroundColor: colors.secondaryBackground,
          borderBottomColor: colors.border 
        }]}>
          <PersonaSelector 
            selectedPersona={selectedPersona} 
            onSelectPersona={handlePersonaChange} 
          />
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {selectedPersona.name}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
              {selectedPersona.subject}
            </Text>
          </View>
          <ModelSelector 
            selectedModel={selectedModel} 
            onSelectModel={handleModelChange} 
          />
        </View>
        
        <View style={[styles.studyBackground, { backgroundColor: colors.background }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={[styles.overlay, { backgroundColor: theme === 'light' ? 'rgba(255, 248, 238, 0.85)' : 'rgba(42, 32, 24, 0.9)' }]} />
        </View>
        
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: colors.secondaryBackground,
              borderTopColor: colors.border 
            }
          ]}>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border 
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Ask ${selectedPersona.name} a question...`}
              placeholderTextColor={colors.secondaryText}
              multiline
              onKeyPress={handleKeyPress}
              blurOnSubmit={false}
            />
            {isLoading ? (
              <ActivityIndicator color={colors.activeTab} style={styles.sendButton} />
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendButton, 
                  { backgroundColor: colors.activeTab },
                  !inputText.trim() && styles.sendButtonDisabled
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim()}>
                <Send
                  size={20}
                  color={inputText.trim() ? '#FFFFFF' : colors.secondaryText}
                />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    minHeight: 60,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    zIndex: 10,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  studyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    padding: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    position: 'relative',
    flexDirection: 'row',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
    marginLeft: '20%',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    marginRight: '20%',
  },
  teacherIconContainer: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  teacherIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userTextContainer: {
    flex: 1,
  },
  assistantTextContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
  },
  assistantText: {
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: -4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 0.5,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});