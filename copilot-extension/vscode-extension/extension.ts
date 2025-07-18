import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('AGU Copilot Extension is now active!');

    let listAgentsCommand = vscode.commands.registerCommand('agu.listAgents', () => {
        vscode.window.showInformationMessage('AGU Agents: SWE Agent, SRE Agent, QA Agent, DevOps Agent');
    });

    let selectAgentCommand = vscode.commands.registerCommand('agu.selectAgent', async () => {
        const agents = ['SWE Agent', 'SRE Agent', 'QA Agent', 'DevOps Agent'];
        const selected = await vscode.window.showQuickPick(agents, {
            placeHolder: 'Select an AGU agent'
        });
        
        if (selected) {
            vscode.window.showInformationMessage(`Selected: ${selected}`);
        }
    });

    let assignTaskCommand = vscode.commands.registerCommand('agu.assignTask', async () => {
        const task = await vscode.window.showInputBox({
            placeHolder: 'Enter task description',
            prompt: 'What task would you like to assign to the agent?'
        });
        
        if (task) {
            vscode.window.showInformationMessage(`Task assigned: ${task}`);
        }
    });

    context.subscriptions.push(listAgentsCommand, selectAgentCommand, assignTaskCommand);

    const participant = vscode.chat.createChatParticipant('agu', handleChatRequest);
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
    
    context.subscriptions.push(participant);
}

async function handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    const prompt = request.prompt.toLowerCase();
    const userId = 'vscode-user'; // VSCode extension user identifier
    
    try {
        if (prompt.includes('config') || prompt.includes('configure')) {
            stream.markdown('🔧 **AGU Configuration**\n\n');
            stream.markdown('To configure AGU agents, you need to set up API keys:\n\n');
            stream.markdown('**Required Configuration:**\n');
            stream.markdown('- **Devin API Key** - For Software Engineering Agent\n');
            stream.markdown('- **GitHub Token** - For repository access\n');
            stream.markdown('- **Azure OpenAI Key & Endpoint** - For Codex agents\n\n');
            stream.markdown('**Get your API keys from:**\n');
            stream.markdown('- Devin: https://app.devin.ai/settings/api-keys\n');
            stream.markdown('- GitHub: https://github.com/settings/tokens\n');
            stream.markdown('- Azure OpenAI: Azure Portal\n\n');
            stream.markdown('Use the AGU backend API or GitHub Copilot Chat to configure these settings.');
            
        } else if (prompt.includes('list') && prompt.includes('agent')) {
            stream.markdown('## 🤖 Available AGU Agents\n\n');
            stream.markdown('- **Software Engineering Agent** (`swe-agent`)\n');
            stream.markdown('  - Code reviews, bug fixes, feature development\n');
            stream.markdown('  - Uses Devin API for advanced coding tasks\n\n');
            stream.markdown('- **Site Reliability Engineering Agent** (`sre-agent`)\n');
            stream.markdown('  - Infrastructure, monitoring, deployments\n');
            stream.markdown('  - Uses Codex CLI for automation tasks\n\n');
            stream.markdown('- **Quality Assurance Agent** (`qa-agent`)\n');
            stream.markdown('  - Testing, validation, quality checks\n');
            stream.markdown('  - Uses GitHub Copilot for test generation\n\n');
            stream.markdown('- **DevOps Agent** (`devops-agent`)\n');
            stream.markdown('  - CI/CD pipelines, automation, tooling\n');
            stream.markdown('  - Uses Codex CLI for pipeline management\n\n');
            stream.markdown('Use `@agu assign task to AGENT_ID: DESCRIPTION` to assign tasks.');
            
        } else if (prompt.includes('assign') && prompt.includes('task')) {
            const taskMatch = prompt.match(/assign.*task.*?to\s+(\S+):\s*(.+)/i);
            if (taskMatch) {
                const [, agentId, taskDescription] = taskMatch;
                stream.markdown('🚀 **Task Assignment Request**\n\n');
                stream.markdown(`**Agent:** ${agentId}\n`);
                stream.markdown(`**Task:** ${taskDescription}\n\n`);
                stream.markdown('⚠️ **Configuration Required**\n');
                stream.markdown('To actually assign tasks, please configure your API keys first using `@agu config`.\n\n');
                stream.markdown('Once configured, tasks will be automatically assigned to the selected agent and you\'ll receive a task ID for tracking progress.');
            } else {
                stream.markdown('📋 **Task Assignment Format**\n\n');
                stream.markdown('To assign a task, use this format:\n');
                stream.markdown('`@agu assign task to AGENT_ID: TASK_DESCRIPTION`\n\n');
                stream.markdown('**Examples:**\n');
                stream.markdown('- `@agu assign task to swe-agent: review authentication code`\n');
                stream.markdown('- `@agu assign task to devops-agent: set up CI pipeline`\n');
                stream.markdown('- `@agu assign task to qa-agent: create unit tests for user service`\n');
            }
            
        } else if (prompt.includes('status')) {
            stream.markdown('📊 **AGU Agent Status**\n\n');
            stream.markdown('**Configuration Status:** ❌ Not configured\n');
            stream.markdown('**Available Agents:** 4 (SWE, SRE, QA, DevOps)\n');
            stream.markdown('**Active Tasks:** 0\n\n');
            stream.markdown('Use `@agu config` to set up API keys and start using agents.\n');
            stream.markdown('Use `@agu list agents` to see available agents.');
            
        } else if (prompt.includes('help')) {
            stream.markdown('📚 **AGU Copilot Extension Help**\n\n');
            stream.markdown('**Available Commands:**\n');
            stream.markdown('- `@agu config` - Configure API keys\n');
            stream.markdown('- `@agu list agents` - Show available agents\n');
            stream.markdown('- `@agu assign task to AGENT_ID: DESCRIPTION` - Assign a task\n');
            stream.markdown('- `@agu status` - Check agent status\n');
            stream.markdown('- `@agu help` - Show this help message\n\n');
            stream.markdown('**Agent IDs:**\n');
            stream.markdown('- `swe-agent` - Software Engineering\n');
            stream.markdown('- `sre-agent` - Site Reliability Engineering\n');
            stream.markdown('- `qa-agent` - Quality Assurance\n');
            stream.markdown('- `devops-agent` - DevOps\n');
            
        } else {
            stream.markdown('👋 **Welcome to AGU Copilot Extension!**\n\n');
            stream.markdown('Agent unblock (AGU) helps you interact with background agents directly from GitHub Copilot.\n\n');
            stream.markdown('**Quick Start:**\n');
            stream.markdown('1. `@agu config` - Set up your API keys\n');
            stream.markdown('2. `@agu list agents` - See available agents\n');
            stream.markdown('3. `@agu assign task to swe-agent: review my code` - Assign tasks\n\n');
            stream.markdown('**Need help?** Use `@agu help` for detailed commands.');
        }
        
    } catch (error) {
        stream.markdown('❌ **Error**\n\n');
        stream.markdown(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`);
        stream.markdown('Please try again or use `@agu help` for available commands.');
    }
    
    return { metadata: { command: 'agu' } };
}

export function deactivate() {}
