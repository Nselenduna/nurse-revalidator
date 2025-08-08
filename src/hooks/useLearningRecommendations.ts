import { useState, useEffect, useCallback } from 'react';
import { educationService } from '../services/EducationService';
import { EducationMaterial, Transcript, CPDLog } from '../types';
import databaseService from '../services/DatabaseService';

export interface LearningRecommendation {
  material: EducationMaterial;
  relevanceScore: number;
  reason: string;
  category: string;
}

export interface UseLearningRecommendationsReturn {
  recommendations: LearningRecommendation[];
  allMaterials: EducationMaterial[];
  statistics: {
    totalMaterials: number;
    categories: Record<string, number>;
    difficultyLevels: Record<string, number>;
    recentAdditions: EducationMaterial[];
  } | null;
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  searchMaterials: (query: string) => Promise<EducationMaterial[]>;
  getMaterialsByCategory: (category: string) => Promise<EducationMaterial[]>;
  getMaterialsByDifficulty: (difficulty: string) => Promise<EducationMaterial[]>;
  userInterests: string[];
  userLevel: string;
}

export const useLearningRecommendations = (): UseLearningRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [allMaterials, setAllMaterials] = useState<EducationMaterial[]>([]);
  const [statistics, setStatistics] = useState<UseLearningRecommendationsReturn['statistics']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<string>('Beginner');

  // Initialize education service and load initial data
  useEffect(() => {
    console.log('useLearningRecommendations hook initializing...');
    const initializeService = async () => {
      try {
        await educationService.initialize();
        await loadInitialData();
      } catch (err) {
        console.error('Education service initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize education service');
      }
    };

    initializeService();
  }, []);

  // Load initial data including materials and statistics
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all educational materials
      const materials = await educationService.getEducationalMaterials();
      setAllMaterials(materials);

      // Load statistics
      const stats = await educationService.getLearningStatistics();
      setStatistics(stats);

      // Generate initial recommendations
      await generateRecommendations();

      console.log('Initial learning data loaded successfully');
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load learning materials');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate personalized recommendations
  const generateRecommendations = async () => {
    try {
      console.log('Generating personalized recommendations...');
      
      // Get user data for analysis
      const transcripts = await databaseService.getTranscripts();
      const cpdLogs = await databaseService.getCPDLogs();

      // Extract user interests and level
      const interests = extractUserInterests(transcripts, cpdLogs);
      const level = assessUserLevel(transcripts, cpdLogs);
      
      setUserInterests(interests);
      setUserLevel(level);

      // Generate recommendations
      const recs = await educationService.generateRecommendations(transcripts, cpdLogs);
      setRecommendations(recs);

      console.log(`Generated ${recs.length} recommendations for user level: ${level}`);
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    }
  };

  // Extract user interests from activity
  const extractUserInterests = (transcripts: Transcript[], cpdLogs: CPDLog[]): string[] => {
    const interests: string[] = [];
    const allContent = [
      ...transcripts.map(t => t.content.toLowerCase()),
      ...cpdLogs.map(l => l.summary.toLowerCase()),
      ...transcripts.map(t => t.tags.toLowerCase()),
      ...cpdLogs.map(l => l.tags.toLowerCase()),
    ].join(' ');
    
    // Extract common themes and interests
    const themes = [
      'patient safety', 'communication', 'leadership', 'evidence-based practice',
      'mental health', 'infection control', 'medication safety', 'palliative care',
      'digital health', 'cultural competence', 'teamwork', 'research',
      'clinical decision making', 'risk assessment', 'quality improvement'
    ];
    
    themes.forEach(theme => {
      if (allContent.includes(theme)) {
        interests.push(theme);
      }
    });
    
    return interests;
  };

  // Assess user's current learning level
  const assessUserLevel = (transcripts: Transcript[], cpdLogs: CPDLog[]): string => {
    const totalActivity = transcripts.length + cpdLogs.length;
    
    if (totalActivity < 3) return 'Beginner';
    if (totalActivity < 10) return 'Intermediate';
    return 'Advanced';
  };

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await generateRecommendations();
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search materials
  const searchMaterials = useCallback(async (query: string): Promise<EducationMaterial[]> => {
    try {
      return await educationService.searchMaterials(query);
    } catch (err) {
      console.error('Failed to search materials:', err);
      throw err;
    }
  }, []);

  // Get materials by category
  const getMaterialsByCategory = useCallback(async (category: string): Promise<EducationMaterial[]> => {
    try {
      return await educationService.getMaterialsByCategory(category);
    } catch (err) {
      console.error('Failed to get materials by category:', err);
      throw err;
    }
  }, []);

  // Get materials by difficulty
  const getMaterialsByDifficulty = useCallback(async (difficulty: string): Promise<EducationMaterial[]> => {
    try {
      return await educationService.getMaterialsByDifficulty(difficulty);
    } catch (err) {
      console.error('Failed to get materials by difficulty:', err);
      throw err;
    }
  }, []);

  console.log('useLearningRecommendations hook state:', {
    recommendationsCount: recommendations.length,
    materialsCount: allMaterials.length,
    userInterests: userInterests.length,
    userLevel,
    isLoading,
    error,
  });

  return {
    recommendations,
    allMaterials,
    statistics,
    isLoading,
    error,
    refreshRecommendations,
    searchMaterials,
    getMaterialsByCategory,
    getMaterialsByDifficulty,
    userInterests,
    userLevel,
  };
}; 