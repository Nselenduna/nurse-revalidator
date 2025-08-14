import { useState, useEffect, useCallback } from 'react';
import { voiceService, RecordingState, TranscriptionResult } from '../services/VoiceService';

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  transcription: string;
  suggestions: string[];
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcribeRecording: () => Promise<void>;
  enhanceTranscription: () => Promise<void>;
  clearTranscription: () => void;
  error: string | null;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  console.log('useVoiceRecording hook initializing...');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    uri: null,
    error: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize voice service on mount
  useEffect(() => {
    console.log('useVoiceRecording useEffect running...');
    const initializeService = async () => {
      try {
        console.log('Initializing voice service...');
        await voiceService.initialize();
        console.log('Voice service initialized successfully');
      } catch (err) {
        console.error('Voice service initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize voice service');
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up voice service...');
      voiceService.cleanup();
    };
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    console.log('startRecording called');
    try {
      setError(null);
      
      // If we have a paused recording, resume it
      if (isPaused) {
        await voiceService.resumeRecording();
      } else {
        // Start a new recording
        await voiceService.startRecording();
      }

      // Update state based on service state
      const newState = voiceService.getRecordingState();
      setIsRecording(newState.isRecording);
      setIsPaused(newState.isPaused);
      
      setRecordingState(voiceService.getRecordingState());
      console.log('Recording started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      
      // Don't set "Already recording" as an error, just log it
      if (errorMessage.includes('Already recording')) {
        console.log('Recording already in progress, ignoring duplicate start request');
        return;
      }
      
      setError(errorMessage);
      console.error('Start recording error:', err);
    }
  }, [isPaused]);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    console.log('pauseRecording called');
    try {
      setError(null);
      await voiceService.pauseRecording();
      setIsPaused(true);
      setRecordingState(voiceService.getRecordingState());
      console.log('Recording paused successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause recording';
      
      // Don't set certain errors as error state, just log them
      if (errorMessage.includes('No active recording') || errorMessage.includes('not currently active')) {
        console.log('No active recording to pause');
        return;
      }
      
      setError(errorMessage);
      console.error('Pause recording error:', err);
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    console.log('resumeRecording called');
    try {
      setError(null);
      await voiceService.resumeRecording();
      setIsPaused(false);
      setRecordingState(voiceService.getRecordingState());
      console.log('Recording resumed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume recording';
      
      // Don't set certain errors as error state, just log them
      if (errorMessage.includes('No recording to resume') || errorMessage.includes('already active')) {
        console.log('Cannot resume recording:', errorMessage);
        return;
      }
      
      setError(errorMessage);
      console.error('Resume recording error:', err);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    console.log('stopRecording called');
    try {
      setError(null);
      const audioUri = await voiceService.stopRecording();
      
      // Only update state if we actually got a URI back
      if (audioUri) {
        setIsRecording(false);
        setIsPaused(false);
        setRecordingState(voiceService.getRecordingState());
        console.log('Recording stopped, audio URI:', audioUri);
      } else {
        console.log('No recording was active to stop');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      console.error('Stop recording error:', err);
    }
  }, []);

  // Transcribe the recorded audio
  const transcribeRecording = useCallback(async () => {
    console.log('transcribeRecording called');
    try {
      setError(null);
      setIsTranscribing(true);
      
      const currentState = voiceService.getRecordingState();
      console.log('Current recording state:', currentState);
      
      if (!currentState.uri) {
        throw new Error('No recording available for transcription');
      }

      const result: TranscriptionResult = await voiceService.transcribeAudio(currentState.uri);
      setTranscription(result.text);
      
      // Generate initial suggestions
      const initialSuggestions = voiceService.generateAISuggestions(result.text);
      setSuggestions(initialSuggestions);
      
      console.log('Transcription completed:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe recording';
      setError(errorMessage);
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  // Enhance transcription with AI
  const enhanceTranscription = useCallback(async () => {
    console.log('enhanceTranscription called');
    try {
      setError(null);
      if (!transcription.trim()) {
        throw new Error('No transcription to enhance');
      }

      const enhancedText = await voiceService.enhanceText(transcription);
      setTranscription(enhancedText);
      
      // Update suggestions
      const newSuggestions = voiceService.generateAISuggestions(enhancedText);
      setSuggestions(newSuggestions);
      
      console.log('Transcription enhanced successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance transcription';
      setError(errorMessage);
      console.error('Enhancement error:', err);
    }
  }, [transcription]);

  // Clear transcription and reset state
  const clearTranscription = useCallback(() => {
    console.log('clearTranscription called');
    setTranscription('');
    setSuggestions([]);
    setError(null);
    
    // Reset all recording state
    setIsRecording(false);
    setIsPaused(false);
    setIsTranscribing(false);
    
    // Reset the voice service state too
    voiceService.cleanup();
    voiceService.initialize().catch(error => {
      console.error('Failed to reinitialize voice service:', error);
      setError('Failed to reset recording state. Please restart the app.');
    });
  }, []);

  console.log('useVoiceRecording hook state:', { isRecording, isTranscribing, transcription: transcription?.length, error });

  return {
    isRecording,
    isPaused,
    isTranscribing,
    transcription,
    suggestions,
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    transcribeRecording,
    enhanceTranscription,
    clearTranscription,
    error,
  };
}; 