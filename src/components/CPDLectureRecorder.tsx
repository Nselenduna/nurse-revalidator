import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants';
import { styles } from '../styles/CPDLectureRecorder.styles';
import { useCPDRecording } from '../hooks/useCPDRecording';

interface CPDLectureRecorderProps {
  onSave?: (cpdLog: any) => void;
  initialTitle?: string;
}

export const CPDLectureRecorder: React.FC<CPDLectureRecorderProps> = ({
  onSave,
  initialTitle = '',
}) => {
  console.log('CPDLectureRecorder component rendering with props:', { onSave: !!onSave, initialTitle });
  
  const {
    isRecording,
    isPaused,
    isSummarizing,
    isSaving,
    recordingSession,
    summary,
    tags,
    notes,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    generateSummary,
    updateTags,
    updateNotes,
    saveCPDLog,
    clearRecording,
    error,
  } = useCPDRecording();

  const [title, setTitle] = useState(initialTitle);
  const [tagInput, setTagInput] = useState('');

  console.log('CPDLectureRecorder state:', { 
    isRecording, 
    isSummarizing, 
    isSaving, 
    recordingSession: !!recordingSession, 
    summary: summary?.length, 
    error 
  });

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const handlePauseRecording = async () => {
    try {
      await pauseRecording();
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to pause recording.');
    }
  };

  const handleResumeRecording = async () => {
    try {
      await resumeRecording();
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to resume recording.');
    }
  };

  const handleStopRecording = async () => {
    console.log('handleStopRecording called');
    try {
      await stopRecording();
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to stop recording.');
    }
  };

  const handleGenerateSummary = async () => {
    console.log('handleGenerateSummary called');
    try {
      await generateSummary();
    } catch (err) {
      Alert.alert('Summary Error', 'Failed to generate summary.');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = [...tags, tagInput.trim()];
      updateTags(newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    updateTags(newTags);
  };

  const handleSave = async () => {
    console.log('handleSave called');
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your CPD log.');
      return;
    }

    if (!recordingSession) {
      Alert.alert('No Recording', 'Please record a lecture before saving.');
      return;
    }

    if (!summary.trim()) {
      Alert.alert('No Summary', 'Please generate a summary before saving.');
      return;
    }

    try {
      const cpdLog = await saveCPDLog();
      if (cpdLog) {
        onSave?.(cpdLog);
        Alert.alert('Success', 'CPD log saved successfully!');
      }
    } catch (err) {
      Alert.alert('Save Error', 'Failed to save CPD log.');
    }
  };

  const handleClear = () => {
    console.log('handleClear called');
    Alert.alert(
      'Clear Recording',
      'Are you sure you want to clear the current recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearRecording();
            setTitle('');
            setTagInput('');
          },
        },
      ]
    );
  };

  console.log('CPDLectureRecorder about to render UI');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Record CPD Lecture</Text>
          <Text style={styles.subtitle}>
            Record your lecture and get an AI-generated summary
          </Text>
        </View>

        {/* Title Input Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Lecture Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter lecture title..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
          />
        </View>

        {/* Recording Controls Section */}
        <View style={styles.recordingContainer}>
          <View style={styles.recordingStatus}>
            {isRecording || isPaused ? (
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, isPaused && styles.recordingDotPaused]} />
                <Text style={styles.recordingText}>
                  {isRecording ? 'Recording Lecture...' : 'Recording Paused'}
                </Text>
              </View>
            ) : (
              <Text style={styles.readyText}>Ready to record</Text>
            )}
          </View>

          {/* Recording Controls */}
          <View style={styles.recordingButtons}>
            {!isRecording && !isPaused ? (
              // Show Start Recording button when not recording and not paused
              <TouchableOpacity
                style={[styles.button, styles.recordButton]}
                onPress={handleStartRecording}
                disabled={isSummarizing || isSaving}
              >
                <Text style={styles.buttonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              // Show Pause/Resume and Stop buttons when recording or paused
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, !isRecording ? styles.resumeButton : styles.pauseButton]}
                  onPress={!isRecording ? handleResumeRecording : handlePauseRecording}
                >
                  <Text style={styles.buttonText}>
                    {!isRecording ? 'Resume' : 'Pause'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.stopButton]}
                  onPress={handleStopRecording}
                >
                  <Text style={styles.buttonText}>Stop</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {recordingSession && !isRecording && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionText}>
              Duration: {recordingSession.duration}s | 
              Status: {recordingSession.status}
            </Text>
          </View>
        )}

        {/* Summary Section */}
        {recordingSession && !isRecording && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Text style={styles.label}>AI Summary</Text>
              <TouchableOpacity
                style={[styles.actionButton, isSummarizing && styles.disabledButton]}
                onPress={handleGenerateSummary}
                disabled={isSummarizing}
              >
                {isSummarizing ? (
                  <ActivityIndicator size="small" color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {summary ? 'Regenerate' : 'Generate'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {summary ? (
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryText}>{summary}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>
                Click "Generate" to create an AI summary of the lecture
              </Text>
            )}
          </View>
        )}

        {/* Tags Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tags (e.g., patient safety, leadership)"
              placeholderTextColor={COLORS.TEXT_DISABLED}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
              disabled={!tagInput.trim()}
            >
              <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tagItem}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Text style={styles.removeTagText}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={updateNotes}
            placeholder="Add any additional notes or reflections..."
            placeholderTextColor={COLORS.TEXT_DISABLED}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={!title.trim() || !recordingSession || !summary.trim() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Save CPD Log</Text>
            )}
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

        {/* Loading Overlay */}
        {(isSummarizing || isSaving) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>
              {isSummarizing ? 'Generating summary...' : 'Saving CPD log...'}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CPDLectureRecorder;
