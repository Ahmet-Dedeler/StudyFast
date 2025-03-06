import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Switch, TouchableOpacity } from 'react-native';
import { useOpenAI, AI_MODELS } from '@/lib/openai';
import { PERSONAS } from '@/lib/personas';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, getTheme } from '@/lib/theme';
import { Check } from 'lucide-react-native';

export default function DebugScreen() {
  const { theme } = useTheme();
  const colors = getTheme(theme);
  
  const [message, setMessage] = useState('Hello, can you help me with studying?');
  const [response, setResponse] = useState('');
  const [modelId, setModelId] = useState('gpt-4o');
  const [systemPrompt, setSystemPrompt] = useState(PERSONAS[0].systemPrompt);
  
  const { sendMessage, isLoading, error, apiUrl } = useOpenAI();

  const handleSendMessage = async () => {
    try {
      const result = await sendMessage(message, modelId, systemPrompt);
      setResponse(result);
    } catch (err) {
      setResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Check if the selected model requires special handling
  const isSpecialModel = modelId === 'o1' || modelId === 'o3-mini';
  
  const selectModel = (id: string) => {
    setModelId(id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>API Debug Screen</Text>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>API Configuration</Text>
          <Text style={[styles.label, { color: colors.text }]}>API URL:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{apiUrl}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Chat API</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Message:</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground || colors.card }]}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Model ID:</Text>
          <View style={styles.modelButtonsContainer}>
            {AI_MODELS.map(model => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelButton,
                  { 
                    backgroundColor: colors.card,
                    borderColor: modelId === model.id ? colors.primary : colors.border,
                    borderWidth: modelId === model.id ? 2 : 1
                  }
                ]}
                onPress={() => selectModel(model.id)}
              >
                <View style={styles.modelButtonContent}>
                  <Text 
                    style={[
                      styles.modelButtonText, 
                      { 
                        color: colors.text,
                        fontWeight: modelId === model.id ? 'bold' : 'normal'
                      }
                    ]}
                  >
                    {model.name}
                  </Text>
                  {modelId === model.id && (
                    <Check size={16} color={colors.primary} style={styles.checkIcon} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.label, { color: colors.text }]}>Custom Model ID (optional):</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                borderColor: colors.border, 
                color: colors.text, 
                backgroundColor: colors.inputBackground || colors.card,
                fontWeight: 'bold'
              }
            ]}
            value={modelId}
            onChangeText={setModelId}
            placeholder="Enter custom model ID here"
            placeholderTextColor={colors.placeholderText || '#999'}
          />
          
          {isSpecialModel && (
            <View style={styles.noteContainer}>
              <Text style={[styles.noteText, { color: colors.text }]}>
                Note: {modelId} uses 'max_completion_tokens' instead of 'max_tokens', 'developer' role instead of 'system' role, and doesn't support the 'temperature' parameter
              </Text>
            </View>
          )}
          
          <Text style={[styles.label, { color: colors.text }]}>System Prompt:</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground || colors.card }]}
            value={systemPrompt}
            onChangeText={setSystemPrompt}
            multiline
          />
          
          <View style={styles.row}>
            <Button 
              title="Send Message" 
              onPress={handleSendMessage} 
              disabled={isLoading}
              color={colors.primary}
            />
            {isLoading && <ActivityIndicator style={styles.loader} size="small" color={colors.primary} />}
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error.message}</Text>
            </View>
          )}
          
          {response ? (
            <View style={[styles.responseContainer, { borderColor: colors.border }]}>
              <Text style={[styles.responseLabel, { color: colors.text }]}>Response:</Text>
              <Text style={[styles.responseText, { color: colors.text }]}>{response}</Text>
            </View>
          ) : null}
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Models</Text>
          {AI_MODELS.map(model => (
            <View key={model.id} style={styles.modelItem}>
              <Text style={[styles.modelName, { color: colors.text }]}>{model.name} ({model.id})</Text>
              <Text style={[styles.modelDescription, { color: colors.text }]}>{model.description}</Text>
              {(model.id === 'o1' || model.id === 'o3-mini') && (
                <View>
                  <Text style={[styles.modelNote, { color: colors.warning || '#f57c00' }]}>
                    Uses max_completion_tokens parameter
                  </Text>
                  <Text style={[styles.modelNote, { color: colors.warning || '#f57c00' }]}>
                    Uses developer role instead of system role
                  </Text>
                  <Text style={[styles.modelNote, { color: colors.warning || '#f57c00' }]}>
                    Doesn't support temperature parameter
                  </Text>
                </View>
              )}
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    minHeight: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loader: {
    marginLeft: 10,
  },
  responseContainer: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginTop: 16,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  noteContainer: {
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  modelButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  modelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  modelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  modelItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  modelNote: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
}); 