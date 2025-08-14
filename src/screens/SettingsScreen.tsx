import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { themeService } from '../services/ThemeService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { RootStackParamList } from '../types';
import { BackupRestoreManager } from '../components/BackupRestoreManager';
import { SubscriptionManager } from '../components/SubscriptionManager';
import authService from '../services/AuthService';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(() => themeService.getCurrentTheme() === 'dark');

  // Handle dark mode toggle
  const handleDarkModeToggle = async (value: boolean) => {
    try {
      await themeService.setTheme(value ? 'dark' : 'light');
      setDarkModeEnabled(value);
    } catch (error) {
      console.error('Failed to toggle dark mode:', error);
      Alert.alert('Error', 'Failed to change theme. Please try again.');
    }
  };
  const [privacyModeEnabled, setPrivacyModeEnabled] = useState(false);

  const handleBackupRestore = () => {
    setShowBackupManager(true);
  };

  const handleSubscription = () => {
    setShowSubscriptionManager(true);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your data in a portable format.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Export', 'Data export functionality would be implemented here.');
        }},
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Data', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Data Cleared', 'All data has been cleared (simulated).');
          }
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your data is stored locally on your device. We do not collect, track, or share any personal information. All processing happens on your device for maximum privacy.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'This app is designed to help nurses with their revalidation process. Use responsibly and ensure compliance with your local nursing regulations.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Nurse Revalidator',
      'Version 1.0.0\n\nA comprehensive tool for nurses to manage their revalidation process, CPD logging, and professional development.\n\nBuilt with React Native and Expo.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // Navigation will be handled by the auth state change in App.tsx
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  if (showBackupManager) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowBackupManager(false)}
          >
            <Text style={styles.backButtonText}>← Back to Settings</Text>
          </TouchableOpacity>
        </View>
        <BackupRestoreManager />
      </SafeAreaView>
    );
  }

  if (showSubscriptionManager) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowSubscriptionManager(false)}
          >
            <Text style={styles.backButtonText}>← Back to Settings</Text>
          </TouchableOpacity>
        </View>
        <SubscriptionManager />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          {/* Title removed as per request */}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive reminders for CPD deadlines</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
              thumbColor={COLORS.WHITE}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Save</Text>
              <Text style={styles.settingDescription}>Automatically save your work</Text>
            </View>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
              thumbColor={COLORS.WHITE}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
              thumbColor={COLORS.WHITE}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Privacy Mode</Text>
              <Text style={styles.settingDescription}>Enhanced privacy features</Text>
            </View>
            <Switch
              value={privacyModeEnabled}
              onValueChange={setPrivacyModeEnabled}
              trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
              thumbColor={COLORS.WHITE}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={[styles.settingButton, styles.dangerButton]} 
            onPress={handleLogout}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Logout</Text>
              <Text style={[styles.settingDescription, styles.dangerText]}>Sign out of your account</Text>
            </View>
            <Text style={[styles.settingArrow, styles.dangerText]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleBackupRestore}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Backup & Restore</Text>
              <Text style={styles.settingDescription}>Manage your data backups</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={handleExportData}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>Export all data to file</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={handleSubscription}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Subscription</Text>
              <Text style={styles.settingDescription}>Manage premium subscription</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingButton, styles.dangerButton]} 
            onPress={handleClearData}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Clear All Data</Text>
              <Text style={[styles.settingDescription, styles.dangerText]}>Permanently delete all data</Text>
            </View>
            <Text style={[styles.settingArrow, styles.dangerText]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          <View style={styles.subscriptionCard}>
            <Text style={styles.subscriptionTitle}>Free Plan</Text>
            <Text style={styles.subscriptionDescription}>
              Basic features: Voice-to-text, form filling, CPD logging
            </Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium (£3/month)</Text>
            </TouchableOpacity>
            <Text style={styles.subscriptionFeatures}>
              Premium includes: AI suggestions, lecture summarization, PDF export, educational recommendations
            </Text>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={handlePrivacyPolicy}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.settingDescription}>How we protect your data</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={handleTermsOfService}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
              <Text style={styles.settingDescription}>App usage terms</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleAbout}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>About App</Text>
              <Text style={styles.settingDescription}>Version and information</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Nurse Revalidator v1.0.0
          </Text>
          <Text style={styles.footerText}>
            Built for UK nurses
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  settingDescription: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  settingArrow: {
    ...TYPOGRAPHY.H2,
    color: COLORS.GRAY_400,
  },
  dangerButton: {
    borderBottomColor: COLORS.ERROR + '30',
  },
  dangerText: {
    color: COLORS.ERROR,
  },
  subscriptionCard: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY + '30',
  },
  subscriptionTitle: {
    ...TYPOGRAPHY.H3,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM,
  },
  subscriptionDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  upgradeButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  subscriptionFeatures: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.LG,
  },
  footerText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});

export default SettingsScreen; 