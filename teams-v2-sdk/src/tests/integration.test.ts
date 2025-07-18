import { createStatusDisplayCard, createSessionListCard, createMessageInputCard } from '../cards/statusDisplayCard';

declare global {
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: () => void): void;
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
      toBe(expected: any): R;
      toThrow(expected?: string | RegExp): R;
      toBeUndefined(): R;
      toContain(expected: any): R;
    }
  }
  function expect<T>(actual: T): jest.Matchers<T>;
}

describe('Teams App Session Integration', () => {
  const mockSessionData = {
    id: 'integration-test-123',
    status: 'running',
    task: 'Integration test task',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T01:00:00Z',
    progress: 75,
    logs: ['Started task', 'Processing...', 'Almost done']
  };

  test('should create complete card workflow', () => {
    const statusCard = createStatusDisplayCard(mockSessionData);
    expect(statusCard).toBeDefined();
    expect(statusCard.type).toBe('AdaptiveCard');
    
    const sessionListCard = createSessionListCard([mockSessionData]);
    expect(sessionListCard).toBeDefined();
    expect(sessionListCard.type).toBe('AdaptiveCard');
    
    const messageCard = createMessageInputCard(mockSessionData.id);
    expect(messageCard).toBeDefined();
    expect(messageCard.type).toBe('AdaptiveCard');
  });

  test('should handle session state transitions', () => {
    const runningSession = { ...mockSessionData, status: 'running' };
    const runningCard = createStatusDisplayCard(runningSession);
    
    const completedSession = { ...mockSessionData, status: 'completed' };
    const completedCard = createStatusDisplayCard(completedSession);
    
    const failedSession = { ...mockSessionData, status: 'failed', error: 'Test error' };
    const failedCard = createStatusDisplayCard(failedSession);
    
    expect(runningCard).toBeDefined();
    expect(completedCard).toBeDefined();
    expect(failedCard).toBeDefined();
  });

  test('should maintain data consistency across card types', () => {
    const statusCard = createStatusDisplayCard(mockSessionData);
    const sessionListCard = createSessionListCard([mockSessionData]);
    
    const statusCardSessionId = statusCard.actions.find((action: any) => 
      action.data?.sessionId === mockSessionData.id
    );
    expect(statusCardSessionId).toBeDefined();
  });

  test('should handle edge cases gracefully', () => {
    const minimalSession = {
      id: 'minimal-test',
      status: 'pending',
      task: 'Minimal test',
      created_at: '2024-01-01T00:00:00Z'
    };
    
    const card = createStatusDisplayCard(minimalSession);
    expect(card).toBeDefined();
    expect(card.type).toBe('AdaptiveCard');
  });

  test('should validate all required session fields', () => {
    const invalidSessions = [
      { status: 'running', task: 'Missing ID', created_at: '2024-01-01T00:00:00Z' },
      { id: 'test', task: 'Missing status', created_at: '2024-01-01T00:00:00Z' },
      { id: 'test', status: 'running', created_at: '2024-01-01T00:00:00Z' },
      { id: 'test', status: 'running', task: 'Missing created_at' }
    ];
    
    invalidSessions.forEach((session, index) => {
      expect(() => createStatusDisplayCard(session)).toThrow();
    });
  });
});
