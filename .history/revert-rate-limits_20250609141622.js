#!/usr/bin/env node

/**
 * Script to revert rate limiting changes back to production-safe values
 * Run this after completing load testing to restore security
 */

const fs = require('fs');
const path = require('path');

const RATE_LIMITING_FILE = path.join(__dirname, 'Backend', 'src', 'middleware', 'rateLimiting.ts');

// Original production-safe rate limiting values
const ORIGINAL_VALUES = {
  generalLimiter: 'max: NODE_ENV === \'development\' ? 1000 : 100, // Limit for production',
  globalLimiter: 'delayAfter: NODE_ENV === \'development\' ? 100 : 100, // Production threshold',
  authLimiter: 'max: NODE_ENV === \'development\' ? 100 : 5, // Strict auth limits for production',
  speedLimiter: {
    delayAfter: 'delayAfter: NODE_ENV === \'development\' ? 1000 : 2, // Production speed limit',
    maxDelayMs: 'maxDelayMs: NODE_ENV === \'development\' ? 0 : 20000, // Production delay'
  },
  passwordResetLimiter: 'max: NODE_ENV === \'development\' ? 50 : 3, // Strict password reset limit',
  signupLimiter: 'max: NODE_ENV === \'development\' ? 100 : 3, // Strict signup limit',
};

// Current load testing values (what we need to replace)
const LOAD_TEST_VALUES = {
  generalLimiter: 'max: NODE_ENV === \'development\' ? 1000 : 100000, // Temporarily disabled for load testing in production',
  globalLimiter: 'delayAfter: NODE_ENV === \'development\' ? 100 : 100000, // Temporarily disabled for load testing',
  authLimiter: 'max: NODE_ENV === \'development\' ? 100 : 10000, // Temporarily disabled for load testing',
  speedLimiter: {
    delayAfter: 'delayAfter: NODE_ENV === \'development\' ? 1000 : 100000, // Temporarily disabled for load testing',
    maxDelayMs: 'maxDelayMs: NODE_ENV === \'development\' ? 0 : 0, // No delay for load testing'
  },
  passwordResetLimiter: 'max: NODE_ENV === \'development\' ? 50 : 10000, // Temporarily disabled for load testing',
  signupLimiter: 'max: NODE_ENV === \'development\' ? 100 : 10000, // Temporarily disabled for load testing',
};

function revertRateLimits() {
  console.log('🔄 Reverting rate limiting configuration to production-safe values...\n');

  try {
    // Check if the file exists
    if (!fs.existsSync(RATE_LIMITING_FILE)) {
      console.error('❌ Rate limiting file not found:', RATE_LIMITING_FILE);
      process.exit(1);
    }

    // Read the current file content
    let content = fs.readFileSync(RATE_LIMITING_FILE, 'utf8');

    // Store original content for backup
    const backupFile = RATE_LIMITING_FILE + '.backup.' + Date.now();
    fs.writeFileSync(backupFile, content);
    console.log('📁 Backup created:', backupFile);

    // Perform replacements
    const replacements = [
      {
        name: 'General Limiter',
        from: LOAD_TEST_VALUES.generalLimiter,
        to: ORIGINAL_VALUES.generalLimiter
      },
      {
        name: 'Global Limiter',
        from: LOAD_TEST_VALUES.globalLimiter,
        to: ORIGINAL_VALUES.globalLimiter
      },
      {
        name: 'Auth Limiter',
        from: LOAD_TEST_VALUES.authLimiter,
        to: ORIGINAL_VALUES.authLimiter
      },
      {
        name: 'Speed Limiter - delayAfter',
        from: LOAD_TEST_VALUES.speedLimiter.delayAfter,
        to: ORIGINAL_VALUES.speedLimiter.delayAfter
      },
      {
        name: 'Speed Limiter - maxDelayMs',
        from: LOAD_TEST_VALUES.speedLimiter.maxDelayMs,
        to: ORIGINAL_VALUES.speedLimiter.maxDelayMs
      },
      {
        name: 'Password Reset Limiter',
        from: LOAD_TEST_VALUES.passwordResetLimiter,
        to: ORIGINAL_VALUES.passwordResetLimiter
      },
      {
        name: 'Signup Limiter',
        from: LOAD_TEST_VALUES.signupLimiter,
        to: ORIGINAL_VALUES.signupLimiter
      }
    ];

    let changesCount = 0;

    replacements.forEach(replacement => {
      if (content.includes(replacement.from)) {
        content = content.replace(replacement.from, replacement.to);
        console.log('✅', replacement.name, 'reverted');
        changesCount++;
      } else {
        console.log('⚠️ ', replacement.name, 'not found (may already be reverted)');
      }
    });

    if (changesCount === 0) {
      console.log('\n🎯 No changes needed - rate limits appear to already be at production values');
      // Remove the backup since no changes were made
      fs.unlinkSync(backupFile);
      return;
    }

    // Write the updated content back to the file
    fs.writeFileSync(RATE_LIMITING_FILE, content);

    console.log(`\n✅ Successfully reverted ${changesCount} rate limiting configurations!`);
    console.log('\n📋 Summary of reverted values:');
    console.log('   • General API: 100 requests per 15 minutes');
    console.log('   • Authentication: 5 requests per 15 minutes');
    console.log('   • Password Reset: 3 requests per hour');
    console.log('   • Account Creation: 3 requests per hour');
    console.log('   • Speed throttling: After 2 requests with 20s delay');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Deploy these changes to production');
    console.log('   2. Verify rate limiting is working as expected');
    console.log('   3. Monitor your application for proper protection');

  } catch (error) {
    console.error('❌ Error reverting rate limits:', error.message);
    process.exit(1);
  }
}

// Show current status
function showCurrentStatus() {
  console.log('📊 Current Rate Limiting Status Check\n');
  
  try {
    const content = fs.readFileSync(RATE_LIMITING_FILE, 'utf8');
    
    const checks = [
      { name: 'General Limiter', pattern: /max: NODE_ENV === 'development' \? 1000 : (\d+)/ },
      { name: 'Auth Limiter', pattern: /max: NODE_ENV === 'development' \? 100 : (\d+)/ },
      { name: 'Signup Limiter', pattern: /max: NODE_ENV === 'development' \? 100 : (\d+)/ },
      { name: 'Password Reset', pattern: /max: NODE_ENV === 'development' \? 50 : (\d+)/ }
    ];

    checks.forEach(check => {
      const match = content.match(check.pattern);
      if (match) {
        const prodValue = parseInt(match[1]);
        const status = prodValue > 1000 ? '🔥 LOAD TESTING' : '🔒 PRODUCTION';
        console.log(`${status} ${check.name}: ${prodValue} requests`);
      }
    });

    const isLoadTesting = content.includes('Temporarily disabled for load testing');
    
    if (isLoadTesting) {
      console.log('\n⚠️  RATE LIMITS ARE CURRENTLY DISABLED FOR LOAD TESTING');
      console.log('   Your production backend is vulnerable to abuse!');
      console.log('   Run this script to restore protection after testing.');
    } else {
      console.log('\n✅ Rate limits appear to be at production-safe values');
    }

  } catch (error) {
    console.error('❌ Error reading rate limiting file:', error.message);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--status') || args.includes('-s')) {
  showCurrentStatus();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🛡️  Rate Limiting Revert Script

Usage:
  node revert-rate-limits.js          # Revert to production values
  node revert-rate-limits.js --status # Check current status
  node revert-rate-limits.js --help   # Show this help

This script safely reverts rate limiting configurations from load testing
values back to production-safe values to protect your backend.
  `);
} else {
  showCurrentStatus();
  console.log('\n' + '='.repeat(50));
  revertRateLimits();
}
