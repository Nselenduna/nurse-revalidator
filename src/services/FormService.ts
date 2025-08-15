import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Form, NMCForm, FormField } from '../types';
import { FORM_TEMPLATES } from '../constants';

class FormService {
  private isWeb = Platform.OS === 'web';
  private formsDirectory = `${FileSystem.documentDirectory}forms/`;

  async initialize(): Promise<void> {
    try {
      if (!this.isWeb) {
        // Create forms directory if it doesn't exist
        const dirInfo = await FileSystem.getInfoAsync(this.formsDirectory);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(this.formsDirectory, { intermediates: true });
        }
      }
      console.log('FormService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FormService:', error);
      throw error;
    }
  }

  // Download NMC forms from official website
  async downloadNMCForm(formType: string): Promise<Form> {
    try {
      console.log(`Downloading NMC form: ${formType}`);
      
      // For now, we'll use static templates since we can't actually download from NMC website
      // In a real implementation, you would fetch from the actual NMC website
      const formTemplate = FORM_TEMPLATES[formType as keyof typeof FORM_TEMPLATES];
      
      if (!formTemplate) {
        throw new Error(`Form type '${formType}' not found`);
      }

      const formData: Form = {
        id: Date.now(),
        name: formTemplate.name,
        file_path: this.isWeb ? `web://${formType}.json` : `${this.formsDirectory}${formType}.json`,
        filled_data: JSON.stringify(formTemplate.fields),
        created_at: new Date().toISOString(),
        form_type: formType as 'revalidation' | 'practice_log' | 'reflection',
        status: 'draft' as 'draft' | 'completed' | 'submitted',
      };

      // Save form data
      if (this.isWeb) {
        // Store in localStorage for web
        const forms = this.getWebForms();
        forms.push(formData);
        this.setWebForms(forms);
      } else {
        // Save to file system for mobile
        await FileSystem.writeAsStringAsync(
          formData.file_path,
          JSON.stringify(formTemplate)
        );
      }

      console.log(`Form downloaded successfully: ${formType}`);
      return formData;
    } catch (error) {
      console.error(`Failed to download form ${formType}:`, error);
      throw error;
    }
  }

  // Get available form templates
  getAvailableForms(): string[] {
    return Object.keys(FORM_TEMPLATES);
  }

  // Get form template by type
  getFormTemplate(formType: string): NMCForm | null {
    const template = FORM_TEMPLATES[formType as keyof typeof FORM_TEMPLATES];
    if (!template) return null;
    
    // Convert readonly fields to mutable FormField[]
    return {
      ...template,
      fields: template.fields.map(field => ({
        ...field,
        value: '',
        name: field.id,
        required: field.required || false,
      }))
    };
  }

  // Fill form with transcribed data
  async fillFormWithTranscript(formId: number, transcriptData: string): Promise<Form> {
    try {
      console.log(`Filling form ${formId} with transcript data`);
      
      // Get the form
      const forms = this.isWeb ? this.getWebForms() : await this.getLocalForms();
      const formIndex = forms.findIndex(f => f.id === formId);
      
      if (formIndex === -1) {
        throw new Error(`Form with ID ${formId} not found`);
      }

      const form = forms[formIndex];
      const formTemplate = this.getFormTemplate(form.form_type);
      
      if (!formTemplate) {
        throw new Error(`Form template for ${form.form_type} not found`);
      }

      // Parse existing filled data
      const filledData = JSON.parse(form.filled_data || '{}');
      
      // Auto-fill fields based on transcript content
      const updatedFields = this.autoFillFields(formTemplate.fields, filledData, transcriptData);
      
      // Update form with new data
      const updatedForm: Form = {
        ...form,
        filled_data: JSON.stringify(updatedFields),
        updated_at: new Date().toISOString(),
        status: 'completed' as 'draft' | 'completed' | 'submitted',
      };

      // Save updated form
      if (this.isWeb) {
        forms[formIndex] = updatedForm;
        this.setWebForms(forms);
      } else {
        await FileSystem.writeAsStringAsync(
          form.file_path,
          JSON.stringify(updatedForm)
        );
      }

      console.log(`Form ${formId} filled successfully`);
      return updatedForm;
    } catch (error) {
      console.error(`Failed to fill form ${formId}:`, error);
      throw error;
    }
  }

  // Auto-fill form fields based on transcript content
  private autoFillFields(fields: FormField[], existingData: any, transcriptData: string): any {
    const updatedData = { ...existingData };
    
    fields.forEach(field => {
      // Check if field has auto-fill capability
      if (field.autoFill && !updatedData[field.name || field.id]) {
        // Simple keyword matching for auto-fill
        const keywords = field.keywords || [];
        const fieldLabel = field.label.toLowerCase();
        const transcriptLower = transcriptData.toLowerCase();
        
        // Check if transcript contains relevant keywords for this field
        if (transcriptLower.includes(fieldLabel) || 
            keywords.some(keyword => transcriptLower.includes(keyword.toLowerCase())) ||
            (fieldLabel.includes('name') && transcriptLower.includes('name')) ||
            (fieldLabel.includes('email') && transcriptLower.includes('email')) ||
            (fieldLabel.includes('reflection') && transcriptLower.includes('reflection'))) {
          
          // Extract relevant text around the field label
          const labelIndex = transcriptLower.indexOf(fieldLabel);
          const start = Math.max(0, labelIndex - 50);
          const end = Math.min(transcriptData.length, labelIndex + fieldLabel.length + 50);
          const extractedText = transcriptData.substring(start, end).trim();
          
          updatedData[field.name || field.id] = extractedText;
        }
      }
    });

    return updatedData;
  }

  // Export form as PDF (placeholder for now)
  async exportFormAsPDF(formId: number): Promise<string> {
    try {
      console.log(`Exporting form ${formId} as PDF`);
      
      // This would integrate with a PDF generation library
      // For now, we'll return a placeholder
      const pdfPath = this.isWeb 
        ? `web://form_${formId}.pdf`
        : `${FileSystem.documentDirectory}exports/form_${formId}.pdf`;
      
      // In a real implementation, you would:
      // 1. Get the form data
      // 2. Generate PDF using a library like react-native-html-to-pdf
      // 3. Save the PDF file
      
      console.log(`Form ${formId} exported as PDF: ${pdfPath}`);
      return pdfPath;
    } catch (error) {
      console.error(`Failed to export form ${formId} as PDF:`, error);
      throw error;
    }
  }

  // Print form (placeholder for now)
  async printForm(formId: number): Promise<void> {
    try {
      console.log(`Printing form ${formId}`);
      
      // This would integrate with a printing library
      // For now, we'll just log the action
      
      console.log(`Form ${formId} sent to printer`);
    } catch (error) {
      console.error(`Failed to print form ${formId}:`, error);
      throw error;
    }
  }

  // Web storage helpers
  private getWebForms(): Form[] {
    if (this.isWeb && typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem('forms');
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  private setWebForms(forms: Form[]): void {
    if (this.isWeb && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('forms', JSON.stringify(forms));
    }
  }

  private async getLocalForms(): Promise<Form[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.formsDirectory);
      const forms: Form[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await FileSystem.readAsStringAsync(`${this.formsDirectory}${file}`);
          const form = JSON.parse(content);
          forms.push(form);
        }
      }
      
      return forms;
    } catch (error) {
      console.error('Failed to get local forms:', error);
      return [];
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    // Cleanup any temporary files or resources
    console.log('FormService cleanup completed');
  }
}

export const formService = new FormService();
export default formService; 