import { AdaptiveCard } from 'adaptivecards';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class AdaptiveCardValidator {
  
  validateSchema(cardJson: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!cardJson) {
      errors.push('Card JSON is null or undefined');
      return { valid: false, errors, warnings };
    }

    if (!cardJson.type || cardJson.type !== 'AdaptiveCard') {
      errors.push('Missing or invalid type property. Expected "AdaptiveCard"');
    }

    if (!cardJson.version) {
      errors.push('Missing version property');
    } else {
      const versionRegex = /^\d+\.\d+$/;
      if (!versionRegex.test(cardJson.version)) {
        errors.push(`Invalid version format: ${cardJson.version}. Expected format: "x.y"`);
      }
    }

    if (cardJson.body && !Array.isArray(cardJson.body)) {
      errors.push('Body must be an array');
    }

    if (cardJson.actions && !Array.isArray(cardJson.actions)) {
      errors.push('Actions must be an array');
    }

    if (cardJson.actions) {
      for (let i = 0; i < cardJson.actions.length; i++) {
        const action = cardJson.actions[i];
        if (!action.type) {
          errors.push(`Action at index ${i} missing type property`);
        } else if (!action.type.startsWith('Action.')) {
          errors.push(`Invalid action type at index ${i}: ${action.type}. Must start with "Action."`);
        }

        if (action.type === 'Action.Submit' && !action.data) {
          warnings.push(`Action.Submit at index ${i} missing data property`);
        }

        if (action.type === 'Action.OpenUrl' && !action.url) {
          errors.push(`Action.OpenUrl at index ${i} missing url property`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateRendering(cardJson: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const adaptiveCard = new AdaptiveCard();
      adaptiveCard.parse(cardJson);
      
      const renderedCard = adaptiveCard.render();
      
      if (!renderedCard) {
        errors.push('Card failed to render - returned null or undefined');
      }
      
    } catch (error) {
      errors.push(`Rendering error: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateActionData(actionType: string, actionData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!actionData) {
      errors.push('Action data is required');
      return { valid: false, errors, warnings };
    }

    switch (actionType) {
      case 'save_config':
        if (!actionData.devinApiKey && !actionData.githubToken && !actionData.azureOpenAiApiKey) {
          errors.push('At least one API key must be provided for save_config action');
        }
        break;

      case 'create_task':
      case 'confirm_create_task':
        if (!actionData.taskDescription || actionData.taskDescription.trim().length === 0) {
          errors.push('Task description is required for task creation actions');
        }
        if (!actionData.taskType) {
          errors.push('Task type is required for task creation actions');
        }
        break;

      case 'refresh_status':
      case 'send_message':
      case 'view_detailed_results':
      case 'download_results':
      case 'cancel_session':
      case 'view_logs':
        if (!actionData.sessionId) {
          errors.push(`Session ID is required for ${actionType} action`);
        }
        break;

      case 'send_message_submit':
        if (!actionData.sessionId) {
          errors.push('Session ID is required for send_message_submit action');
        }
        if (!actionData.message || actionData.message.trim().length === 0) {
          errors.push('Message content is required for send_message_submit action');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateExpectedActions(cardJson: any, expectedActions: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const actualActions = cardJson.actions?.map((a: any) => a.data?.action).filter(Boolean) || [];

    for (const expectedAction of expectedActions) {
      if (!actualActions.includes(expectedAction)) {
        errors.push(`Expected action "${expectedAction}" not found in card`);
      }
    }

    const unexpectedActions = actualActions.filter((action: string) => !expectedActions.includes(action));
    if (unexpectedActions.length > 0) {
      warnings.push(`Unexpected actions found: ${unexpectedActions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
