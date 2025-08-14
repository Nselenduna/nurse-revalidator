export interface AzureSpeechPhrase {
  display: string;
  offsetInTicks: number;
  durationInTicks: number;
  confidence: number;
}

export interface AzureSpeechResponse {
  status: 'NotStarted' | 'Running' | 'Succeeded' | 'Failed';
  combinedRecognizedPhrases: Array<{
    display: string;
    confidence: number;
  }>;
  recognizedPhrases: AzureSpeechPhrase[];
  error?: {
    code: string;
    message: string;
  };
}
