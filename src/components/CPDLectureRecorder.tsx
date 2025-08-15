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
    isSummarizing,
    isSaving,
    recordingSession,
    summary,
    tags,
    notes,
    startRecording,
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
    console.log('handleStartRecording called');
    try {
      await startRecording();
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to start recording. Please check microphone permissions.');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>CPD Lecture Recorder</Text>
        <Text style={styles.subtitle}>Record lectures and generate AI summaries for CPD logging</Text>
      </View>

      {/* Title Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Lecture Title</Text>
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter the lecture title..."
          placeholderTextColor={COLORS.TEXT_DISABLED}
        />
      </View>

      {/* Recording Controls */}
      <View style={styles.recordingContainer}>
        <View style={styles.recordingStatus}>
          {isRecording ? (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording Lecture...</Text>
            </View>
          ) : (
            <Text style={styles.readyText}>Ready to record lecture</Text>
          )}
        </View>

        <View style={styles.recordingButtons}>
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.button, styles.recordButton]}
              onPress={handleStartRecording}
              disabled={isSummarizing || isSaving}
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

        {recordingSession && !isRecording && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionText}>
              Duration: {recordingSession.duration}s | 
              Status: {recordingSession.status}
            </Text>
          </View>
        )}
      </View>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XL,
  },
  header: {
    marginBottom: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.H1,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
  },
  inputContainer: {
    marginBottom: SPACING.LG,
  },
  label: {
    ...TYPOGRAPHY.LABEL,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    minWidth: 150,
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
  sessionInfo: {
    marginTop: SPACING.MD,
    alignItems: 'center',
  },
  sessionText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  summaryContainer: {
    marginBottom: SPACING.LG,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  actionButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY_500,
  },
  actionButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  summaryTextContainer: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.GRAY_50,
  },
  summaryText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  },
  placeholderText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_DISABLED,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.MD,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    marginRight: SPACING.SM,
  },
  addTagButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    justifyContent: 'center',
  },
  addTagButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: COLORS.PRIMARY + '20',
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY,
    marginRight: SPACING.XS,
  },
  removeTagText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.LG,
  },
  saveButton: {
    backgroundColor: COLORS.SUCCESS,
    flex: 2,
    marginRight: SPACING.SM,
  },
  clearButton: {
    backgroundColor: COLORS.GRAY_200,
    flex: 1,
    marginLeft: SPACING.SM,
  },
  clearButtonText: {
    color: COLORS.GRAY_700,
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR + '20',
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    marginTop: SPACING.MD,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.ERROR,
    textAlign: 'center',
  },
}); 