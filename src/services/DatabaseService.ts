import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Transcript, Form, CPDLog, EducationMaterial, Settings, User, ApiResponse } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = 'nurseApp.db';
  private isWeb = Platform.OS === 'web';

  async initialize(): Promise<void> {
    try {
      if (this.isWeb) {
        console.log('Initializing web storage (localStorage)');
        this.initializeWebStorage();
      } else {
        console.log('Initializing SQLite database');
        this.db = await SQLite.openDatabaseAsync(this.dbName);
        await this.createTables();
      }
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private initializeWebStorage(): void {
    // Initialize localStorage with default data structure
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = ['transcripts', 'forms', 'cpd_logs', 'education_materials', 'settings', 'users'];
      keys.forEach(key => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify([]));
        }
      });
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTablesSQL = `
      -- Table: transcripts
      CREATE TABLE IF NOT EXISTS transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        isEnhanced INTEGER DEFAULT 0,
        aiSuggestions TEXT
      );

      -- Table: forms
      CREATE TABLE IF NOT EXISTS forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        filled_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        form_type TEXT DEFAULT 'revalidation',
        status TEXT DEFAULT 'draft'
      );

      -- Table: cpd_logs
      CREATE TABLE IF NOT EXISTS cpd_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        audio_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        duration INTEGER,
        category TEXT,
        learning_outcomes TEXT
      );

      -- Table: education_materials
      CREATE TABLE IF NOT EXISTS education_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT NOT NULL,
        recommended_for TEXT NOT NULL,
        description TEXT,
        nmc_pillars TEXT
      );

      -- Table: settings
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );

      -- Table: users
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        pin TEXT NOT NULL,
        subscription_tier TEXT DEFAULT 'free',
        subscription_expiry DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.db.execAsync(createTablesSQL);
  }

  // Web storage helpers
  private getWebData(key: string): any[] {
    if (this.isWeb && typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  private setWebData(key: string, data: any[]): void {
    if (this.isWeb && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Transcript operations
  async saveTranscript(transcript: Transcript): Promise<ApiResponse<Transcript>> {
    try {
      if (this.isWeb) {
        const transcripts = this.getWebData('transcripts');
        const newTranscript = {
          ...transcript,
          id: Date.now(), // Simple ID generation for web
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        transcripts.push(newTranscript);
        this.setWebData('transcripts', transcripts);
        return { success: true, data: newTranscript };
      }

      if (!this.db) throw new Error('Database not initialized');

      const { title, content, tags, isEnhanced, aiSuggestions } = transcript;
      const aiSuggestionsJson = aiSuggestions ? JSON.stringify(aiSuggestions) : null;

      const result = await this.db.runAsync(
        'INSERT INTO transcripts (title, content, tags, isEnhanced, aiSuggestions) VALUES (?, ?, ?, ?, ?)',
        [title, content, tags || '', isEnhanced ? 1 : 0, aiSuggestionsJson]
      );

      const newTranscript: Transcript = {
        ...transcript,
        id: result.lastInsertRowId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { success: true, data: newTranscript };
    } catch (error) {
      console.error('Failed to save transcript:', error);
      return { success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save transcript' } };
    }
  }

  async getTranscripts(): Promise<ApiResponse<Transcript[]>> {
    try {
      if (this.isWeb) {
        const transcripts = this.getWebData('transcripts');
        return { success: true, data: transcripts };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.getAllAsync('SELECT * FROM transcripts ORDER BY created_at DESC');
      const transcripts = result.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tags: row.tags,
        isEnhanced: Boolean(row.isEnhanced),
        aiSuggestions: row.aiSuggestions ? JSON.parse(row.aiSuggestions) : [],
      }));

      return { success: true, data: transcripts };
    } catch (error) {
      console.error('Failed to get transcripts:', error);
      return { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to get transcripts' } };
    }
  }

  async updateTranscript(id: number, updates: Partial<Transcript>): Promise<ApiResponse<Transcript>> {
    try {
      if (this.isWeb) {
        const transcripts = this.getWebData('transcripts');
        const index = transcripts.findIndex(t => t.id === id);
        if (index !== -1) {
          const updatedTranscript = { ...transcripts[index], ...updates, updated_at: new Date().toISOString() };
          transcripts[index] = updatedTranscript;
          this.setWebData('transcripts', transcripts);
          return { success: true };
        }
        return { success: false, error: { code: 'NOT_FOUND', message: 'Transcript not found' } };
      }

      if (!this.db) throw new Error('Database not initialized');

      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`)
        .join(', ');

      const values = Object.values(updates).filter(value => value !== undefined);
      values.push(new Date().toISOString()); // updated_at
      values.push(id);

      await this.db.runAsync(
        `UPDATE transcripts SET ${setClause}, updated_at = ? WHERE id = ?`,
        values as any
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to update transcript:', error);
      return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update transcript' } };
    }
  }

  async deleteTranscript(id: number): Promise<ApiResponse<void>> {
    try {
      if (this.isWeb) {
        const transcripts = this.getWebData('transcripts');
        const initialLength = transcripts.length;
        const updatedTranscripts = transcripts.filter(t => t.id !== id);
        if (updatedTranscripts.length < initialLength) {
          this.setWebData('transcripts', updatedTranscripts);
          return { success: true };
        }
        return { success: false, error: { code: 'NOT_FOUND', message: 'Transcript not found' } };
      }

      if (!this.db) throw new Error('Database not initialized');

      await this.db.runAsync('DELETE FROM transcripts WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete transcript:', error);
      return { success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete transcript' } };
    }
  }

  // Form operations
  async saveForm(form: Form): Promise<ApiResponse<Form>> {
    try {
      if (this.isWeb) {
        const forms = this.getWebData('forms');
        const newForm = {
          ...form,
          id: Date.now(), // Simple ID generation for web
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        forms.push(newForm);
        this.setWebData('forms', forms);
        return { success: true, data: newForm };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.runAsync(
        'INSERT INTO forms (name, file_path, filled_data, form_type, status) VALUES (?, ?, ?, ?, ?)',
        [form.name, form.file_path, form.filled_data, form.form_type, form.status]
      );

      const newForm: Form = {
        ...form,
        id: result.lastInsertRowId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { success: true, data: newForm };
    } catch (error) {
      console.error('Failed to save form:', error);
      return { success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save form' } };
    }
  }

  async getForms(): Promise<ApiResponse<Form[]>> {
    try {
      if (this.isWeb) {
        const forms = this.getWebData('forms');
        return { success: true, data: forms };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.getAllAsync('SELECT * FROM forms ORDER BY created_at DESC');
      const forms = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        file_path: row.file_path,
        filled_data: row.filled_data,
        created_at: row.created_at,
        form_type: row.form_type,
        status: row.status,
      }));

      return { success: true, data: forms };
    } catch (error) {
      console.error('Failed to get forms:', error);
      return { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to get forms' } };
    }
  }

  // CPD Log operations
  async saveCPDLog(cpdLog: CPDLog): Promise<ApiResponse<CPDLog>> {
    try {
      if (this.isWeb) {
        const cpdLogs = this.getWebData('cpd_logs');
        const newCPDLog = {
          ...cpdLog,
          id: Date.now(), // Simple ID generation for web
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        cpdLogs.push(newCPDLog);
        this.setWebData('cpd_logs', cpdLogs);
        return { success: true, data: newCPDLog };
      }

      if (!this.db) throw new Error('Database not initialized');

      const { title, summary, audio_path, tags, duration, category, learning_outcomes } = cpdLog;
      const learningOutcomesJson = learning_outcomes ? JSON.stringify(learning_outcomes) : null;

      const result = await this.db.runAsync(
        'INSERT INTO cpd_logs (title, summary, audio_path, tags, duration, category, learning_outcomes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, summary, audio_path || '', tags || '', duration || 0, category || '', learningOutcomesJson]
      );

      const newCPDLog: CPDLog = {
        ...cpdLog,
        id: result.lastInsertRowId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { success: true, data: newCPDLog };
    } catch (error) {
      console.error('Failed to save CPD log:', error);
      return { success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save CPD log' } };
    }
  }

  async getCPDLogs(): Promise<ApiResponse<CPDLog[]>> {
    try {
      if (this.isWeb) {
        const cpdLogs = this.getWebData('cpd_logs');
        return { success: true, data: cpdLogs };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.getAllAsync('SELECT * FROM cpd_logs ORDER BY created_at DESC');
      const cpdLogs = result.map((row: any) => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        audio_path: row.audio_path,
        created_at: row.created_at,
        tags: row.tags,
        duration: row.duration,
        category: row.category,
        learning_outcomes: row.learning_outcomes ? JSON.parse(row.learning_outcomes) : [],
      }));

      return { success: true, data: cpdLogs };
    } catch (error) {
      console.error('Failed to get CPD logs:', error);
      return { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to get CPD logs' } };
    }
  }

  // Settings operations
  async saveSetting(key: string, value: string): Promise<ApiResponse<void>> {
    try {
      if (this.isWeb) {
        const settings = this.getWebData('settings');
        const index = settings.findIndex(s => s.key === key);
        if (index !== -1) {
          settings[index] = { key, value };
        } else {
          settings.push({ key, value });
        }
        this.setWebData('settings', settings);
        return { success: true };
      }

      if (!this.db) throw new Error('Database not initialized');

      await this.db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to save setting:', error);
      return { success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save setting' } };
    }
  }

  async getSetting(key: string): Promise<ApiResponse<string | null>> {
    try {
      if (this.isWeb) {
        const settings = this.getWebData('settings');
        const setting = settings.find(s => s.key === key);
        return { success: true, data: setting ? setting.value : null };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
      return { success: true, data: (result as any)?.value || null };
    } catch (error) {
      console.error('Failed to fetch setting:', error);
      return { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch setting' } };
    }
  }

  // Education Material operations
  async saveEducationMaterial(material: EducationMaterial): Promise<ApiResponse<EducationMaterial>> {
    try {
      if (this.isWeb) {
        const materials = this.getWebData('education_materials');
        const newMaterial = {
          ...material,
          id: Date.now(), // Simple ID generation for web
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        materials.push(newMaterial);
        this.setWebData('education_materials', materials);
        return { success: true, data: newMaterial };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.runAsync(
        'INSERT INTO education_materials (title, url, category, recommended_for, description, nmc_pillars) VALUES (?, ?, ?, ?, ?, ?)',
        [material.title, material.url, material.category, material.recommended_for, material.description, material.nmc_pillars]
      );

      const newMaterial: EducationMaterial = {
        ...material,
        id: result.lastInsertRowId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { success: true, data: newMaterial };
    } catch (error) {
      console.error('Failed to save education material:', error);
      return { success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save education material' } };
    }
  }

  async getEducationMaterials(): Promise<ApiResponse<EducationMaterial[]>> {
    try {
      if (this.isWeb) {
        const materials = this.getWebData('education_materials');
        return { success: true, data: materials };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.getAllAsync('SELECT * FROM education_materials ORDER BY created_at DESC');
      const materials = result.map((row: any) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        category: row.category,
        recommended_for: row.recommended_for,
        description: row.description,
        nmc_pillars: row.nmc_pillars,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return { success: true, data: materials };
    } catch (error) {
      console.error('Failed to get education materials:', error);
      return { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to get education materials' } };
    }
  }

  async updateEducationMaterial(id: number, updates: Partial<EducationMaterial>): Promise<ApiResponse<EducationMaterial>> {
    try {
      if (this.isWeb) {
        const materials = this.getWebData('education_materials');
        const index = materials.findIndex(m => m.id === id);
        if (index !== -1) {
          const updatedMaterial = { ...materials[index], ...updates, updated_at: new Date().toISOString() };
          materials[index] = updatedMaterial;
          this.setWebData('education_materials', materials);
          return { success: true, data: updatedMaterial };
        }
        return { success: false, error: { code: 'NOT_FOUND', message: 'Education material not found' } };
      }

      if (!this.db) throw new Error('Database not initialized');

      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`)
        .join(', ');

      const values = Object.values(updates).filter(value => value !== undefined);
      values.push(id);
      values.push(new Date().toISOString()); // updated_at

      await this.db.runAsync(
        `UPDATE education_materials SET ${setClause}, updated_at = ? WHERE id = ?`,
        values as any
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to update education material:', error);
      return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update education material' } };
    }
  }

  async deleteEducationMaterial(id: number): Promise<ApiResponse<void>> {
    try {
      if (this.isWeb) {
        const materials = this.getWebData('education_materials');
        const initialLength = materials.length;
        const updatedMaterials = materials.filter(m => m.id !== id);
        if (updatedMaterials.length < initialLength) {
          this.setWebData('education_materials', updatedMaterials);
          return { success: true };
        }
        return { success: false, error: { code: 'NOT_FOUND', message: 'Education material not found' } };
      }

      if (!this.db) throw new Error('Database not initialized');

      await this.db.runAsync('DELETE FROM education_materials WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete education material:', error);
      return { success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete education material' } };
    }
  }

  // User operations
  async saveUser(user: User): Promise<ApiResponse<User>> {
    try {
      if (this.isWeb) {
        const users = this.getWebData('users');
        const newUser = {
          ...user,
          id: Date.now(), // Simple ID generation for web
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        users.push(newUser);
        this.setWebData('users', users);
        return { success: true, data: newUser };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.runAsync(
        'INSERT INTO users (name, pin, subscription_tier, subscription_expiry) VALUES (?, ?, ?, ?)',
        [user.name, user.pin, user.subscription_tier, user.subscription_expiry]
      );

      const newUser: User = {
        ...user,
        id: result.lastInsertRowId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { success: true, data: newUser };
    } catch (error) {
      console.error('Failed to save user:', error);
      return { success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save user' } };
    }
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      if (this.isWeb) {
        const users = this.getWebData('users');
        return { success: true, data: users };
      }

      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.getAllAsync('SELECT * FROM users ORDER BY created_at DESC');
      const users = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        pin: row.pin,
        subscription_tier: row.subscription_tier,
        subscription_expiry: row.subscription_expiry,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return { success: true, data: users };
    } catch (error) {
      console.error('Failed to get users:', error);
      return { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to get users' } };
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      if (this.isWeb) {
        const users = this.getWebData('users');
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          const updatedUser = { ...users[index], ...updates, updated_at: new Date().toISOString() };
          users[index] = updatedUser;
          this.setWebData('users', users);
          return { success: true, data: updatedUser };
        }
        return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
      }

      if (!this.db) throw new Error('Database not initialized');

      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`)
        .join(', ');

      const values = Object.values(updates).filter(value => value !== undefined);
      values.push(id);
      values.push(new Date().toISOString()); // updated_at

      await this.db.runAsync(
        `UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`,
        values as any
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update user' } };
    }
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      if (this.isWeb) {
        const users = this.getWebData('users');
        const initialLength = users.length;
        const updatedUsers = users.filter(u => u.id !== id);
        if (updatedUsers.length < initialLength) {
          this.setWebData('users', updatedUsers);
          return { success: true };
        }
        return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
      }

      if (!this.db) throw new Error('Database not initialized');

      await this.db.runAsync('DELETE FROM users WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete user' } };
    }
  }

  // Backup and restore
  async exportBackup(): Promise<ApiResponse<string>> {
    try {
      if (this.isWeb) {
        return { success: false, error: { code: 'PLATFORM_ERROR', message: 'Web platform does not support file system operations for backup' } };
      }

      const dbPath = `${FileSystem.documentDirectory}SQLite/${this.dbName}`;
      const backupPath = `${FileSystem.documentDirectory}backup/nurseApp-backup-${Date.now()}.db`;

      // Ensure backup directory exists
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}backup`, { intermediates: true });

      await FileSystem.copyAsync({
        from: dbPath,
        to: backupPath,
      });

      return { success: true, data: backupPath };
    } catch (error) {
      console.error('Failed to create backup:', error);
      return { success: false, error: { code: 'BACKUP_FAILED', message: 'Failed to create backup' } };
    }
  }

  async importBackup(backupPath: string): Promise<ApiResponse<void>> {
    try {
      if (this.isWeb) {
        return { success: false, error: { code: 'PLATFORM_ERROR', message: 'Web platform does not support file system operations for restore' } };
      }

      const dbPath = `${FileSystem.documentDirectory}SQLite/${this.dbName}`;
      
      await FileSystem.copyAsync({
        from: backupPath,
        to: dbPath,
      });

      // Reinitialize database connection
      await this.initialize();

      return { success: true };
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return { success: false, error: { code: 'RESTORE_FAILED', message: 'Failed to restore backup' } };
    }
  }

  // Close database
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService; 