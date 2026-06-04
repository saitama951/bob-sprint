#!/usr/bin/env node

/**
 * Test Parser
 * Test the commit message parser with sample messages
 */

const CommitParser = require('./parser');

// Sample config
const config = {
  automation: {
    status_keywords: {
      in_progress: ['in-progress', 'ongoing', 'wip', 'working', 'progress'],
      done: ['done', 'completed', 'finished', 'resolved', 'fixed', 'complete']
    }
  }
};

const parser = new CommitParser(config);

// Test cases
const testCases = [
  {
    name: 'Valid in-progress commit',
    message: `Add user authentication
issue: 123
status: in-progress`,
    expected: { issue: 123, status: 'in-progress', valid: true }
  },
  {
    name: 'Valid done commit',
    message: `Complete authentication system
issue: 456
status: done`,
    expected: { issue: 456, status: 'done', valid: true }
  },
  {
    name: 'With hash symbol',
    message: `Fix bug in login
issue: #789
status: completed`,
    expected: { issue: 789, status: 'done', valid: true }
  },
  {
    name: 'WIP synonym',
    message: `Work in progress on feature
issue: 111
status: wip`,
    expected: { issue: 111, status: 'in-progress', valid: true }
  },
  {
    name: 'Missing issue',
    message: `Some commit message
status: done`,
    expected: { valid: false }
  },
  {
    name: 'Missing status',
    message: `Some commit message
issue: 222`,
    expected: { valid: false }
  },
  {
    name: 'Invalid status',
    message: `Some commit message
issue: 333
status: invalid-status`,
    expected: { valid: false }
  }
];

console.log('🧪 Testing Commit Message Parser\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`Message:\n${test.message}\n`);
  
  const result = parser.parseCommitMessage(test.message);
  const validation = parser.validate(result);
  
  console.log('Parsed:', {
    issue: result.issue,
    status: result.status,
    description: result.description.substring(0, 50) + '...'
  });
  
  console.log('Validation:', validation.valid ? '✅ Valid' : '❌ Invalid');
  if (!validation.valid) {
    console.log('Errors:', validation.errors);
  }
  
  // Check expectations
  let testPassed = true;
  if (test.expected.valid !== undefined) {
    if (validation.valid !== test.expected.valid) {
      testPassed = false;
    }
  }
  if (test.expected.issue !== undefined) {
    if (result.issue !== test.expected.issue) {
      testPassed = false;
    }
  }
  if (test.expected.status !== undefined) {
    if (result.status !== test.expected.status) {
      testPassed = false;
    }
  }
  
  if (testPassed) {
    console.log('Result: ✅ PASSED\n');
    passed++;
  } else {
    console.log('Result: ❌ FAILED\n');
    failed++;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

// Test with command line argument if provided
if (process.argv[2]) {
  console.log('\n🔍 Testing custom message:\n');
  const customMessage = process.argv[2];
  console.log(`Message:\n${customMessage}\n`);
  
  const result = parser.parseCommitMessage(customMessage);
  const validation = parser.validate(result);
  
  console.log('Parsed:', result);
  console.log('\nValidation:', validation.valid ? '✅ Valid' : '❌ Invalid');
  if (!validation.valid) {
    console.log('Errors:', validation.errors);
  }
  console.log('');
}

process.exit(failed > 0 ? 1 : 0);

// Made with Bob
