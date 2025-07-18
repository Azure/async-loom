import { createStatusDisplayCard } from '../cards/statusDisplayCard';

declare global {
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: () => void): void;
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
      toBe(expected: any): R;
      toThrow(expected?: string | RegExp): R;
      toBeUndefined(): R;
    }
  }
  function expect<T>(actual: T): jest.Matchers<T>;
}

describe('Session Data Mapping', () => {
  const validSessionData = {
    id: 'test-session-123',
    status: 'running',
    task: 'Test task description',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T01:00:00Z',
    progress: 50,
    error: null,
    logs: ['Log entry 1', 'Log entry 2']
  };

  test('should create status card with valid session data', () => {
    const card = createStatusDisplayCard(validSessionData);
    
    expect(card).toBeDefined();
    expect(card.type).toBe('AdaptiveCard');
    expect(card.body).toBeDefined();
    expect(card.actions).toBeDefined();
  });

  test('should throw error for missing session data', () => {
    expect(() => createStatusDisplayCard(null)).toThrow('Session data is required');
    expect(() => createStatusDisplayCard(undefined)).toThrow('Session data is required');
    expect(() => createStatusDisplayCard({})).toThrow('Session ID is required');
  });

  test('should throw error for invalid session ID', () => {
    const invalidData = { ...validSessionData, id: null };
    expect(() => createStatusDisplayCard(invalidData)).toThrow('Session ID is required');
  });

  test('should throw error for invalid status', () => {
    const invalidData = { ...validSessionData, status: null };
    expect(() => createStatusDisplayCard(invalidData)).toThrow('Session status is required');
  });

  test('should throw error for invalid task', () => {
    const invalidData = { ...validSessionData, task: null };
    expect(() => createStatusDisplayCard(invalidData)).toThrow('Session task is required');
  });

  test('should throw error for invalid created_at', () => {
    const invalidData = { ...validSessionData, created_at: null };
    expect(() => createStatusDisplayCard(invalidData)).toThrow('Session created_at is required');
  });

  test('should handle optional fields correctly', () => {
    const minimalData = {
      id: 'test-session-123',
      status: 'completed',
      task: 'Test task',
      created_at: '2024-01-01T00:00:00Z'
    };
    
    const card = createStatusDisplayCard(minimalData);
    expect(card).toBeDefined();
    expect(card.type).toBe('AdaptiveCard');
  });

  test('should handle session with error', () => {
    const errorData = {
      ...validSessionData,
      status: 'failed',
      error: 'Test error message'
    };
    
    const card = createStatusDisplayCard(errorData);
    expect(card).toBeDefined();
    
    const errorContainer = card.body.find((item: any) => 
      item.style === 'attention' && 
      item.items?.some((subItem: any) => 
        subItem.columns?.some((col: any) => 
          col.items?.some((textBlock: any) => 
            textBlock.text === 'Test error message'
          )
        )
      )
    );
    expect(errorContainer).toBeDefined();
  });

  test('should handle session with logs', () => {
    const logsData = {
      ...validSessionData,
      logs: ['Log 1', 'Log 2', 'Log 3', 'Log 4']
    };
    
    const card = createStatusDisplayCard(logsData);
    expect(card).toBeDefined();
    
    const logsSection = card.body.find((item: any) => 
      item.text === '📝 **Recent Activity:**'
    );
    expect(logsSection).toBeDefined();
  });

  test('should include progress in facts when available', () => {
    const progressData = {
      ...validSessionData,
      progress: 75
    };
    
    const card = createStatusDisplayCard(progressData);
    expect(card).toBeDefined();
    
    const factSet = card.body.find((item: any) => item.type === 'FactSet');
    expect(factSet).toBeDefined();
    
    const progressFact = factSet.facts.find((fact: any) => 
      fact.title === 'Progress:' && fact.value === '75%'
    );
    expect(progressFact).toBeDefined();
  });

  test('should show correct actions for running session', () => {
    const runningData = {
      ...validSessionData,
      status: 'running'
    };
    
    const card = createStatusDisplayCard(runningData);
    expect(card).toBeDefined();
    
    const sendMessageAction = card.actions.find((action: any) => 
      action.data?.action === 'send_message'
    );
    const cancelAction = card.actions.find((action: any) => 
      action.data?.action === 'cancel_session'
    );
    
    expect(sendMessageAction).toBeDefined();
    expect(cancelAction).toBeDefined();
  });

  test('should not show running-specific actions for completed session', () => {
    const completedData = {
      ...validSessionData,
      status: 'completed'
    };
    
    const card = createStatusDisplayCard(completedData);
    expect(card).toBeDefined();
    
    const sendMessageAction = card.actions.find((action: any) => 
      action.data?.action === 'send_message'
    );
    const cancelAction = card.actions.find((action: any) => 
      action.data?.action === 'cancel_session'
    );
    
    expect(sendMessageAction).toBeUndefined();
    expect(cancelAction).toBeUndefined();
  });
});
