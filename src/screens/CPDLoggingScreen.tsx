import React from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { CPDLectureRecorder } from '../components/CPDLectureRecorder';
import databaseService from '../services/DatabaseService';

const CPDLoggingScreen: React.FC = () => {
  console.log('CPDLoggingScreen rendering...');
  
  const navigation = useNavigation();

  const handleSaveCPDLog = async (cpdLog: any) => {
    console.log('handleSaveCPDLog called with:', cpdLog);
    
    try {
      // Save to database
      const result = await databaseService.saveCPDLog(cpdLog);
      
      if (result.success) {
        console.log('CPD log saved to database successfully');
        
        // Navigate to CPD logs list
        navigation.navigate('CPDDetail' as any);
      } else {
        throw new Error(result.error || 'Failed to save CPD log');
      }
    } catch (error) {
      console.error('Failed to save CPD log:', error);
      Alert.alert('Error', 'Failed to save CPD log. Please try again.');
    }
  };

  console.log('CPDLoggingScreen about to render CPDLectureRecorder component');

  return (
    <SafeAreaView style={styles.container}>
      <CPDLectureRecorder
        onSave={handleSaveCPDLog}
        initialTitle="Lecture Recording"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});

export default CPDLoggingScreen; 