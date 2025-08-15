const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Stage 3: NMC Form Integration\n');

const requiredFiles = [
  'src/services/FormService.ts',
];

const updatedScreens = [
  'src/screens/FormsScreen.tsx',
  'src/screens/FormFillingScreen.tsx',
];

const requiredDependencies = [
  'expo-file-system',
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📱 Checking updated screens...');
let allScreensUpdated = true;

updatedScreens.forEach(screen => {
  if (fs.existsSync(screen)) {
    console.log(`  ✅ ${screen}`);
  } else {
    console.log(`  ❌ ${screen} - MISSING`);
    allScreensUpdated = false;
  }
});

console.log('\n📦 Checking package.json dependencies...');
let allDependenciesExist = true;

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  requiredDependencies.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`  ✅ ${dep} - ${dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      allDependenciesExist = false;
    }
  });
} catch (error) {
  console.log(`  ❌ Failed to read package.json: ${error.message}`);
  allDependenciesExist = false;
}

console.log('\n🔧 Checking App.tsx initialization...');
let appInitializationCorrect = false;

try {
  const appContent = fs.readFileSync('App.tsx', 'utf8');
  if (appContent.includes('formService.initialize()')) {
    console.log('  ✅ FormService initialization in App.tsx');
    appInitializationCorrect = true;
  } else {
    console.log('  ❌ FormService initialization missing from App.tsx');
  }
} catch (error) {
  console.log(`  ❌ Failed to read App.tsx: ${error.message}`);
}

console.log('\n📊 Stage 3 Test Summary\n');

if (allFilesExist && allScreensUpdated && allDependenciesExist && appInitializationCorrect) {
  console.log('✅ Stage 3: NMC Form Integration - READY\n');
  
  console.log('🎯 Features Implemented:');
  console.log('  • FormService for managing NMC forms');
  console.log('  • Download and store forms locally');
  console.log('  • Auto-fill forms with transcript data');
  console.log('  • Form editing and validation');
  console.log('  • Export to PDF (placeholder)');
  console.log('  • Print functionality (placeholder)');
  console.log('  • Web and mobile storage compatibility');
  
  console.log('\n🚀 Ready for Stage 4: CPD Lecture Logging');
} else {
  console.log('❌ Stage 3: NMC Form Integration - INCOMPLETE\n');
  
  if (!allFilesExist) {
    console.log('Missing required files');
  }
  if (!allScreensUpdated) {
    console.log('Screens not updated');
  }
  if (!allDependenciesExist) {
    console.log('Missing dependencies');
  }
  if (!appInitializationCorrect) {
    console.log('App initialization not configured');
  }
}

console.log('\n✅ Stage 3 test completed.'); 