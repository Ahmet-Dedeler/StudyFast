import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { AI_MODELS, AIModel } from '@/lib/openai';
import { useTheme } from '@/lib/theme';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onSelectModel: (model: AIModel) => void;
}

export default function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightColors : darkColors;

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelectModel = (model: AIModel) => {
    onSelectModel(model);
    toggleModal();
  };

  const renderModelItem = ({ item }: { item: AIModel }) => {
    const isSelected = selectedModel.id === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.modelItem, { backgroundColor: colors.itemBackground }]}
        onPress={() => handleSelectModel(item)}>
        <View style={styles.modelInfo}>
          <Text style={[styles.modelName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.modelDescription, { color: colors.secondaryText }]}>
            {item.description}
          </Text>
        </View>
        {isSelected && <Check size={20} color={colors.accent} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: colors.selectorBackground }]}
        onPress={toggleModal}>
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {selectedModel.name}
        </Text>
        <ChevronDown size={16} color={colors.text} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}>
        <Pressable
          style={styles.modalOverlay}
          onPress={toggleModal}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.modalBackground }
            ]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Model</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={[styles.closeButton, { color: colors.accent }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={AI_MODELS}
              renderItem={renderModelItem}
              keyExtractor={(item) => item.id}
              style={styles.modelList}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    minWidth: 90,
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modelList: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  modelDescription: {
    fontSize: 14,
  },
});

const lightColors = {
  text: '#000000',
  secondaryText: '#8E8E93',
  accent: '#007AFF',
  selectorBackground: 'rgba(0, 0, 0, 0.05)',
  modalBackground: '#FFFFFF',
  itemBackground: '#F2F2F7',
  border: '#C6C6C8',
};

const darkColors = {
  text: '#FFFFFF',
  secondaryText: '#8E8E93',
  accent: '#0A84FF',
  selectorBackground: 'rgba(255, 255, 255, 0.1)',
  modalBackground: '#1C1C1E',
  itemBackground: '#2C2C2E',
  border: '#38383A',
};