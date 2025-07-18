#!/usr/bin/env ts-node

import { runBasicCardTests } from './basicCardTest';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🧪 Starting Adaptive Card Testing Suite\n');
  console.log('Testing all 5 card types: Configuration, Task Creation, Status Display, Results, Help\n');
  
  try {
    runBasicCardTests();
    console.log('\n✅ Basic card tests completed successfully!');
  } catch (error: any) {
    console.error('❌ Basic card tests failed:', error.message);
    process.exit(1);
  }
}

declare const require: any;
declare const module: any;

if (typeof require !== 'undefined' && require.main === module) {
  main().catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export { main as runTests };
