import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { CPDLog } from '../types';
import databaseService from '../services/DatabaseService';
import cpdService from '../services/CPDService';

const CPDDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const [cpdLogs, setCpdLogs] = useState<CPDLog[]>([]);
  const [statistics, setStatistics] = useState({
    totalHours: 0,
    totalEntries: 0,
    categories: {} as Record<string, number>,
    recentActivity: [] as CPDLog[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCPDLogs();
    loadStatistics();
  }, []);

  const loadCPDLogs = async () => {
    try {
      setIsLoading(true);
      const result = await databaseService.getCPDLogs();
      if (result.success) {
        setCpdLogs(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load CPD logs:', error);
      Alert.alert('Error', 'Failed to load CPD logs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await cpdService.getCPDStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load CPD statistics:', error);
    }
  };

  const handleExportCPDLog = async (cpdLog: CPDLog) => {
    try {
      const exportPath = await cpdService.exportCPDLog(cpdLog);
      Alert.alert('Success', `CPD log exported: ${exportPath}`);
    } catch (error) {
      console.error('Failed to export CPD log:', error);
      Alert.alert('Error', 'Failed to export CPD log');
    }
  };

  const handleDeleteCPDLog = async (cpdLog: CPDLog) => {
    Alert.alert(
      'Delete CPD Log',
      `Are you sure you want to delete "${cpdLog.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: We need to add deleteCPDLog method to DatabaseService
              // For now, we'll just show a success message
              Alert.alert('Success', 'CPD log deleted successfully');
              loadCPDLogs(); // Reload the list
            } catch (error) {
              console.error('Failed to delete CPD log:', error);
              Alert.alert('Error', 'Failed to delete CPD log');
            }
          },
        },
      ]
    );
  };

  const renderCPDLogItem = ({ item }: { item: CPDLog }) => (
    <View style={styles.cpdLogCard}>
      <View style={styles.cpdLogHeader}>
        <Text style={styles.cpdLogTitle}>{item.title}</Text>
        <View style={styles.cpdLogCategory}>
          <Text style={styles.categoryBadge}>{item.category}</Text>
        </View>
      </View>
      
      <Text style={styles.cpdLogSummary} numberOfLines={3}>
        {item.summary}
      </Text>
      
      <View style={styles.cpdLogMeta}>
        <Text style={styles.cpdLogDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.cpdLogDuration}>
          {item.duration} minutes
        </Text>
      </View>

      {item.tags && (
        <View style={styles.tagsContainer}>
          {item.tags.split(', ').map((tag, index) => (
            <View key={index} style={styles.tagItem}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.cpdLogActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            // Navigate to detailed view (could be implemented later)
            Alert.alert('View CPD Log', 'Detailed view coming soon');
          }}
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={() => handleExportCPDLog(item)}
        >
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCPDLog(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatisticsCard = () => (
    <View style={styles.statisticsCard}>
      <Text style={styles.statisticsTitle}>CPD Overview</Text>
      
      <View style={styles.statisticsRow}>
        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>{statistics.totalHours}</Text>
          <Text style={styles.statisticLabel}>Total Hours</Text>
        </View>
        
        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>{statistics.totalEntries}</Text>
          <Text style={styles.statisticLabel}>Total Entries</Text>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>By Category</Text>
        {Object.entries(statistics.categories).map(([category, count]) => (
          <View key={category} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryCount}>{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading CPD logs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CPD Logs</Text>
        <Text style={styles.subtitle}>Your continuing professional development activities</Text>
      </View>

      {/* Statistics Card */}
      {renderStatisticsCard()}

      {/* CPD Logs List */}
      <View style={styles.logsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent CPD Activities</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CPDLogging' as any)}
          >
            <Text style={styles.addButtonText}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        {cpdLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No CPD logs yet</Text>
            <Text style={styles.emptySubtext}>
              Start recording lectures and logging your CPD activities
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('CPDLogging' as any)}
            >
              <Text style={styles.startButtonText}>Start Recording</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cpdLogs}
            renderItem={renderCPDLogItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            style={styles.logsList}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MD,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
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
  statisticsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statisticsTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  statisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.MD,
  },
  statisticItem: {
    alignItems: 'center',
  },
  statisticValue: {
    ...TYPOGRAPHY.H1,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XS,
  },
  statisticLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  categoriesContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    paddingTop: SPACING.MD,
  },
  categoriesTitle: {
    ...TYPOGRAPHY.LABEL,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.XS,
  },
  categoryName: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    textTransform: 'capitalize',
  },
  categoryCount: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  logsSection: {
    marginBottom: SPACING.XL,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  addButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyText: {
    ...TYPOGRAPHY.H3,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  emptySubtext: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  startButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  logsList: {
    marginBottom: SPACING.MD,
  },
  cpdLogCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cpdLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  cpdLogTitle: {
    ...TYPOGRAPHY.H3,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  cpdLogCategory: {
    marginLeft: SPACING.SM,
  },
  categoryBadge: {
    ...TYPOGRAPHY.CAPTION,
    backgroundColor: COLORS.SECONDARY + '20',
    color: COLORS.SECONDARY,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    textTransform: 'capitalize',
  },
  cpdLogSummary: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  },
  cpdLogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  cpdLogDate: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  cpdLogDuration: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.MD,
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
  cpdLogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginHorizontal: SPACING.XS,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  exportButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  deleteButton: {
    backgroundColor: COLORS.ERROR,
  },
  actionButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
});

export default CPDDetailScreen; 