import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { useBackupRestore } from '../hooks/useBackupRestore';
import { BackupOptions, RestoreOptions } from '../services/BackupService';

export const BackupRestoreManager: React.FC = () => {
  const {
    isCreatingBackup,
    isRestoringBackup,
    isExportingBackup,
    isImportingBackup,
    backupStatistics,
    error,
    createBackup,
    exportBackup,
    importBackup,
    restoreBackup,
    shareBackup,
    uploadToCloud,
    downloadFromCloud,
    createAutoBackup,
    getBackupStatistics,
    clearError,
  } = useBackupRestore();

  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeAudioFiles: true,
    includeForms: true,
    encryptBackup: false,
    compressionLevel: 'low',
  });

  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    validateData: true,
    mergeData: false,
    overwriteExisting: false,
  });

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  // Load backup statistics on mount
  useEffect(() => {
    getBackupStatistics();
  }, [getBackupStatistics]);

  // Handle backup creation
  const handleCreateBackup = async () => {
    const backupData = await createBackup(backupOptions);
    if (backupData) {
      await exportBackup(backupData);
    }
  };

  // Handle backup import
  const handleImportBackup = () => {
    importBackup(restoreOptions);
  };

  // Handle cloud upload
  const handleCloudUpload = async (provider: 'google-drive' | 'icloud' | 'dropbox') => {
    Alert.alert(
      'Cloud Upload',
      `Select a backup file to upload to ${provider}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select File',
          onPress: async () => {
            // This would trigger file selection and upload
            Alert.alert('Upload', `Uploading to ${provider}... (simulated)`);
          },
        },
      ]
    );
  };

  // Handle cloud download
  const handleCloudDownload = () => {
    Alert.prompt(
      'Cloud Download',
      'Enter the cloud URL to download backup from:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async (url) => {
            if (url) {
              await downloadFromCloud(url);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Toggle auto-backup
  const toggleAutoBackup = () => {
    setAutoBackupEnabled(!autoBackupEnabled);
    if (!autoBackupEnabled) {
      Alert.alert(
        'Auto-Backup Enabled',
        'Automatic backups will be created periodically. You can disable this in settings.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Backup & Restore</Text>
        <Text style={styles.subtitle}>
          Manage your data backups and restore from cloud storage
        </Text>
      </View>

      {/* Backup Statistics */}
      {backupStatistics && (
        <View style={styles.statisticsContainer}>
          <Text style={styles.sectionTitle}>Backup Statistics</Text>
          <View style={styles.statisticsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{backupStatistics.totalBackups}</Text>
              <Text style={styles.statLabel}>Total Backups</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {backupStatistics.latestBackup ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.statLabel}>Latest Backup</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round(backupStatistics.totalSize / 1024)}KB
              </Text>
              <Text style={styles.statLabel}>Total Size</Text>
            </View>
          </View>
        </View>
      )}

      {/* Backup Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup Options</Text>
        
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Include Audio Files</Text>
          <Switch
            value={backupOptions.includeAudioFiles}
            onValueChange={(value) => setBackupOptions(prev => ({ ...prev, includeAudioFiles: value }))}
            trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
            thumbColor={COLORS.WHITE}
          />
        </View>

        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Include Forms</Text>
          <Switch
            value={backupOptions.includeForms}
            onValueChange={(value) => setBackupOptions(prev => ({ ...prev, includeForms: value }))}
            trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
            thumbColor={COLORS.WHITE}
          />
        </View>

        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Encrypt Backup</Text>
          <Switch
            value={backupOptions.encryptBackup}
            onValueChange={(value) => setBackupOptions(prev => ({ ...prev, encryptBackup: value }))}
            trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
            thumbColor={COLORS.WHITE}
          />
        </View>

        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Auto-Backup</Text>
          <Switch
            value={autoBackupEnabled}
            onValueChange={toggleAutoBackup}
            trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
            thumbColor={COLORS.WHITE}
          />
        </View>
      </View>

      {/* Restore Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restore Options</Text>
        
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Validate Data</Text>
          <Switch
            value={restoreOptions.validateData}
            onValueChange={(value) => setRestoreOptions(prev => ({ ...prev, validateData: value }))}
            trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
            thumbColor={COLORS.WHITE}
          />
        </View>

        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Merge with Existing</Text>
          <Switch
            value={restoreOptions.mergeData}
            onValueChange={(value) => setRestoreOptions(prev => ({ ...prev, mergeData: value }))}
            trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
            thumbColor={COLORS.WHITE}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Backup Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleCreateBackup}
          disabled={isCreatingBackup}
        >
          {isCreatingBackup ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Create Backup</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={createAutoBackup}
          disabled={isCreatingBackup}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Create Auto-Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.successButton]}
          onPress={handleImportBackup}
          disabled={isImportingBackup}
        >
          {isImportingBackup ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Import Backup</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Cloud Integration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud Integration</Text>
        
        <View style={styles.cloudButtons}>
          <TouchableOpacity
            style={[styles.cloudButton, styles.googleDriveButton]}
            onPress={() => handleCloudUpload('google-drive')}
          >
            <Text style={styles.cloudButtonText}>Google Drive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cloudButton, styles.icloudButton]}
            onPress={() => handleCloudUpload('icloud')}
          >
            <Text style={styles.cloudButtonText}>iCloud</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cloudButton, styles.dropboxButton]}
            onPress={() => handleCloudUpload('dropbox')}
          >
            <Text style={styles.cloudButtonText}>Dropbox</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={handleCloudDownload}
        >
          <Text style={styles.buttonText}>Download from Cloud</Text>
        </TouchableOpacity>
      </View>

      {/* Backup History */}
      {backupStatistics?.backupHistory && backupStatistics.backupHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup History</Text>
          <ScrollView style={styles.historyContainer}>
            {backupStatistics.backupHistory.map((backup, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {new Date(backup.timestamp).toLocaleDateString()}
                </Text>
                <Text style={styles.historyDetails}>
                  {backup.records} records • {Math.round(backup.size / 1024)}KB
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.clearErrorButton} onPress={clearError}>
            <Text style={styles.clearErrorText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.refreshButton]}
        onPress={getBackupStatistics}
      >
        <Text style={[styles.buttonText, styles.refreshButtonText]}>Refresh Statistics</Text>
      </TouchableOpacity>
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
  statisticsContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  section: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  sectionTitle: {
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
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  optionLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  actionsContainer: {
    marginBottom: SPACING.LG,
  },
  actionButton: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.GRAY_200,
  },
  successButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  infoButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  refreshButton: {
    backgroundColor: COLORS.GRAY_100,
  },
  buttonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  secondaryButtonText: {
    color: COLORS.TEXT_PRIMARY,
  },
  refreshButtonText: {
    color: COLORS.TEXT_PRIMARY,
  },
  cloudButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  cloudButton: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    alignItems: 'center',
    marginHorizontal: SPACING.XS,
  },
  googleDriveButton: {
    backgroundColor: '#4285F4',
  },
  icloudButton: {
    backgroundColor: '#007AFF',
  },
  dropboxButton: {
    backgroundColor: '#0061FF',
  },
  cloudButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  historyContainer: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  historyDate: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  historyDetails: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR + '20',
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.ERROR,
    flex: 1,
  },
  clearErrorButton: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  clearErrorText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
}); 