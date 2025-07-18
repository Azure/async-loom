import { AdaptiveCardValidator } from './adaptiveCardValidator';
import * as mockData from './mockData';
import { AdaptiveCard } from 'adaptivecards';

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

export interface VisualTestResult {
  cardType: string;
  testName: string;
  passed: boolean;
  renderTime: number;
  elementCount: number;
  hasScrolling: boolean;
  errors: string[];
  warnings: string[];
}

export class VisualRenderingTester {
  private validator = new AdaptiveCardValidator();

  private testCardRendering(cardJson: any, testName: string): VisualTestResult {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let elementCount = 0;
    let hasScrolling = false;

    try {
      const adaptiveCard = new AdaptiveCard();
      adaptiveCard.parse(cardJson);
      
      const renderedElement = adaptiveCard.render();
      const renderTime = Date.now() - startTime;
      
      if (!renderedElement) {
        errors.push('Card failed to render - returned null');
        return {
          cardType: testName.split(' - ')[0],
          testName,
          passed: false,
          renderTime,
          elementCount: 0,
          hasScrolling: false,
          errors,
          warnings
        };
      }

      try {
        elementCount = this.countElements(renderedElement);
        hasScrolling = this.checkForScrolling(renderedElement);
      } catch (error) {
        warnings.push(`Element analysis failed: ${error.message}`);
        elementCount = 0;
        hasScrolling = false;
      }

      if (renderTime > 1000) {
        warnings.push(`Slow rendering: ${renderTime}ms`);
      }

      if (elementCount > 100) {
        warnings.push(`High element count: ${elementCount} elements`);
      }

      return {
        cardType: testName.split(' - ')[0],
        testName,
        passed: true,
        renderTime,
        elementCount,
        hasScrolling,
        errors,
        warnings
      };

    } catch (error) {
      return {
        cardType: testName.split(' - ')[0],
        testName,
        passed: false,
        renderTime: Date.now() - startTime,
        elementCount: 0,
        hasScrolling: false,
        errors: [`Rendering error: ${error.message}`],
        warnings
      };
    }
  }

  private countElements(element: any): number {
    try {
      return element.querySelectorAll ? element.querySelectorAll('*').length : 0;
    } catch (error) {
      return 0;
    }
  }

  private checkForScrolling(element: any): boolean {
    try {
      if (typeof window === 'undefined' || !window || !window.getComputedStyle) {
        return false;
      }
      
      const style = window.getComputedStyle(element);
      return style.overflowX === 'scroll' || style.overflowY === 'scroll' ||
             style.overflowX === 'auto' || style.overflowY === 'auto';
    } catch (error) {
      return false;
    }
  }

  public runVisualTests(): VisualTestResult[] {
    const results: VisualTestResult[] = [];

    const testScenarios = [
      {
        name: 'Configuration Card - Visual Rendering',
        cardFunction: () => createConfigurationCard()
      },
      {
        name: 'Configuration Card with Data - Visual Rendering',
        cardFunction: () => createConfigurationCard(mockData.mockUserConfig)
      },
      {
        name: 'Task Creation Card - Visual Rendering',
        cardFunction: () => createTaskCreationCard()
      },
      {
        name: 'Task Preview Card - Visual Rendering',
        cardFunction: () => createTaskPreviewCard(mockData.mockTaskData)
      },
      {
        name: 'Status Display Running - Visual Rendering',
        cardFunction: () => createStatusDisplayCard(mockData.mockSessionData)
      },
      {
        name: 'Status Display Completed - Visual Rendering',
        cardFunction: () => createStatusDisplayCard(mockData.mockCompletedSessionData)
      },
      {
        name: 'Status Display Failed - Visual Rendering',
        cardFunction: () => createStatusDisplayCard(mockData.mockFailedSessionData)
      },
      {
        name: 'Session List Card - Visual Rendering',
        cardFunction: () => createSessionListCard(mockData.mockSessionList)
      },
      {
        name: 'Results Card Full - Visual Rendering',
        cardFunction: () => createResultsCard(mockData.mockCompletedSessionData, mockData.mockResultsData)
      },
      {
        name: 'Results Card Empty - Visual Rendering',
        cardFunction: () => createResultsCard(mockData.mockCompletedSessionData, mockData.mockEmptyResultsData)
      },
      {
        name: 'Help Card - Visual Rendering',
        cardFunction: () => createHelpCard()
      }
    ];

    console.log('🎨 Running visual rendering tests...\n');

    for (const scenario of testScenarios) {
      try {
        const cardJson = scenario.cardFunction();
        const result = this.testCardRendering(cardJson, scenario.name);
        results.push(result);
        
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${scenario.name} (${result.renderTime}ms, ${result.elementCount} elements)`);
        
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            console.log(`  ⚠️ ${warning}`);
          });
        }
        
        if (!result.passed) {
          result.errors.forEach(error => {
            console.log(`  ❌ ${error}`);
          });
        }
        
      } catch (error) {
        results.push({
          cardType: scenario.name.split(' - ')[0],
          testName: scenario.name,
          passed: false,
          renderTime: 0,
          elementCount: 0,
          hasScrolling: false,
          errors: [`Test execution failed: ${error.message}`],
          warnings: []
        });
        console.log(`❌ ${scenario.name} - Test execution failed: ${error.message}`);
      }
    }

    return results;
  }

  public generateVisualReport(results: VisualTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const avgRenderTime = results.reduce((sum, r) => sum + r.renderTime, 0) / totalTests;

    let report = `# Visual Rendering Test Report\n\n`;
    report += `## Summary\n`;
    report += `- **Total Tests**: ${totalTests}\n`;
    report += `- **Passed**: ${passedTests} ✅\n`;
    report += `- **Failed**: ${failedTests} ❌\n`;
    report += `- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`;
    report += `- **Average Render Time**: ${avgRenderTime.toFixed(1)}ms\n\n`;

    report += `## Performance Metrics\n`;
    report += `| Card Type | Render Time | Element Count | Has Scrolling | Status |\n`;
    report += `|-----------|-------------|---------------|---------------|--------|\n`;

    for (const result of results) {
      const status = result.passed ? '✅' : '❌';
      const scrolling = result.hasScrolling ? '⚠️ Yes' : '✅ No';
      report += `| ${result.testName} | ${result.renderTime}ms | ${result.elementCount} | ${scrolling} | ${status} |\n`;
    }

    report += '\n';

    const failedResults = results.filter(r => !r.passed);
    if (failedResults.length > 0) {
      report += `## Failed Visual Tests\n\n`;
      for (const result of failedResults) {
        report += `### ❌ ${result.testName}\n`;
        result.errors.forEach(error => {
          report += `- **Error**: ${error}\n`;
        });
        report += '\n';
      }
    }

    const warningResults = results.filter(r => r.warnings.length > 0);
    if (warningResults.length > 0) {
      report += `## Performance Warnings\n\n`;
      for (const result of warningResults) {
        report += `### ⚠️ ${result.testName}\n`;
        result.warnings.forEach(warning => {
          report += `- **Warning**: ${warning}\n`;
        });
        report += '\n';
      }
    }

    return report;
  }
}
