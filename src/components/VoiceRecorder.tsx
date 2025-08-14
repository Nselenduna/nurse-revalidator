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
import { voiceService } from '../services/VoiceService';

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
    isPaused,
    isTranscribing,
    transcription,
    suggestions,
    startRecording,
    pauseRecording,
    resumeRecording,
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

  const handleStartPauseRecording = async () => {
    console.log('handleStartPauseRecording called');
    try {
      // Don't try to set error directly as it comes from the hook
      
      if (isRecording && !isPaused) {
        await pauseRecording();
      } else if (isPaused) {
        await resumeRecording();
      } else {
        await startRecording();
      }
    } catch (err) {
      console.error('Recording error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown recording error';
      
      // Don't show "Already recording" error to user, just log it
      if (errorMessage.includes('Already recording')) {
        console.log('Recording already in progress, ignoring duplicate start request');
        return;
      }
      
      // Show user-friendly error message
      const userFriendlyMessage = errorMessage.includes('permission') 
        ? 'Microphone permission required. Please enable microphone access in your device settings.'
        : 'Failed to start/pause/resume recording. Please try again.';
      
      Alert.alert('Recording Error', userFriendlyMessage);
    }
  };

  const handleStopRecording = async () => {
    console.log('handleStopRecording called');
    try {
      // First try to stop recording
      try {
        await stopRecording();
      } catch (stopError) {
        console.warn('Error stopping recording:', stopError);
        // Don't throw here, still try to transcribe if we have a recording
      }

      // Check if we have a recording state with URI before transcribing
      const recordingState = voiceService.getRecordingState();
      if (recordingState.uri) {
        console.log('Recording stopped, proceeding with transcription');
        try {
          await transcribeRecording();
        } catch (transcribeError) {
          console.error('Transcription error:', transcribeError);
          Alert.alert(
            'Transcription Error',
            'Failed to transcribe recording. Please try again or save the audio for later.'
          );
        }
      } else {
        console.log('No recording URI available');
        Alert.alert('Note', 'No recording was captured. Please try recording again.');
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Show user-friendly error message
      const userFriendlyMessage = errorMessage.includes('No active recording')
        ? 'No recording to stop. Please start recording first.'
        : 'Failed to stop recording. Please try again.';
      
      Alert.alert('Recording Error', userFriendlyMessage);
    }
  };

  const handleEnhance = async () => {
    console.log('handleEnhance called');
    try {
      await enhanceTranscription();
    } catch (err) {
      console.error('Enhancement error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Show user-friendly error message
      const userFriendlyMessage = errorMessage.includes('No transcription')
        ? 'No transcription to enhance. Please record and transcribe first.'
        : 'Failed to enhance transcription. Please try again.';
      
      Alert.alert('Enhancement Error', userFriendlyMessage);
    }
  };

  const handleSave = async () => {
    console.log('handleSave called');
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your transcript.');
      return;
    }

    try {
      // If currently recording, stop the recording first
      if (isRecording) {
        const result = await stopRecording();
        if (result !== undefined) {
          await transcribeRecording();
        }
      }

      // Now check if we have content
      if (!transcription.trim()) {
        Alert.alert('Missing Content', 'Please ensure the recording is transcribed before saving.');
        return;
      }

      const transcriptData = {
        title: title.trim(),
        content: transcription.trim(),
        tags: tags.trim(),
      };

      console.log('Saving transcript data:', transcriptData);
      onSave?.(transcriptData);
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Show user-friendly error message
      const userFriendlyMessage = errorMessage.includes('transcription')
        ? 'Failed to transcribe recording. Please try again.'
        : 'Failed to save transcript. Please try again.';
      
      Alert.alert('Error', userFriendlyMessage);
    }
  };

  const handleClear = () => {
    console.log('handleClear called');
    
    // Check if there's anything to clear
    if (!transcription.trim() && !title.trim() && !tags.trim()) {
      Alert.alert('Nothing to Clear', 'There is no content to clear.');
      return;
    }
    
    Alert.alert(
      'Clear Transcript',
      'Are you sure you want to clear the current transcript?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            try {
              clearTranscription();
              setTitle('');
              setTags('');
              setIsEditing(false);
              console.log('Content cleared successfully');
            } catch (err) {
              console.error('Failed to clear content:', err);
              Alert.alert('Error', 'Failed to clear content. Please try again.');
            }
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
              <View style={[styles.recordingDot, isPaused && styles.pausedDot]} />
              <Text style={styles.recordingText}>
                {isPaused ? 'Paused...' : 'Recording...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.readyText}>Ready to record</Text>
          )}
        </View>

        <View style={styles.recordingButtonsRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.controlButton,
              isRecording && !isPaused ? styles.recordingButton : 
              isPaused ? styles.pauseButton : styles.startButton
            ]}
            onPress={handleStartPauseRecording}
            disabled={isTranscribing}
          >
            <Text style={styles.buttonText}>
              {isRecording && !isPaused ? 'Pause' : 
               isPaused ? 'Resume' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.controlButton,
              styles.stopButton,
              (!isRecording || isTranscribing) && styles.disabledButton
            ]}
            onPress={handleStopRecording}
            disabled={!isRecording || isTranscribing}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Show recording status */}
        {isRecording && (
          <View style={styles.recordingStatusContainer}>
            <Text style={styles.recordingStatusText}>
              {isPaused ? 'Recording paused - tap Resume to continue' : 'Recording in progress...'}
            </Text>
          </View>
        )}

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
          disabled={!title.trim() || ((!isRecording && !transcription.trim()) || isTranscribing)}
        >
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop and Save' : 
             transcription.trim() ? 'Save Transcript' : 'Save (requires transcription)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button, 
            styles.clearButton,
            (!transcription.trim() && !title.trim() && !tags.trim()) && styles.disabledButton
          ]}
          onPress={handleClear}
          disabled={!transcription.trim() && !title.trim() && !tags.trim()}
        >
          <Text style={[styles.buttonText, styles.clearButtonText]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && !error.includes('Already recording') && !error.includes('No active recording') && 
       !error.includes('No recording to resume') && !error.includes('already active') && 
       !error.includes('not currently active') && !error.includes('No recording to pause') && 
       !error.includes('No recording to stop') && !error.includes('No recording available') && 
       !error.includes('No transcription to enhance') && !error.includes('No transcription available') && 
       !error.includes('No content to clear') && !error.includes('Nothing to clear') && 
       !error.includes('No recording was active') && !error.includes('No recording to pause') && 
       !error.includes('No recording to resume') && !error.includes('No recording to stop') && 
       !error.includes('No recording was active to stop') && !error.includes('No recording to pause') && (
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
  recordingButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  button: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    flex: 1,
    maxWidth: 150,
    minHeight: 48,
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  pauseButton: {
    backgroundColor: COLORS.WARNING,
  },
  recordingButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY_400,
    opacity: 0.7,
  },
  buttonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
    textAlign: 'center',
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
    maxHeight: 400, // Add maximum height
    flex: 1, // Allow container to grow
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
    maxHeight: 400,
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
  pausedDot: {
    backgroundColor: COLORS.WARNING,
  },
  recordingStatusContainer: {
    alignItems: 'center',
    marginTop: SPACING.SM,
  },
  recordingStatusText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_600,
    fontStyle: 'italic',
  },
}); 