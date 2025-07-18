import { AdaptiveCardValidator } from '../adaptiveCardValidator';
import {
  createStatusDisplayCard,
  createSessionListCard,
  createMessageInputCard
} from '../../../src/cards/statusDisplayCard';
import { 
  mockSessionData, 
  mockCompletedSessionData, 
  mockFailedSessionData,
  mockSessionList,
  mockEmptySessionList
} from '../mockData';

describe('Status Display Card Tests', () => {
  const validator = new AdaptiveCardValidator();

  describe('createStatusDisplayCard', () => {
    test('should create valid card for running session', () => {
      const card = createStatusDisplayCard(mockSessionData);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
      expect(card.version).toBe('1.5');
    });

    test('should create valid card for completed session', () => {
      const card = createStatusDisplayCard(mockCompletedSessionData);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
    });

    test('should create valid card for failed session', () => {
      const card = createStatusDisplayCard(mockFailedSessionData);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
    });

    test('should include expected actions for running session', () => {
      const card = createStatusDisplayCard(mockSessionData);
      const expectedActions = ['refresh_status', 'send_message', 'cancel_session', 'view_logs', 'show_help'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });

    test('should include expected actions for completed session', () => {
      const card = createStatusDisplayCard(mockCompletedSessionData);
      const expectedActions = ['refresh_status', 'view_logs', 'show_help'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });

    test('should render without errors', () => {
      const card = createStatusDisplayCard(mockSessionData);
      const validation = validator.validateRendering(card);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('createSessionListCard', () => {
    test('should create valid card with sessions', () => {
      const card = createSessionListCard(mockSessionList);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should create valid card with empty session list', () => {
      const card = createSessionListCard(mockEmptySessionList);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
    });

    test('should include expected actions', () => {
      const card = createSessionListCard(mockSessionList);
      const expectedActions = ['create_new_task', 'refresh_session_list'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('createMessageInputCard', () => {
    test('should create valid message input card', () => {
      const card = createMessageInputCard('session-123');
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should include expected actions', () => {
      const card = createMessageInputCard('session-123');
      const expectedActions = ['send_message_submit'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });
  });
});
