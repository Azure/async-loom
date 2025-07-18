#!/usr/bin/env ts-node

import { runBasicCardTests } from './basicCardTest';

console.log('🧪 Adaptive Card Testing Suite');
console.log('===============================\n');

console.log('Testing all 5 card types:');
console.log('- Configuration Cards (configurationCard.ts)');
console.log('- Task Creation Cards (taskCreationCard.ts)');
console.log('- Status Display Cards (statusDisplayCard.ts)');
console.log('- Results Cards (resultsCard.ts)');
console.log('- Help Cards (helpCard.ts)\n');

try {
  runBasicCardTests();
  console.log('\n🎉 All adaptive card tests completed!');
  console.log('\nNext steps:');
  console.log('- Run "npm run test:cards:basic" to test individual card types');
  console.log('- Run "npm run test:jest" for Jest unit tests');
  console.log('- Check tests/cards/README.md for detailed documentation');
} catch (error: any) {
  console.error('\n❌ Test suite failed:', error.message);
  if (typeof process !== 'undefined') {
    process.exit(1);
  }
}
