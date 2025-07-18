import { AdaptiveCardValidator } from '../adaptiveCardValidator';
import { createHelpCard } from '../../../src/cards/helpCard';

describe('Help Card Tests', () => {
  const validator = new AdaptiveCardValidator();

  describe('createHelpCard', () => {
    test('should create valid help card', () => {
      const card = createHelpCard();
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
      expect(card.version).toBe('1.5');
    });

    test('should include expected actions', () => {
      const card = createHelpCard();
      const expectedActions = ['show_config', 'create_new_task', 'view_all_sessions'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });

    test('should render without errors', () => {
      const card = createHelpCard();
      const validation = validator.validateRendering(card);
      
      expect(validation.valid).toBe(true);
    });

    test('should have proper structure', () => {
      const card = createHelpCard();
      
      expect(Array.isArray(card.body)).toBe(true);
      expect(Array.isArray(card.actions)).toBe(true);
      expect(card.body.length).toBeGreaterThan(0);
      expect(card.actions.length).toBeGreaterThan(0);
    });
  });
});
