import React from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../constants';
import { RootStackParamList } from '../types';
import { VoiceRecorder } from '../components/VoiceRecorder';
import databaseService from '../services/DatabaseService';

type VoiceRecorderScreenRouteProp = RouteProp<RootStackParamList, 'VoiceRecorder'>;
type VoiceRecorderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VoiceRecorder'>;

const VoiceRecorderScreen: React.FC = () => {
  console.log('VoiceRecorderScreen rendering...');
  
  const navigation = useNavigation<VoiceRecorderScreenNavigationProp>();
  const route = useRoute<VoiceRecorderScreenRouteProp>();
  const { mode = 'transcript' } = route.params || {};

  const handleSaveTranscript = async (transcriptData: {
    title: string;
    content: string;
    tags: string;
  }) => {
    console.log('handleSaveTranscript called with:', transcriptData);
    
    try {
      const transcript: any = {
        title: transcriptData.title,
        content: transcriptData.content,
        tags: transcriptData.tags,
        isEnhanced: true,
        aiSuggestions: [],
      };

      console.log('Saving transcript:', transcript);
      const result = await databaseService.saveTranscript(transcript);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Transcript saved successfully!',
          [
            {
              text: 'View Transcripts',
              onPress: () => navigation.navigate('Transcript' as any),
            },
            {
              text: 'Continue Recording',
              style: 'cancel',
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to save transcript');
      }
    } catch (error) {
      console.error('Failed to save transcript:', error);
      Alert.alert('Error', 'Failed to save transcript. Please try again.');
    }
  };

  console.log('VoiceRecorderScreen about to render VoiceRecorder component');
  
  return (
    <SafeAreaView style={styles.container}>
      <VoiceRecorder
        onSave={handleSaveTranscript}
        mode={mode}
        initialTitle={mode === 'lecture' ? 'Lecture Recording' : 'Nursing Reflection'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});

export default VoiceRecorderScreen; 