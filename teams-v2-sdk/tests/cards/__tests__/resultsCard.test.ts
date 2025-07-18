import { AdaptiveCardValidator } from '../adaptiveCardValidator';
import {
  createResultsCard,
  createResultsSummaryCard
} from '../../../src/cards/resultsCard';
import { 
  mockCompletedSessionData, 
  mockResultsData, 
  mockEmptyResultsData 
} from '../mockData';

describe('Results Card Tests', () => {
  const validator = new AdaptiveCardValidator();

  describe('createResultsCard', () => {
    test('should create valid results card with full data', () => {
      const card = createResultsCard(mockCompletedSessionData, mockResultsData);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
      expect(card.version).toBe('1.5');
    });

    test('should create valid results card with empty results', () => {
      const card = createResultsCard(mockCompletedSessionData, mockEmptyResultsData);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
    });

    test('should include expected actions', () => {
      const card = createResultsCard(mockCompletedSessionData, mockResultsData);
      const expectedActions = ['view_detailed_results', 'download_results', 'create_new_task', 'show_help'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });

    test('should render without errors', () => {
      const card = createResultsCard(mockCompletedSessionData, mockResultsData);
      const validation = validator.validateRendering(card);
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('createResultsSummaryCard', () => {
    test('should create valid summary card', () => {
      const card = createResultsSummaryCard([mockCompletedSessionData]);
      const validation = validator.validateSchema(card);
      
      expect(validation.valid).toBe(true);
      expect(card.type).toBe('AdaptiveCard');
    });

    test('should include expected actions', () => {
      const card = createResultsSummaryCard([mockCompletedSessionData]);
      const expectedActions = ['view_all_results', 'export_results_report', 'create_new_task'];
      const validation = validator.validateExpectedActions(card, expectedActions);
      
      expect(validation.valid).toBe(true);
    });
  });
});
