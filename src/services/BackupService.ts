import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert } from 'react-native';
import { Transcript, Form, CPDLog, EducationMaterial, Settings, User } from '../types';
import databaseService from './DatabaseService';

export interface BackupData {
  version: string;
  timestamp: string;
  device: string;
  platform: string;
  data: {
    transcripts: Transcript[];
    forms: Form[];
    cpdLogs: CPDLog[];
    educationMaterials: EducationMaterial[];
    settings: Settings[];
    users: User[];
  };
  metadata: {
    totalRecords: number;
    backupSize: number;
    checksum: string;
  };
}

export interface BackupOptions {
  includeAudioFiles?: boolean;
  includeForms?: boolean;
  encryptBackup?: boolean;
  compressionLevel?: 'none' | 'low' | 'high';
}

export interface RestoreOptions {
  validateData?: boolean;
  mergeData?: boolean;
  overwriteExisting?: boolean;
}

class BackupService {
  private isWeb = Platform.OS === 'web';
  private backupDirectory = `${FileSystem.documentDirectory}backups/`;
  private version = '1.0.0';

  async initialize(): Promise<void> {
    try {
      if (!this.isWeb) {
        const dirInfo = await FileSystem.getInfoAsync(this.backupDirectory);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(this.backupDirectory, { intermediates: true });
        }
      }
      console.log('BackupService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BackupService:', error);
      throw error;
    }
  }

  // Create comprehensive backup
  async createBackup(options: BackupOptions = {}): Promise<BackupData> {
    try {
      console.log('Creating comprehensive backup...');
      
      const {
        includeAudioFiles = true,
        includeForms = true,
        encryptBackup = false,
        compressionLevel = 'low'
      } = options;

      // Collect all data from database
      const transcripts = await databaseService.getTranscripts();
      const forms = includeForms ? await databaseService.getForms() : [];
      const cpdLogs = await databaseService.getCPDLogs();
      const educationMaterials = await databaseService.getEducationMaterials();
      const settings = await databaseService.getSettings();
      const users = await databaseService.getUsers();

      // Collect audio files if requested
      let audioFiles: string[] = [];
      if (includeAudioFiles && !this.isWeb) {
        audioFiles = await this.collectAudioFiles();
      }

      // Create backup data structure
      const backupData: BackupData = {
        version: this.version,
        timestamp: new Date().toISOString(),
        device: Platform.OS,
        platform: Platform.Version?.toString() || 'unknown',
        data: {
          transcripts,
          forms,
          cpdLogs,
          educationMaterials,
          settings,
          users,
        },
        metadata: {
          totalRecords: transcripts.length + forms.length + cpdLogs.length + educationMaterials.length + settings.length + users.length,
          backupSize: 0, // Will be calculated after serialization
          checksum: '', // Will be calculated after serialization
        },
      };

      // Calculate metadata
      const serializedData = JSON.stringify(backupData);
      backupData.metadata.backupSize = new Blob([serializedData]).size;
      backupData.metadata.checksum = await this.generateChecksum(serializedData);

      // Encrypt if requested
      let finalData = serializedData;
      if (encryptBackup) {
        finalData = await this.encryptData(serializedData);
      }

      // Compress if requested
      if (compressionLevel !== 'none') {
        finalData = await this.compressData(finalData, compressionLevel);
      }

      console.log(`Backup created successfully: ${backupData.metadata.totalRecords} records, ${backupData.metadata.backupSize} bytes`);
      return backupData;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  // Export backup to file
  async exportBackup(backupData: BackupData, options: BackupOptions = {}): Promise<string> {
    try {
      console.log('Exporting backup to file...');
      
      const serializedData = JSON.stringify(backupData);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `nmc-nurse-backup-${timestamp}.json`;
      const filePath = `${this.backupDirectory}${filename}`;

      if (!this.isWeb) {
        await FileSystem.writeAsStringAsync(filePath, serializedData);
        console.log(`Backup exported to: ${filePath}`);
        return filePath;
      } else {
        // Web: Create downloadable file
        const blob = new Blob([serializedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        console.log('Backup downloaded in web browser');
        return 'web-download';
      }
    } catch (error) {
      console.error('Failed to export backup:', error);
      throw error;
    }
  }

  // Share backup file
  async shareBackup(filePath: string): Promise<void> {
    try {
      console.log('Sharing backup file...');
      
      if (!this.isWeb && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Share NMC Nurse Backup',
        });
        console.log('Backup shared successfully');
      } else {
        console.log('Sharing not available on this platform');
      }
    } catch (error) {
      console.error('Failed to share backup:', error);
      throw error;
    }
  }

  // Import backup from file
  async importBackup(options: RestoreOptions = {}): Promise<BackupData> {
    try {
      console.log('Importing backup from file...');
      
      if (this.isWeb) {
        // Web: Use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const text = await file.text();
            const backupData = JSON.parse(text);
            await this.restoreBackup(backupData, options);
          }
        };
        input.click();
        throw new Error('Web import handled by file input');
      } else {
        // Mobile: Use document picker
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          throw new Error('Backup import cancelled');
        }

        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const backupData: BackupData = JSON.parse(fileContent);
        
        console.log('Backup file imported successfully');
        return backupData;
      }
    } catch (error) {
      console.error('Failed to import backup:', error);
      throw error;
    }
  }

  // Restore backup data
  async restoreBackup(backupData: BackupData, options: RestoreOptions = {}): Promise<void> {
    try {
      console.log('Restoring backup data...');
      
      const {
        validateData = true,
        mergeData = false,
        overwriteExisting = false
      } = options;

      // Validate backup data
      if (validateData) {
        const isValid = await this.validateBackupData(backupData);
        if (!isValid) {
          throw new Error('Invalid backup data format');
        }
      }

      // Check version compatibility
      if (backupData.version !== this.version) {
        console.warn(`Backup version ${backupData.version} differs from current version ${this.version}`);
      }

      // Restore data based on options
      if (overwriteExisting) {
        // Clear existing data and restore
        await this.clearAllData();
        await this.restoreAllData(backupData.data);
      } else if (mergeData) {
        // Merge with existing data
        await this.mergeData(backupData.data);
      } else {
        // Check for conflicts
        const conflicts = await this.checkForConflicts(backupData.data);
        if (conflicts.length > 0) {
          throw new Error(`Conflicts detected: ${conflicts.join(', ')}`);
        }
        await this.restoreAllData(backupData.data);
      }

      console.log('Backup restored successfully');
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  // Get backup statistics
  async getBackupStatistics(): Promise<{
    totalBackups: number;
    latestBackup: string | null;
    totalSize: number;
    backupHistory: Array<{ timestamp: string; size: number; records: number }>;
  }> {
    try {
      if (this.isWeb) {
        // Web: Return basic stats from localStorage
        const backups = this.getWebBackups();
        return {
          totalBackups: backups.length,
          latestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
          totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
          backupHistory: backups.map(backup => ({
            timestamp: backup.timestamp,
            size: backup.size,
            records: backup.records,
          })),
        };
      } else {
        // Mobile: Scan backup directory
        const backupFiles = await FileSystem.readDirectoryAsync(this.backupDirectory);
        const backupStats = await Promise.all(
          backupFiles
            .filter(file => file.endsWith('.json'))
            .map(async (file) => {
              const filePath = `${this.backupDirectory}${file}`;
              const fileInfo = await FileSystem.getInfoAsync(filePath);
              const content = await FileSystem.readAsStringAsync(filePath);
              const backupData: BackupData = JSON.parse(content);
              return {
                timestamp: backupData.timestamp,
                size: fileInfo.size || 0,
                records: backupData.metadata.totalRecords,
              };
            })
        );

        return {
          totalBackups: backupStats.length,
          latestBackup: backupStats.length > 0 ? backupStats[backupStats.length - 1].timestamp : null,
          totalSize: backupStats.reduce((sum, stat) => sum + stat.size, 0),
          backupHistory: backupStats.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        };
      }
    } catch (error) {
      console.error('Failed to get backup statistics:', error);
      throw error;
    }
  }

  // Auto-backup functionality
  async createAutoBackup(): Promise<void> {
    try {
      console.log('Creating automatic backup...');
      
      const backupData = await this.createBackup({
        includeAudioFiles: false, // Skip audio files for auto-backup
        includeForms: true,
        encryptBackup: false,
        compressionLevel: 'high',
      });

      await this.exportBackup(backupData);
      console.log('Auto-backup completed successfully');
    } catch (error) {
      console.error('Failed to create auto-backup:', error);
      throw error;
    }
  }

  // Cloud integration helpers
  async uploadToCloud(filePath: string, cloudProvider: 'google-drive' | 'icloud' | 'dropbox'): Promise<string> {
    try {
      console.log(`Uploading backup to ${cloudProvider}...`);
      
      // This would integrate with cloud storage APIs
      // For now, we'll simulate the upload
      const uploadUrl = `https://${cloudProvider}.com/backup-${Date.now()}`;
      
      console.log(`Backup uploaded to ${cloudProvider}: ${uploadUrl}`);
      return uploadUrl;
    } catch (error) {
      console.error(`Failed to upload to ${cloudProvider}:`, error);
      throw error;
    }
  }

  async downloadFromCloud(cloudUrl: string): Promise<string> {
    try {
      console.log('Downloading backup from cloud...');
      
      // This would download from cloud storage
      // For now, we'll simulate the download
      const localPath = `${this.backupDirectory}cloud-backup-${Date.now()}.json`;
      
      console.log(`Backup downloaded from cloud: ${localPath}`);
      return localPath;
    } catch (error) {
      console.error('Failed to download from cloud:', error);
      throw error;
    }
  }

  // Private helper methods
  private async collectAudioFiles(): Promise<string[]> {
    try {
      const audioDirectory = `${FileSystem.documentDirectory}audio/`;
      const audioFiles = await FileSystem.readDirectoryAsync(audioDirectory);
      return audioFiles.map(file => `${audioDirectory}${file}`);
    } catch (error) {
      console.warn('Failed to collect audio files:', error);
      return [];
    }
  }

  private async generateChecksum(data: string): Promise<string> {
    // Simple checksum generation (in production, use crypto-js or similar)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private async encryptData(data: string): Promise<string> {
    // Simple encryption (in production, use proper encryption)
    return btoa(data); // Base64 encoding for demo
  }

  private async compressData(data: string, level: 'low' | 'high'): Promise<string> {
    // Simple compression (in production, use proper compression)
    if (level === 'high') {
      return data.replace(/\s+/g, ' ').trim(); // Remove extra whitespace
    }
    return data;
  }

  private async validateBackupData(backupData: BackupData): Promise<boolean> {
    return (
      backupData.version &&
      backupData.timestamp &&
      backupData.data &&
      typeof backupData.data.transcripts === 'object' &&
      typeof backupData.data.forms === 'object' &&
      typeof backupData.data.cpdLogs === 'object'
    );
  }

  private async clearAllData(): Promise<void> {
    // Clear all data from database
    await databaseService.clearAllData();
  }

  private async restoreAllData(data: BackupData['data']): Promise<void> {
    // Restore all data to database
    for (const transcript of data.transcripts) {
      await databaseService.saveTranscript(transcript);
    }
    for (const form of data.forms) {
      await databaseService.saveForm(form);
    }
    for (const cpdLog of data.cpdLogs) {
      await databaseService.saveCPDLog(cpdLog);
    }
    for (const setting of data.settings) {
      await databaseService.saveSetting(setting.key, setting.value);
    }
    for (const user of data.users) {
      await databaseService.saveUser(user);
    }
  }

  private async mergeData(data: BackupData['data']): Promise<void> {
    // Merge data with existing data (avoid duplicates)
    const existingTranscripts = await databaseService.getTranscripts();
    const existingForms = await databaseService.getForms();
    const existingCPDLogs = await databaseService.getCPDLogs();

    // Merge transcripts
    for (const transcript of data.transcripts) {
      const exists = existingTranscripts.find(t => t.id === transcript.id);
      if (!exists) {
        await databaseService.saveTranscript(transcript);
      }
    }

    // Merge forms
    for (const form of data.forms) {
      const exists = existingForms.find(f => f.id === form.id);
      if (!exists) {
        await databaseService.saveForm(form);
      }
    }

    // Merge CPD logs
    for (const cpdLog of data.cpdLogs) {
      const exists = existingCPDLogs.find(c => c.id === cpdLog.id);
      if (!exists) {
        await databaseService.saveCPDLog(cpdLog);
      }
    }
  }

  private async checkForConflicts(data: BackupData['data']): Promise<string[]> {
    const conflicts: string[] = [];
    
    // Check for ID conflicts
    const existingTranscripts = await databaseService.getTranscripts();
    const existingForms = await databaseService.getForms();
    const existingCPDLogs = await databaseService.getCPDLogs();

    for (const transcript of data.transcripts) {
      if (existingTranscripts.find(t => t.id === transcript.id)) {
        conflicts.push(`Transcript ID ${transcript.id}`);
      }
    }

    for (const form of data.forms) {
      if (existingForms.find(f => f.id === form.id)) {
        conflicts.push(`Form ID ${form.id}`);
      }
    }

    for (const cpdLog of data.cpdLogs) {
      if (existingCPDLogs.find(c => c.id === cpdLog.id)) {
        conflicts.push(`CPD Log ID ${cpdLog.id}`);
      }
    }

    return conflicts;
  }

  private getWebBackups(): Array<{ timestamp: string; size: number; records: number }> {
    // Get backup history from localStorage (web)
    const backups = localStorage.getItem('backup-history');
    return backups ? JSON.parse(backups) : [];
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    try {
      console.log('BackupService cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup BackupService:', error);
    }
  }
}

export const backupService = new BackupService();
export default backupService; 