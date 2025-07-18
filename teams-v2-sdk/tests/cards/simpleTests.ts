import { AdaptiveCardValidator } from './adaptiveCardValidator';
import * as mockData from './mockData';

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

export function runSimpleCardTests(): void {
  console.log('🧪 Running Simple Adaptive Card Tests\n');
  
  const validator = new AdaptiveCardValidator();
  let totalTests = 0;
  let passedTests = 0;
  
  const testCard = (name: string, cardFunction: () => any, expectedActions?: string[]) => {
    totalTests++;
    try {
      console.log(`Testing: ${name}`);
      const card = cardFunction();
      
      const schemaValidation = validator.validateSchema(card);
      if (!schemaValidation.valid) {
        console.log(`  ❌ Schema validation failed: ${schemaValidation.errors.join(', ')}`);
        return;
      }
      
      const renderingValidation = validator.validateRendering(card);
      if (!renderingValidation.valid) {
        console.log(`  ❌ Rendering failed: ${renderingValidation.errors.join(', ')}`);
        return;
      }
      
      if (expectedActions) {
        const actionValidation = validator.validateExpectedActions(card, expectedActions);
        if (!actionValidation.valid) {
          console.log(`  ❌ Action validation failed: ${actionValidation.errors.join(', ')}`);
          return;
        }
      }
      
      console.log(`  ✅ All tests passed`);
      passedTests++;
      
    } catch (error) {
      console.log(`  ❌ Test execution failed: ${error.message}`);
    }
  };

  testCard('Configuration Card - Empty', () => createConfigurationCard(), ['save_config', 'show_status', 'show_help']);
  testCard('Configuration Card - With Data', () => createConfigurationCard(mockData.mockUserConfig), ['save_config', 'show_status', 'show_help']);
  testCard('Configuration Success Card', () => createConfigurationSuccessCard('Success!'), ['show_config']);
  testCard('Configuration Error Card', () => createConfigurationErrorCard('Error!'), ['show_config']);
  
  testCard('Task Creation Card', () => createTaskCreationCard(), ['preview_task', 'create_task', 'cancel_task']);
  testCard('Task Preview Card', () => createTaskPreviewCard(mockData.mockTaskData), ['confirm_create_task', 'edit_task', 'cancel_task']);
  testCard('Task Success Card', () => createTaskSuccessCard(mockData.mockSessionData), ['check_status', 'create_new_task']);
  
  testCard('Status Display - Running', () => createStatusDisplayCard(mockData.mockSessionData), ['refresh_status', 'send_message', 'cancel_session', 'view_logs', 'show_help']);
  testCard('Status Display - Completed', () => createStatusDisplayCard(mockData.mockCompletedSessionData), ['refresh_status', 'view_logs', 'show_help']);
  testCard('Status Display - Failed', () => createStatusDisplayCard(mockData.mockFailedSessionData), ['refresh_status', 'view_logs', 'show_help']);
  
  testCard('Session List - Empty', () => createSessionListCard(mockData.mockEmptySessionList), ['create_new_task', 'refresh_session_list']);
  testCard('Session List - With Data', () => createSessionListCard(mockData.mockSessionList), ['create_new_task', 'refresh_session_list']);
  testCard('Message Input Card', () => createMessageInputCard('session-123'), ['send_message_submit']);
  
  testCard('Results Card - Full', () => createResultsCard(mockData.mockCompletedSessionData, mockData.mockResultsData), ['view_detailed_results', 'download_results', 'create_new_task', 'show_help']);
  testCard('Results Card - Empty', () => createResultsCard(mockData.mockCompletedSessionData, mockData.mockEmptyResultsData), ['view_detailed_results', 'download_results', 'create_new_task', 'show_help']);
  testCard('Results Summary Card', () => createResultsSummaryCard([mockData.mockCompletedSessionData]), ['view_all_results', 'export_results_report', 'create_new_task']);
  
  testCard('Help Card', () => createHelpCard(), ['show_config', 'create_new_task', 'view_all_sessions']);
  
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
  runSimpleCardTests();
}
