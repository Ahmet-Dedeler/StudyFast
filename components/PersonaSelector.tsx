import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import { PERSONAS, Persona } from '@/lib/personas';
import { useTheme } from '@/lib/theme';

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

export default function PersonaSelector({ selectedPersona, onSelectPersona }: PersonaSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightColors : darkColors;

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelectPersona = (persona: Persona) => {
    onSelectPersona(persona);
    toggleModal();
  };

  const renderPersonaItem = ({ item }: { item: Persona }) => {
    const isSelected = selectedPersona.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.personaItem,
          { backgroundColor: colors.itemBackground },
          isSelected && { borderColor: colors.accent, borderWidth: 2 }
        ]}
        onPress={() => handleSelectPersona(item)}>
        <Image source={{ uri: item.avatar }} style={styles.personaAvatar} />
        <Text style={[styles.personaName, { color: colors.text }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal} style={styles.avatarContainer}>
        <Image
          source={{ uri: selectedPersona.avatar }}
          style={styles.selectedAvatar}
        />
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Persona</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={[styles.closeButton, { color: colors.accent }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={PERSONAS}
              renderItem={renderPersonaItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.personaList}
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
  avatarContainer: {
    padding: 5,
  },
  selectedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  personaList: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  personaItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  personaAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  personaName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

const lightColors = {
  text: '#000000',
  secondaryText: '#8E8E93',
  accent: '#007AFF',
  modalBackground: '#FFFFFF',
  itemBackground: '#F2F2F7',
  border: '#C6C6C8',
};

const darkColors = {
  text: '#FFFFFF',
  secondaryText: '#8E8E93',
  accent: '#0A84FF',
  modalBackground: '#1C1C1E',
  itemBackground: '#2C2C2E',
  border: '#38383A',
};