# Adaptive Card Testing Suite

This directory contains comprehensive tests for all adaptive cards used in the Devin Teams App.

## Overview

The testing suite validates:
- **Schema Compliance**: Ensures all cards follow Microsoft's Adaptive Card v1.5 specification
- **Rendering Validation**: Uses the adaptivecards library to verify cards render without errors
- **Action Integrity**: Validates that action data structures match what the handlers expect
- **Visual Performance**: Tests rendering performance and element counts

## Card Types Tested

1. **Configuration Cards** (`configurationCard.ts`)
   - Empty configuration form
   - Pre-filled configuration form
   - Success and error states

2. **Task Creation Cards** (`taskCreationCard.ts`)
   - Initial task creation form
   - Task preview before creation
   - Task creation success confirmation

3. **Status Display Cards** (`statusDisplayCard.ts`)
   - Running session status
   - Completed session status
   - Failed session status
   - Session list views
   - Message input forms

4. **Results Cards** (`resultsCard.ts`)
   - Full results with code changes
   - Empty results (no changes)
   - Results summary for multiple sessions

5. **Help Cards** (`helpCard.ts`)
   - Command documentation and guidance

## Running Tests

### Quick Test Run
```bash
npm run test:cards
```

### Basic Card Tests (Recommended)
```bash
npm run test:cards:basic
```

### Simple Card Tests
```bash
npm run test:cards:simple
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test:cards:watch
```

### Jest Unit Tests
```bash
npm run test:jest
```

## Test Structure

- `adaptiveCardValidator.ts` - Core validation logic for schema and rendering
- `mockData.ts` - Test data scenarios for all card types
- `basicCardTest.ts` - Basic card generation and validation tests (recommended)
- `simpleTests.ts` - Simple card tests with action validation
- `cardTests.ts` - Comprehensive test runner with detailed scenarios
- `visualRenderingTests.ts` - Performance and visual validation tests
- `testRunner.ts` - Main CLI test runner
- `runTests.ts` - Alternative test runner
- `__tests__/` - Jest unit tests for individual card types

## Test Reports

After running tests, reports are generated in `tests/cards/results/`:

- `test-report.md` - Detailed test results with pass/fail status
- `test-results.json` - Raw test data in JSON format
- `visual-test-report.md` - Visual rendering performance report
- `visual-test-results.json` - Raw visual test data

## Expected Actions by Card Type

Each card type has specific actions that should be present:

### Configuration Cards
- `save_config` - Save API configuration
- `show_status` - View current status
- `show_help` - Show help information

### Task Creation Cards
- `preview_task` - Preview task before creation
- `create_task` - Create new task
- `confirm_create_task` - Confirm task creation
- `cancel_task` - Cancel task creation
- `edit_task` - Edit task details

### Status Display Cards
- `refresh_status` - Refresh session status
- `send_message` - Send message to session (running only)
- `cancel_session` - Cancel running session
- `view_logs` - View session logs
- `show_help` - Show help information

### Results Cards
- `view_detailed_results` - View detailed results
- `download_results` - Download results
- `create_new_task` - Create new task
- `show_help` - Show help information

### Help Cards
- `show_config` - Show configuration
- `create_new_task` - Create new task
- `view_all_sessions` - View all sessions

## Validation Rules

### Schema Validation
- Must have `type: "AdaptiveCard"`
- Must have valid version (format: "x.y")
- Body must be an array
- Actions must be an array
- Action types must start with "Action."

### Action Data Validation
- `save_config`: Requires at least one API key
- `create_task`/`confirm_create_task`: Requires taskDescription and taskType
- Session actions: Require sessionId
- `send_message_submit`: Requires sessionId and message

### Rendering Validation
- Cards must render without throwing errors
- Performance warnings for >1000ms render time
- Element count warnings for >100 elements
- Scrolling detection for layout issues

## Adding New Tests

To add tests for new card types:

1. Add mock data to `mockData.ts`
2. Add test scenarios to `cardTests.ts`
3. Create Jest unit tests in `__tests__/`
4. Update expected actions list in this README

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all card functions are properly exported from their modules
2. **Schema Validation Failures**: Check that cards have required properties (type, version, body, actions)
3. **Rendering Errors**: Verify card JSON structure matches Adaptive Card specification
4. **Action Validation Failures**: Ensure action data includes required fields for each action type

### Debug Mode

Set `DEBUG=true` environment variable for verbose test output:
```bash
DEBUG=true npm run test:cards
```
