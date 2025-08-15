import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

interface VoiceRecorderProps {
  onSave?: (transcript: { title: string; content: string; tags: string }) => void;
  initialTitle?: string;
  mode?: 'transcript' | 'lecture';
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSave,
  initialTitle = '',
  mode = 'transcript',
}) => {
  console.log('VoiceRecorder component rendering with props:', { onSave: !!onSave, initialTitle, mode });
  
  const {
    isRecording,
    isTranscribing,
    transcription,
    suggestions,
    startRecording,
    stopRecording,
    transcribeRecording,
    enhanceTranscription,
    clearTranscription,
    error,
  } = useVoiceRecording();

  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  console.log('VoiceRecorder state:', { isRecording, isTranscribing, transcription: transcription?.length, error });

  const handleStartRecording = async () => {
    console.log('handleStartRecording called');
    try {
      await startRecording();
    } catch (err) {
      console.error('Recording error:', err);
      Alert.alert('Recording Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    console.log('handleStopRecording called');
    try {
      await stopRecording();
      // Automatically start transcription
      await transcribeRecording();
    } catch (err) {
      console.error('Stop recording error:', err);
      Alert.alert('Recording Error', 'Failed to stop recording.');
    }
  };

  const handleEnhance = async () => {
    console.log('handleEnhance called');
    try {
      await enhanceTranscription();
    } catch (err) {
      console.error('Enhancement error:', err);
      Alert.alert('Enhancement Error', 'Failed to enhance transcription.');
    }
  };

  const handleSave = () => {
    console.log('handleSave called');
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your transcript.');
      return;
    }

    if (!transcription.trim()) {
      Alert.alert('Missing Content', 'Please record and transcribe some content before saving.');
      return;
    }

    const transcriptData = {
      title: title.trim(),
      content: transcription.trim(),
      tags: tags.trim(),
    };

    console.log('Saving transcript data:', transcriptData);
    onSave?.(transcriptData);
  };

  const handleClear = () => {
    console.log('handleClear called');
    Alert.alert(
      'Clear Transcript',
      'Are you sure you want to clear the current transcript?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearTranscription();
            setTitle('');
            setTags('');
            setIsEditing(false);
          },
        },
      ]
    );
  };

  console.log('VoiceRecorder about to render UI');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'lecture' ? 'Lecture Recorder' : 'Voice Recorder'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'lecture' 
            ? 'Record and summarize lectures for CPD' 
            : 'Record your nursing reflections'
          }
        </Text>
      </View>

      {/* Title Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title for your transcript..."
          placeholderTextColor={COLORS.TEXT_DISABLED}
        />
      </View>

      {/* Recording Controls */}
      <View style={styles.recordingContainer}>
        <View style={styles.recordingStatus}>
          {isRecording ? (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          ) : (
            <Text style={styles.readyText}>Ready to record</Text>
          )}
        </View>

        <View style={styles.recordingButtons}>
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.button, styles.recordButton]}
              onPress={handleStartRecording}
              disabled={isTranscribing}
            >
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStopRecording}
            >
              <Text style={styles.buttonText}>Stop Recording</Text>
            </TouchableOpacity>
          )}
        </View>

        {isTranscribing && (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            <Text style={styles.transcribingText}>Transcribing...</Text>
          </View>
        )}
      </View>

      {/* Transcription Display */}
      {transcription && (
        <View style={styles.transcriptionContainer}>
          <View style={styles.transcriptionHeader}>
            <Text style={styles.label}>Transcription</Text>
            <View style={styles.transcriptionActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Text style={styles.actionButtonText}>
                  {isEditing ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEnhance}
              >
                <Text style={styles.actionButtonText}>Enhance</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isEditing ? (
            <TextInput
              style={[styles.textInput, styles.transcriptionInput]}
              value={transcription}
              onChangeText={(text) => {
                // Update transcription through the hook
                // This would need to be implemented in the hook
              }}
              multiline
              placeholder="Edit your transcription..."
              placeholderTextColor={COLORS.TEXT_DISABLED}
            />
          ) : (
            <View style={styles.transcriptionTextContainer}>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
          )}
        </View>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.label}>AI Suggestions</Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tags Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tags (optional)</Text>
        <TextInput
          style={styles.textInput}
          value={tags}
          onChangeText={setTags}
          placeholder="Enter tags separated by commas..."
          placeholderTextColor={COLORS.TEXT_DISABLED}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={!transcription.trim() || !title.trim()}
        >
          <Text style={styles.buttonText}>Save Transcript</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
        >
          <Text style={[styles.buttonText, styles.clearButtonText]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
  },
  contentContainer: {
    paddingBottom: SPACING.XL, // Add some padding at the bottom for action buttons
  },
  header: {
    marginBottom: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.H1,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_600,
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR_LIGHT,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.ERROR,
  },
  recordingContainer: {
    marginBottom: SPACING.LG,
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  readyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_600,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.ERROR,
    marginRight: SPACING.SM,
  },
  recordingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.ERROR,
  },
  recordingButtons: {
    alignItems: 'center',
  },
  button: {
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.XL,
    borderRadius: BORDER_RADIUS.LG,
    minWidth: 200,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR,
  },
  buttonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.MD,
  },
  transcribingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY,
    marginLeft: SPACING.SM,
  },
  inputContainer: {
    marginBottom: SPACING.LG,
  },
  label: {
    ...TYPOGRAPHY.LABEL,
    color: COLORS.GRAY_700,
    marginBottom: SPACING.SM,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_900,
  },
  transcriptionContainer: {
    marginBottom: SPACING.LG,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  transcriptionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    marginLeft: SPACING.SM,
  },
  actionButtonText: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    color: COLORS.PRIMARY,
  },
  transcriptionTextContainer: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    minHeight: 120,
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_900,
    textAlignVertical: 'top',
  },
  transcriptionText: {
    // ...TYPOGRAPHY.BODY, // This is now handled by transcriptionTextContainer
    color: COLORS.GRAY_900,
    textAlignVertical: 'top',
  },
  transcriptionInput: {
    backgroundColor: COLORS.GRAY_50,
  },
  suggestionsContainer: {
    marginBottom: SPACING.LG,
  },
  suggestionItem: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
  },
  suggestionText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY_DARK,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.LG,
  },
  saveButton: {
    backgroundColor: COLORS.SUCCESS,
    flex: 2,
    marginLeft: SPACING.SM,
  },
  clearButton: {
    backgroundColor: COLORS.GRAY_200,
    flex: 1,
    marginLeft: SPACING.SM,
  },
  clearButtonText: {
    color: COLORS.GRAY_700,
  },
}); 