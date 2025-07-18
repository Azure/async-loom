export const mockUserConfig = {
  devinApiKey: 'test-devin-key-123456789',
  githubToken: 'ghp_test-github-token-123456789',
  azureOpenAiApiKey: 'test-azure-key-123456789',
  azureOpenAiEndpoint: 'https://test.openai.azure.com/',
  githubRepo: 'user/test-repo'
};

export const mockSessionData = {
  id: 'session-123',
  status: 'running',
  task: 'Create a React component for user authentication',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T11:45:00Z',
  progress: 75,
  completed_at: null,
  error: null,
  logs: ['Starting task...', 'Analyzing requirements...', 'Generating code...']
};

export const mockCompletedSessionData = {
  ...mockSessionData,
  status: 'completed',
  completed_at: '2024-01-15T12:00:00Z',
  progress: 100
};

export const mockFailedSessionData = {
  ...mockSessionData,
  status: 'failed',
  error: 'API rate limit exceeded. Please try again later.',
  progress: 45
};

export const mockPendingSessionData = {
  ...mockSessionData,
  status: 'pending',
  progress: 0
};

export const mockCancelledSessionData = {
  ...mockSessionData,
  status: 'cancelled',
  progress: 30
};

export const mockResultsData = {
  duration: '45 minutes',
  filesModified: [
    { name: 'src/components/Auth.tsx', status: 'added' },
    { name: 'src/utils/auth.ts', status: 'modified' },
    { name: 'package.json', status: 'modified' },
    { name: 'src/types/user.ts', status: 'added' },
    { name: 'src/hooks/useAuth.ts', status: 'added' }
  ],
  linesChanged: 234,
  codeChanges: [
    {
      type: 'added',
      file: 'src/components/Auth.tsx',
      description: 'Created authentication component with login/logout functionality',
      additions: 89,
      deletions: 0
    },
    {
      type: 'modified',
      file: 'src/utils/auth.ts',
      description: 'Updated authentication utilities with new token handling',
      additions: 23,
      deletions: 12
    },
    {
      type: 'added',
      file: 'src/types/user.ts',
      description: 'Added TypeScript interfaces for user authentication',
      additions: 15,
      deletions: 0
    }
  ],
  externalLinks: [
    {
      type: 'github_pr',
      url: 'https://github.com/user/repo/pull/123',
      title: 'Add authentication component',
      description: 'Pull request with authentication implementation'
    },
    {
      type: 'deployment',
      url: 'https://app-preview.herokuapp.com',
      title: 'Preview Deployment',
      description: 'Live preview of the changes'
    }
  ],
  summary: 'Successfully implemented user authentication with React components and utility functions. Added comprehensive error handling and token management.'
};

export const mockEmptyResultsData = {
  duration: '5 minutes',
  filesModified: [],
  linesChanged: 0,
  codeChanges: [],
  externalLinks: [],
  summary: 'Task completed with no code changes required.'
};

export const mockTaskData = {
  taskDescription: 'Create a responsive dashboard with charts and data visualization',
  taskType: 'web',
  priority: 'high',
  complexity: 'complex'
};

export const mockSimpleTaskData = {
  taskDescription: 'Fix a small bug in the login form',
  taskType: 'bug',
  priority: 'low',
  complexity: 'simple'
};

export const mockApiTaskData = {
  taskDescription: 'Build a REST API with authentication and rate limiting',
  taskType: 'api',
  priority: 'medium',
  complexity: 'medium'
};

export const mockSessionList = [
  mockSessionData,
  mockCompletedSessionData,
  {
    id: 'session-456',
    status: 'completed',
    task: 'Implement user dashboard',
    created_at: '2024-01-14T09:00:00Z',
    progress: 100
  },
  {
    id: 'session-789',
    status: 'running',
    task: 'Add payment integration',
    created_at: '2024-01-15T14:00:00Z',
    progress: 60
  }
];

export const mockEmptySessionList: any[] = [];

export const mockActionScenarios = {
  save_config: {
    devinApiKey: 'test-key-123456789',
    githubToken: 'ghp-token-123456789',
    azureOpenAiApiKey: 'azure-key-123456789',
    azureOpenAiEndpoint: 'https://test.openai.azure.com/',
    githubRepo: 'user/test-repo'
  },
  create_task: {
    taskDescription: 'Create a React dashboard with charts',
    taskType: 'web',
    priority: 'high',
    complexity: 'medium'
  },
  preview_task: {
    taskDescription: 'Build a REST API with authentication',
    taskType: 'api',
    priority: 'medium',
    complexity: 'complex'
  },
  confirm_create_task: {
    taskDescription: 'Implement user authentication system',
    taskType: 'security',
    priority: 'high',
    complexity: 'medium'
  },
  refresh_status: {
    sessionId: 'session-123'
  },
  send_message: {
    sessionId: 'session-456',
    message: 'Please add error handling to the authentication flow'
  },
  send_message_submit: {
    sessionId: 'session-456',
    message: 'Please add comprehensive unit tests for the new components'
  },
  view_detailed_results: {
    sessionId: 'session-789'
  },
  download_results: {
    sessionId: 'session-101'
  },
  cancel_session: {
    sessionId: 'session-123'
  },
  view_logs: {
    sessionId: 'session-123'
  }
};
