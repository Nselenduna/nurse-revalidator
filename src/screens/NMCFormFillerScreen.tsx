import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Platform, Button, Alert } from 'react-native';
import Pdf from 'react-native-pdf';
import { downloadLatestNMCForm } from '../services/FormDownloadService';
import { Audio } from 'expo-av';
import RNFetchBlob from 'react-native-blob-util';

const DEEPGRAM_API_KEY = '3b172003f0e76d71f193e52680fb43d0c1a75c75';

const NMCFormFillerScreen = () => {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [formUri, setFormUri] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef<any>(null);

  useEffect(() => {
    downloadForm();
  }, []);

  const downloadForm = async () => {
    const uri = await downloadLatestNMCForm();
    setFormUri(uri);
  };

  const startListening = async () => {
    setIsListening(true);
    setRecognizedText('');
    // Deepgram SDK live transcription is not supported in React Native. Use REST API upload after recording.
    setTimeout(() => {
      setRecognizedText('Simulated voice-to-text result (use native audio recorder and Deepgram REST API for production)');
      setIsListening(false);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    if (Platform.OS === 'web' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission not granted');
        setIsRecording(false);
        return;
      }
      // Prepare and start recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      recordingRef.current = newRecording;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Recording Error', message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setAudioPath(uri || null);
        recordingRef.current = null;
      }
      setIsRecording(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Stop Recording Error', message);
    }
  };

  const uploadToDeepgram = async () => {
    if (!audioPath) {
      Alert.alert('No audio to upload');
      return;
    }
    try {
      const audioData = await RNFetchBlob.fs.readFile(audioPath, 'base64');
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/mp3',
        },
        body: RNFetchBlob.base64.decode(audioData),
      });
      const result = await response.json();
      setTranscription(result.results.channels[0].alternatives[0].transcript || '');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Deepgram Error', message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {formUri ? (
        <View>
          <Pdf
            source={{ uri: formUri }}
            style={styles.pdf}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => isListening ? stopListening() : startListening()}
          >
            <Text style={styles.buttonText}>
              {isListening ? 'Stop Voice Input' : 'Start Voice Input'}
            </Text>
          </TouchableOpacity>
          {isListening && (
            <Text style={styles.listeningText}>Listening...</Text>
          )}
          <TextInput
            style={styles.textInput}
            multiline
            value={recognizedText}
            onChangeText={setRecognizedText}
            placeholder="Recognized text will appear here"
          />
          <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} />
          <Button title="Transcribe Audio" onPress={uploadToDeepgram} disabled={!audioPath} />
          <Text>Transcription: {transcription}</Text>
        </View>
      ) : (
        <Text>Loading form...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: 500,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  listeningText: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    margin: 10,
    height: 100,
    textAlignVertical: 'top',
  },
});

export default NMCFormFillerScreen;
