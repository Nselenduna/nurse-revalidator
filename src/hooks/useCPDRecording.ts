import { useState, useEffect, useCallback } from 'react';
import { cpdService, RecordingSession } from '../services/CPDService';
import { CPDLog } from '../types';

export interface UseCPDRecordingReturn {
  isRecording: boolean;
  isSummarizing: boolean;
  isSaving: boolean;
  recordingSession: RecordingSession | null;
  summary: string;
  tags: string[];
  notes: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  generateSummary: () => Promise<void>;
  updateTags: (newTags: string[]) => void;
  updateNotes: (newNotes: string) => void;
  saveCPDLog: () => Promise<CPDLog | null>;
  clearRecording: () => void;
}

export const useCPDRecording = (): UseCPDRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingSession, setRecordingSession] = useState<RecordingSession | null>(null);
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize CPD service on mount
  useEffect(() => {
    console.log('useCPDRecording hook initializing...');
    const initializeService = async () => {
      try {
        await cpdService.initialize();
        console.log('CPD service initialized successfully');
      } catch (err) {
        console.error('CPD service initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize CPD service');
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up CPD service...');
      cpdService.cleanup();
    };
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    console.log('startRecording called');
    try {
      setError(null);
      const session = await cpdService.startLectureRecording();
      setRecordingSession(session);
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Start recording error:', err);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    console.log('stopRecording called');
    try {
      setError(null);
      const session = await cpdService.stopLectureRecording();
      setRecordingSession(session);
      setIsRecording(false);
      console.log('Recording stopped successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      console.error('Stop recording error:', err);
    }
  }, []);

  // Generate summary
  const generateSummary = useCallback(async () => {
    console.log('generateSummary called');
    try {
      if (!recordingSession?.audioUri) {
        throw new Error('No recording available for summarization');
      }

      setError(null);
      setIsSummarizing(true);
      
      const generatedSummary = await cpdService.generateLectureSummary(recordingSession.audioUri);
      setSummary(generatedSummary);
      
      console.log('Summary generated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(errorMessage);
      console.error('Summary generation error:', err);
    } finally {
      setIsSummarizing(false);
    }
  }, [recordingSession]);

  // Update tags
  const updateTags = useCallback((newTags: string[]) => {
    console.log('updateTags called:', newTags);
    setTags(newTags);
  }, []);

  // Update notes
  const updateNotes = useCallback((newNotes: string) => {
    console.log('updateNotes called:', newNotes);
    setNotes(newNotes);
  }, []);

  // Save CPD log
  const saveCPDLog = useCallback(async (): Promise<CPDLog | null> => {
    console.log('saveCPDLog called');
    try {
      if (!recordingSession) {
        throw new Error('No recording session to save');
      }

      if (!summary.trim()) {
        throw new Error('Please generate a summary before saving');
      }

      setError(null);
      setIsSaving(true);

      // Create CPD log from lecture
      const cpdLog = await cpdService.createCPDLogFromLecture(
        recordingSession,
        summary,
        tags,
        notes
      );

      console.log('CPD log saved successfully');
      return cpdLog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save CPD log';
      setError(errorMessage);
      console.error('Save CPD log error:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [recordingSession, summary, tags, notes]);

  // Clear recording
  const clearRecording = useCallback(() => {
    console.log('clearRecording called');
    setIsRecording(false);
    setIsSummarizing(false);
    setIsSaving(false);
    setRecordingSession(null);
    setSummary('');
    setTags([]);
    setNotes('');
    setError(null);
  }, []);

  console.log('useCPDRecording hook state:', {
    isRecording,
    isSummarizing,
    isSaving,
    recordingSession: !!recordingSession,
    summary: summary?.length,
    tags: tags.length,
    error,
  });

  return {
    isRecording,
    isSummarizing,
    isSaving,
    recordingSession,
    summary,
    tags,
    notes,
    error,
    startRecording,
    stopRecording,
    generateSummary,
    updateTags,
    updateNotes,
    saveCPDLog,
    clearRecording,
  };
}; 