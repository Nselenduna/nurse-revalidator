import { Platform } from 'react-native';
import { EducationMaterial, Transcript, CPDLog } from '../types';
import { NMC } from '../constants';

interface LearningRecommendation {
  material: EducationMaterial;
  relevanceScore: number;
  reason: string;
  category: string;
}

class EducationService {
  private isWeb = Platform.OS === 'web';

  async initialize(): Promise<void> {
    try {
      console.log('EducationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EducationService:', error);
      throw error;
    }
  }

  // Get curated educational materials
  async getEducationalMaterials(): Promise<EducationMaterial[]> {
    try {
      console.log('Getting educational materials...');
      
      // Curated list of educational materials aligned with NMC competencies
      const materials: EducationMaterial[] = [
        {
          id: 1,
          title: 'Patient Safety in Clinical Practice',
          url: 'https://www.nmc.org.uk/standards/guidance/patient-safety/',
          category: 'patient_safety',
          recommended_for: 'All nurses',
          description: 'Essential guidelines for maintaining patient safety in clinical settings',
          duration: '2 hours',
          difficulty: 'Intermediate',
          tags: ['patient safety', 'clinical practice', 'risk assessment'],
          last_updated: '2024-01-15',
        },
        {
          id: 2,
          title: 'Evidence-Based Practice in Nursing',
          url: 'https://www.nmc.org.uk/standards/guidance/evidence-based-practice/',
          category: 'evidence_based_practice',
          recommended_for: 'Registered nurses',
          description: 'Understanding and applying evidence-based practice principles',
          duration: '3 hours',
          difficulty: 'Advanced',
          tags: ['evidence-based practice', 'research', 'clinical decision making'],
          last_updated: '2024-02-20',
        },
        {
          id: 3,
          title: 'Communication Skills for Healthcare Professionals',
          url: 'https://www.nmc.org.uk/standards/guidance/communication/',
          category: 'communication',
          recommended_for: 'All healthcare professionals',
          description: 'Enhancing communication skills with patients, families, and colleagues',
          duration: '1.5 hours',
          difficulty: 'Beginner',
          tags: ['communication', 'teamwork', 'patient interaction'],
          last_updated: '2024-01-30',
        },
        {
          id: 4,
          title: 'Leadership and Management in Nursing',
          url: 'https://www.nmc.org.uk/standards/guidance/leadership/',
          category: 'leadership',
          recommended_for: 'Senior nurses and managers',
          description: 'Developing leadership skills and management competencies',
          duration: '4 hours',
          difficulty: 'Advanced',
          tags: ['leadership', 'management', 'decision making'],
          last_updated: '2024-03-10',
        },
        {
          id: 5,
          title: 'Mental Health Awareness for Nurses',
          url: 'https://www.nmc.org.uk/standards/guidance/mental-health/',
          category: 'mental_health',
          recommended_for: 'All nurses',
          description: 'Understanding mental health conditions and providing appropriate care',
          duration: '2.5 hours',
          difficulty: 'Intermediate',
          tags: ['mental health', 'patient care', 'wellbeing'],
          last_updated: '2024-02-15',
        },
        {
          id: 6,
          title: 'Infection Prevention and Control',
          url: 'https://www.nmc.org.uk/standards/guidance/infection-control/',
          category: 'infection_control',
          recommended_for: 'All healthcare workers',
          description: 'Best practices for preventing and controlling infections',
          duration: '2 hours',
          difficulty: 'Intermediate',
          tags: ['infection control', 'hygiene', 'patient safety'],
          last_updated: '2024-01-25',
        },
        {
          id: 7,
          title: 'Medication Safety and Administration',
          url: 'https://www.nmc.org.uk/standards/guidance/medication-safety/',
          category: 'medication_safety',
          recommended_for: 'Registered nurses',
          description: 'Safe medication administration practices and error prevention',
          duration: '3 hours',
          difficulty: 'Intermediate',
          tags: ['medication safety', 'drug administration', 'error prevention'],
          last_updated: '2024-03-05',
        },
        {
          id: 8,
          title: 'End-of-Life Care and Palliative Nursing',
          url: 'https://www.nmc.org.uk/standards/guidance/end-of-life-care/',
          category: 'palliative_care',
          recommended_for: 'Registered nurses',
          description: 'Providing compassionate end-of-life care and support',
          duration: '3.5 hours',
          difficulty: 'Advanced',
          tags: ['palliative care', 'end of life', 'compassionate care'],
          last_updated: '2024-02-28',
        },
        {
          id: 9,
          title: 'Digital Health and Technology in Nursing',
          url: 'https://www.nmc.org.uk/standards/guidance/digital-health/',
          category: 'digital_health',
          recommended_for: 'All nurses',
          description: 'Understanding and using digital health technologies',
          duration: '2 hours',
          difficulty: 'Beginner',
          tags: ['digital health', 'technology', 'innovation'],
          last_updated: '2024-03-15',
        },
        {
          id: 10,
          title: 'Cultural Competence in Healthcare',
          url: 'https://www.nmc.org.uk/standards/guidance/cultural-competence/',
          category: 'cultural_competence',
          recommended_for: 'All healthcare professionals',
          description: 'Providing culturally sensitive and appropriate care',
          duration: '2.5 hours',
          difficulty: 'Intermediate',
          tags: ['cultural competence', 'diversity', 'inclusive care'],
          last_updated: '2024-01-20',
        },
      ];
      
      console.log(`Retrieved ${materials.length} educational materials`);
      return materials;
    } catch (error) {
      console.error('Failed to get educational materials:', error);
      throw error;
    }
  }

  // Generate personalized learning recommendations
  async generateRecommendations(
    transcripts: Transcript[],
    cpdLogs: CPDLog[],
    userPreferences?: string[]
  ): Promise<LearningRecommendation[]> {
    try {
      console.log('Generating personalized learning recommendations...');
      
      const materials = await this.getEducationalMaterials();
      const recommendations: LearningRecommendation[] = [];
      
      // Analyze user activity to determine learning needs
      const activityAnalysis = this.analyzeUserActivity(transcripts, cpdLogs);
      const userInterests = this.extractUserInterests(transcripts, cpdLogs);
      
      // Score each material based on relevance
      materials.forEach(material => {
        const relevanceScore = this.calculateRelevanceScore(
          material,
          activityAnalysis,
          userInterests,
          userPreferences
        );
        
        if (relevanceScore > 0.3) { // Only recommend if relevance score is above threshold
          const reason = this.generateRecommendationReason(material, activityAnalysis, userInterests);
          const category = this.mapToNMCCategory(material.category);
          
          recommendations.push({
            material,
            relevanceScore,
            reason,
            category,
          });
        }
      });
      
      // Sort by relevance score (highest first)
      recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      console.log(`Generated ${recommendations.length} recommendations`);
      return recommendations.slice(0, 10); // Return top 10 recommendations
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      throw error;
    }
  }

  // Analyze user activity patterns
  private analyzeUserActivity(transcripts: Transcript[], cpdLogs: CPDLog[]): Record<string, number> {
    const analysis: Record<string, number> = {};
    
    // Analyze transcripts
    transcripts.forEach(transcript => {
      const content = transcript.content.toLowerCase();
      const tags = transcript.tags?.toLowerCase() || '';
      
      // Count mentions of different topics
      Object.values(NMC.PILLARS).forEach(pillar => {
        const pillarLower = pillar.title.toLowerCase();
        if (content.includes(pillarLower) || tags.includes(pillarLower)) {
          analysis[pillarLower] = (analysis[pillarLower] || 0) + 1;
        }
      });
      
      // Count specific competency mentions
      NMC.COMPETENCIES.forEach(competency => {
        const competencyLower = competency.toLowerCase();
        if (content.includes(competencyLower) || tags.includes(competencyLower)) {
          analysis[competencyLower] = (analysis[competencyLower] || 0) + 1;
        }
      });
    });
    
    // Analyze CPD logs
    cpdLogs.forEach(log => {
      const summary = log.summary.toLowerCase();
      const tags = log.tags?.toLowerCase() || '';
      
      Object.values(NMC.PILLARS).forEach(pillar => {
        const pillarLower = pillar.title.toLowerCase();
        if (summary.includes(pillarLower) || tags.includes(pillarLower)) {
          analysis[pillarLower] = (analysis[pillarLower] || 0) + 2; // CPD logs weighted higher
        }
      });
    });
    
    return analysis;
  }

  // Extract user interests from activity
  private extractUserInterests(transcripts: Transcript[], cpdLogs: CPDLog[]): string[] {
    const interests: string[] = [];
    const allContent = [
      ...transcripts.map(t => t.content.toLowerCase()),
      ...cpdLogs.map(l => l.summary.toLowerCase()),
      ...transcripts.map(t => t.tags?.toLowerCase() || ''),
      ...cpdLogs.map(l => l.tags?.toLowerCase() || ''),
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
  }

  // Calculate relevance score for a material
  private calculateRelevanceScore(
    material: EducationMaterial,
    activityAnalysis: Record<string, number>,
    userInterests: string[],
    userPreferences?: string[]
  ): number {
    let score = 0;
    
    // Base score from material tags
    material.tags?.forEach(tag => {
      const tagLower = tag.toLowerCase();
      
      // Check against user activity
      if (activityAnalysis[tagLower]) {
        score += activityAnalysis[tagLower] * 0.3;
      }
      
      // Check against user interests
      if (userInterests.includes(tagLower)) {
        score += 0.5;
      }
      
      // Check against user preferences
      if (userPreferences?.includes(tagLower)) {
        score += 0.8;
      }
    });
    
    // Category relevance
    const categoryLower = material.category.toLowerCase();
    if (activityAnalysis[categoryLower]) {
      score += activityAnalysis[categoryLower] * 0.4;
    }
    
    // Difficulty adjustment based on user level
    const userLevel = this.assessUserLevel(activityAnalysis);
    if (material.difficulty === userLevel) {
      score += 0.3;
    } else if (material.difficulty === 'Intermediate' && userLevel === 'Beginner') {
      score += 0.1; // Encourage progression
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  // Assess user's current learning level
  private assessUserLevel(activityAnalysis: Record<string, number>): string {
    const totalActivity = Object.values(activityAnalysis).reduce((sum, count) => sum + count, 0);
    
    if (totalActivity < 5) return 'Beginner';
    if (totalActivity < 15) return 'Intermediate';
    return 'Advanced';
  }

  // Generate explanation for recommendation
  private generateRecommendationReason(
    material: EducationMaterial,
    activityAnalysis: Record<string, number>,
    userInterests: string[]
  ): string {
    const reasons: string[] = [];
    
    // Check for activity-based reasons
    material.tags?.forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (activityAnalysis[tagLower]) {
        reasons.push(`You've shown interest in ${tag}`);
      }
    });
    
    // Check for interest-based reasons
    const matchingInterests = material.tags?.filter(tag => 
      userInterests.includes(tag.toLowerCase())
    );
    if (matchingInterests && matchingInterests.length > 0) {
      reasons.push(`Aligns with your interests in ${matchingInterests.join(', ')}`);
    }
    
    // Check for NMC pillar alignment
    const pillarAlignment = this.checkNMCPillarAlignment(material);
    if (pillarAlignment) {
      reasons.push(`Supports ${pillarAlignment} pillar of NMC standards`);
    }
    
    if (reasons.length === 0) {
      reasons.push('Recommended based on your learning profile');
    }
    
    return reasons.join('. ');
  }

  // Check alignment with NMC pillars
  private checkNMCPillarAlignment(material: EducationMaterial): string | null {
    const content = `${material.title} ${material.description}`.toLowerCase();
    
    for (const pillar of Object.values(NMC.PILLARS)) {
      if (content.includes(pillar.title.toLowerCase())) {
        return pillar.title;
      }
    }
    
    return null;
  }

  // Map material category to NMC category
  private mapToNMCCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'patient_safety': 'Prioritise People',
      'evidence_based_practice': 'Practise Effectively',
      'communication': 'Preserve Safety',
      'leadership': 'Promote Professionalism and Trust',
      'mental_health': 'Prioritise People',
      'infection_control': 'Preserve Safety',
      'medication_safety': 'Preserve Safety',
      'palliative_care': 'Prioritise People',
      'digital_health': 'Practise Effectively',
      'cultural_competence': 'Prioritise People',
    };
    
    return categoryMap[category] || 'General Professional Development';
  }

  // Get materials by category
  async getMaterialsByCategory(category: string): Promise<EducationMaterial[]> {
    try {
      const materials = await this.getEducationalMaterials();
      return materials.filter(material => material.category === category);
    } catch (error) {
      console.error('Failed to get materials by category:', error);
      throw error;
    }
  }

  // Get materials by difficulty level
  async getMaterialsByDifficulty(difficulty: string): Promise<EducationMaterial[]> {
    try {
      const materials = await this.getEducationalMaterials();
      return materials.filter(material => material.difficulty === difficulty);
    } catch (error) {
      console.error('Failed to get materials by difficulty:', error);
      throw error;
    }
  }

  // Search materials by keyword
  async searchMaterials(query: string): Promise<EducationMaterial[]> {
    try {
      const materials = await this.getEducationalMaterials();
      const queryLower = query.toLowerCase();
      
      return materials.filter(material => 
        material.title.toLowerCase().includes(queryLower) ||
        material.description?.toLowerCase().includes(queryLower) ||
        material.tags?.some(tag => tag.toLowerCase().includes(queryLower))
      );
    } catch (error) {
      console.error('Failed to search materials:', error);
      throw error;
    }
  }

  // Get learning statistics
  async getLearningStatistics(): Promise<{
    totalMaterials: number;
    categories: Record<string, number>;
    difficultyLevels: Record<string, number>;
    recentAdditions: EducationMaterial[];
  }> {
    try {
      const materials = await this.getEducationalMaterials();
      
      const categories: Record<string, number> = {};
      const difficultyLevels: Record<string, number> = {};
      
      materials.forEach(material => {
        categories[material.category] = (categories[material.category] || 0) + 1;
        if (material.difficulty) {
          difficultyLevels[material.difficulty] = (difficultyLevels[material.difficulty] || 0) + 1;
        }
      });
      
      const recentAdditions = materials
        .sort((a, b) => {
          const aDate = a.last_updated ? new Date(a.last_updated).getTime() : 0;
          const bDate = b.last_updated ? new Date(b.last_updated).getTime() : 0;
          return bDate - aDate;
        })
        .slice(0, 5);
      
      return {
        totalMaterials: materials.length,
        categories,
        difficultyLevels,
        recentAdditions,
      };
    } catch (error) {
      console.error('Failed to get learning statistics:', error);
      throw error;
    }
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    try {
      console.log('EducationService cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup EducationService:', error);
    }
  }
}

export const educationService = new EducationService();
export default educationService; 