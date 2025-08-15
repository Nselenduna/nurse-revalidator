// Core types for the NMC Nurse Revalidation App

export interface Transcript {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  tags?: string;
  isEnhanced?: boolean;
  aiSuggestions?: string[];
}

export interface Form {
  id?: number;
  name: string;
  file_path: string;
  filled_data: string;
  created_at?: string;
  updated_at?: string;
  form_type: 'revalidation' | 'practice_log' | 'reflection';
  status: 'draft' | 'completed' | 'submitted';
}

export interface CPDLog {
  id?: number;
  title: string;
  summary: string;
  audio_path?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string;
  duration?: number;
  category?: string;
  learning_outcomes?: string[];
}

export interface EducationMaterial {
  id?: number;
  title: string;
  url: string;
  category: string;
  recommended_for: string;
  description?: string;
  nmc_pillars?: string[];
  duration?: string;
  difficulty?: string;
  tags?: string[];
  last_updated?: string;
  created_at?: string;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
}

export interface User {
  id?: number;
  name: string;
  pin: string;
  subscription_tier: 'free' | 'premium';
  subscription_expiry?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AISuggestion {
  id: string;
  type: 'enhancement' | 'nudge' | 'recommendation';
  content: string;
  nmc_pillar?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RecordingSession {
  id: string;
  title?: string;
  isRecording: boolean;
  startTime?: Date;
  duration?: number;
  audioUri?: string;
  transcript?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'checkbox';
  value: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  name?: string;
  description?: string;
  autoFill?: boolean;
  keywords?: string[];
}

export interface NMCForm {
  id: string;
  name: string;
  version: string;
  fields: FormField[];
  template_url?: string;
  last_updated?: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Transcript: { transcriptId?: number };
  Forms: undefined;
  FormFilling: { formId: number };
  CPDLogging: undefined;
  CPDDetail: { cpdId: number };
  Education: undefined;
  Settings: undefined;
  VoiceRecorder: { mode: 'transcript' | 'lecture' };
};

// App state types
export interface AppState {
  user: User | null;
  isRecording: boolean;
  currentSession: RecordingSession | null;
  activeForm: Form | null;
  settings: Record<string, any>;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// API response types (for local operations)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// NMC Pillars constants
export const NMC_PILLARS = {
  PRIORITIZE_PEOPLE: 'Prioritize people',
  PRACTICE_EFFECTIVELY: 'Practice effectively',
  PRESERVE_SAFETY: 'Preserve safety',
  PROMOTE_PROFESSIONALISM: 'Promote professionalism and trust'
} as const;

export type NMCPillar = typeof NMC_PILLARS[keyof typeof NMC_PILLARS];

// Subscription features
export const SUBSCRIPTION_FEATURES = {
  FREE: ['voice_transcription', 'form_filling', 'cpd_logging'],
  PREMIUM: ['ai_suggestions', 'lecture_summarization', 'educational_recommendations', 'pdf_export', 'printing']
} as const; 