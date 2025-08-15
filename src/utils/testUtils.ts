// Test utilities for the NMC Nurse Revalidation App

import databaseService from '../services/DatabaseService';
import { Transcript, Form, CPDLog } from '../types';

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await databaseService.initialize();
    console.log('✅ Database connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

export const testTranscriptOperations = async (): Promise<boolean> => {
  try {
    // Test saving a transcript
    const testTranscript: Transcript = {
      title: 'Test Reflection',
      content: 'This is a test reflection for database testing.',
      tags: 'test, reflection',
    };

    const saveResult = await databaseService.saveTranscript(testTranscript);
    if (!saveResult.success) {
      throw new Error('Failed to save transcript');
    }

    // Test retrieving transcripts
    const getResult = await databaseService.getTranscripts();
    if (!getResult.success || !getResult.data) {
      throw new Error('Failed to retrieve transcripts');
    }

    // Verify the transcript was saved
    const savedTranscript = getResult.data.find(t => t.title === testTranscript.title);
    if (!savedTranscript) {
      throw new Error('Saved transcript not found in retrieval');
    }

    console.log('✅ Transcript operations test passed');
    return true;
  } catch (error) {
    console.error('❌ Transcript operations test failed:', error);
    return false;
  }
};

export const testFormOperations = async (): Promise<boolean> => {
  try {
    // Test saving a form
    const testForm: Form = {
      name: 'Test Form',
      file_path: '/test/form.pdf',
      filled_data: '{"field1": "value1"}',
      form_type: 'revalidation',
      status: 'draft',
    };

    const saveResult = await databaseService.saveForm(testForm);
    if (!saveResult.success) {
      throw new Error('Failed to save form');
    }

    // Test retrieving forms
    const getResult = await databaseService.getForms();
    if (!getResult.success || !getResult.data) {
      throw new Error('Failed to retrieve forms');
    }

    console.log('✅ Form operations test passed');
    return true;
  } catch (error) {
    console.error('❌ Form operations test failed:', error);
    return false;
  }
};

export const testCPDLogOperations = async (): Promise<boolean> => {
  try {
    // Test saving a CPD log
    const testCPDLog: CPDLog = {
      title: 'Test CPD Activity',
      summary: 'This is a test CPD activity for database testing.',
      category: 'training',
      duration: 60,
    };

    const saveResult = await databaseService.saveCPDLog(testCPDLog);
    if (!saveResult.success) {
      throw new Error('Failed to save CPD log');
    }

    // Test retrieving CPD logs
    const getResult = await databaseService.getCPDLogs();
    if (!getResult.success || !getResult.data) {
      throw new Error('Failed to retrieve CPD logs');
    }

    console.log('✅ CPD log operations test passed');
    return true;
  } catch (error) {
    console.error('❌ CPD log operations test failed:', error);
    return false;
  }
};

export const runAllTests = async (): Promise<void> => {
  console.log('🧪 Running all tests...\n');

  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'Transcript Operations', test: testTranscriptOperations },
    { name: 'Form Operations', test: testFormOperations },
    { name: 'CPD Log Operations', test: testCPDLogOperations },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const { name, test } of tests) {
    console.log(`Testing: ${name}`);
    const result = await test();
    if (result) {
      passedTests++;
    }
    console.log('');
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Stage 1 is ready.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

export const cleanupTestData = async (): Promise<void> => {
  try {
    // This would be implemented to clean up test data
    // For now, we'll just log that cleanup is needed
    console.log('🧹 Test data cleanup would be implemented here');
  } catch (error) {
    console.error('Failed to cleanup test data:', error);
  }
}; 