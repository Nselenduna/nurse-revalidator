import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { RootStackParamList, Form, FormField } from '../types';
import formService from '../services/FormService';
import databaseService from '../services/DatabaseService';

type FormFillingScreenRouteProp = RouteProp<RootStackParamList, 'FormFilling'>;
type FormFillingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FormFilling'>;

const FormFillingScreen: React.FC = () => {
  const navigation = useNavigation<FormFillingScreenNavigationProp>();
  const route = useRoute<FormFillingScreenRouteProp>();
  const { formId } = route.params || {};

  const [form, setForm] = useState<Form | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [filledData, setFilledData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      
      // Get form from database
      const formsResult = await databaseService.getForms();
      if (!formsResult.success) {
        throw new Error('Failed to load forms');
      }

      const foundForm = formsResult.data?.find(f => f.id === formId);
      if (!foundForm) {
        throw new Error('Form not found');
      }

      setForm(foundForm);

      // Get form template
      const template = formService.getFormTemplate(foundForm.form_type);
      if (!template) {
        throw new Error('Form template not found');
      }

      setFormFields(template.fields);

      // Parse filled data
      if (foundForm.filled_data) {
        const parsedData = JSON.parse(foundForm.filled_data);
        setFilledData(parsedData);
      }
    } catch (error) {
      console.error('Failed to load form:', error);
      Alert.alert('Error', 'Failed to load form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFilledData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSaveForm = async () => {
    try {
      if (!form) return;

      setIsSaving(true);
      
      const updatedForm: Form = {
        ...form,
        filled_data: JSON.stringify(filledData),
        updated_at: new Date().toISOString(),
        status: 'filled',
      };

      const result = await databaseService.saveForm(updatedForm);
      
      if (result.success) {
        Alert.alert('Success', 'Form saved successfully!');
        setForm(updatedForm);
      } else {
        throw new Error(result.error || 'Failed to save form');
      }
    } catch (error) {
      console.error('Failed to save form:', error);
      Alert.alert('Error', 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoFillFromTranscript = async () => {
    try {
      if (!form) return;

      // Get the latest transcript
      const transcriptResult = await databaseService.getTranscripts();
      if (!transcriptResult.success || !transcriptResult.data || transcriptResult.data.length === 0) {
        Alert.alert('No Transcripts', 'Please create a transcript first before auto-filling forms.');
        return;
      }

      const latestTranscript = transcriptResult.data[0];
      
      // Fill the form with transcript data
      const filledForm = await formService.fillFormWithTranscript(form.id, latestTranscript.content);
      
      // Update local state
      setForm(filledForm);
      if (filledForm.filled_data) {
        const parsedData = JSON.parse(filledForm.filled_data);
        setFilledData(parsedData);
      }
      
      Alert.alert('Success', 'Form auto-filled with transcript data!');
    } catch (error) {
      console.error('Failed to auto-fill form:', error);
      Alert.alert('Error', 'Failed to auto-fill form with transcript data.');
    }
  };

  const handleExportForm = async () => {
    try {
      if (!form) return;

      const pdfPath = await formService.exportFormAsPDF(form.id);
      Alert.alert('Success', `Form exported as PDF: ${pdfPath}`);
    } catch (error) {
      console.error('Failed to export form:', error);
      Alert.alert('Error', 'Failed to export form as PDF.');
    }
  };

  const handlePrintForm = async () => {
    try {
      if (!form) return;

      await formService.printForm(form.id);
      Alert.alert('Success', 'Form sent to printer');
    } catch (error) {
      console.error('Failed to print form:', error);
      Alert.alert('Error', 'Failed to print form.');
    }
  };

  const renderField = (field: FormField) => {
    const value = filledData[field.name] || '';

    return (
      <View key={field.name} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
        
        {field.type === 'textarea' ? (
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={value}
            onChangeText={(text) => handleFieldChange(field.name, text)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            placeholderTextColor={COLORS.TEXT_DISABLED}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        ) : (
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={(text) => handleFieldChange(field.name, text)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            placeholderTextColor={COLORS.TEXT_DISABLED}
          />
        )}
        
        {field.description && (
          <Text style={styles.fieldDescription}>{field.description}</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading form...</Text>
      </View>
    );
  }

  if (!form) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Form not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{form.name}</Text>
          <Text style={styles.subtitle}>{form.form_type}</Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusBadge, styles[`status${form.status}`]]}>
              {form.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.autoFillButton]}
            onPress={handleAutoFillFromTranscript}
          >
            <Text style={styles.actionButtonText}>Auto-Fill from Transcript</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExportForm}
          >
            <Text style={styles.actionButtonText}>Export PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={handlePrintForm}
          >
            <Text style={styles.actionButtonText}>Print</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Form Fields</Text>
          {formFields.map(renderField)}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.savingButton]}
          onPress={handleSaveForm}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <Text style={styles.saveButtonText}>Save Form</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  scrollContent: {
    padding: SPACING.MD,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  errorText: {
    ...TYPOGRAPHY.H3,
    color: COLORS.ERROR,
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
    marginBottom: SPACING.SM,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    ...TYPOGRAPHY.CAPTION,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.LG,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginHorizontal: SPACING.XS,
    alignItems: 'center',
  },
  autoFillButton: {
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
  formSection: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  fieldContainer: {
    marginBottom: SPACING.MD,
  },
  fieldLabel: {
    ...TYPOGRAPHY.LABEL,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  required: {
    color: COLORS.ERROR,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  fieldDescription: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  savingButton: {
    backgroundColor: COLORS.GRAY_500,
  },
  saveButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
});

export default FormFillingScreen; 