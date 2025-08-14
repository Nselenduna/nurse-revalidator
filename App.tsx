import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, APP_CONFIG } from './src/constants';
import databaseService from './src/services/DatabaseService';
import formService from './src/services/FormService';
import cpdService from './src/services/CPDService';
import educationService from './src/services/EducationService';
import backupService from './src/services/BackupService';
import subscriptionService from './src/services/SubscriptionService';
import authService from './src/services/AuthService';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TranscriptScreen from './src/screens/TranscriptScreen';
import FormsScreen from './src/screens/FormsScreen';
import FormFillingScreen from './src/screens/FormFillingScreen';
import CPDLoggingScreen from './src/screens/CPDLoggingScreen';
import CPDDetailScreen from './src/screens/CPDDetailScreen';
import EducationScreen from './src/screens/EducationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import VoiceRecorderScreen from './src/screens/VoiceRecorderScreen';
import NMCFormFillerScreen from './src/screens/NMCFormFillerScreen';

const Stack = createStackNavigator();

// Logout button component
const LogoutButton = () => {
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
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{ marginRight: 15, padding: 5 }}
    >
      <Text style={{ color: COLORS.WHITE, fontSize: 16 }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializationErrors, setInitializationErrors] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    initializeApp();
    
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((authState) => {
      setIsAuthenticated(authState.isAuthenticated);
    });
    
    return unsubscribe;
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Starting app initialization...');
      const errors: string[] = [];
      
      // Initialize database
      try {
        await databaseService.initialize();
        console.log('Database initialized successfully');
      } catch (dbError) {
        console.error('Database initialization failed:', dbError);
        errors.push('Database initialization failed');
      }
      
      // Initialize form service
      try {
        await formService.initialize();
        console.log('Form service initialized successfully');
      } catch (formError) {
        console.error('Form service initialization failed:', formError);
        errors.push('Form service initialization failed');
      }
      
      // Initialize CPD service
      try {
        await cpdService.initialize();
        console.log('CPD service initialized successfully');
      } catch (cpdError) {
        console.error('CPD service initialization failed:', cpdError);
        errors.push('CPD service initialization failed');
      }

      // Initialize education service
      try {
        await educationService.initialize();
        console.log('Education service initialized successfully');
      } catch (educationError) {
        console.error('Education service initialization failed:', educationError);
        errors.push('Education service initialization failed');
      }

      // Initialize backup service
      try {
        await backupService.initialize();
        console.log('Backup service initialized successfully');
      } catch (backupError) {
        console.error('Backup service initialization failed:', backupError);
        errors.push('Backup service initialization failed');
      }

      // Initialize subscription service
      try {
        await subscriptionService.initialize();
        console.log('Subscription service initialized successfully');
      } catch (subscriptionError) {
        console.error('Subscription service initialization failed:', subscriptionError);
        errors.push('Subscription service initialization failed');
      }

      // Initialize auth service
      try {
        await authService.initialize();
        console.log('Auth service initialized successfully');
      } catch (authError) {
        console.error('Auth service initialization failed:', authError);
        errors.push('Auth service initialization failed');
      }
      
      // Add a small delay to show loading screen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (errors.length > 0) {
        setInitializationErrors(errors);
        console.warn('Some services failed to initialize, but app will continue:', errors);
      }
      
      console.log('App initialization complete');
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError('Failed to initialize app. Please restart.');
      setIsLoading(false);
    }
  };

  console.log('App render - isLoading:', isLoading, 'error:', error, 'initErrors:', initializationErrors);

  if (isLoading) {
    console.log('Rendering loading screen');
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>{APP_CONFIG.NAME}</Text>
          <Text style={styles.loadingSubtitle}>Initializing...</Text>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} style={styles.loadingSpinner} />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  if (error) {
    console.log('Rendering error screen');
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorSubtitle}>Please restart the app</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  console.log('Rendering main app');
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? "Home" : "Login"}
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.NMC_BLUE,
            },
            headerTintColor: COLORS.WHITE,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            cardStyle: { backgroundColor: COLORS.BACKGROUND },
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ 
                  title: '',
                  headerRight: () => <LogoutButton />
                }}
              />
          <Stack.Screen 
            name="Transcript" 
            component={TranscriptScreen}
            options={{ 
              title: 'Voice Transcript',
              headerRight: () => <LogoutButton />
            }}
          />
          <Stack.Screen 
            name="Forms" 
            component={FormsScreen}
            options={{ 
              title: 'Nursing Forms',
              headerRight: () => <LogoutButton />
            }}
          />
          <Stack.Screen 
            name="FormFilling" 
            component={FormFillingScreen}
            options={{ 
              title: 'Fill Form',
              headerRight: () => <LogoutButton />
            }}
          />
          <Stack.Screen 
            name="CPDLogging" 
            component={CPDLoggingScreen}
            options={{ 
              title: 'CPD Logging',
              headerRight: () => <LogoutButton />
            }}
          />
          <Stack.Screen 
            name="CPDDetail" 
            component={CPDDetailScreen}
            options={{ 
              title: 'CPD Logs',
              headerRight: () => <LogoutButton />
            }}
          />
          <Stack.Screen 
            name="Education" 
            component={EducationScreen}
            options={{ 
              title: 'Learning Resources',
              headerRight: () => <LogoutButton />
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: 'Settings',
              headerRight: () => <LogoutButton />,
            }}
          />
          <Stack.Screen 
            name="VoiceRecorder" 
            component={VoiceRecorderScreen}
            options={{ 
              title: 'Voice Recorder',
              headerRight: () => <LogoutButton />
            }}
          />
          <Stack.Screen 
            name="NMCFormFiller" 
            component={NMCFormFillerScreen}
            options={{ 
              title: 'NMC Form Filler',
              headerRight: () => <LogoutButton />
            }}
          />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
  },
  loadingSpinner: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.ERROR,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
