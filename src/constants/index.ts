// App-wide constants and configuration

export const APP_CONFIG = {
  NAME: 'Nurse Revalidator',
  VERSION: '1.0.0',
  DESCRIPTION: 'Voice-to-text nursing revalidation assistant',
  AUTHOR: 'NMC Nurse App Team',
} as const;

// Color scheme - NMC-inspired professional colors
export const COLORS = {
  // Primary colors - NMC blue scheme
  PRIMARY: '#1E40AF', // Dark blue from NMC website
  PRIMARY_DARK: '#1E3A8A', // Darker blue for hover states
  PRIMARY_LIGHT: '#3B82F6', // Lighter blue for accents
  
  // Secondary colors
  SECONDARY: '#059669', // Healthcare green
  SECONDARY_DARK: '#047857',
  SECONDARY_LIGHT: '#10b981',
  
  // Accent colors
  ACCENT: '#dc2626', // Alert red
  ACCENT_DARK: '#b91c1c',
  ACCENT_LIGHT: '#ef4444',
  
  // Neutral colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
  
  // Status colors
  SUCCESS: '#059669', // Darker green for better contrast
  SUCCESS_LIGHT: '#D1FAE5', // Light green background
  SUCCESS_DARK: '#047857', // Darker green
  WARNING: '#D97706', // Darker orange
  ERROR: '#DC2626', // Darker red
  ERROR_LIGHT: '#FEE2E2', // Light red background for error containers
  INFO: '#2563EB',
  
  // Background colors
  BACKGROUND: '#F8FAFC', // Very light blue-gray
  SURFACE: '#ffffff',
  CARD: '#ffffff',
  
  // Text colors
  TEXT_PRIMARY: '#1f2937',
  TEXT_SECONDARY: '#4B5563', // Darker gray for better readability
  TEXT_DISABLED: '#9ca3af',
  
  // NMC specific colors
  NMC_BLUE: '#1E40AF', // Main NMC blue
  NMC_BLUE_LIGHT: '#3B82F6', // Lighter NMC blue
  NMC_BLUE_DARK: '#1E3A8A', // Darker NMC blue
  NMC_GRAY: '#6B7280', // NMC gray for secondary text
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    REGULAR: 'System',
    MEDIUM: 'System',
    BOLD: 'System',
  },
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    '2XL': 24,
    '3XL': 30,
    '4XL': 36,
  },
  LINE_HEIGHT: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
  // Typography styles for components
  H1: {
    fontFamily: 'System',
    fontSize: 30,
    fontWeight: 'bold' as const,
    lineHeight: 36,
    color: COLORS.TEXT_PRIMARY,
  },
  BODY: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  BUTTON: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: COLORS.WHITE,
  },
  BUTTON_SMALL: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: COLORS.PRIMARY,
  },
  LABEL: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: COLORS.TEXT_PRIMARY,
  },
  H2: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
    color: COLORS.TEXT_PRIMARY,
  },
  H3: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: COLORS.TEXT_PRIMARY,
  },
  CAPTION: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
    color: COLORS.TEXT_SECONDARY,
  },
} as const;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
  '3XL': 64,
} as const;

// Border radius
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  FULL: 9999,
} as const;

// NMC-specific constants
export const NMC = {
  PILLARS: {
    PRIORITIZE_PEOPLE: {
      title: 'Prioritize people',
      description: 'Treat people with kindness, respect and compassion',
      color: COLORS.PRIMARY,
    },
    PRACTICE_EFFECTIVELY: {
      title: 'Practice effectively',
      description: 'Use the best available evidence to deliver care',
      color: COLORS.SECONDARY,
    },
    PRESERVE_SAFETY: {
      title: 'Preserve safety',
      description: 'Keep people safe from harm and protect their health',
      color: COLORS.ACCENT,
    },
    PROMOTE_PROFESSIONALISM: {
      title: 'Promote professionalism and trust',
      description: 'Uphold the reputation of your profession',
      color: COLORS.GRAY_700,
    },
  },
  
  COMPETENCIES: [
    'Communication and interpersonal skills',
    'Nursing practice and decision making',
    'Leadership, management and team working',
    'Safeguarding',
    'Improving safety and quality of care',
    'Coordinating care',
    'Promoting health and preventing ill health',
    'Assessing needs and planning care',
    'Providing and evaluating care',
    'Leading and managing nursing care',
    'Working in teams',
    'Improving safety and quality of care',
    'Coordinating care',
    'Promoting health and preventing ill health',
  ],
  
  CPD_REQUIREMENTS: {
    HOURS_PER_YEAR: 35,
    REFLECTION_REQUIRED: true,
    PRACTICE_HOURS_REQUIRED: 450,
    REVALIDATION_CYCLE: 3, // years
  },
} as const;

// Form templates
export const FORM_TEMPLATES = {
  REVALIDATION: {
    id: 'revalidation',
    name: 'NMC Revalidation Form',
    version: '2024',
    fields: [
      { id: 'personal_details', label: 'Personal Details', type: 'section' },
      { id: 'nmc_number', label: 'NMC Number', type: 'text', required: true },
      { id: 'name', label: 'Full Name', type: 'text', required: true },
      { id: 'email', label: 'Email Address', type: 'text', required: true },
      { id: 'practice_details', label: 'Practice Details', type: 'section' },
      { id: 'practice_hours', label: 'Practice Hours (last 3 years)', type: 'number', required: true },
      { id: 'practice_setting', label: 'Practice Setting', type: 'select', required: true, options: ['Hospital', 'Community', 'Primary Care', 'Mental Health', 'Learning Disability', 'Children\'s Nursing', 'Other'] },
      { id: 'reflections', label: 'Practice Reflections', type: 'textarea', required: true },
      { id: 'cpd_activities', label: 'CPD Activities', type: 'textarea', required: true },
      { id: 'feedback', label: 'Practice-Related Feedback', type: 'textarea', required: false },
      { id: 'health_character', label: 'Health and Character Declaration', type: 'checkbox', required: true },
      { id: 'indemnity', label: 'Professional Indemnity Arrangement', type: 'checkbox', required: true },
    ],
  },
  
  PRACTICE_LOG: {
    id: 'practice_log',
    name: 'Practice Log Entry',
    version: '2024',
    fields: [
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'shift_hours', label: 'Shift Hours', type: 'number', required: true },
      { id: 'practice_area', label: 'Practice Area', type: 'text', required: true },
      { id: 'activities', label: 'Activities Undertaken', type: 'textarea', required: true },
      { id: 'learning', label: 'Learning Points', type: 'textarea', required: true },
      { id: 'nmc_pillars', label: 'NMC Pillars Addressed', type: 'multiselect', required: true, options: Object.values(NMC.PILLARS).map(pillar => pillar.title) },
      { id: 'competencies', label: 'Competencies Demonstrated', type: 'multiselect', required: true, options: NMC.COMPETENCIES },
    ],
  },
  
  REFLECTION: {
    id: 'reflection',
    name: 'Reflection Entry',
    version: '2024',
    fields: [
      { id: 'title', label: 'Reflection Title', type: 'text', required: true },
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'situation', label: 'What happened?', type: 'textarea', required: true },
      { id: 'thoughts', label: 'What were you thinking?', type: 'textarea', required: true },
      { id: 'feelings', label: 'What were you feeling?', type: 'textarea', required: true },
      { id: 'evaluation', label: 'What was good and bad?', type: 'textarea', required: true },
      { id: 'analysis', label: 'What sense can you make of this?', type: 'textarea', required: true },
      { id: 'conclusion', label: 'What else could you have done?', type: 'textarea', required: true },
      { id: 'action_plan', label: 'What will you do next time?', type: 'textarea', required: true },
      { id: 'nmc_pillars', label: 'NMC Pillars Addressed', type: 'multiselect', required: true, options: Object.values(NMC.PILLARS).map(pillar => pillar.title) },
    ],
  },
} as const;

// AI Enhancement suggestions based on NMC pillars
export const AI_SUGGESTIONS = {
  PRIORITIZE_PEOPLE: [
    'Consider how this situation affected the person receiving care',
    'Reflect on how you maintained dignity and respect',
    'Think about the person\'s preferences and choices',
    'Consider the impact on family and carers',
  ],
  PRACTICE_EFFECTIVELY: [
    'What evidence informed your practice in this situation?',
    'How did you ensure best practice was followed?',
    'What guidelines or protocols were relevant?',
    'How did you use your professional judgment?',
  ],
  PRESERVE_SAFETY: [
    'What safety measures were in place?',
    'How did you identify and manage risks?',
    'What would you do differently to improve safety?',
    'How did you protect people from harm?',
  ],
  PROMOTE_PROFESSIONALISM: [
    'How did you maintain professional boundaries?',
    'What ethical considerations were involved?',
    'How did you uphold the reputation of nursing?',
    'What professional development needs did this highlight?',
  ],
} as const;

// Subscription tiers
export const SUBSCRIPTION = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      'Voice-to-text transcription',
      'Basic form filling',
      'CPD logging',
      'Local storage',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 3,
    currency: 'GBP',
    period: 'month',
    features: [
      'AI suggestions and enhancements',
      'Lecture summarization',
      'Educational recommendations',
      'PDF export and printing',
      'Advanced form templates',
      'Priority support',
    ],
  },
} as const;

// App navigation
export const ROUTES = {
  HOME: 'Home',
  TRANSCRIPT: 'Transcript',
  FORMS: 'Forms',
  FORM_FILLING: 'FormFilling',
  CPD_LOGGING: 'CPDLogging',
  CPD_DETAIL: 'CPDDetail',
  EDUCATION: 'Education',
  SETTINGS: 'Settings',
  VOICE_RECORDER: 'VoiceRecorder',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SUBSCRIPTION_STATUS: 'subscription_status',
  LAST_BACKUP: 'last_backup',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  THEME: 'theme',
  NOTIFICATIONS: 'notifications',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection required for this feature',
  PERMISSION_DENIED: 'Permission denied. Please enable microphone access.',
  RECORDING_FAILED: 'Recording failed. Please try again.',
  SAVE_FAILED: 'Failed to save. Please check your storage space.',
  LOAD_FAILED: 'Failed to load data. Please restart the app.',
  BACKUP_FAILED: 'Backup failed. Please try again.',
  RESTORE_FAILED: 'Restore failed. Please check the backup file.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Successfully saved',
  BACKUP_CREATED: 'Backup created successfully',
  RESTORE_COMPLETE: 'Restore completed successfully',
  TRANSCRIPT_SAVED: 'Transcript saved successfully',
  FORM_FILLED: 'Form filled successfully',
  CPD_LOGGED: 'CPD activity logged successfully',
} as const; 