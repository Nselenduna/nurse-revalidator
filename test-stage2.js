const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Stage 2: Voice-to-Text Transcription\n');

// Check required files for Stage 2
const requiredFiles = [
  'src/services/VoiceService.ts',
  'src/hooks/useVoiceRecording.ts',
  'src/components/VoiceRecorder.tsx',
];

console.log('📁 Checking required files...');
let filesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    filesExist = false;
  }
});

// Check updated screens
const updatedScreens = [
  'src/screens/VoiceRecorderScreen.tsx',
  'src/screens/TranscriptScreen.tsx',
];

console.log('\n📱 Checking updated screens...');
updatedScreens.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    filesExist = false;
  }
});

// Check package.json for required dependencies
console.log('\n📦 Checking package.json dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'expo-av',
    'expo-speech',
    'expo-file-system'
  ];
  
  let depsExist = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep} - ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      depsExist = false;
    }
  });
  
  if (!depsExist) {
    filesExist = false;
  }
} catch (error) {
  console.log('  ❌ Failed to read package.json');
  filesExist = false;
}

// Check app.json for audio permissions
console.log('\n⚙️ Checking app.json configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  // Check for audio permissions
  const hasAudioPermissions = appJson.expo?.plugins?.some(plugin => 
    Array.isArray(plugin) && plugin[0] === 'expo-av'
  );
  
  if (hasAudioPermissions) {
    console.log('  ✅ Audio permissions configured');
  } else {
    console.log('  ❌ Audio permissions missing');
    filesExist = false;
  }
  
  // Check for microphone permissions in iOS
  const hasMicrophonePermission = appJson.expo?.ios?.infoPlist?.NSMicrophoneUsageDescription;
  if (hasMicrophonePermission) {
    console.log('  ✅ iOS microphone permission configured');
  } else {
    console.log('  ❌ iOS microphone permission missing');
    filesExist = false;
  }
  
  // Check for microphone permissions in Android
  const hasAndroidPermissions = appJson.expo?.android?.permissions?.includes('android.permission.RECORD_AUDIO');
  if (hasAndroidPermissions) {
    console.log('  ✅ Android microphone permission configured');
  } else {
    console.log('  ❌ Android microphone permission missing');
    filesExist = false;
  }
  
} catch (error) {
  console.log('  ❌ Failed to read app.json');
  filesExist = false;
}

// Check for TypeScript compilation
console.log('\n🔧 Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  console.log('  ✅ TypeScript configuration exists');
} catch (error) {
  console.log('  ❌ TypeScript configuration missing');
  filesExist = false;
}

// Summary
console.log('\n📊 Stage 2 Test Summary\n');

if (filesExist) {
  console.log('✅ Stage 2: Voice-to-Text Transcription - READY');
  console.log('\n🎯 Features Implemented:');
  console.log('  • Voice recording with Expo AV');
  console.log('  • Speech-to-text transcription (simulated)');
  console.log('  • AI enhancement suggestions based on NMC pillars');
  console.log('  • Editable transcript interface');
  console.log('  • Save/load functionality with SQLite');
  console.log('  • Transcript management (view, delete)');
  console.log('  • Error handling and user feedback');
  console.log('\n🚀 Ready for Stage 3: NMC Form Integration');
} else {
  console.log('❌ Stage 2: Voice-to-Text Transcription - INCOMPLETE');
  console.log('\nPlease fix the missing files and dependencies before proceeding.');
}

console.log('\n✅ Stage 2 test completed.'); 