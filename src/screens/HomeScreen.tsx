import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, TYPOGRAPHY, ROUTES, APP_CONFIG } from '../constants';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: keyof RootStackParamList;
  color: string;
  requiresPremium?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'transcript',
    title: 'Start Transcript',
    subtitle: 'Voice-to-text for reflections',
    icon: '🎤',
    route: 'VoiceRecorder',
    color: COLORS.NMC_BLUE,
  },
  {
    id: 'forms',
    title: 'NMC Forms',
    subtitle: 'Download and fill forms',
    icon: '📄',
    route: 'Forms',
    color: COLORS.NMC_BLUE_LIGHT,
  },
  {
    id: 'cpd',
    title: 'CPD Logging',
    subtitle: 'Record and log CPD activities',
    icon: '📚',
    route: 'CPDLogging',
    color: COLORS.SUCCESS,
  },
  {
    id: 'education',
    title: 'Learning Resources',
    subtitle: 'Educational materials and suggestions',
    icon: '🎓',
    route: 'Education',
    color: COLORS.SECONDARY_LIGHT,
    requiresPremium: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App preferences and backup',
    icon: '⚙️',
    route: 'Settings',
    color: COLORS.GRAY_600,
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.requiresPremium) {
      // TODO: Check subscription status and show upgrade prompt
      alert('This feature requires a premium subscription');
      return;
    }
    
    navigation.navigate(item.route as any);
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { borderLeftColor: item.color }]}
      onPress={() => handleMenuItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemIcon}>{item.icon}</Text>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
        {item.requiresPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Lloyd, welcome to</Text>
          <Text style={styles.appTitle}>{APP_CONFIG.NAME}</Text>
          <Text style={styles.appSubtitle}>
            Your voice-powered nursing revalidation assistant
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Transcript' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Transcripts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Forms' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Forms</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('CPDDetail' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>CPD Hours</Text>
          </TouchableOpacity>
        </View>

        {/* Main Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>What would you like to do?</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>
            • Use voice transcription to quickly capture your reflections
          </Text>
          <Text style={styles.tipText}>
            • Download NMC forms for offline access
          </Text>
          <Text style={styles.tipText}>
            • Log CPD activities as you complete them
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
  header: {
    padding: SPACING.LG,
    backgroundColor: COLORS.NMC_BLUE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.NMC_BLUE_DARK,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    color: COLORS.WHITE,
    marginBottom: SPACING.XS,
    opacity: 0.9,
  },
  appTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE['3XL'],
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: SPACING.SM,
  },
  appSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
    color: COLORS.WHITE,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.LG,
    gap: SPACING.MD,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.NMC_BLUE_LIGHT,
    elevation: 3,
    shadowColor: COLORS.NMC_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZE['2XL'],
    fontWeight: 'bold',
    color: COLORS.NMC_BLUE,
    marginBottom: SPACING.XS,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '600',
  },
  menuContainer: {
    padding: SPACING.LG,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: 'bold',
    color: COLORS.NMC_BLUE,
    marginBottom: SPACING.LG,
  },
  menuItem: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    marginBottom: SPACING.MD,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: COLORS.NMC_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  menuItemIcon: {
    fontSize: 32,
    marginRight: SPACING.MD,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  menuItemSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  },
  premiumBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  tipsContainer: {
    margin: SPACING.LG,
    padding: SPACING.LG,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.NMC_BLUE_LIGHT,
    elevation: 2,
    shadowColor: COLORS.NMC_BLUE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: 'bold',
    color: COLORS.NMC_BLUE,
    marginBottom: SPACING.MD,
  },
  tipText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  },
});

export default HomeScreen; 