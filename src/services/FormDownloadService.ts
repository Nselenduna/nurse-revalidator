import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

// Use NMC's official form URLs (from their CDN)
const NMC_FORMS = {
  REVALIDATION: 'https://www.nmc.org.uk/cdn/forms/revalidation-form.pdf',
  REFLECTION: 'https://www.nmc.org.uk/cdn/forms/reflection-form.pdf',
  PRACTICE_HOURS: 'https://www.nmc.org.uk/cdn/forms/practice-hours.pdf',
  CPD_LOG: 'https://www.nmc.org.uk/cdn/forms/cpd-log.pdf'
} as const;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MIN_PDF_SIZE = 1000; // Minimum size for a valid PDF file

export const getFormDirectory = async (): Promise<string> => {
  const formsDir = `${FileSystem.documentDirectory}forms/`;
  const formsDirInfo = await FileSystem.getInfoAsync(formsDir);
  
  if (!formsDirInfo.exists) {
    await FileSystem.makeDirectoryAsync(formsDir, { intermediates: true });
  }
  
  return formsDir;
};

export const checkCachedForm = async (formPath: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(formPath);
    if (!fileInfo.exists) return false;

    // Check file size
    if (fileInfo.size && fileInfo.size < MIN_PDF_SIZE) {
      await FileSystem.deleteAsync(formPath);
      return false;
    }

    // Check file age (if possible)
    const stats = await FileSystem.getInfoAsync(formPath);
    const now = Date.now();
    if (stats.exists && stats.modificationTime && (now - stats.modificationTime < CACHE_DURATION)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking cached form:', error);
    return false;
  }
};

export const downloadLatestNMCForm = async (formType: keyof typeof NMC_FORMS): Promise<string | null> => {
  try {
    const formsDir = await getFormDirectory();
    const formUrl = NMC_FORMS[formType];
    const fileName = `nmc_${formType.toLowerCase()}_form.pdf`;
    const downloadPath = `${formsDir}${fileName}`;

    // Check cache first
    if (await checkCachedForm(downloadPath)) {
      console.log('Using cached form:', downloadPath);
      return downloadPath;
    }

    console.log('Downloading form from:', formUrl);
    console.log('Saving to:', downloadPath);

    try {
      const downloadResult = await FileSystem.downloadAsync(
        formUrl,
        downloadPath,
        {
          headers: {
            'Accept': 'application/pdf',
            'User-Agent': 'Mozilla/5.0',
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (downloadResult.status === 200) {
        // Verify downloaded file
        const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
        if (!fileInfo.exists || (fileInfo.size && fileInfo.size < MIN_PDF_SIZE)) {
          throw new Error('Downloaded file appears to be invalid');
        }

        // Share on iOS
        if (Platform.OS === 'ios') {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: `Save ${formType} Form`
            });
          }
        }

        return downloadResult.uri;
      } else {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      // Clean up failed download
      const failedFileInfo = await FileSystem.getInfoAsync(downloadPath);
      if (failedFileInfo.exists) {
        await FileSystem.deleteAsync(downloadPath);
      }

      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          throw new Error('Unable to download form. Please check your internet connection.');
        }
        throw error;
      }
      throw new Error('Failed to download form');
    }
  } catch (error) {
    console.error('Form download failed:', error);
    Alert.alert(
      'Download Failed',
      error instanceof Error ? error.message : 'Unable to download form. Please try again later.'
    );
    return null;
  }
};

export const clearFormCache = async (): Promise<void> => {
  try {
    const formsDir = await getFormDirectory();
    const dirContents = await FileSystem.readDirectoryAsync(formsDir);
    
    await Promise.all(
      dirContents.map(file => 
        FileSystem.deleteAsync(`${formsDir}${file}`, { idempotent: true })
      )
    );
    
    console.log('Form cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear form cache:', error);
    throw error;
  }
};
