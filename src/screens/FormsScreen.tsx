import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { downloadLatestNMCForm } from '../services/FormDownloadService';

interface DownloadedForm {
  id: string;
  name: string;
  uri: string;
  downloadDate: Date;
}

const FORM_TYPES = {
  REVALIDATION: 'NMC Revalidation Form',
  PRACTICE_LOG: 'Practice Hours Log',
  REFLECTION: 'Reflection Form'
} as const;

export const FormsScreen: React.FC = () => {
  const [downloadedForms, setDownloadedForms] = useState<DownloadedForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingForm, setDownloadingForm] = useState<string | null>(null);

  const handleDownloadForm = async (formType: keyof typeof FORM_TYPES) => {
    try {
      setDownloadingForm(formType);
      const formUri = await downloadLatestNMCForm(formType);
      
      if (formUri) {
        const newForm: DownloadedForm = {
          id: Date.now().toString(),
          name: FORM_TYPES[formType],
          uri: formUri,
          downloadDate: new Date()
        };
        
        setDownloadedForms(prev => [...prev, newForm]);
        Alert.alert('Success', `${FORM_TYPES[formType]} downloaded successfully`);
      }
    } catch (error) {
      Alert.alert(
        'Download Failed',
        error instanceof Error ? error.message : 'Unable to download form'
      );
    } finally {
      setDownloadingForm(null);
    }
  };

  const renderFormItem = (formType: keyof typeof FORM_TYPES) => {
    const isDownloading = downloadingForm === formType;
    const hasDownloaded = downloadedForms.some(form => form.name === FORM_TYPES[formType]);

    return (
      <View style={styles.formItem} key={formType}>
        <Text style={styles.formName}>{FORM_TYPES[formType]}</Text>
        <TouchableOpacity
          style={[
            styles.downloadButton,
            hasDownloaded ? styles.downloadedButton : null,
            isDownloading ? styles.downloadingButton : null
          ]}
          onPress={() => handleDownloadForm(formType)}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator color={COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.downloadButtonText}>
              {hasDownloaded ? 'Update' : 'Download'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Forms</Text>
          <Text style={styles.sectionDescription}>
            Download official NMC forms for your revalidation process
          </Text>
          {Object.keys(FORM_TYPES).map((formType) => 
            renderFormItem(formType as keyof typeof FORM_TYPES)
          )}
        </View>

        {downloadedForms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Downloaded Forms</Text>
            {downloadedForms.map(form => (
              <View key={form.id} style={styles.downloadedFormItem}>
                <View style={styles.downloadedFormInfo}>
                  <Text style={styles.downloadedFormName}>{form.name}</Text>
                  <Text style={styles.downloadDate}>
                    Downloaded: {form.downloadDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    padding: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  sectionDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
    elevation: 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formName: {
    ...TYPOGRAPHY.BODY_BOLD,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.MD,
  },
  downloadButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    minWidth: 100,
    alignItems: 'center',
  },
  downloadedButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  downloadingButton: {
    backgroundColor: COLORS.GRAY_500,
  },
  downloadButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  downloadedFormItem: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
  },
  downloadedFormInfo: {
    flex: 1,
  },
  downloadedFormName: {
    ...TYPOGRAPHY.BODY_BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  downloadDate: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default FormsScreen;
