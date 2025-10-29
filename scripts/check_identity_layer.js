#!/usr/bin/env node

/**
 * BANIBS Identity Layer Verification
 * 
 * This script ensures that the required BANIBS brand elements
 * are present on the homepage.
 * 
 * Required elements:
 * 1. QuickLinks component (ecosystem navigation)
 * 2. Identity statement (brand name)
 * 3. The BANIBS Network section
 * 
 * Usage: node scripts/check_identity_layer.js
 * 
 * Exit codes:
 * 0 - All required elements found
 * 1 - One or more required elements missing
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, checks) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`❌ File not found: ${filePath}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  let allPassed = true;
  
  checks.forEach(check => {
    if (content.includes(check.pattern)) {
      log(`✅ ${check.name} found`, 'green');
    } else {
      log(`❌ ${check.name} missing`, 'red');
      log(`   Expected pattern: "${check.pattern}"`, 'yellow');
      allPassed = false;
    }
  });
  
  return allPassed;
}

// Main verification
log('\n🔍 Verifying BANIBS Identity Layer...\n', 'blue');

const homePageChecks = [
  {
    name: 'QuickLinks component import',
    pattern: "import QuickLinks from"
  },
  {
    name: 'QuickLinks component usage',
    pattern: "<QuickLinks"
  },
  {
    name: 'Identity statement (brand name)',
    pattern: "Black America News Information & Business System"
  },
  {
    name: 'The BANIBS Network section',
    pattern: "The BANIBS Network"
  }
];

const quickLinksChecks = [
  {
    name: 'Social link',
    pattern: "Social"
  },
  {
    name: 'Business link',
    pattern: "Business"
  },
  {
    name: 'Information link',
    pattern: "Information"
  },
  {
    name: 'Education link',
    pattern: "Education"
  },
  {
    name: 'Youth link',
    pattern: "Youth"
  },
  {
    name: 'Opportunities link',
    pattern: "Opportunities"
  },
  {
    name: 'Resources link',
    pattern: "Resources"
  }
];

log('📄 Checking HomePage.js...\n', 'blue');
const homePageValid = checkFile('frontend/src/pages/HomePage.js', homePageChecks);

log('\n📄 Checking QuickLinks.js...\n', 'blue');
const quickLinksValid = checkFile('frontend/src/components/QuickLinks.js', quickLinksChecks);

// Final result
log('\n' + '='.repeat(50) + '\n', 'blue');

if (homePageValid && quickLinksValid) {
  log('✅ BANIBS Identity Layer Verified', 'green');
  log('All required brand elements are present.\n', 'green');
  process.exit(0);
} else {
  log('❌ BANIBS Identity Layer Incomplete', 'red');
  log('Required brand elements are missing.', 'red');
  log('See /docs/BANIBS_NARRATIVE_GUIDE.md for requirements.\n', 'yellow');
  process.exit(1);
}
