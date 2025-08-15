import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { backupService, BackupData, BackupOptions, RestoreOptions } from '../services/BackupService';

export interface UseBackupRestoreReturn {
  isCreatingBackup: boolean;
  isRestoringBackup: boolean;
  isExportingBackup: boolean;
  isImportingBackup: boolean;
  backupStatistics: {
    totalBackups: number;
    latestBackup: string | null;
    totalSize: number;
    backupHistory: Array<{ timestamp: string; size: number; records: number }>;
  } | null;
  error: string | null;
  createBackup: (options?: BackupOptions) => Promise<BackupData | null>;
  exportBackup: (backupData: BackupData) => Promise<string | null>;
  importBackup: (options?: RestoreOptions) => Promise<void>;
  restoreBackup: (backupData: BackupData, options?: RestoreOptions) => Promise<void>;
  shareBackup: (filePath: string) => Promise<void>;
  uploadToCloud: (filePath: string, provider: 'google-drive' | 'icloud' | 'dropbox') => Promise<string | null>;
  downloadFromCloud: (cloudUrl: string) => Promise<string | null>;
  createAutoBackup: () => Promise<void>;
  getBackupStatistics: () => Promise<void>;
  clearError: () => void;
}

export const useBackupRestore = (): UseBackupRestoreReturn => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [backupStatistics, setBackupStatistics] = useState<UseBackupRestoreReturn['backupStatistics']>(null);
  const [error, setError] = useState<string | null>(null);

  // Create backup
  const createBackup = useCallback(async (options: BackupOptions = {}): Promise<BackupData | null> => {
    try {
      setIsCreatingBackup(true);
      setError(null);

      const backupData = await backupService.createBackup(options);
      
      Alert.alert(
        'Backup Created',
        `Successfully created backup with ${backupData.metadata.totalRecords} records (${backupData.metadata.backupSize} bytes)`,
        [{ text: 'OK' }]
      );

      return backupData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create backup';
      setError(errorMessage);
      Alert.alert('Backup Error', errorMessage);
      return null;
    } finally {
      setIsCreatingBackup(false);
    }
  }, []);

  // Export backup
  const exportBackup = useCallback(async (backupData: BackupData): Promise<string | null> => {
    try {
      setIsExportingBackup(true);
      setError(null);

      const filePath = await backupService.exportBackup(backupData);
      
      Alert.alert(
        'Backup Exported',
        'Backup file has been exported successfully. You can now share or upload it to cloud storage.',
        [
          { text: 'Share', onPress: () => shareBackup(filePath) },
          { text: 'OK' }
        ]
      );

      return filePath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export backup';
      setError(errorMessage);
      Alert.alert('Export Error', errorMessage);
      return null;
    } finally {
      setIsExportingBackup(false);
    }
  }, []);

  // Import backup
  const importBackup = useCallback(async (options: RestoreOptions = {}): Promise<void> => {
    try {
      setIsImportingBackup(true);
      setError(null);

      Alert.alert(
        'Import Backup',
        'This will import data from a backup file. Choose how to handle existing data:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Merge', 
            onPress: async () => {
              try {
                const backupData = await backupService.importBackup({ ...options, mergeData: true });
                await backupService.restoreBackup(backupData, { ...options, mergeData: true });
                Alert.alert('Import Successful', 'Backup data has been merged with existing data.');
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to import backup';
                setError(errorMessage);
                Alert.alert('Import Error', errorMessage);
              }
            }
          },
          { 
            text: 'Overwrite', 
            style: 'destructive',
            onPress: async () => {
              try {
                const backupData = await backupService.importBackup({ ...options, overwriteExisting: true });
                await backupService.restoreBackup(backupData, { ...options, overwriteExisting: true });
                Alert.alert('Import Successful', 'Backup data has been restored, overwriting existing data.');
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to import backup';
                setError(errorMessage);
                Alert.alert('Import Error', errorMessage);
              }
            }
          }
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import backup';
      setError(errorMessage);
      Alert.alert('Import Error', errorMessage);
    } finally {
      setIsImportingBackup(false);
    }
  }, []);

  // Restore backup
  const restoreBackup = useCallback(async (backupData: BackupData, options: RestoreOptions = {}): Promise<void> => {
    try {
      setIsRestoringBackup(true);
      setError(null);

      await backupService.restoreBackup(backupData, options);
      
      Alert.alert('Restore Successful', 'Backup data has been restored successfully.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore backup';
      setError(errorMessage);
      Alert.alert('Restore Error', errorMessage);
    } finally {
      setIsRestoringBackup(false);
    }
  }, []);

  // Share backup
  const shareBackup = useCallback(async (filePath: string): Promise<void> => {
    try {
      setError(null);
      await backupService.shareBackup(filePath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share backup';
      setError(errorMessage);
      Alert.alert('Share Error', errorMessage);
    }
  }, []);

  // Upload to cloud
  const uploadToCloud = useCallback(async (filePath: string, provider: 'google-drive' | 'icloud' | 'dropbox'): Promise<string | null> => {
    try {
      setError(null);

      Alert.alert(
        'Upload to Cloud',
        `This will upload your backup to ${provider}. Make sure you're signed in to your ${provider} account.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload',
            onPress: async () => {
              try {
                const cloudUrl = await backupService.uploadToCloud(filePath, provider);
                Alert.alert(
                  'Upload Successful',
                  `Backup has been uploaded to ${provider}.\nURL: ${cloudUrl}`,
                  [{ text: 'OK' }]
                );
                return cloudUrl;
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to upload to cloud';
                setError(errorMessage);
                Alert.alert('Upload Error', errorMessage);
                return null;
              }
            }
          }
        ]
      );

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload to cloud';
      setError(errorMessage);
      Alert.alert('Upload Error', errorMessage);
      return null;
    }
  }, []);

  // Download from cloud
  const downloadFromCloud = useCallback(async (cloudUrl: string): Promise<string | null> => {
    try {
      setError(null);

      const localPath = await backupService.downloadFromCloud(cloudUrl);
      
      Alert.alert(
        'Download Successful',
        'Backup has been downloaded from cloud storage. You can now restore it.',
        [
          { text: 'Restore', onPress: () => importBackup() },
          { text: 'OK' }
        ]
      );

      return localPath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download from cloud';
      setError(errorMessage);
      Alert.alert('Download Error', errorMessage);
      return null;
    }
  }, [importBackup]);

  // Create auto-backup
  const createAutoBackup = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await backupService.createAutoBackup();
      
      Alert.alert(
        'Auto-Backup Complete',
        'Automatic backup has been created successfully.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create auto-backup';
      setError(errorMessage);
      Alert.alert('Auto-Backup Error', errorMessage);
    }
  }, []);

  // Get backup statistics
  const getBackupStatistics = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const stats = await backupService.getBackupStatistics();
      setBackupStatistics(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get backup statistics';
      setError(errorMessage);
      console.error('Backup statistics error:', err);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
}; 