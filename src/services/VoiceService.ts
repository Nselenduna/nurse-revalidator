import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { COLORS, NMC } from '../constants';
import { Transcript } from '../types';

export interface RecordingState {
  isRecording: boolean;
  duration: number;
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
  private recordingState: RecordingState = {
    isRecording: false,
    duration: 0,
    uri: null,
    error: null,
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
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('VoiceService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VoiceService:', error);
      throw error;
    }
  }

  // Start recording
  async startRecording(): Promise<void> {
    try {
      if (this.recordingState.isRecording) {
        throw new Error('Already recording');
      }

      const recording = new (Audio as any).Recording();
      await recording.prepareAsync((Audio as any).RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      this.recording = recording;
      this.recordingState = {
        isRecording: true,
        duration: 0,
        uri: null,
        error: null,
      };

      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.recordingState.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Stop recording
  async stopRecording(): Promise<string> {
    try {
      if (!this.recording || !this.recordingState.isRecording) {
        throw new Error('No active recording');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      this.recordingState = {
        isRecording: false,
        duration: 0,
        uri,
        error: null,
      };

      this.recording = null;
      console.log('Recording stopped, URI:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.recordingState.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Get current recording state
  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  // Transcribe audio file (simulated for now - would use real STT service in production)
  async transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
    try {
      // In a real implementation, this would call a speech-to-text service
      // For now, we'll simulate transcription with a placeholder
      console.log('Transcribing audio:', audioUri);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return simulated transcription
      return {
        text: "This is a simulated transcription. In a real implementation, this would contain the actual transcribed text from the audio recording. The nurse would speak about their practice experiences, patient care, and professional development activities.",
        confidence: 0.85,
        segments: [
          {
            text: "This is a simulated transcription.",
            start: 0,
            end: 3.5,
          },
          {
            text: "In a real implementation, this would contain the actual transcribed text from the audio recording.",
            start: 3.5,
            end: 8.2,
          },
          {
            text: "The nurse would speak about their practice experiences, patient care, and professional development activities.",
            start: 8.2,
            end: 12.0,
          },
        ],
      };
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      throw error;
    }
  }

  // Generate AI enhancement suggestions based on NMC pillars
  generateAISuggestions(text: string): string[] {
    const suggestions: string[] = [];
    
    // Analyze text for NMC pillar alignment
    const lowerText = text.toLowerCase();
    
    // Check for safety and effectiveness
    if (!lowerText.includes('safety') && !lowerText.includes('protocol') && !lowerText.includes('guideline')) {
      suggestions.push("Consider mentioning any safety protocols or guidelines followed during this practice.");
    }
    
    // Check for professionalism
    if (!lowerText.includes('professional') && !lowerText.includes('ethical') && !lowerText.includes('accountability')) {
      suggestions.push("You might want to reflect on the professional and ethical aspects of this experience.");
    }
    
    // Check for learning and development
    if (!lowerText.includes('learn') && !lowerText.includes('develop') && !lowerText.includes('improve')) {
      suggestions.push("Consider how this experience contributed to your learning and professional development.");
    }
    
    // Check for communication and teamwork
    if (!lowerText.includes('communicat') && !lowerText.includes('team') && !lowerText.includes('collaborat')) {
      suggestions.push("Reflect on any communication or teamwork involved in this practice experience.");
    }
    
    // Add general NMC pillar suggestions
    suggestions.push("This reflection aligns with the NMC pillar: 'Prioritize people' - treating patients with kindness and respect.");
    suggestions.push("Consider how this experience demonstrates your commitment to safe, effective practice.");
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Enhance text with AI suggestions
  async enhanceText(text: string): Promise<string> {
    try {
      const suggestions = this.generateAISuggestions(text);
      
      // In a real implementation, this would use AI to enhance the text
      // For now, we'll add some basic enhancements
      let enhancedText = text;
      
      if (suggestions.length > 0) {
        enhancedText += "\n\nAI Enhancement Suggestions:\n";
        suggestions.forEach((suggestion, index) => {
          enhancedText += `${index + 1}. ${suggestion}\n`;
        });
      }
      
      return enhancedText;
    } catch (error) {
      console.error('Failed to enhance text:', error);
      return text; // Return original text if enhancement fails
    }
  }

  // Save audio file to local storage
  async saveAudioFile(audioUri: string, filename: string): Promise<string> {
    try {
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) {
        throw new Error('Documents directory not available');
      }

      const audioDir = `${documentsDir}audio/`;
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
      
      const destinationUri = `${audioDir}${filename}`;
      await FileSystem.copyAsync({
        from: audioUri,
        to: destinationUri,
      });

      console.log('Audio file saved:', destinationUri);
      return destinationUri;
    } catch (error) {
      console.error('Failed to save audio file:', error);
      throw error;
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      if (this.recording && this.recordingState.isRecording) {
        await this.stopRecording();
      }
      this.recording = null;
      this.recordingState = {
        isRecording: false,
        duration: 0,
        uri: null,
        error: null,
      };
    } catch (error) {
      console.error('Failed to cleanup VoiceService:', error);
    }
  }
}

export const voiceService = new VoiceService(); 