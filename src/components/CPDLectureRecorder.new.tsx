import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants';
import { TYPOGRAPHY } from '../constants/typography';
import { useCPDRecording } from '../hooks/useCPDRecording';
import { ErrorMessage } from './ErrorBoundary';

interface CPDLectureRecorderProps {
  onSave?: (cpdLog: any) => void;
  initialTitle?: string;
}

export const CPDLectureRecorder: React.FC<CPDLectureRecorderProps> = ({
  onSave,
  initialTitle = '',
}) => {
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
    error: recordingError,
  } = useCPDRecording();

  const [title, setTitle] = useState(initialTitle);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (recordingError) {
      setError(recordingError);
    }
  }, [recordingError]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startRecording();
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      setError(null);
      await stopRecording();
    } catch (err) {
      setError('Failed to stop recording.');
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setError(null);
      await generateSummary();
    } catch (err) {
      setError('Failed to generate summary.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your CPD log.');
      return;
    }

    try {
      setError(null);
      const cpdLog = await saveCPDLog();
      if (cpdLog) {
        onSave?.(cpdLog);
        Alert.alert('Success', 'CPD log saved successfully!');
      }
    } catch (err) {
      setError('Failed to save CPD log.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Record CPD Lecture</Text>
          <Text style={styles.subtitle}>
            Record your lecture and get an AI-generated summary
          </Text>
        </View>

        <View style={styles.recordingSection}>
          <View style={styles.recordingHeader}>
            <Text style={styles.recordingStatus}>
              {isRecording ? 'Recording...' : 'Ready to record'}
            </Text>
            {isRecording && (
              <Text style={styles.duration}>Duration: {formatDuration(duration)}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              isRecording ? styles.stopButton : styles.startButton,
            ]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter lecture title..."
            placeholderTextColor={COLORS.GRAY_400}
          />
        </View>

        {summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.label}>AI Summary</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={summary}
              multiline
              scrollEnabled
              editable={false}
            />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Save CPD Log</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          type="error"
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: TYPOGRAPHY.HEADER.MEDIUM.fontSize,
    fontWeight: 'bold',
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.BODY.MEDIUM.fontSize,
    color: COLORS.GRAY_600,
    marginBottom: 24,
  },
  recordingSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingStatus: {
    fontSize: TYPOGRAPHY.BODY.MEDIUM.fontSize,
    fontWeight: '500',
    color: COLORS.PRIMARY,
  },
  duration: {
    fontSize: TYPOGRAPHY.BODY.MEDIUM.fontSize,
    color: COLORS.GRAY_600,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.BUTTON.MEDIUM.fontSize,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: TYPOGRAPHY.LABEL.MEDIUM.fontSize,
    fontWeight: '500',
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
    padding: 12,
    fontSize: TYPOGRAPHY.BODY.MEDIUM.fontSize,
    color: COLORS.GRAY_800,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
});
