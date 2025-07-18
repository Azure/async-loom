import { AdaptiveCardValidator, ValidationResult } from './adaptiveCardValidator';
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

export interface TestResult {
  cardType: string;
  testName: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  cardJson?: any;
}

export interface TestScenario {
  name: string;
  cardFunction: () => any;
  expectedActions?: string[];
  description: string;
}

export class AdaptiveCardTester {
  private validator = new AdaptiveCardValidator();
  private results: TestResult[] = [];

  private createTestResult(
    cardType: string,
    testName: string,
    validationResult: ValidationResult,
    cardJson?: any
  ): TestResult {
    return {
      cardType,
      testName,
      passed: validationResult.valid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      cardJson
    };
  }

  private runSingleTest(scenario: TestScenario): TestResult[] {
    const results: TestResult[] = [];
    let cardJson: any;

    try {
      cardJson = scenario.cardFunction();
    } catch (error) {
      return [{
        cardType: scenario.name.split(' - ')[0],
        testName: scenario.name,
        passed: false,
        errors: [`Card generation failed: ${error.message}`],
        warnings: []
      }];
    }

    const schemaValidation = this.validator.validateSchema(cardJson);
    results.push(this.createTestResult(
      scenario.name.split(' - ')[0],
      `${scenario.name} - Schema Validation`,
      schemaValidation,
      cardJson
    ));

    const renderingValidation = this.validator.validateRendering(cardJson);
    results.push(this.createTestResult(
      scenario.name.split(' - ')[0],
      `${scenario.name} - Rendering Test`,
      renderingValidation,
      cardJson
    ));

    if (scenario.expectedActions) {
      const actionValidation = this.validator.validateExpectedActions(cardJson, scenario.expectedActions);
      results.push(this.createTestResult(
        scenario.name.split(' - ')[0],
        `${scenario.name} - Expected Actions`,
        actionValidation,
        cardJson
      ));
    }

    if (cardJson.actions) {
      for (const action of cardJson.actions) {
        if (action.data?.action && mockData.mockActionScenarios[action.data.action as keyof typeof mockData.mockActionScenarios]) {
          const mockActionData = mockData.mockActionScenarios[action.data.action as keyof typeof mockData.mockActionScenarios];
          const actionDataValidation = this.validator.validateActionData(action.data.action, mockActionData);
          results.push(this.createTestResult(
            scenario.name.split(' - ')[0],
            `${scenario.name} - Action Data (${action.data.action})`,
            actionDataValidation,
            cardJson
          ));
        }
      }
    }

    return results;
  }

  private getTestScenarios(): TestScenario[] {
    return [
      {
        name: 'Configuration Card - Empty Config',
        cardFunction: () => createConfigurationCard(),
        expectedActions: ['save_config', 'show_status', 'show_help'],
        description: 'Configuration card with no existing configuration'
      },
      {
        name: 'Configuration Card - With Existing Config',
        cardFunction: () => createConfigurationCard(mockData.mockUserConfig),
        expectedActions: ['save_config', 'show_status', 'show_help'],
        description: 'Configuration card with pre-filled values'
      },
      {
        name: 'Configuration Success Card',
        cardFunction: () => createConfigurationSuccessCard('Configuration saved successfully!'),
        expectedActions: ['show_config'],
        description: 'Success confirmation card after configuration save'
      },
      {
        name: 'Configuration Error Card',
        cardFunction: () => createConfigurationErrorCard('Invalid API key provided'),
        expectedActions: ['show_config'],
        description: 'Error card displayed when configuration fails'
      },
      {
        name: 'Task Creation Card - Initial Form',
        cardFunction: () => createTaskCreationCard(),
        expectedActions: ['preview_task', 'create_task', 'cancel_task'],
        description: 'Initial task creation form'
      },
      {
        name: 'Task Preview Card',
        cardFunction: () => createTaskPreviewCard(mockData.mockTaskData),
        expectedActions: ['confirm_create_task', 'edit_task', 'cancel_task'],
        description: 'Task preview before final creation'
      },
      {
        name: 'Task Success Card',
        cardFunction: () => createTaskSuccessCard(mockData.mockSessionData),
        expectedActions: ['check_status', 'create_new_task'],
        description: 'Success card after task creation'
      },
      {
        name: 'Status Display Card - Running',
        cardFunction: () => createStatusDisplayCard(mockData.mockSessionData),
        expectedActions: ['refresh_status', 'send_message', 'cancel_session', 'view_logs', 'show_help'],
        description: 'Status card for running session'
      },
      {
        name: 'Status Display Card - Completed',
        cardFunction: () => createStatusDisplayCard(mockData.mockCompletedSessionData),
        expectedActions: ['refresh_status', 'view_logs', 'show_help'],
        description: 'Status card for completed session'
      },
      {
        name: 'Status Display Card - Failed',
        cardFunction: () => createStatusDisplayCard(mockData.mockFailedSessionData),
        expectedActions: ['refresh_status', 'view_logs', 'show_help'],
        description: 'Status card for failed session'
      },
      {
        name: 'Status Display Card - Pending',
        cardFunction: () => createStatusDisplayCard(mockData.mockPendingSessionData),
        expectedActions: ['refresh_status', 'view_logs', 'show_help'],
        description: 'Status card for pending session'
      },
      {
        name: 'Status Display Card - Cancelled',
        cardFunction: () => createStatusDisplayCard(mockData.mockCancelledSessionData),
        expectedActions: ['refresh_status', 'view_logs', 'show_help'],
        description: 'Status card for cancelled session'
      },
      {
        name: 'Session List Card - Empty',
        cardFunction: () => createSessionListCard(mockData.mockEmptySessionList),
        expectedActions: ['create_new_task', 'refresh_session_list'],
        description: 'Session list when no sessions exist'
      },
      {
        name: 'Session List Card - With Sessions',
        cardFunction: () => createSessionListCard(mockData.mockSessionList),
        expectedActions: ['create_new_task', 'refresh_session_list'],
        description: 'Session list with multiple sessions'
      },
      {
        name: 'Message Input Card',
        cardFunction: () => createMessageInputCard('session-123'),
        expectedActions: ['send_message_submit'],
        description: 'Card for sending messages to active session'
      },
      {
        name: 'Results Card - Complete',
        cardFunction: () => createResultsCard(mockData.mockCompletedSessionData, mockData.mockResultsData),
        expectedActions: ['view_detailed_results', 'download_results', 'create_new_task', 'show_help'],
        description: 'Results card with full completion data'
      },
      {
        name: 'Results Card - Empty Results',
        cardFunction: () => createResultsCard(mockData.mockCompletedSessionData, mockData.mockEmptyResultsData),
        expectedActions: ['view_detailed_results', 'download_results', 'create_new_task', 'show_help'],
        description: 'Results card with no code changes'
      },
      {
        name: 'Results Summary Card',
        cardFunction: () => createResultsSummaryCard([mockData.mockCompletedSessionData]),
        expectedActions: ['view_all_results', 'export_results_report', 'create_new_task'],
        description: 'Summary card showing multiple completed sessions'
      },
      {
        name: 'Help Card',
        cardFunction: () => createHelpCard(),
        expectedActions: ['show_config', 'create_new_task', 'view_all_sessions'],
        description: 'Help and documentation card'
      }
    ];
  }

  public runAllTests(): TestResult[] {
    this.results = [];
    const scenarios = this.getTestScenarios();

    console.log(`🧪 Running ${scenarios.length} adaptive card test scenarios...\n`);

    for (const scenario of scenarios) {
      console.log(`Testing: ${scenario.name}`);
      const scenarioResults = this.runSingleTest(scenario);
      this.results.push(...scenarioResults);
      
      const passed = scenarioResults.filter(r => r.passed).length;
      const total = scenarioResults.length;
      const status = passed === total ? '✅' : '❌';
      console.log(`  ${status} ${passed}/${total} tests passed`);
      
      const failed = scenarioResults.filter(r => !r.passed);
      if (failed.length > 0) {
        failed.forEach(result => {
          console.log(`    ❌ ${result.testName}: ${result.errors.join(', ')}`);
        });
      }
    }

    return this.results;
  }

  public generateReport(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    let report = `# Adaptive Card Testing Report\n\n`;
    report += `## Summary\n`;
    report += `- **Total Tests**: ${totalTests}\n`;
    report += `- **Passed**: ${passedTests} ✅\n`;
    report += `- **Failed**: ${failedTests} ❌\n`;
    report += `- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`;

    const resultsByType = this.results.reduce((acc, result) => {
      if (!acc[result.cardType]) {
        acc[result.cardType] = [];
      }
      acc[result.cardType].push(result);
      return acc;
    }, {} as Record<string, TestResult[]>);

    for (const [cardType, results] of Object.entries(resultsByType)) {
      const typePassed = results.filter(r => r.passed).length;
      const typeTotal = results.length;
      const typeStatus = typePassed === typeTotal ? '✅' : '❌';
      
      report += `## ${cardType} ${typeStatus}\n`;
      report += `**Status: ${typePassed}/${typeTotal} tests passed**\n\n`;

      for (const result of results) {
        const status = result.passed ? '✅' : '❌';
        report += `${status} ${result.testName}\n`;
        if (!result.passed) {
          result.errors.forEach(error => {
            report += `   - ❌ ${error}\n`;
          });
        }
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            report += `   - ⚠️ ${warning}\n`;
          });
        }
      }
      report += '\n';
    }

    const failedResults = this.results.filter(r => !r.passed);
    if (failedResults.length > 0) {
      report += `## Failed Test Details\n\n`;
      for (const result of failedResults) {
        report += `### ❌ ${result.testName}\n`;
        result.errors.forEach(error => {
          report += `- **Error**: ${error}\n`;
        });
        if (result.cardJson) {
          report += `\n**Card JSON Structure:**\n`;
          report += `\`\`\`json\n${JSON.stringify(result.cardJson, null, 2)}\n\`\`\`\n\n`;
        }
      }
    }

    return report;
  }

  public getResults(): TestResult[] {
    return this.results;
  }
}
