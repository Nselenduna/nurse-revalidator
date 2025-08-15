import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { useLearningRecommendations, LearningRecommendation } from '../hooks/useLearningRecommendations';
import { EducationMaterial } from '../types';

interface LearningRecommendationsProps {
  onMaterialSelect?: (material: EducationMaterial) => void;
}

export const LearningRecommendations: React.FC<LearningRecommendationsProps> = ({
  onMaterialSelect,
}) => {
  const {
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
  } = useLearningRecommendations();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EducationMaterial[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [filteredMaterials, setFilteredMaterials] = useState<EducationMaterial[]>([]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchMaterials(query);
      setSearchResults(results);
    } catch (err) {
      Alert.alert('Search Error', 'Failed to search materials. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter selection
  const handleFilterSelect = async (filter: string) => {
    setSelectedFilter(filter);
    try {
      let results: EducationMaterial[] = [];
      
      if (filter === 'all') {
        results = allMaterials;
      } else if (filter === 'beginner' || filter === 'intermediate' || filter === 'advanced') {
        results = await getMaterialsByDifficulty(filter.charAt(0).toUpperCase() + filter.slice(1));
      } else {
        results = await getMaterialsByCategory(filter);
      }
      
      setFilteredMaterials(results);
    } catch (err) {
      Alert.alert('Filter Error', 'Failed to filter materials. Please try again.');
    }
  };

  // Handle material selection
  const handleMaterialSelect = (material: EducationMaterial) => {
    onMaterialSelect?.(material);
    Alert.alert(
      'Open Material',
      `Would you like to open "${material.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
          // In a real app, this would open the URL or navigate to the material
          Alert.alert('Material', `Opening: ${material.url}`);
        }},
      ]
    );
  };

  // Render recommendation item
  const renderRecommendation = ({ item }: { item: LearningRecommendation }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => handleMaterialSelect(item.material)}
    >
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationTitle}>{item.material.title}</Text>
        <View style={styles.relevanceBadge}>
          <Text style={styles.relevanceText}>
            {Math.round(item.relevanceScore * 100)}% match
          </Text>
        </View>
      </View>
      
      <Text style={styles.recommendationDescription}>{item.material.description}</Text>
      
      <View style={styles.recommendationMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Duration:</Text>
          <Text style={styles.metaValue}>{item.material.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Level:</Text>
          <Text style={styles.metaValue}>{item.material.difficulty}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Category:</Text>
          <Text style={styles.metaValue}>{item.category}</Text>
        </View>
      </View>
      
      <Text style={styles.recommendationReason}>{item.reason}</Text>
      
      <View style={styles.tagsContainer}>
        {item.material.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tagItem}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  // Render material item (for search/filter results)
  const renderMaterial = ({ item }: { item: EducationMaterial }) => (
    <TouchableOpacity
      style={styles.materialCard}
      onPress={() => handleMaterialSelect(item)}
    >
      <View style={styles.materialHeader}>
        <Text style={styles.materialTitle}>{item.title}</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>
      
      <Text style={styles.materialDescription}>{item.description}</Text>
      
      <View style={styles.materialMeta}>
        <Text style={styles.materialDuration}>{item.duration}</Text>
        <Text style={styles.materialCategory}>{item.category.replace('_', ' ')}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading learning recommendations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshRecommendations}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Learning Recommendations</Text>
        <Text style={styles.subtitle}>
          Personalized suggestions based on your activity and interests
        </Text>
      </View>

      {/* User Profile */}
      <View style={styles.userProfile}>
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Your Level:</Text>
          <Text style={styles.profileValue}>{userLevel}</Text>
        </View>
        {userInterests.length > 0 && (
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Interests:</Text>
            <Text style={styles.profileValue}>{userInterests.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      {statistics && (
        <View style={styles.statisticsContainer}>
          <Text style={styles.statisticsTitle}>Learning Library</Text>
          <View style={styles.statisticsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.totalMaterials}</Text>
              <Text style={styles.statLabel}>Total Materials</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Object.keys(statistics.categories).length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{recommendations.length}</Text>
              <Text style={styles.statLabel}>For You</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search learning materials..."
          placeholderTextColor={COLORS.TEXT_DISABLED}
        />
        {isSearching && <ActivityIndicator size="small" color={COLORS.PRIMARY} />}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => handleFilterSelect('all')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'beginner' && styles.filterButtonActive]}
            onPress={() => handleFilterSelect('beginner')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'beginner' && styles.filterButtonTextActive]}>
              Beginner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'intermediate' && styles.filterButtonActive]}
            onPress={() => handleFilterSelect('intermediate')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'intermediate' && styles.filterButtonTextActive]}>
              Intermediate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'advanced' && styles.filterButtonActive]}
            onPress={() => handleFilterSelect('advanced')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'advanced' && styles.filterButtonTextActive]}>
              Advanced
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      {searchQuery.trim().length > 0 ? (
        // Search results
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Search Results ({searchResults.length})
          </Text>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderMaterial}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noResultsText}>No materials found for "{searchQuery}"</Text>
          )}
        </View>
      ) : selectedFilter !== 'all' ? (
        // Filtered results
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Materials ({filteredMaterials.length})
          </Text>
          {filteredMaterials.length > 0 ? (
            <FlatList
              data={filteredMaterials}
              renderItem={renderMaterial}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noResultsText}>No materials found for this filter</Text>
          )}
        </View>
      ) : (
        // Recommendations
        <View style={styles.recommendationsContainer}>
          <View style={styles.recommendationsHeader}>
            <Text style={styles.recommendationsTitle}>
              Recommended for You ({recommendations.length})
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshRecommendations}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {recommendations.length > 0 ? (
            <FlatList
              data={recommendations}
              renderItem={renderRecommendation}
              keyExtractor={(item) => item.material.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noResultsText}>
              No recommendations yet. Start using the app to get personalized suggestions!
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XL,
  },
  header: {
    marginBottom: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.H1,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
  },
  userProfile: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  profileLabel: {
    ...TYPOGRAPHY.LABEL,
    color: COLORS.TEXT_SECONDARY,
  },
  profileValue: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  statisticsContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  statisticsTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  statisticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.H1,
    color: COLORS.PRIMARY,
    fontSize: 24,
  },
  statLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    marginRight: SPACING.SM,
  },
  filtersContainer: {
    marginBottom: SPACING.LG,
  },
  filterButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.GRAY_100,
    marginRight: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  filterButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.WHITE,
  },
  resultsContainer: {
    marginBottom: SPACING.LG,
  },
  resultsTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  recommendationsContainer: {
    marginBottom: SPACING.LG,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  recommendationsTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
  },
  refreshButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  refreshButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  recommendationTitle: {
    ...TYPOGRAPHY.H3,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  relevanceBadge: {
    backgroundColor: COLORS.SUCCESS + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  relevanceText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.SUCCESS,
    fontWeight: '600',
  },
  recommendationDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  },
  recommendationMeta: {
    marginBottom: SPACING.MD,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.XS,
  },
  metaLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  metaValue: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  recommendationReason: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY,
    fontStyle: 'italic',
    marginBottom: SPACING.SM,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: COLORS.PRIMARY + '20',
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    marginRight: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  tagText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY,
  },
  materialCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  materialTitle: {
    ...TYPOGRAPHY.H3,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  difficultyBadge: {
    backgroundColor: COLORS.SECONDARY + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  difficultyText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.SECONDARY,
    fontWeight: '600',
  },
  materialDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  },
  materialMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialDuration: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  materialCategory: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  retryButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  noResultsText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: SPACING.XL,
  },
}); 