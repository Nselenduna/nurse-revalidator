import React from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../constants';
import { RootStackParamList } from '../types';
import { LearningRecommendations } from '../components/LearningRecommendations';
import { EducationMaterial } from '../types';

type EducationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Education'>;

const EducationScreen: React.FC = () => {
  console.log('EducationScreen rendering...');
  const navigation = useNavigation<EducationScreenNavigationProp>();

  const handleMaterialSelect = (material: EducationMaterial) => {
    console.log('Material selected:', material.title);
    // In a real app, this would open the material or navigate to a detailed view
    Alert.alert(
      'Learning Material',
      `"${material.title}"\n\n${material.description}\n\nDuration: ${material.duration}\nLevel: ${material.difficulty}\n\nThis material aligns with NMC standards and will help you meet your CPD requirements.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Learning', onPress: () => {
          Alert.alert('Learning Started', 'You can now access this material. In a full implementation, this would open the learning content.');
        }},
      ]
    );
  };

  console.log('EducationScreen about to render LearningRecommendations component');

  return (
    <SafeAreaView style={styles.container}>
      <LearningRecommendations onMaterialSelect={handleMaterialSelect} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});

export default EducationScreen; 