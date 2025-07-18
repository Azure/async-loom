# Adaptive Card Testing Guide

## Quick Start

1. **Install dependencies** (if not already installed):
   ```bash
   cd /home/ubuntu/repos/devin-teams-app/teams-v2-sdk
   npm install
   ```

2. **Run the main test suite**:
   ```bash
   npm run test:cards
   ```

3. **Run basic card tests** (recommended for quick validation):
   ```bash
   npm run test:cards:basic
   ```

## Test Coverage

This testing framework validates all 5 adaptive card types:

### ✅ Configuration Cards (`configurationCard.ts`)
- Empty configuration form
- Pre-filled configuration with API keys
- Success confirmation cards
- Error handling cards

### ✅ Task Creation Cards (`taskCreationCard.ts`)
- Initial task creation form
- Task preview with validation
- Task creation success confirmation

### ✅ Status Display Cards (`statusDisplayCard.ts`)
- Running session status with progress
- Completed session status
- Failed session with error messages
- Session list views (empty and populated)
- Message input forms for active sessions

### ✅ Results Cards (`resultsCard.ts`)
- Full results with code changes and file modifications
- Empty results (no changes made)
- Results summary for multiple sessions

### ✅ Help Cards (`helpCard.ts`)
- Command documentation and usage examples
- Navigation actions and help content

## Validation Performed

Each card is tested for:

1. **Schema Compliance**: Microsoft Adaptive Card v1.5 specification
2. **Rendering Validation**: Cards render without errors using adaptivecards library
3. **Action Integrity**: Action data structures match handler expectations
4. **Content Validation**: Proper display of dynamic content and data

## Expected Actions by Card Type

- **Configuration**: `save_config`, `show_status`, `show_help`
- **Task Creation**: `preview_task`, `create_task`, `confirm_create_task`, `cancel_task`
- **Status Display**: `refresh_status`, `send_message`, `cancel_session`, `view_logs`
- **Results**: `view_detailed_results`, `download_results`, `create_new_task`
- **Help**: `show_config`, `create_new_task`, `view_all_sessions`

## Test Results

The test suite provides:
- ✅ Pass/fail status for each card type
- 📊 Overall success rate percentage
- ❌ Detailed error messages for failures
- ⚠️ Warnings for potential issues

## Troubleshooting

If tests fail:
1. Check that all card functions are properly exported
2. Verify card JSON structure matches Adaptive Card specification
3. Ensure action data includes required fields
4. Review error messages for specific validation failures

## Files Structure

```
tests/cards/
├── adaptiveCardValidator.ts    # Core validation logic
├── basicCardTest.ts           # Basic card generation tests ⭐
├── mockData.ts               # Test data scenarios
├── testRunner.ts             # Main CLI test runner ⭐
├── README.md                 # Detailed documentation
└── __tests__/                # Jest unit tests
```

⭐ = Recommended starting points
