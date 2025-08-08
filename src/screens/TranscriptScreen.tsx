import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { RootStackParamList, Transcript } from '../types';
import { databaseService } from '../services/DatabaseService';

type TranscriptScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Transcript'>;

const TranscriptScreen: React.FC = () => {
  const navigation = useNavigation<TranscriptScreenNavigationProp>();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTranscripts();
  }, []);

  const loadTranscripts = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getAllTranscripts();
      setTranscripts(data);
    } catch (error) {
      console.error('Failed to load transcripts:', error);
      Alert.alert('Error', 'Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTranscripts();
    setRefreshing(false);
  };

  const handleDeleteTranscript = (transcriptId: number) => {
    Alert.alert(
      'Delete Transcript',
      'Are you sure you want to delete this transcript?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteTranscript(transcriptId);
              await loadTranscripts();
              Alert.alert('Success', 'Transcript deleted successfully');
            } catch (error) {
              console.error('Failed to delete transcript:', error);
              Alert.alert('Error', 'Failed to delete transcript');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTranscriptItem = ({ item }: { item: Transcript }) => (
    <View style={styles.transcriptItem}>
      <View style={styles.transcriptHeader}>
        <Text style={styles.transcriptTitle}>{item.title}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTranscript(item.id!)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.transcriptContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      {item.tags && (
        <View style={styles.tagsContainer}>
          {item.tags.split(',').map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag.trim()}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.transcriptFooter}>
        <Text style={styles.transcriptDate}>
          {formatDate(item.created_at || new Date().toISOString())}
        </Text>
        {item.isEnhanced && (
          <View style={styles.enhancedBadge}>
            <Text style={styles.enhancedText}>AI Enhanced</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Transcripts Yet</Text>
      <Text style={styles.emptyStateText}>
        Start recording your nursing reflections to see them here.
      </Text>
      <TouchableOpacity
        style={styles.startRecordingButton}
        onPress={() => navigation.navigate('VoiceRecorder' as any, { mode: 'transcript' })}
      >
        <Text style={styles.startRecordingButtonText}>Start Recording</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading transcripts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Transcripts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('VoiceRecorder' as any, { mode: 'transcript' })}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transcripts}
        renderItem={renderTranscriptItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  headerTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.GRAY_900,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
  },
  addButtonText: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    color: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_600,
    marginTop: SPACING.MD,
  },
  listContainer: {
    padding: SPACING.MD,
  },
  transcriptItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  transcriptTitle: {
    ...TYPOGRAPHY.H3,
    color: COLORS.GRAY_900,
    flex: 1,
  },
  deleteButton: {
    padding: SPACING.XS,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  transcriptContent: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_700,
    marginBottom: SPACING.MD,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.MD,
  },
  tag: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  tagText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY_DARK,
  },
  transcriptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transcriptDate: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY_500,
  },
  enhancedBadge: {
    backgroundColor: COLORS.SUCCESS_LIGHT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  enhancedText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.SUCCESS_DARK,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.GRAY_700,
    marginBottom: SPACING.MD,
  },
  emptyStateText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_600,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  startRecordingButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  startRecordingButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
});

export default TranscriptScreen; 