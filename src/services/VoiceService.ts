import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { COLORS, AZURE } from '../constants';
import { Transcript } from '../types';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  durationMillis: number;
  startTime: Date | null;
  uri: string | null;
  error: string | null;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  segments: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private recordingStartTime: number = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private recordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    durationMillis: 0,
    startTime: null,
    uri: null,
    error: null,
  };

  private updateDuration = () => {
    if (this.recordingStartTime && this.recordingState.isRecording) {
      const duration = (Date.now() - this.recordingStartTime) / 1000;
      this.recordingState = {
        ...this.recordingState,
        duration,
      };
    }
  };

  // Initialize audio permissions and settings
  async initialize(): Promise<void> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Reset recording state
      this.recordingState = {
        isRecording: false,
        isPaused: false,
        duration: 0,
        durationMillis: 0,
        startTime: null,
        uri: null,
        error: null,
      };

      console.log('VoiceService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VoiceService:', error);
      throw error;
    }
  }

  // Pause recording
  async pauseRecording(): Promise<void> {
    try {
      console.log('Attempting to pause recording...');
      
      if (!this.recording || !this.recordingState.isRecording) {
        throw new Error('No active recording to pause');
      }

      await this.recording.pauseAsync();
      // ...existing code...
    } catch (error) {
      // ...existing code...
    }
  }
  // ...existing code...
}

// Export the singleton instance
