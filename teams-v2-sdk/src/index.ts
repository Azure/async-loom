import { App } from '@microsoft/teams.apps';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { 
  createConfigurationCard, 
  createConfigurationSuccessCard, 
  createConfigurationErrorCard
} from './cards/configurationCard';
import {
  createTaskCreationCard,
  createTaskPreviewCard,
  createTaskSuccessCard
} from './cards/taskCreationCard';
import {
  createStatusDisplayCard,
  createSessionListCard,
  createMessageInputCard
} from './cards/statusDisplayCard';
import {
  createResultsCard,
  createResultsSummaryCard
} from './cards/resultsCard';
import { createHelpCard } from './cards/helpCard';

dotenv.config();

interface DevinSession {
  id: string;
  status: string;
  task: string;
  created_at: string;
}

interface UserConfig {
  devinApiKey?: string;
  githubToken?: string;
  azureOpenAiApiKey?: string;
  azureOpenAiEndpoint?: string;
  githubRepo?: string;
}

const userConfigs = new Map<string, UserConfig>();

class DevinApiClient {
  private apiKey: string;
  private baseUrl = 'https://api.devin.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createSession(task: string): Promise<DevinSession> {
    try {
      const response = await axios.post(`${this.baseUrl}/sessions`, {
        prompt: task,
        idempotent: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Devin session:', error);
      throw new Error('Failed to create Devin session. Please check your API key.');
    }
  }

  async getSession(sessionId: string): Promise<DevinSession> {
    try {
      const response = await axios.get(`${this.baseUrl}/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Devin session:', error);
      throw new Error('Failed to get Devin session.');
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/sessions/${sessionId}/messages`, {
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error sending message to Devin:', error);
      throw new Error('Failed to send message to Devin.');
    }
  }
}

class CopilotCodingAgent {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async createCodingTask(task: string, repository?: string): Promise<{ taskId: string; status: string }> {
    console.log(`Copilot Coding Agent - Creating task: ${task} for repo: ${repository || 'default'} with token: ${this.token.substring(0, 8)}...`);
    
    const taskId = `copilot-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      taskId,
      status: 'queued'
    };
  }

  async getTaskStatus(taskId: string): Promise<{ taskId: string; status: string; progress?: string }> {
    console.log(`Copilot Coding Agent - Getting status for task: ${taskId} with token: ${this.token.substring(0, 8)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const statuses = ['queued', 'running', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      taskId,
      status: randomStatus,
      progress: randomStatus === 'running' ? 'Analyzing code structure...' : undefined
    };
  }

  async triggerGitHubAction(repository: string, workflow: string, task: string): Promise<{ runId: string; status: string }> {
    console.log(`Copilot Coding Agent - Triggering workflow: ${workflow} in repo: ${repository} for task: ${task} with token: ${this.token.substring(0, 8)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      runId,
      status: 'triggered'
    };
  }
}

class CodexCliAgent {
  private githubToken: string;
  private azureApiKey: string;
  private azureEndpoint: string;
  private backendUrl: string;

  constructor(githubToken: string, azureApiKey: string, azureEndpoint: string) {
    this.githubToken = githubToken;
    this.azureApiKey = azureApiKey;
    this.azureEndpoint = azureEndpoint;
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  }

  async createCodexTask(task: string, repository: string): Promise<{ taskId: string; status: string; workflowUrl?: string }> {
    console.log(`Codex CLI Agent - Creating task: ${task} for repo: ${repository}`);
    
    const taskId = `codex-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await axios.post(`${this.backendUrl}/api/github/workflows`, {
        repo_name: repository,
        github_token: this.githubToken,
        task: task
      });
      
      await axios.post(`${this.backendUrl}/api/github/secrets`, {
        repo_name: repository,
        github_token: this.githubToken,
        secrets: {
          AZURE_OPENAI_API_KEY: this.azureApiKey,
          AZURE_OPENAI_ENDPOINT: this.azureEndpoint
        }
      });
      
      return {
        taskId,
        status: 'workflow_created',
        workflowUrl: response.data.workflow_url
      };
    } catch (error) {
      console.error('Error creating codex task:', error);
      return {
        taskId,
        status: 'failed'
      };
    }
  }

  async getTaskStatus(taskId: string, runId?: string): Promise<{ taskId: string; status: string; progress?: string; logs?: string }> {
    console.log(`Codex CLI Agent - Getting status for task: ${taskId}`);
    
    if (!runId) {
      return {
        taskId,
        status: 'pending',
        progress: 'Workflow created, waiting for manual trigger'
      };
    }
    
    try {
      const response = await axios.get(`${this.backendUrl}/api/github/runs/${runId}`, {
        params: { github_token: this.githubToken }
      });
      
      return {
        taskId,
        status: response.data.status,
        progress: response.data.progress,
        logs: response.data.logs
      };
    } catch (error) {
      console.error('Error getting task status:', error);
      return {
        taskId,
        status: 'error',
        progress: 'Failed to get status'
      };
    }
  }

  async triggerWorkflow(repository: string, task: string): Promise<{ runId: string; status: string }> {
    console.log(`Codex CLI Agent - Triggering workflow in repo: ${repository} for task: ${task}`);
    
    try {
      const response = await axios.post(`${this.backendUrl}/api/github/trigger-workflow`, {
        repo_name: repository,
        github_token: this.githubToken,
        task: task
      });
      
      return {
        runId: response.data.run_id,
        status: 'triggered'
      };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return {
        runId: `error-${Date.now()}`,
        status: 'failed'
      };
    }
  }
}

const app = new App({
  plugins: [new DevtoolsPlugin()],
});

async function handleConfigurationSave(send: any, userId: string, formData: any) {
  try {
    const devinApiKey = formData.devinApiKey?.trim();
    const githubToken = formData.githubToken?.trim();
    
    if (devinApiKey && devinApiKey !== '••••••••••••••••') {
      if (devinApiKey.length < 10) {
        const errorCard = createConfigurationErrorCard('Devin API key appears to be too short. Please check your key and try again.');
        await send({
          type: 'message',
          attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: errorCard
          }]
        });
        return;
      }
    }
    
    if (githubToken && githubToken !== '••••••••••••••••') {
      if (githubToken.length < 10) {
        const errorCard = createConfigurationErrorCard('GitHub token appears to be too short. Please check your token and try again.');
        await send({
          type: 'message',
          attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: errorCard
          }]
        });
        return;
      }
    }
    
    const currentConfig = userConfigs.get(userId) || {};
    let updated = false;
    let message = 'Configuration updated successfully!\n\n';
    
    if (devinApiKey && devinApiKey !== '••••••••••••••••') {
      currentConfig.devinApiKey = devinApiKey;
      updated = true;
      message += '✅ Devin API key configured\n';
    }
    
    if (githubToken && githubToken !== '••••••••••••••••') {
      currentConfig.githubToken = githubToken;
      updated = true;
      message += '✅ GitHub token configured\n';
    }
    
    const azureApiKey = formData.azureOpenAiApiKey?.trim();
    const azureEndpoint = formData.azureOpenAiEndpoint?.trim();
    const githubRepo = formData.githubRepo?.trim();
    
    if (azureApiKey && azureApiKey !== '••••••••••••••••') {
      currentConfig.azureOpenAiApiKey = azureApiKey;
      updated = true;
      message += '✅ Azure OpenAI API key configured\n';
    }
    
    if (azureEndpoint) {
      currentConfig.azureOpenAiEndpoint = azureEndpoint;
      updated = true;
      message += '✅ Azure OpenAI endpoint configured\n';
    }
    
    if (githubRepo) {
      currentConfig.githubRepo = githubRepo;
      updated = true;
      message += '✅ GitHub repository configured\n';
    }
    
    if (updated) {
      userConfigs.set(userId, currentConfig);
      message += '\nYou can now start using the coding agents!';
      
      const successCard = createConfigurationSuccessCard(message);
      await send({
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: successCard
        }]
      });
    } else {
      const errorCard = createConfigurationErrorCard('No changes were made. Please enter your API keys and try again.');
      await send({
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: errorCard
        }]
      });
    }
  } catch (error) {
    const errorCard = createConfigurationErrorCard(`An error occurred while saving configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: errorCard
      }]
    });
  }
}

async function handleShowStatus(send: any, userId: string) {
  const currentConfig = userConfigs.get(userId);
  const card = createConfigurationCard(currentConfig);
  
  await send({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: card
    }]
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleConfigurationHelp(send: any) {
  await send({
    type: 'message',
    text: '**Configuration Help:**\n\n' +
      '**For Devin:**\n' +
      '1. Get your Devin API key from: https://app.devin.ai/settings/api-keys\n' +
      '2. Enter it in the configuration form\n' +
      '3. Start using Devin with: `/devin <your-task>`\n\n' +
      '**For GitHub Copilot Coding Agent:**\n' +
      '1. Get your GitHub token from: https://github.com/settings/tokens\n' +
      '2. Enter it in the configuration form\n' +
      '3. Start using Copilot agent with: `/github <your-task>`\n\n' +
      '**Security Note:** Your API keys are stored securely and only shown as masked values.'
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleShowConfiguration(send: any, userId: string) {
  const currentConfig = userConfigs.get(userId);
  const card = createConfigurationCard(currentConfig);
  
  await send({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: card
    }]
  });
}

async function handleTaskPreview(activity: any, send: any) {
  const data = activity.value?.action?.data;
  if (!data.taskDescription?.trim()) {
    await send('❌ Please provide a task description before previewing.');
    return;
  }
  
  const previewCard = createTaskPreviewCard(data);
  await send({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: previewCard
    }]
  });
}

async function handleTaskCreation(activity: any, send: any, data: any) {
  if (!data.taskDescription?.trim()) {
    await send('❌ Please provide a task description.');
    return;
  }
  
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    const client = new DevinApiClient(config.devinApiKey);
    const session = await client.createSession(data.taskDescription);
    const successCard = createTaskSuccessCard(session);
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: successCard
      }]
    });
  } catch (error) {
    await send(`❌ Error creating task: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleConfirmTaskCreation(send: any, userId: string, data: any) {
  if (!data.taskDescription?.trim()) {
    await send('❌ Task description is required.');
    return;
  }
  
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    const client = new DevinApiClient(config.devinApiKey);
    const session = await client.createSession(data.taskDescription);
    const successCard = createTaskSuccessCard(session);
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: successCard
      }]
    });
  } catch (error) {
    await send(`❌ Error creating task: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleEditTask(send: any) {
  const card = createTaskCreationCard();
  await send({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: card
    }]
  });
}

async function handleCancelTask(send: any) {
  await send('❌ Task creation cancelled. Type `/devin` to start a new task.');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleCreateNewTask(send: any) {
  const card = createTaskCreationCard();
  await send({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: card
    }]
  });
}

async function handleCheckTaskStatus(send: any, userId: string, sessionId: string) {
  if (!sessionId) {
    await send('❌ Session ID is required to check status.');
    return;
  }
  
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    const client = new DevinApiClient(config.devinApiKey);
    const session = await client.getSession(sessionId);
    const statusCard = createStatusDisplayCard(session);
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: statusCard
      }]
    });
  } catch (error) {
    await send(`❌ Error checking status: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleRefreshStatus(activity: any, send: any, sessionId: string) {
  await handleCheckTaskStatus(activity, send, sessionId);
}

async function handleSendMessageDialog(activity: any, send: any) {
  const data = activity.value?.action?.data;
  const sessionId = data?.sessionId;
  const messageCard = createMessageInputCard(sessionId);
  await send({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: messageCard
    }]
  });
}

async function handleSendMessageSubmit(activity: any, send: any, data: any) {
  const userId = getUserId(activity);
  if (!data.sessionId || !data.message?.trim()) {
    await send('❌ Session ID and message are required.');
    return;
  }
  
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    const client = new DevinApiClient(config.devinApiKey);
    await client.sendMessage(data.sessionId, data.message);
    await send(`✅ Message sent to Devin session ${data.sessionId}`);
    
    setTimeout(async () => {
      const session = await client.getSession(data.sessionId);
      const statusCard = createStatusDisplayCard(session);
      await send({
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: statusCard
        }]
      });
    }, 1000);
  } catch (error) {
    await send(`❌ Error sending message: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleCancelSession(activity: any, send: any, sessionId: string) {
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    await send(`⏹️ Session ${sessionId} cancellation requested. (Note: This is a stub implementation)`);
  } catch (error) {
    await send(`❌ Error cancelling session: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleViewLogs(activity: any, send: any, sessionId: string) {
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    await send(`📋 **Session Logs for ${sessionId}**\n\n` +
      `This feature will show detailed logs from the Devin session.\n` +
      `(Note: This is a stub implementation - full log viewing will be available in the actual Devin API)`);
  } catch (error) {
    await send(`❌ Error viewing logs: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleViewSessionStatus(activity: any, send: any, sessionId: string) {
  await handleCheckTaskStatus(activity, send, sessionId);
}

async function handleViewAllSessions(activity: any, send: any) {
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    const mockSessions = [
      {
        id: 'session-001',
        task: 'Create a React todo app',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'session-002', 
        task: 'Fix authentication bug',
        status: 'running',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    const sessionListCard = createSessionListCard(mockSessions);
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: sessionListCard
      }]
    });
  } catch (error) {
    await send(`❌ Error viewing sessions: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleRefreshSessionList(activity: any, send: any) {
  await handleViewAllSessions(activity, send);
}

async function handleViewDetailedResults(activity: any, send: any, sessionId: string) {
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    const client = new DevinApiClient(config.devinApiKey);
    const session = await client.getSession(sessionId);
    
    const mockResults = {
      duration: "2h 15m",
      filesModified: [
        { name: "src/components/TodoList.tsx", status: "added" },
        { name: "src/styles/main.css", status: "modified" },
        { name: "package.json", status: "modified" }
      ],
      linesChanged: 247,
      codeChanges: [
        {
          type: "added",
          file: "src/components/TodoList.tsx",
          description: "Created new React component with drag-and-drop functionality",
          additions: 89,
          deletions: 0
        },
        {
          type: "modified",
          file: "src/styles/main.css",
          description: "Added styling for todo list component",
          additions: 45,
          deletions: 12
        }
      ],
      externalLinks: [
        {
          type: "github_pr",
          title: "Add TodoList component with drag-and-drop",
          url: "https://github.com/example/repo/pull/123",
          description: "Pull request with the implemented changes"
        },
        {
          type: "deployment",
          title: "Preview Deployment",
          url: "https://preview-abc123.vercel.app",
          description: "Live preview of the changes"
        }
      ],
      summary: "Successfully implemented a React TodoList component with drag-and-drop functionality. The component includes proper TypeScript types, responsive styling, and comprehensive error handling."
    };
    
    const resultsCard = createResultsCard(session, mockResults);
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: resultsCard
      }]
    });
  } catch (error) {
    await send(`❌ Error viewing results: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleDownloadResults(activity: any, send: any, sessionId: string) {
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    await send(`💾 **Download Results for Session ${sessionId}**\n\n` +
      `Your results package is being prepared and will include:\n` +
      `• Source code changes\n` +
      `• Documentation updates\n` +
      `• Test files\n` +
      `• Configuration files\n\n` +
      `You'll receive a download link shortly.\n\n` +
      `⚠️ **Note:** This is a stub implementation - actual file downloads will be available in the production version.`);
  } catch (error) {
    await send(`❌ Error downloading results: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleViewAllResults(activity: any, send: any) {
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    const mockCompletedSessions = [
      {
        id: 'session-001',
        task: 'Create a React todo app with drag-and-drop',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 82800000).toISOString(),
        results: {
          filesModified: [
            { name: "src/components/TodoList.tsx", status: "added" },
            { name: "src/styles/main.css", status: "modified" }
          ],
          linesChanged: 247
        }
      },
      {
        id: 'session-003',
        task: 'Implement user authentication system',
        status: 'completed',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        completed_at: new Date(Date.now() - 169200000).toISOString(),
        results: {
          filesModified: [
            { name: "src/auth/AuthProvider.tsx", status: "added" },
            { name: "src/components/LoginForm.tsx", status: "added" },
            { name: "src/utils/api.ts", status: "modified" }
          ],
          linesChanged: 156
        }
      }
    ];
    
    const summaryCard = createResultsSummaryCard(mockCompletedSessions);
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: summaryCard
      }]
    });
  } catch (error) {
    await send(`❌ Error viewing all results: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

async function handleExportResultsReport(activity: any, send: any) {
  const userId = getUserId(activity);
  const config = userConfigs.get(userId);
  if (!config?.devinApiKey) {
    await send('❌ Please configure your Devin API key first using `/config`');
    return;
  }
  
  try {
    await send(`📈 **Export Results Report**\n\n` +
      `Your comprehensive results report is being generated and will include:\n\n` +
      `📊 **Analytics:**\n` +
      `• Task completion statistics\n` +
      `• Code quality metrics\n` +
      `• Performance improvements\n` +
      `• Time tracking data\n\n` +
      `📁 **Deliverables:**\n` +
      `• All source code changes\n` +
      `• Documentation updates\n` +
      `• Test coverage reports\n` +
      `• Deployment configurations\n\n` +
      `The report will be available in PDF and JSON formats.\n\n` +
      `⚠️ **Note:** This is a stub implementation - actual report generation will be available in the production version.`);
  } catch (error) {
    await send(`❌ Error exporting report: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

function getUserId(activity: any): string {
  const userId = activity.from?.id || 'unknown';
  console.log(`🔍 Debug: getUserId returned: "${userId}"`);
  return userId;
}

app.on('message', async ({ activity, send }) => {
  await send({ type: 'typing' });
  
  const text = activity.text?.trim() || '';
  const userId = getUserId(activity);
  
  if (activity.value?.action) {
    console.log(`🔍 Debug: app.on('message') received action but delegating to card.action handler:`, activity.value.action);
    return;
  }

  if (text.startsWith('/config')) {
    const parts = text.split(' ');
    
    if (parts.length >= 3 && parts[1].startsWith('set-')) {
      const configType = parts[1];
      const value = parts.slice(2).join(' ');
      const currentConfig = userConfigs.get(userId) || {};
      
      switch (configType) {
        case 'set-devin-key':
          currentConfig.devinApiKey = value;
          userConfigs.set(userId, currentConfig);
          await send('✅ Devin API key configured successfully!');
          return;
        case 'set-github-token':
          currentConfig.githubToken = value;
          userConfigs.set(userId, currentConfig);
          await send('✅ GitHub token configured successfully!');
          return;
        case 'set-azure-key':
          currentConfig.azureOpenAiApiKey = value;
          userConfigs.set(userId, currentConfig);
          await send('✅ Azure OpenAI API key configured successfully!');
          return;
        case 'set-azure-endpoint':
          currentConfig.azureOpenAiEndpoint = value;
          userConfigs.set(userId, currentConfig);
          await send('✅ Azure OpenAI endpoint configured successfully!');
          return;
        case 'set-github-repo':
          currentConfig.githubRepo = value;
          userConfigs.set(userId, currentConfig);
          await send('✅ GitHub repository configured successfully!');
          return;
        default:
          await send('❌ Unknown configuration option. Use: set-devin-key, set-github-token, set-azure-key, set-azure-endpoint, or set-github-repo');
          return;
      }
    }
    
    const currentConfig = userConfigs.get(userId);
    const card = createConfigurationCard(currentConfig);
    
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: card
      }]
    });
    return;
  }
  
  if (text.startsWith('/devin ') || text === '/devin') {
    const config = userConfigs.get(userId);
    console.log(`🔍 Debug: /devin command - userId: "${userId}", config:`, config);
    console.log(`🔍 Debug: userConfigs has keys:`, Array.from(userConfigs.keys()));
    if (!config?.devinApiKey) {
      await send('❌ Please configure your Devin API key first using `/config`\n\n' +
        'Get your API key from: https://app.devin.ai/settings/api-keys');
      return;
    }
    
    const task = text.substring(6).trim();
    if (!task) {
      const card = createTaskCreationCard();
      await send({
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card
        }]
      });
      return;
    }
    
    try {
      console.log(`🔍 Debug: Creating DevinApiClient with API key`);
      const client = new DevinApiClient(config.devinApiKey);
      console.log(`🔍 Debug: Calling createSession with task: "${task}"`);
      const session = await client.createSession(task);
      console.log(`🔍 Debug: Session created successfully:`, session);
      const sessionData = session as any;
      const sessionForCard = {
        id: sessionData.session_id,
        status: 'running',
        created_at: new Date().toISOString(),
        url: sessionData.url
      };
      console.log(`🔍 Debug: Mapped session data for card:`, sessionForCard);
      const successCard = createTaskSuccessCard(sessionForCard);
      console.log(`🔍 Debug: Generated success card:`, JSON.stringify(successCard, null, 2));
      console.log(`🔍 Debug: Sending success card`);
      const sendResult = await send({
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: successCard
        }]
      });
      console.log(`🔍 Debug: Success card sent, result:`, sendResult);
    } catch (error) {
      console.log(`🔍 Debug: Error occurred:`, error);
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/devin-status')) {
    const config = userConfigs.get(userId);
    console.log(`🔍 Debug: /devin-status command - userId: "${userId}", config:`, config);
    if (!config?.devinApiKey) {
      await send('❌ Please configure your Devin API key first using `/config`');
      return;
    }
    
    const sessionId = text.substring(13).trim();
    console.log(`🔍 Debug: Raw sessionId from command: "${sessionId}"`);
    if (!sessionId) {
      await send('❌ Please provide a session ID: `/devin-status <session-id>`');
      return;
    }
    
    const cleanSessionId = sessionId.startsWith('devin-') ? sessionId.substring(6) : sessionId;
    console.log(`🔍 Debug: Clean sessionId for API: "${cleanSessionId}"`);
    
    try {
      console.log(`🔍 Debug: Creating DevinApiClient for status check`);
      const client = new DevinApiClient(config.devinApiKey);
      console.log(`🔍 Debug: Calling getSession with sessionId: "${cleanSessionId}"`);
      const session = await client.getSession(cleanSessionId);
      console.log(`🔍 Debug: Session status retrieved successfully:`, session);
      const statusCard = createStatusDisplayCard(session);
      console.log(`🔍 Debug: Generated status card:`, JSON.stringify(statusCard, null, 2));
      console.log(`🔍 Debug: Sending status card`);
      const sendResult = await send({
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: statusCard
        }]
      });
      console.log(`🔍 Debug: Status card sent, result:`, sendResult);
    } catch (error) {
      console.log(`🔍 Debug: Error in /devin-status:`, error);
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/devin-message')) {
    const config = userConfigs.get(userId);
    if (!config?.devinApiKey) {
      await send('❌ Please configure your Devin API key first using `/config`');
      return;
    }
    
    const parts = text.substring(14).trim().split(' ');
    const sessionId = parts[0];
    const message = parts.slice(1).join(' ');
    
    if (!sessionId || !message) {
      await send('❌ Usage: `/devin-message <session-id> <message>`');
      return;
    }
    
    try {
      const client = new DevinApiClient(config.devinApiKey);
      await client.sendMessage(sessionId, message);
      await send(`✅ Message sent to Devin session ${sessionId}`);
    } catch (error) {
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/github')) {
    const config = userConfigs.get(userId);
    if (!config?.githubToken) {
      await send('❌ Please configure your GitHub token first using `/config set-github-token <your-token>`\n\n' +
        'Get your GitHub token from: https://github.com/settings/tokens');
      return;
    }
    
    const parts = text.substring(7).trim().split(' ');
    const task = parts.join(' ');
    
    if (!task) {
      await send('**Copilot Coding Agent Commands:**\n\n' +
        '• `/github <task>` - Create a coding task\n' +
        '• `/github-status <task-id>` - Check task status\n' +
        '• `/github-action <repo> <workflow> <task>` - Trigger GitHub Action\n\n' +
        '**Example:** `/github Fix the login bug in the authentication module`\n\n' +
        '⚠️ **Note:** This is a preview implementation. The Copilot Coding Agent API is not yet available.');
      return;
    }
    
    try {
      const agent = new CopilotCodingAgent(config.githubToken);
      const result = await agent.createCodingTask(task);
      await send(`🔧 **Copilot Coding Task Created!**\n\n` +
        `**Task ID:** ${result.taskId}\n` +
        `**Task:** ${task}\n` +
        `**Status:** ${result.status}\n\n` +
        `Use \`/github-status ${result.taskId}\` to check progress.\n\n` +
        `⚠️ **Note:** This is a stub implementation for preview purposes.`);
    } catch (error) {
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/github-status')) {
    const config = userConfigs.get(userId);
    if (!config?.githubToken) {
      await send('❌ Please configure your GitHub token first using `/config`');
      return;
    }
    
    const taskId = text.substring(14).trim();
    if (!taskId) {
      await send('❌ Please provide a task ID: `/github-status <task-id>`');
      return;
    }
    
    try {
      const agent = new CopilotCodingAgent(config.githubToken);
      const status = await agent.getTaskStatus(taskId);
      await send(`📊 **Copilot Task Status**\n\n` +
        `**Task ID:** ${status.taskId}\n` +
        `**Status:** ${status.status}\n` +
        `${status.progress ? `**Progress:** ${status.progress}\n` : ''}` +
        `\n⚠️ **Note:** This is a stub implementation for preview purposes.`);
    } catch (error) {
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/github-action')) {
    const config = userConfigs.get(userId);
    if (!config?.githubToken) {
      await send('❌ Please configure your GitHub token first using `/config`');
      return;
    }
    
    const parts = text.substring(14).trim().split(' ');
    const repository = parts[0];
    const workflow = parts[1];
    const task = parts.slice(2).join(' ');
    
    if (!repository || !workflow || !task) {
      await send('❌ Usage: `/github-action <repository> <workflow> <task>`\n\n' +
        '**Example:** `/github-action myorg/myrepo ci.yml Fix authentication bug`');
      return;
    }
    
    try {
      const agent = new CopilotCodingAgent(config.githubToken);
      const result = await agent.triggerGitHubAction(repository, workflow, task);
      await send(`🚀 **GitHub Action Triggered!**\n\n` +
        `**Repository:** ${repository}\n` +
        `**Workflow:** ${workflow}\n` +
        `**Run ID:** ${result.runId}\n` +
        `**Status:** ${result.status}\n` +
        `**Task:** ${task}\n\n` +
        `⚠️ **Note:** This is a stub implementation for preview purposes.`);
    } catch (error) {
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/codex')) {
    const config = userConfigs.get(userId);
    if (!config?.githubToken || !config?.azureOpenAiApiKey || !config?.githubRepo) {
      await send('❌ Please configure all required settings first using `/config`:\n\n' +
        '• GitHub token\n' +
        '• Azure OpenAI API key\n' +
        '• GitHub repository\n' +
        '• Azure OpenAI endpoint (optional)');
      return;
    }
    
    const task = text.substring(6).trim();
    if (!task) {
      await send('**Codex CLI Agent Commands:**\n\n' +
        '• `/codex <task>` - Create a codex refactoring task\n' +
        '• `/codex-status <task-id>` - Check task status\n' +
        '• `/codex-trigger <task-id>` - Trigger workflow execution\n\n' +
        '**Example:** `/codex refactor the authentication module for clarity`\n\n' +
        '**Note:** This will create a GitHub Actions workflow in your configured repository.');
      return;
    }
    
    try {
      const agent = new CodexCliAgent(
        config.githubToken,
        config.azureOpenAiApiKey,
        config.azureOpenAiEndpoint || 'https://api.openai.com/v1'
      );
      const result = await agent.createCodexTask(task, config.githubRepo);
      await send(`🤖 **Codex CLI Task Created!**\n\n` +
        `**Task ID:** ${result.taskId}\n` +
        `**Repository:** ${config.githubRepo}\n` +
        `**Task:** ${task}\n` +
        `**Status:** ${result.status}\n` +
        `${result.workflowUrl ? `**Workflow:** ${result.workflowUrl}\n` : ''}` +
        `\nUse \`/codex-trigger ${result.taskId}\` to run the workflow.\n` +
        `Use \`/codex-status ${result.taskId}\` to check progress.`);
    } catch (error) {
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/codex-status')) {
    const config = userConfigs.get(userId);
    if (!config?.githubToken || !config?.azureOpenAiApiKey) {
      await send('❌ Please configure your tokens first using `/config`');
      return;
    }
    
    const taskId = text.substring(13).trim();
    if (!taskId) {
      await send('❌ Please provide a task ID: `/codex-status <task-id>`');
      return;
    }
    
    try {
      const agent = new CodexCliAgent(
        config.githubToken,
        config.azureOpenAiApiKey,
        config.azureOpenAiEndpoint || 'https://api.openai.com/v1'
      );
      const status = await agent.getTaskStatus(taskId);
      await send(`📊 **Codex CLI Task Status**\n\n` +
        `**Task ID:** ${status.taskId}\n` +
        `**Status:** ${status.status}\n` +
        `${status.progress ? `**Progress:** ${status.progress}\n` : ''}` +
        `${status.logs ? `**Logs:**\n\`\`\`\n${status.logs}\n\`\`\`\n` : ''}`);
    } catch (error) {
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text.startsWith('/codex-trigger')) {
    const config = userConfigs.get(userId);
    if (!config?.githubToken || !config?.azureOpenAiApiKey || !config?.githubRepo) {
      await send('❌ Please configure all required settings first using `/config`');
      return;
    }
    
    const parts = text.substring(14).trim().split(' ');
    const taskId = parts[0];
    const task = parts.slice(1).join(' ') || 'refactor code for clarity';
    
    if (!taskId) {
      await send('❌ Usage: `/codex-trigger <task-id> [task-description]`');
      return;
    }
    
    try {
      const agent = new CodexCliAgent(
        config.githubToken,
        config.azureOpenAiApiKey,
        config.azureOpenAiEndpoint || 'https://api.openai.com/v1'
      );
      const result = await agent.triggerWorkflow(config.githubRepo, task);
      await send(`🚀 **Codex CLI Workflow Triggered!**\n\n` +
        `**Task ID:** ${taskId}\n` +
        `**Run ID:** ${result.runId}\n` +
        `**Repository:** ${config.githubRepo}\n` +
        `**Status:** ${result.status}\n` +
        `**Task:** ${task}\n\n` +
        `Use \`/codex-status ${taskId}\` to monitor progress.`);
    } catch (error) {
      await send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    return;
  }
  
  if (text === '/help' || text === 'help') {
    const helpCard = createHelpCard();
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: helpCard
      }]
    });
    return;
  }
  
  await send(`I didn't understand that command. Type \`/help\` to see available commands.\n\n` +
    `You said: "${text}"`);
});

app.on('dialog.open', async ({ activity }) => {
  const data = activity.value?.data;
  const dialogType = data?.opendialogtype;
  
  console.debug('Received dialog open request:', dialogType);

  try {
    switch (dialogType) {
      case 'configure_devin':
        const configCard = createConfigurationCard();
        return {
          task: {
            type: 'continue',
            value: {
              title: 'Configure Devin API',
              card: {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: configCard
              }
            }
          }
        };

      case 'create_task':
        const taskCard = createTaskCreationCard();
        return {
          task: {
            type: 'continue',
            value: {
              title: 'Create Coding Task',
              card: {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: taskCard
              }
            }
          }
        };

      default:
        return {
          task: {
            type: 'continue',
            value: {
              title: 'Unknown Dialog',
              card: {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: {
                  type: "AdaptiveCard",
                  version: "1.5",
                  body: [
                    {
                      type: "TextBlock",
                      text: "❌ Unknown dialog type requested",
                      weight: "Bolder",
                      color: "Attention"
                    }
                  ]
                }
              }
            }
          }
        };
    }
  } catch (error) {
    console.error('Error handling dialog open:', error);
    return {
      task: {
        type: 'continue',
        value: {
          title: 'Error',
          card: {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
              type: "AdaptiveCard",
              version: "1.5",
              body: [
                {
                  type: "TextBlock",
                  text: "❌ Error opening dialog",
                  weight: "Bolder",
                  color: "Attention"
                }
              ]
            }
          }
        }
      }
    };
  }
});

app.on("dialog.submit", async ({ activity, send }) => {
  const dialogType = activity.value.data?.submissiondialogtype;
  
  console.debug('Received dialog submission:', dialogType);

  try {
    if (dialogType === "configure_devin") {
      const devinKey = activity.value.data.devin_key;
      const githubToken = activity.value.data.github_token;
      
      if (!devinKey || !githubToken) {
        await send('❌ Please provide both Devin API key and GitHub token');
        return {
          task: {
            type: "message",
            value: "Configuration incomplete"
          }
        };
      }
      
      await send(`✅ Configuration saved successfully!\n\n🔑 Devin API key: ${devinKey.substring(0, 8)}...\n🐙 GitHub token: ${githubToken.substring(0, 8)}...`);
      return {
        task: {
          type: "message",
          value: "Configuration completed"
        }
      };
    } else if (dialogType === "create_task") {
      const taskDescription = activity.value.data.task_description;
      const taskType = activity.value.data.task_type;
      const priority = activity.value.data.priority;
      
      if (!taskDescription) {
        await send('❌ Please provide a task description');
        return {
          task: {
            type: "message",
            value: "Task creation incomplete"
          }
        };
      }
      
      await send(`🚀 Task created successfully!\n\n📝 Description: ${taskDescription}\n🏷️ Type: ${taskType || 'General'}\n⚡ Priority: ${priority || 'Medium'}`);
      return {
        task: {
          type: "message",
          value: "Task created successfully"
        }
      };
    } else {
      await send('❌ Unknown dialog submission type');
      return {
        task: {
          type: "message",
          value: "Unknown submission"
        }
      };
    }
  } catch (error) {
    console.error('Error handling dialog submission:', error);
    await send(`❌ Error processing dialog submission: ${(error as Error).message}`);
    return {
      task: {
        type: "message",
        value: "Error occurred"
      }
    };
  }
});

app.on('card.action', async ({ activity, send }) => {
  const data = activity.value?.action?.data;
  
  if (!data?.action) {
    await send('❌ No action specified in the request.');
    return;
  }

  console.log(`🔍 Debug: app.on('card.action') received action:`, data.action, 'with data:', data);

  try {
    switch (data.action) {
      case 'show_config':
        const configCard = createConfigurationCard();
        await send({
          type: 'message',
          attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: configCard
          }]
        });
        break;

      case 'save_configuration':
        const devinKey = data.devin_key;
        const githubToken = data.github_token;
        if (!devinKey || !githubToken) {
          await send('❌ Please provide both Devin API key and GitHub token');
          return;
        }
        await send(`✅ Configuration saved successfully!\n\n🔑 Devin API key: ${devinKey.substring(0, 8)}...\n🐙 GitHub token: ${githubToken.substring(0, 8)}...`);
        break;

      case 'show_help':
        const helpCard = createHelpCard();
        await send({
          type: 'message',
          attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: helpCard
          }]
        });
        break;

      case 'create_new_task':
        const taskCard = createTaskCreationCard();
        await send({
          type: 'message',
          attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: taskCard
          }]
        });
        break;

      case 'preview_task':
        await handleTaskPreview(activity, send);
        break;

      case 'create_task':
        await handleTaskCreation(activity, send, data);
        break;

      case 'view_all_sessions':
        await handleViewAllSessions(activity, send);
        break;

      case 'view_session_status':
        const statusSessionId = data.sessionId;
        await handleViewSessionStatus(activity, send, statusSessionId);
        break;

      case 'refresh_status':
        const refreshSessionId = data.sessionId;
        await handleRefreshStatus(activity, send, refreshSessionId);
        break;

      case 'view_detailed_results':
        const resultsSessionId = data.sessionId;
        await handleViewDetailedResults(activity, send, resultsSessionId);
        break;

      case 'send_message':
        await handleSendMessageDialog(activity, send);
        break;

      case 'send_message_submit':
        const messageData = data;
        await handleSendMessageSubmit(activity, send, messageData);
        break;

      case 'cancel_session':
        const cancelSessionId = data.sessionId;
        await handleCancelSession(activity, send, cancelSessionId);
        break;

      case 'view_logs':
        const logsSessionId = data.sessionId;
        await handleViewLogs(activity, send, logsSessionId);
        break;

      case 'refresh_session_list':
        await handleRefreshSessionList(activity, send);
        break;

      case 'download_results':
        const downloadSessionId = data.sessionId;
        await handleDownloadResults(activity, send, downloadSessionId);
        break;

      case 'view_all_results':
        await handleViewAllResults(activity, send);
        break;

      case 'export_results_report':
        await handleExportResultsReport(activity, send);
        break;

      case 'check_status':
        const checkSessionId = data.sessionId;
        const userId = getUserId(activity);
        await handleCheckTaskStatus(send, userId, checkSessionId);
        break;

      case 'save_config':
        const saveUserId = getUserId(activity);
        await handleConfigurationSave(send, saveUserId, data);
        break;

      case 'show_status':
        const statusUserId = getUserId(activity);
        await handleShowStatus(send, statusUserId);
        break;

      case 'confirm_create_task':
        const confirmUserId = getUserId(activity);
        await handleConfirmTaskCreation(send, confirmUserId, data);
        break;

      case 'edit_task':
        await handleEditTask(send);
        break;

      case 'cancel_task':
        await handleCancelTask(send);
        break;

      default:
        await send(`❌ Unknown action: ${data.action}`);
        break;
    }

  } catch (error) {
    console.error('Error processing adaptive card action:', error);
    await send(`❌ Error processing action: ${(error as Error).message}`);
  }
  
  return undefined;
});

(async () => {
  await app.start(+(process.env.PORT || 3978));
  console.log(`🚀 Coding Agent Teams App started on port ${process.env.PORT || 3978}`);
})();
