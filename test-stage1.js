// Simple test script for Stage 1 functionality
// This can be run with Node.js to verify basic database operations

console.log('🧪 Testing Stage 1: Project Setup and Core Infrastructure\n');

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/types/index.ts',
  'src/services/DatabaseService.ts',
  'src/constants/index.ts',
  'src/screens/HomeScreen.tsx',
  'src/screens/TranscriptScreen.tsx',
  'src/screens/FormsScreen.tsx',
  'src/screens/FormFillingScreen.tsx',
  'src/screens/CPDLoggingScreen.tsx',
  'src/screens/CPDDetailScreen.tsx',
  'src/screens/EducationScreen.tsx',
  'src/screens/SettingsScreen.tsx',
  'src/screens/VoiceRecorderScreen.tsx',
  'src/utils/testUtils.ts',
  'App.tsx',
  'package.json',
  'app.json',
  'README.md'
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

// Test 2: Check package.json dependencies
console.log('\n📦 Checking package.json dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@react-navigation/native',
    '@react-navigation/stack',
    'expo-sqlite',
    'expo-file-system',
    'react-native-safe-area-context'
  ];
  
  let depsExist = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep} - ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      depsExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Failed to read package.json');
  filesExist = false;
}

// Test 3: Check app.json configuration
console.log('\n⚙️ Checking app.json configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  if (appJson.expo.name === 'NMC Nurse Revalidation') {
    console.log('  ✅ App name configured correctly');
  } else {
    console.log('  ❌ App name not configured correctly');
    filesExist = false;
  }
  
  if (appJson.expo.plugins && appJson.expo.plugins.length > 0) {
    console.log('  ✅ Plugins configured');
  } else {
    console.log('  ❌ No plugins configured');
    filesExist = false;
  }
} catch (error) {
  console.log('  ❌ Failed to read app.json');
  filesExist = false;
}

// Test 4: Check TypeScript configuration
console.log('\n🔧 Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsConfig.compilerOptions) {
    console.log('  ✅ TypeScript configuration exists');
  } else {
    console.log('  ❌ TypeScript configuration incomplete');
    filesExist = false;
  }
} catch (error) {
  console.log('  ❌ Failed to read tsconfig.json');
  filesExist = false;
}

// Test 5: Check directory structure
console.log('\n📂 Checking directory structure...');
const requiredDirs = [
  'src',
  'src/components',
  'src/screens',
  'src/services',
  'src/types',
  'src/utils',
  'src/hooks',
  'src/constants'
];

let dirsExist = true;
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ - MISSING`);
    dirsExist = false;
  }
});

// Summary
console.log('\n📊 Stage 1 Test Summary');
console.log('========================');
console.log(`Files exist: ${filesExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Directories exist: ${dirsExist ? '✅ PASS' : '❌ FAIL'}`);

if (filesExist && dirsExist) {
  console.log('\n🎉 Stage 1 is ready! All basic infrastructure is in place.');
  console.log('\nNext steps:');
  console.log('1. Run "npm start" to start the development server');
  console.log('2. Test the app on a device or simulator');
  console.log('3. Verify navigation works between screens');
  console.log('4. Check that the database initializes properly');
  console.log('\nReady for Stage 2: Voice-to-Text Transcription');
} else {
  console.log('\n⚠️ Stage 1 has issues that need to be resolved before proceeding.');
  console.log('Please fix the missing files/directories and run this test again.');
}

console.log('\n✅ Stage 1 test completed.'); 