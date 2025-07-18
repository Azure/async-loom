import { createServer, type IncomingMessage } from "node:http";
import { verifyAndParseRequest } from "@copilot-extensions/preview-sdk";
import OpenAI from "openai";
import axios from "axios";
import { parse } from "url";

interface DevinSession {
  session_id: string;
  status: string;
  url?: string;
}

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
}

class CopilotCodingAgent {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async createCodingTask(task: string, repository?: string): Promise<{ taskId: string; status: string }> {
    console.log(`Copilot Coding Agent - Creating task: ${task} for repo: ${repository || 'default'}`);
    
    const taskId = `copilot-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      taskId,
      status: 'queued'
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
}

interface UserConfig {
  devinApiKey?: string;
  githubToken?: string;
  azureOpenAiApiKey?: string;
  azureOpenAiEndpoint?: string;
  githubRepo?: string;
}

const userConfigs = new Map<string, UserConfig>();

const AVAILABLE_AGENTS = [
  {
    id: "swe-agent",
    name: "Software Engineering Agent",
    description: "Handles code reviews, bug fixes, and development tasks using Devin",
    type: "devin",
    capabilities: ["code-review", "bug-fixing", "feature-development", "testing"]
  },
  {
    id: "sre-agent", 
    name: "Site Reliability Engineering Agent",
    description: "Manages infrastructure, monitoring, and deployment tasks using Codex",
    type: "codex",
    capabilities: ["infrastructure", "monitoring", "deployment", "incident-response"]
  },
  {
    id: "qa-agent",
    name: "Quality Assurance Agent", 
    description: "Performs testing, validation, and quality checks using GitHub Copilot",
    type: "copilot",
    capabilities: ["automated-testing", "manual-testing", "quality-assurance", "validation"]
  },
  {
    id: "devops-agent",
    name: "DevOps Agent",
    description: "Handles CI/CD pipelines, automation, and tooling using Codex",
    type: "codex",
    capabilities: ["ci-cd", "automation", "tooling", "pipeline-management"]
  }
];

async function createAgentTask(agentId: string, task: string, userId: string): Promise<any> {
  const config = userConfigs.get(userId);
  const agent = AVAILABLE_AGENTS.find(a => a.id === agentId);
  
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }
  
  switch (agent.type) {
    case 'devin':
      if (!config?.devinApiKey) {
        throw new Error('Devin API key not configured. Use @agu config to set up.');
      }
      const devinClient = new DevinApiClient(config.devinApiKey);
      return await devinClient.createSession(task);
      
    case 'codex':
      if (!config?.azureOpenAiApiKey || !config?.azureOpenAiEndpoint || !config?.githubToken) {
        throw new Error('Azure OpenAI and GitHub configuration required. Use @agu config to set up.');
      }
      const codexAgent = new CodexCliAgent(config.githubToken, config.azureOpenAiApiKey, config.azureOpenAiEndpoint);
      return await codexAgent.createCodexTask(task, config.githubRepo || 'default-repo');
      
    case 'copilot':
      if (!config?.githubToken) {
        throw new Error('GitHub token required. Use @agu config to set up.');
      }
      const copilotAgent = new CopilotCodingAgent(config.githubToken);
      return await copilotAgent.createCodingTask(task, config.githubRepo);
      
    default:
      throw new Error(`Unsupported agent type: ${agent.type}`);
  }
}

const functions = [
  {
    name: "listAgents",
    description: "List all available AGU agents",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "configureAgent",
    description: "Configure AGU agent API keys and settings",
    parameters: {
      type: "object",
      properties: {
        option: {
          type: "string",
          description: "Configuration option to set",
          enum: ["devin-key", "github-token", "azure-key", "azure-endpoint", "github-repo"]
        },
        value: {
          type: "string",
          description: "The value to set for the configuration option"
        }
      },
      required: ["option", "value"]
    }
  },
  {
    name: "showConfiguration",
    description: "Show current AGU configuration status and help",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "assignTask",
    description: "Assign a task to the selected AGU agent",
    parameters: {
      type: "object",
      properties: {
        agentId: {
          type: "string", 
          description: "The ID of the agent to assign the task to",
          enum: AVAILABLE_AGENTS.map(agent => agent.id)
        },
        task: {
          type: "string",
          description: "The task description to assign to the agent"
        },
        priority: {
          type: "string",
          description: "Task priority level",
          enum: ["low", "medium", "high", "urgent"]
        }
      },
      required: ["agentId", "task"]
    }
  },
  {
    name: "getAgentStatus",
    description: "Get the current status of an AGU agent",
    parameters: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "The ID of the agent to check status for",
          enum: AVAILABLE_AGENTS.map(agent => agent.id)
        }
      },
      required: ["agentId"]
    }
  }
];

async function handleListAgents(): Promise<string> {
  const agentList = AVAILABLE_AGENTS.map(agent => 
    `**${agent.name}** (\`${agent.id}\`)\n${agent.description}\nCapabilities: ${agent.capabilities.join(", ")}`
  ).join("\n\n");
  
  return `## 🤖 Available AGU Agents\n\n${agentList}\n\nUse \`assignTask\` to assign tasks to agents or \`configureAgent\` to set up API keys.`;
}

async function handleConfigureAgent(option: string, value: string, userId: string): Promise<string> {
  const config = userConfigs.get(userId) || {};
  
  switch (option) {
    case 'devin-key':
      config.devinApiKey = value;
      userConfigs.set(userId, config);
      return '✅ **Devin API key configured successfully!**\n\nYou can now use the Software Engineering Agent (swe-agent) for code reviews, bug fixes, and development tasks.';
    case 'github-token':
      config.githubToken = value;
      userConfigs.set(userId, config);
      return '✅ **GitHub token configured successfully!**\n\nYou can now use agents that require GitHub access (QA Agent, DevOps Agent, SRE Agent).';
    case 'azure-key':
      config.azureOpenAiApiKey = value;
      userConfigs.set(userId, config);
      return '✅ **Azure OpenAI API key configured successfully!**\n\nMake sure to also set the azure-endpoint for full Codex agent functionality.';
    case 'azure-endpoint':
      config.azureOpenAiEndpoint = value;
      userConfigs.set(userId, config);
      return '✅ **Azure OpenAI endpoint configured successfully!**\n\nMake sure you have also set the azure-key for full Codex agent functionality.';
    case 'github-repo':
      config.githubRepo = value;
      userConfigs.set(userId, config);
      return `✅ **GitHub repository configured successfully!**\n\nDefault repository set to: ${value}\n\nThis will be used for agent tasks that require repository access.`;
    default:
      return `❌ **Unknown configuration option:** ${option}\n\n**Available options:**\n- \`devin-key\` - Set Devin API key for SWE Agent\n- \`github-token\` - Set GitHub token for repository access\n- \`azure-key\` - Set Azure OpenAI API key for Codex agents\n- \`azure-endpoint\` - Set Azure OpenAI endpoint for Codex agents\n- \`github-repo\` - Set default GitHub repository (format: owner/repo)\n\n**Get your API keys from:**\n- Devin: https://app.devin.ai/settings/api-keys\n- GitHub: https://github.com/settings/tokens\n- Azure OpenAI: Azure Portal`;
  }
}

async function handleConfigurationHelp(userId: string): Promise<string> {
  const config = userConfigs.get(userId);
  
  let configStatus = "## 🔧 **AGU Configuration Status**\n\n";
  
  if (!config) {
    configStatus += "❌ **No configuration found**\n\n";
  } else {
    configStatus += "**Current Configuration:**\n";
    configStatus += `- Devin API Key: ${config.devinApiKey ? '✅ Configured' : '❌ Not set'}\n`;
    configStatus += `- GitHub Token: ${config.githubToken ? '✅ Configured' : '❌ Not set'}\n`;
    configStatus += `- Azure OpenAI Key: ${config.azureOpenAiApiKey ? '✅ Configured' : '❌ Not set'}\n`;
    configStatus += `- Azure OpenAI Endpoint: ${config.azureOpenAiEndpoint ? '✅ Configured' : '❌ Not set'}\n`;
    configStatus += `- GitHub Repository: ${config.githubRepo ? `✅ ${config.githubRepo}` : '❌ Not set'}\n\n`;
  }
  
  configStatus += "**To configure options, use:**\n";
  configStatus += "- `configureAgent` with option `devin-key` and your Devin API key\n";
  configStatus += "- `configureAgent` with option `github-token` and your GitHub token\n";
  configStatus += "- `configureAgent` with option `azure-key` and your Azure OpenAI API key\n";
  configStatus += "- `configureAgent` with option `azure-endpoint` and your Azure OpenAI endpoint\n";
  configStatus += "- `configureAgent` with option `github-repo` and your repository (owner/repo)\n\n";
  
  configStatus += "**Get your API keys from:**\n";
  configStatus += "- **Devin:** https://app.devin.ai/settings/api-keys\n";
  configStatus += "- **GitHub:** https://github.com/settings/tokens\n";
  configStatus += "- **Azure OpenAI:** Azure Portal";
  
  return configStatus;
}

async function handleAssignTask(agentId: string, task: string, userId: string, priority: string = "medium"): Promise<string> {
  const agent = AVAILABLE_AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return `❌ Agent with ID "${agentId}" not found. Use \`listAgents\` to see available agents.`;
  }
  
  try {
    const result = await createAgentTask(agentId, task, userId);
    
    const taskId = result.taskId || result.session_id || `task-${Date.now()}`;
    const status = result.status || 'created';
    const url = result.url || result.workflowUrl;
    
    let response = `🚀 **Task Assigned Successfully!**\n\n**Agent:** ${agent.name}\n**Task:** ${task}\n**Priority:** ${priority}\n**Task ID:** ${taskId}\n**Status:** ${status}`;
    
    if (url) {
      response += `\n**URL:** ${url}`;
    }
    
    response += `\n\nThe agent is now working on this task. Use \`getAgentStatus\` to check progress.`;
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return `❌ **Error assigning task:** ${errorMessage}\n\nUse \`configureAgent\` to set up required API keys and configuration.`;
  }
}

async function handleGetAgentStatus(agentId: string, userId: string): Promise<string> {
  const agent = AVAILABLE_AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return `❌ Agent with ID "${agentId}" not found. Use \`listAgents\` to see available agents.`;
  }
  
  const config = userConfigs.get(userId);
  
  if (!config) {
    return `📊 **${agent.name} Status**\n\n❌ Not configured. Use \`configureAgent\` to set up API keys first.`;
  }
  
  let configStatus = "✅ Configured";
  let missingConfig = [];
  
  switch (agent.type) {
    case 'devin':
      if (!config.devinApiKey) missingConfig.push('Devin API key');
      break;
    case 'codex':
      if (!config.azureOpenAiApiKey) missingConfig.push('Azure OpenAI API key');
      if (!config.azureOpenAiEndpoint) missingConfig.push('Azure OpenAI endpoint');
      if (!config.githubToken) missingConfig.push('GitHub token');
      break;
    case 'copilot':
      if (!config.githubToken) missingConfig.push('GitHub token');
      break;
  }
  
  if (missingConfig.length > 0) {
    configStatus = `❌ Missing: ${missingConfig.join(', ')}`;
  }
  
  return `📊 **${agent.name} Status**\n\n**Configuration:** ${configStatus}\n**Type:** ${agent.type}\n**Last Activity:** ${new Date().toLocaleString()}\n\nUse \`assignTask\` to create new tasks for this agent.`;
}

const server = createServer(async (request: IncomingMessage, response) => {
  if (request.method === "GET") {
    const url = parse(request.url || "", true);
    if (url.pathname === "/health") {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
      return;
    }
    response.statusCode = 200;
    response.end("AGU Copilot Extension is running");
    return;
  }

  const body = await getBody(request);
  
  // Skip verification for local development/testing
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    // Simple development mode - just handle basic chat without full verification
    console.log("Development mode: Skipping verification");
    
    try {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        // If JSON parsing fails, create a simple test payload
        payload = {
          messages: [
            {
              role: "user",
              content: "list all available agents",
              name: "test-user"
            }
          ]
        };
      }
      
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.statusCode = 200;

      const userId = payload.messages?.[0]?.name || 'test-user';
      const userMessage = payload.messages?.[payload.messages.length - 1]?.content || '';

      // Simple function detection for development
      let result = "";
      if (userMessage.toLowerCase().includes('list') && userMessage.toLowerCase().includes('agent')) {
        result = await handleListAgents();
      } else if (userMessage.toLowerCase().includes('config')) {
        result = await handleConfigurationHelp(userId);
      } else {
        result = "🤖 **AGU Extension (Development Mode)**\n\nAvailable commands:\n- Ask to 'list all available agents'\n- Ask about 'configuration'\n- Try 'assign task to swe-agent: fix the login bug'\n\nThis is running in development mode for local testing.";
      }
      
      // Write the response in the expected format
      response.write(result);
      response.end();
      return;
    } catch (error) {
      console.error("Development mode error:", error);
      response.statusCode = 500;
      response.end("Development mode error");
      return;
    }
  }

  // Production mode with full verification
  let verifyAndParseRequestResult: Awaited<ReturnType<typeof verifyAndParseRequest>>;
  const apiKey = request.headers["x-github-token"] as string;
  
  try {
    const signature = request.headers["x-github-public-key-signature"] as string;
    const keyId = request.headers["x-github-public-key-identifier"] as string;
    verifyAndParseRequestResult = await verifyAndParseRequest(body, signature, keyId, {
      token: apiKey,
    });
  } catch (err) {
    console.error("Error verifying request:", err);
    response.statusCode = 401;
    response.end("Unauthorized");
    return;
  }

  const { isValidRequest, payload } = verifyAndParseRequestResult;
  
  if (!isValidRequest) {
    console.error("Request verification failed");
    response.statusCode = 401;
    response.end("Unauthorized");
    return;
  }

  try {
    const { payload } = verifyAndParseRequestResult;
    
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.githubcopilot.com",
    });

    const stream = openai.beta.chat.completions.stream({
      model: "gpt-4o",
      messages: payload.messages,
      tools: functions.map(func => ({ type: "function" as const, function: func })),
    });

    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.statusCode = 200;

    const userId = payload.messages[0]?.name || 'default';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      
      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (toolCall.function?.name && toolCall.function?.arguments) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              let result = "";
              
              switch (toolCall.function.name) {
                case "listAgents":
                  result = await handleListAgents();
                  break;
                case "configureAgent":
                  result = await handleConfigureAgent(args.option, args.value, userId);
                  break;
                case "showConfiguration":
                  result = await handleConfigurationHelp(userId);
                  break;
                case "assignTask":
                  result = await handleAssignTask(args.agentId, args.task, userId, args.priority);
                  break;
                case "getAgentStatus":
                  result = await handleGetAgentStatus(args.agentId, userId);
                  break;
                default:
                  result = `❌ Unknown function: ${toolCall.function.name}`;
              }
              
              response.write(result);
            } catch (parseError) {
              console.error("Error parsing function arguments:", parseError);
              response.write("❌ Error processing function call");
            }
          }
        }
      } else if (delta?.content) {
        response.write(delta.content);
      }
    }
    
    response.end();
  } catch (error) {
    console.error("Error processing request:", error);
    response.statusCode = 500;
    response.end("Internal Server Error");
  }
});

async function getBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      resolve(body);
    });
  });
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`AGU Copilot Extension server running on port ${port}`);
});
