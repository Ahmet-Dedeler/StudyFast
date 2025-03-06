import { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERSONAS, Persona } from './personas';

// API URL for the server
const API_URL = 'YOUR_API_URL (SERVER FOLDER)';

// Add a test mode flag for debugging
const TEST_MODE = false;

// Local storage keys
const STORAGE_KEYS = {
  CHAT_HISTORY: 'chat_history',
  MESSAGE_COUNTS: 'message_counts',
  USER_PROFILE: 'user_profile',
};

export type AIModel = {
  id: string;
  name: string;
  description: string;
};

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Fast, intelligent, flexible GPT model'
  },
  {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    description: 'Largest and most capable GPT model'
  },
  {
    id: 'o1',
    name: 'o1',
    description: 'High-intelligence reasoning model'
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    description: 'Fast, flexible, intelligent reasoning model'
  }
];

export type Achievement = {
  level: number;
  messageCount: number;
  badge: string;
  title: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { level: 1, messageCount: 5, badge: '🌱', title: 'Beginner' },
  { level: 2, messageCount: 10, badge: '🌿', title: 'Curious Mind' },
  { level: 3, messageCount: 25, badge: '🌳', title: 'Knowledge Seeker' },
  { level: 4, messageCount: 50, badge: '🎓', title: 'Scholar' },
  { level: 5, messageCount: 100, badge: '⭐', title: 'Master' },
];

export type UserProfile = {
  educationLevel: 'high_school' | 'university' | 'professional';
  learningStyle: string;
  interests: string[];
  additionalInfo: string;
};

// Local storage functions
export const storage = {
  async saveChats(personaId: string, messages: any[]) {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY}_${personaId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  },

  async getChats(personaId: string) {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY}_${personaId}`;
      const chats = await AsyncStorage.getItem(key);
      return chats ? JSON.parse(chats) : [];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  },

  async incrementMessageCount(personaId: string) {
    try {
      const counts = await this.getMessageCounts();
      counts[personaId] = (counts[personaId] || 0) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGE_COUNTS, JSON.stringify(counts));
      return counts[personaId];
    } catch (error) {
      console.error('Error incrementing message count:', error);
      return 0;
    }
  },

  async getMessageCounts() {
    try {
      const counts = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGE_COUNTS);
      return counts ? JSON.parse(counts) : {};
    } catch (error) {
      console.error('Error getting message counts:', error);
      return {};
    }
  },

  async saveUserProfile(profile: UserProfile) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async clearAllData() {
    try {
      // Get all keys from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter keys that belong to our app
      const appKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.CHAT_HISTORY) ||
        key === STORAGE_KEYS.MESSAGE_COUNTS ||
        key === STORAGE_KEYS.USER_PROFILE
      );
      
      // Remove all app data
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
};

export function useOpenAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (
    message: string, 
    modelId: string = 'gpt-4o',
    systemPrompt: string = PERSONAS[0]?.systemPrompt || "You are a helpful AI assistant.",
    userProfile: UserProfile | null = null
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    // If in test mode, return a mock response
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setIsLoading(false);
      return `This is a test response. You asked: "${message}"`;
    }
    
    try {
      console.log(`Sending request to ${API_URL}`);
      console.log('Request payload:', { message, modelId, systemPrompt });
      
      // Determine if we need to use max_completion_tokens instead of max_tokens
      // o1 and o3-mini models require max_completion_tokens
      const usesCompletionTokens = modelId === 'o1' || modelId === 'o3-mini';
      console.log(`Model ${modelId} uses completion tokens: ${usesCompletionTokens}`);
      
      // Call our server API instead of OpenAI directly
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message,
          modelId,
          systemPrompt,
          userProfile,
          // Pass information about which token parameter to use
          usesCompletionTokens
        }),
        credentials: 'omit',
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Received non-JSON response:', text);
        
        // Try to create a JSON-like object from the text
        data = { error: `Server returned non-JSON response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}` };
      }
      
      if (!response.ok) {
        console.error('API error response:', data);
        
        let errorMessage = data.error || `Server error: ${response.status}`;
        if (data.message) {
          errorMessage += ` - ${data.message}`;
        }
        
        throw new Error(errorMessage);
      }
      
      if (!data.content) {
        console.warn('API response missing content property:', data);
      }
      
      setIsLoading(false);
      return data.content || 'Sorry, I couldn\'t generate a response.';
    } catch (err) {
      setIsLoading(false);
      
      // Detect CORS errors which show up as network errors without much detail
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      const isCorsError = err instanceof TypeError && 
        (errorMessage.includes('Failed to fetch') || 
         errorMessage.includes('Network request failed'));
      
      const formattedError = isCorsError 
        ? new Error('CORS error: The server is not allowing requests from this origin. This is likely a server configuration issue.') 
        : (err instanceof Error ? err : new Error(errorMessage));
      
      setError(formattedError);
      console.error('API error:', formattedError.message);
      
      // Return a user-friendly error message
      if (isCorsError) {
        return "I'm sorry, but I can't connect to our server right now. This might be due to network issues or server configuration. Please try again later or contact support.";
      }
      
      // Return a fallback response in case of error
      return `I'm sorry, I couldn't process your request due to a technical issue. Please try again later. (Error: ${formattedError.message})`;
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    apiUrl: API_URL // Export the API URL for debugging
  };
}
