import { AdaptiveCardValidator } from '../adaptiveCardValidator';
import { 
  createConfigurationCard, 
  createConfigurationSuccessCard, 
  createConfigurationErrorCard
} from '../../../src/cards/configurationCard';
import { mockUserConfig } from '../mockData';

describe('Configuration Card Tests', () => {
  const validator = new AdaptiveCardValidator();

  describe('createConfigurationCard', () => {
    test('should create valid card with empty config', () => {
      const card = createConfigurationCard();
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
      expect(card.version).toBe('1.5');
      expect(Array.isArray(card.body)).toBe(true);
      expect(Array.isArray(card.actions)).toBe(true);
    });

    test('should create valid card with existing config', () => {
      const card = createConfigurationCard(mockUserConfig);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should include expected actions', () => {
      const card = createConfigurationCard();
      const expectedActions = ['save_config', 'show_status', 'show_help'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });

    test('should render without errors', () => {
      const card = createConfigurationCard();
      const validation = validator.validateRendering(card);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('createConfigurationSuccessCard', () => {
    test('should create valid success card', () => {
      const card = createConfigurationSuccessCard('Configuration saved!');
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should include show_config action', () => {
      const card = createConfigurationSuccessCard('Success!');
      const validation = validator.validateExpectedActions(card, ['show_config']);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('createConfigurationErrorCard', () => {
    test('should create valid error card', () => {
      const card = createConfigurationErrorCard('Invalid API key');
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should include show_config action', () => {
      const card = createConfigurationErrorCard('Error!');
      const validation = validator.validateExpectedActions(card, ['show_config']);
      
      expect(validation.valid).toBe(true);
    });
  });
});
