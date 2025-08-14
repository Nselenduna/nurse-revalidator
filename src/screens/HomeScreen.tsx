import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { styles } from '../styles/HomeScreen.styles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, TYPOGRAPHY, APP_CONFIG } from '../constants';
import { RootStackParamList } from '../types';

// Type for navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Menu item type
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
    color: COLORS.PRIMARY,
  },
  {
    id: 'forms',
    title: 'Nursing Forms',
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
  {
    id: 'nmcform',
    title: 'NMC Form Filler',
    subtitle: 'Download and fill NMC forms with voice',
    icon: '📝',
    route: 'NMCFormFiller',
    color: COLORS.NMC_BLUE,
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const userName = 'Lloyd'; // Replace with actual user name source
  const [premiumModalVisible, setPremiumModalVisible] = React.useState(false);

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.requiresPremium) {
      setPremiumModalVisible(true);
      return;
    }
    navigation.navigate({ name: item.route as any, params: undefined });
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
      <Modal
        visible={premiumModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Premium Feature</Text>
            <Text style={styles.modalText}>
              This feature requires a premium subscription. Upgrade to unlock all features!
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                setPremiumModalVisible(false);
                navigation.navigate('Settings');
              }}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPremiumModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{userName}, welcome to</Text>
          <Text style={styles.appTitle}>{APP_CONFIG.NAME}</Text>
          <Text style={styles.appSubtitle}>
            Your voice-powered nursing revalidation assistant
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Transcript', { transcriptId: undefined })}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Transcripts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Forms')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Forms</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('CPDLogging')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>CPD Hours</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>What would you like to do?</Text>
          {menuItems.map(renderMenuItem)}
        </View>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>
            • Use voice transcription to quickly capture your reflections
          </Text>
          <Text style={styles.tipText}>
            • Download nursing forms for offline access
          </Text>
          <Text style={styles.tipText}>
            • Log CPD activities as you complete them
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;