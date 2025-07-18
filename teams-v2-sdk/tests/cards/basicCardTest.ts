// import { AdaptiveCardValidator } from './adaptiveCardValidator';
import { 
  createConfigurationCard, 
  createConfigurationSuccessCard, 
  createConfigurationErrorCard
} from '../../src/cards/configurationCard';
import {
  createTaskCreationCard,
  createTaskPreviewCard,
  createTaskSuccessCard
} from '../../src/cards/taskCreationCard';
import {
  createStatusDisplayCard,
  createSessionListCard,
  createMessageInputCard
} from '../../src/cards/statusDisplayCard';
import {
  createResultsCard,
  createResultsSummaryCard
} from '../../src/cards/resultsCard';
import { createHelpCard } from '../../src/cards/helpCard';

const mockUserConfig = {
  devinApiKey: 'test-devin-key-123456789',
  githubToken: 'ghp_test-github-token-123456789',
  azureOpenAiApiKey: 'test-azure-key-123456789',
  azureOpenAiEndpoint: 'https://test.openai.azure.com/',
  githubRepo: 'user/test-repo'
};

const mockSessionData = {
  id: 'session-123',
  status: 'running',
  task: 'Create a React component for user authentication',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T11:45:00Z',
  progress: 75,
  completed_at: null,
  error: null,
  logs: ['Starting task...', 'Analyzing requirements...', 'Generating code...']
};

const mockCompletedSessionData = {
  ...mockSessionData,
  status: 'completed',
  completed_at: '2024-01-15T12:00:00Z',
  progress: 100
};

const mockTaskData = {
  taskDescription: 'Create a responsive dashboard with charts and data visualization',
  taskType: 'web',
  priority: 'high',
  complexity: 'complex'
};

const mockResultsData = {
  duration: '45 minutes',
  filesModified: [
    { name: 'src/components/Auth.tsx', status: 'added' },
    { name: 'src/utils/auth.ts', status: 'modified' }
  ],
  linesChanged: 234,
  codeChanges: [
    {
      type: 'added',
      file: 'src/components/Auth.tsx',
      description: 'Created authentication component',
      additions: 89,
      deletions: 0
    }
  ],
  externalLinks: [],
  summary: 'Successfully implemented user authentication'
};

export function runBasicCardTests(): void {
  console.log('🧪 Running Basic Adaptive Card Tests\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  const testCard = (name: string, cardFunction: () => any) => {
    totalTests++;
    try {
      console.log(`Testing: ${name}`);
      const card = cardFunction();
      
      if (!card) {
        console.log(`  ❌ Card generation returned null/undefined`);
        return;
      }
      
      if (card.type !== 'AdaptiveCard') {
        console.log(`  ❌ Invalid card type: expected 'AdaptiveCard', got '${card.type}'`);
        return;
      }
      
      if (!card.version) {
        console.log(`  ❌ Missing required property: version`);
        return;
      }
      
      if (!card.body || !Array.isArray(card.body)) {
        console.log(`  ❌ Missing or invalid body property`);
        return;
      }
      
      if (card.actions && !Array.isArray(card.actions)) {
        console.log(`  ❌ Actions must be an array`);
        return;
      }
      
      console.log(`  ✅ Basic validation passed`);
      passedTests++;
      
    } catch (error: any) {
      console.log(`  ❌ Test execution failed: ${error.message}`);
    }
  };

  testCard('Configuration Card - Empty', () => createConfigurationCard());
  testCard('Configuration Card - With Data', () => createConfigurationCard(mockUserConfig));
  testCard('Configuration Success Card', () => createConfigurationSuccessCard('Success!'));
  testCard('Configuration Error Card', () => createConfigurationErrorCard('Error!'));
  
  testCard('Task Creation Card', () => createTaskCreationCard());
  testCard('Task Preview Card', () => createTaskPreviewCard(mockTaskData));
  testCard('Task Success Card', () => createTaskSuccessCard(mockSessionData));
  
  testCard('Status Display - Running', () => createStatusDisplayCard(mockSessionData));
  testCard('Status Display - Completed', () => createStatusDisplayCard(mockCompletedSessionData));
  
  testCard('Session List - Empty', () => createSessionListCard([]));
  testCard('Session List - With Data', () => createSessionListCard([mockSessionData]));
  testCard('Message Input Card', () => createMessageInputCard('session-123'));
  
  testCard('Results Card - Full', () => createResultsCard(mockCompletedSessionData, mockResultsData));
  testCard('Results Summary Card', () => createResultsSummaryCard([mockCompletedSessionData]));
  
  testCard('Help Card', () => createHelpCard());
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${totalTests - passedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All adaptive card tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the output above for details.');
  }
}

declare const require: any;
declare const module: any;

if (typeof require !== 'undefined' && require.main === module) {
  runBasicCardTests();
}
