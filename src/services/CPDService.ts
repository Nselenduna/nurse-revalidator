import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { RecordingSession, CPDLog } from '../types';

class CPDService {
  private isWeb = Platform.OS === 'web';
  private recording: Audio.Recording | null = null;
  private recordingStatus: {
    isRecording: boolean;
    isPaused: boolean;
    durationMillis: number;
    startTime: Date | null;
  } = {
    isRecording: false,
    isPaused: false,
    durationMillis: 0,
    startTime: null
  };
  private audioDirectory = `${FileSystem.documentDirectory}audio/`;

  async initialize(): Promise<void> {
    try {
      if (this.isWeb) {
        console.log('CPDService initialized for web platform');
        return;
      }

      // Ensure audio directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.audioDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.audioDirectory, { intermediates: true });
      }

      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('CPDService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CPDService:', error);
      throw error;
    }
  }

  // Pause recording
  async pauseRecording(): Promise<void> {
    try {
      console.log('Attempting to pause recording...');
      
      if (!this.recording || !this.recordingStatus.isRecording) {
        throw new Error('No active recording to pause');
      }

      await this.recording.pauseAsync();
      
      this.recordingStatus = {
        ...this.recordingStatus,
        isRecording: false,
        isPaused: true,
        durationMillis: (this.recordingStatus.startTime ? 
          Date.now() - this.recordingStatus.startTime.getTime() : 
          this.recordingStatus.durationMillis)
      };
      
      console.log('Recording paused successfully');
    } catch (error) {
      console.error('Failed to pause recording:', error);
      // Reset recording state on error
      this.recordingStatus.isRecording = false;
      this.recordingStatus.isPaused = false;
      throw error;
    }
  }

  // Resume recording
  async resumeRecording(): Promise<void> {
    try {
      console.log('Attempting to resume recording...');
      
      if (!this.recording) {
        throw new Error('No recording to resume');
      }

      // Create a new recording if needed
      if (!this.recordingStatus.isPaused) {
        this.recording = new Audio.Recording();
        await this.recording.prepareToRecordAsync({
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
      }

      await this.recording.startAsync();
      
      this.recordingStatus = {
        ...this.recordingStatus,
        isRecording: true,
        isPaused: false,
        startTime: new Date()
      };
      
      console.log('Recording resumed successfully');
    } catch (error) {
      console.error('Failed to resume recording:', error);
      // Reset recording state on error
      this.recordingStatus.isRecording = false;
      this.recordingStatus.isPaused = false;
      throw error;
    }
  }

  // Start recording a lecture
  async startLectureRecording(): Promise<RecordingSession> {
    try {
      console.log('Starting lecture recording...');
      
      if (this.isWeb) {
        // Simulate recording for web platform
        const session: RecordingSession = {
          id: Date.now().toString(),
          isRecording: true,
          isPaused: false,
          startTime: new Date(),
          duration: 0,
          audioUri: undefined,
        };
        
        console.log('Lecture recording started (web simulation)');
        return session;
      }

      // Cleanup any existing recording
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      // Request permissions again to ensure they're still granted
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Create and prepare new recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      await recording.startAsync();
      this.recording = recording;
      this.recordingStatus = {
        isRecording: true,
        isPaused: false,
        durationMillis: 0,
        startTime: new Date()
      };

      const session: RecordingSession = {
        id: Date.now().toString(),
        isRecording: true,
        isPaused: false,
        startTime: new Date(),
        duration: 0,
        audioUri: undefined,
      };

      console.log('Lecture recording started successfully');
      return session;
    } catch (error) {
      console.error('Failed to start lecture recording:', error);
      this.recording = null;
      this.recordingStatus = {
        isRecording: false,
        isPaused: false,
        durationMillis: 0,
        startTime: null
      };
      throw error;
    }
  }

  // Stop recording and get the audio file
  async stopLectureRecording(): Promise<RecordingSession> {
    try {
      console.log('Stopping lecture recording...');
      
      if (this.isWeb) {
        this.recordingStatus = {
          isRecording: false,
          isPaused: false,
          durationMillis: 0,
          startTime: null
        };
        
        return {
          id: Date.now().toString(),
          isRecording: false,
          isPaused: false,
          startTime: new Date(Date.now() - 60000),
          duration: 60,
          audioUri: 'web://lecture_recording.wav',
        };
      }

      if (!this.recording) {
        throw new Error('No active recording to stop');
      }

      try {
        // Stop the recording
        await this.recording.stopAndUnloadAsync();
        
        // Calculate actual duration
        const duration = this.recordingStatus.startTime ? 
          Math.floor((Date.now() - this.recordingStatus.startTime.getTime()) / 1000) : 
          60; // fallback duration
        
        // Get the recording URI
        const uri = this.recording.getURI();
        if (!uri) {
          throw new Error('Failed to get recording URI');
        }

        // Save audio file to local storage
        const fileName = `lecture_${Date.now()}.m4a`;
        const destinationUri = `${this.audioDirectory}${fileName}`;
        
        await FileSystem.moveAsync({
          from: uri,
          to: destinationUri,
        });

        // Create session with actual recording data
        const session: RecordingSession = {
          id: Date.now().toString(),
          isRecording: false,
          isPaused: false,
          startTime: this.recordingStatus.startTime || new Date(Date.now() - duration * 1000),
          duration: duration,
          audioUri: destinationUri,
        };

        // Reset recording state
        this.recording = null;
        this.recordingStatus = {
          isRecording: false,
          isPaused: false,
          durationMillis: 0,
          startTime: null
        };

        console.log('Recording stopped and saved successfully:', { destinationUri, duration });
        return session;
      } catch (recordingError) {
        console.error('Failed to stop and save recording:', recordingError);
        // Reset recording state
        this.recording = null;
        this.recordingStatus = {
          isRecording: false,
          isPaused: false,
          durationMillis: 0,
          startTime: null
        };
        throw recordingError;
      }
    } catch (error) {
      console.error('Failed to stop lecture recording:', error);
      throw error;
    }
  }

  // Get current recording status
  async getRecordingStatus(): Promise<RecordingSession | null> {
    try {
      if (this.isWeb) {
        return {
          id: Date.now().toString(),
          isRecording: this.recordingStatus.isRecording,
          isPaused: this.recordingStatus.isPaused,
          startTime: this.recordingStatus.startTime || new Date(),
          duration: Math.floor(this.recordingStatus.durationMillis / 1000),
          audioUri: 'web://current_recording.wav',
        };
      }

      if (!this.recording) {
        return null;
      }

      try {
        const status = await this.recording.getStatusAsync();
        const currentTime = Date.now();
        const duration = this.recordingStatus.startTime ? 
          Math.floor((currentTime - this.recordingStatus.startTime.getTime()) / 1000) :
          Math.floor(this.recordingStatus.durationMillis / 1000);

        return {
          id: Date.now().toString(),
          isRecording: this.recordingStatus.isRecording,
          isPaused: this.recordingStatus.isPaused,
          startTime: this.recordingStatus.startTime || new Date(currentTime - duration * 1000),
          duration: duration,
          audioUri: this.recording.getURI() || undefined,
        };
      } catch (statusError) {
        console.error('Failed to get recording status:', statusError);
        return {
          id: Date.now().toString(),
          isRecording: this.recordingStatus.isRecording,
          isPaused: this.recordingStatus.isPaused,
          startTime: this.recordingStatus.startTime || new Date(),
          duration: Math.floor(this.recordingStatus.durationMillis / 1000),
          audioUri: undefined,
        };
      }
    } catch (error) {
      console.error('Failed to get recording status:', error);
      return null;
    }
  }

  // Generate a summary from lecture audio
  async generateLectureSummary(audioUri: string, transcript?: string): Promise<string> {
    try {
      console.log('Generating lecture summary...');
      
      if (this.isWeb) {
        // Simulate AI summary generation
        return `This is a simulated summary of the lecture recording. 
        
        Key points covered:
        - Introduction to nursing best practices
        - Patient safety protocols
        - Documentation requirements
        - Professional development opportunities
        
        This summary was generated using AI analysis of the lecture content and would include specific insights relevant to nursing practice and NMC requirements.`;
      }

      // In a real implementation, this would:
      // 1. Send audio to transcription service
      // 2. Use AI to analyze and summarize the content
      // 3. Return structured summary with key points
      
      const mockSummary = `Lecture Summary (Generated from ${audioUri})
      
      This lecture covered essential topics for nursing practice and professional development.
      
      Main Topics:
      - Clinical best practices and evidence-based care
      - Patient safety and risk management
      - Professional communication and documentation
      - Continuing professional development requirements
      
      Learning Outcomes:
      - Enhanced understanding of current nursing protocols
      - Improved patient safety awareness
      - Better documentation practices
      - Clear pathway for CPD activities
      
      This summary demonstrates learning and reflection for NMC revalidation purposes.`;

      return mockSummary;
    } catch (error) {
      console.error('Failed to generate lecture summary:', error);
      throw error;
    }
  }

  // Create a CPD log entry from lecture recording
  async createCPDLogFromLecture(
    session: RecordingSession,
    summary: string,
    tags: string[] = [],
    notes: string = ''
  ): Promise<CPDLog> {
    try {
      console.log('Creating CPD log from lecture...');
      
      const learningOutcomes = this.generateLearningOutcomes(summary);
      
      const cpdLog: CPDLog = {
        title: session.title || 'Lecture Recording',
        summary: summary,
        audio_path: session.audioUri,
        created_at: new Date().toISOString(),
        tags: tags.join(', '),
        duration: session.duration || 0,
        category: 'Lecture/Education',
        learning_outcomes: learningOutcomes,
      };

      console.log('CPD log created from lecture');
      return cpdLog;
    } catch (error) {
      console.error('Failed to create CPD log from lecture:', error);
      throw error;
    }
  }

  // Generate learning outcomes from summary
  private generateLearningOutcomes(summary: string): string[] {
    // Simple keyword-based learning outcome generation
    const outcomes: string[] = [];
    
    if (summary.toLowerCase().includes('safety')) {
      outcomes.push('Enhanced understanding of patient safety protocols');
    }
    
    if (summary.toLowerCase().includes('communication')) {
      outcomes.push('Improved professional communication skills');
    }
    
    if (summary.toLowerCase().includes('documentation')) {
      outcomes.push('Better documentation practices');
    }
    
    if (summary.toLowerCase().includes('evidence')) {
      outcomes.push('Evidence-based practice knowledge');
    }
    
    if (summary.toLowerCase().includes('professional')) {
      outcomes.push('Professional development and growth');
    }
    
    // Default outcomes if none match
    if (outcomes.length === 0) {
      outcomes.push('Enhanced nursing knowledge and skills');
      outcomes.push('Professional development and learning');
    }
    
    return outcomes;
  }

  // Get audio snippet for review
  async getAudioSnippet(audioUri: string, startTime: number, duration: number): Promise<string> {
    try {
      console.log('Getting audio snippet...');
      
      if (this.isWeb) {
        return 'web://audio_snippet.wav';
      }

      // In a real implementation, this would extract a portion of the audio file
      // For now, return the original URI
      return audioUri;
    } catch (error) {
      console.error('Failed to get audio snippet:', error);
      throw error;
    }
  }

  // Export CPD log with audio reference
  async exportCPDLog(cpdLog: CPDLog): Promise<string> {
    try {
      console.log('Exporting CPD log...');
      
      const exportData = {
        ...cpdLog,
        exportDate: new Date().toISOString(),
        audioReference: cpdLog.audio_path,
        learningOutcomes: cpdLog.learning_outcomes,
      };

      // In a real implementation, this would create a formatted document
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export CPD log:', error);
      throw error;
    }
  }

  // Get CPD statistics
  async getCPDStatistics(): Promise<{
    totalHours: number;
    totalEntries: number;
    categories: Record<string, number>;
    recentActivity: CPDLog[];
  }> {
    try {
      console.log('Getting CPD statistics...');
      
      // Mock statistics for demonstration
      return {
        totalHours: 45,
        totalEntries: 12,
        categories: {
          'Lecture/Education': 5,
          'Clinical Practice': 4,
          'Reflection': 3,
        },
        recentActivity: [], // Would be populated from database
      };
    } catch (error) {
      console.error('Failed to get CPD statistics:', error);
      throw error;
    }
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      console.log('CPDService cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup CPDService:', error);
    }
  }
}

export const cpdService = new CPDService();
export default cpdService; 