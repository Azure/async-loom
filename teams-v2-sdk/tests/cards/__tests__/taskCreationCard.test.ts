import { AdaptiveCardValidator } from '../adaptiveCardValidator';
import {
  createTaskCreationCard,
  createTaskPreviewCard,
  createTaskSuccessCard
} from '../../../src/cards/taskCreationCard';
import { mockTaskData, mockSessionData } from '../mockData';

describe('Task Creation Card Tests', () => {
  const validator = new AdaptiveCardValidator();

  describe('createTaskCreationCard', () => {
    test('should create valid task creation card', () => {
      const card = createTaskCreationCard();
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
      expect(card.version).toBe('1.5');
    });

    test('should include expected actions', () => {
      const card = createTaskCreationCard();
      const expectedActions = ['preview_task', 'create_task', 'cancel_task'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });

    test('should render without errors', () => {
      const card = createTaskCreationCard();
      const validation = validator.validateRendering(card);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('createTaskPreviewCard', () => {
    test('should create valid preview card', () => {
      const card = createTaskPreviewCard(mockTaskData);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should include expected actions', () => {
      const card = createTaskPreviewCard(mockTaskData);
      const expectedActions = ['confirm_create_task', 'edit_task', 'cancel_task'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('createTaskSuccessCard', () => {
    test('should create valid success card', () => {
      const card = createTaskSuccessCard(mockSessionData);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should include expected actions', () => {
      const card = createTaskSuccessCard(mockSessionData);
      const expectedActions = ['check_status', 'create_new_task'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });
  });
});
