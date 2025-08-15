import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { Form } from '../types';
import formService from '../services/FormService';
import databaseService from '../services/DatabaseService';

const FormsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [forms, setForms] = useState<Form[]>([]);
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingForm, setDownloadingForm] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
    loadAvailableForms();
  }, []);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      const result = await databaseService.getForms();
      if (result.success) {
        setForms(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load forms:', error);
      Alert.alert('Error', 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableForms = () => {
    const available = formService.getAvailableForms();
    setAvailableForms(available);
  };

  const handleDownloadForm = async (formType: string) => {
    try {
      setDownloadingForm(formType);
      
      // Download the form
      const downloadedForm = await formService.downloadNMCForm(formType);
      
      // Save to database
      const result = await databaseService.saveForm(downloadedForm);
      
      if (result.success) {
        Alert.alert('Success', `${formType} form downloaded successfully!`);
        loadForms(); // Reload the forms list
      } else {
        throw new Error(result.error || 'Failed to save form');
      }
    } catch (error) {
      console.error(`Failed to download ${formType} form:`, error);
      Alert.alert('Error', `Failed to download ${formType} form. Please try again.`);
    } finally {
      setDownloadingForm(null);
    }
  };

  const handleViewForm = (form: Form) => {
    navigation.navigate('FormFilling' as any, { formId: form.id });
  };

  const handleFillFormWithTranscript = async (form: Form) => {
    try {
      // Get the latest transcript
      const transcriptResult = await databaseService.getTranscripts();
      if (!transcriptResult.success || !transcriptResult.data || transcriptResult.data.length === 0) {
        Alert.alert('No Transcripts', 'Please create a transcript first before filling forms.');
        return;
      }

      const latestTranscript = transcriptResult.data[0]; // Get the most recent transcript
      
      // Fill the form with transcript data
      const filledForm = await formService.fillFormWithTranscript(form.id, latestTranscript.content);
      
      // Update the form in database
      await databaseService.saveForm(filledForm);
      
      Alert.alert('Success', 'Form filled with transcript data successfully!');
      loadForms(); // Reload the forms list
    } catch (error) {
      console.error('Failed to fill form with transcript:', error);
      Alert.alert('Error', 'Failed to fill form with transcript data.');
    }
  };

  const handleExportForm = async (form: Form) => {
    try {
      const pdfPath = await formService.exportFormAsPDF(form.id);
      Alert.alert('Success', `Form exported as PDF: ${pdfPath}`);
    } catch (error) {
      console.error('Failed to export form:', error);
      Alert.alert('Error', 'Failed to export form as PDF.');
    }
  };

  const handlePrintForm = async (form: Form) => {
    try {
      await formService.printForm(form.id);
      Alert.alert('Success', 'Form sent to printer');
    } catch (error) {
      console.error('Failed to print form:', error);
      Alert.alert('Error', 'Failed to print form.');
    }
  };

  const renderFormItem = ({ item }: { item: Form }) => (
    <View style={styles.formCard}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>{item.name}</Text>
        <View style={styles.formStatus}>
          <Text style={[styles.statusBadge, styles[`status${item.status}`]]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.formType}>{item.form_type}</Text>
      <Text style={styles.formDate}>
        Created: {new Date(item.created_at).toLocaleDateString()}
      </Text>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewForm(item)}
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.fillButton]}
          onPress={() => handleFillFormWithTranscript(item)}
        >
          <Text style={styles.actionButtonText}>Auto-Fill</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={() => handleExportForm(item)}
        >
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={() => handlePrintForm(item)}
        >
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAvailableFormItem = ({ item }: { item: string }) => (
    <View style={styles.availableFormCard}>
      <Text style={styles.availableFormTitle}>{item}</Text>
      <TouchableOpacity
        style={[styles.downloadButton, downloadingForm === item && styles.downloadingButton]}
        onPress={() => handleDownloadForm(item)}
        disabled={downloadingForm === item}
      >
        {downloadingForm === item ? (
          <ActivityIndicator size="small" color={COLORS.WHITE} />
        ) : (
          <Text style={styles.downloadButtonText}>Download</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NMC Forms</Text>
        <Text style={styles.subtitle}>Download and manage your revalidation forms</Text>
      </View>

      {/* Available Forms Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Forms</Text>
        <Text style={styles.sectionDescription}>
          Download official NMC forms for your revalidation process
        </Text>
        
        <FlatList
          data={availableForms}
          renderItem={renderAvailableFormItem}
          keyExtractor={(item) => item}
          scrollEnabled={false}
          style={styles.availableFormsList}
        />
      </View>

      {/* Downloaded Forms Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Forms</Text>
        <Text style={styles.sectionDescription}>
          Manage your downloaded and filled forms
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading forms...</Text>
          </View>
        ) : forms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No forms downloaded yet</Text>
            <Text style={styles.emptySubtext}>
              Download a form from the list above to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={forms}
            renderItem={renderFormItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            style={styles.formsList}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MD,
  },
  header: {
    marginBottom: SPACING.XL,
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
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  sectionDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  availableFormsList: {
    marginBottom: SPACING.MD,
  },
  availableFormCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availableFormTitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  downloadButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  downloadingButton: {
    backgroundColor: COLORS.GRAY_500,
  },
  downloadButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  formsList: {
    marginBottom: SPACING.MD,
  },
  formCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  formTitle: {
    ...TYPOGRAPHY.H3,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  formStatus: {
    marginLeft: SPACING.SM,
  },
  statusBadge: {
    ...TYPOGRAPHY.CAPTION,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    overflow: 'hidden',
  },
  statusdraft: {
    backgroundColor: COLORS.WARNING + '20',
    color: COLORS.WARNING,
  },
  statusfilled: {
    backgroundColor: COLORS.SUCCESS + '20',
    color: COLORS.SUCCESS,
  },
  statussubmitted: {
    backgroundColor: COLORS.PRIMARY + '20',
    color: COLORS.PRIMARY,
  },
  formType: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  formDate: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginHorizontal: SPACING.XS,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  fillButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  exportButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  printButton: {
    backgroundColor: COLORS.ACCENT,
  },
  actionButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyText: {
    ...TYPOGRAPHY.H3,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  emptySubtext: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default FormsScreen; 