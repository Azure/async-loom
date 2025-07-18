const vscode = require('vscode');

let agentStatusBarItem;
let agentProcess = null;

function activate(context) {
    console.log('AgUnblock GitHub Copilot Extension is now active!');

    agentStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    agentStatusBarItem.text = "$(robot) AgUnblock: Inactive";
    agentStatusBarItem.tooltip = "Click to configure AgUnblock background agent";
    agentStatusBarItem.command = 'agunblock.configureAgent';
    agentStatusBarItem.show();

    const startAgentCommand = vscode.commands.registerCommand('agunblock.startAgent', async () => {
        const config = vscode.workspace.getConfiguration('agunblock');
        const apiKey = config.get('apiKey');
        const agentType = config.get('agentType');

        if (!apiKey) {
            const result = await vscode.window.showInputBox({
                prompt: 'Enter your AgUnblock API key',
                password: true,
                placeHolder: 'API key required for background agent functionality'
            });
            
            if (result) {
                await config.update('apiKey', result, vscode.ConfigurationTarget.Global);
            } else {
                vscode.window.showWarningMessage('API key is required to start background agent');
                return;
            }
        }

        try {
            agentStatusBarItem.text = "$(loading~spin) AgUnblock: Starting...";
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            agentStatusBarItem.text = `$(check) AgUnblock: Active (${agentType})`;
            agentStatusBarItem.tooltip = `Background agent (${agentType}) is running. Click to view status.`;
            agentStatusBarItem.command = 'agunblock.viewAgentStatus';
            
            vscode.window.showInformationMessage(`AgUnblock background agent (${agentType}) started successfully!`);
            
            startBackgroundTasks();
            
        } catch (error) {
            agentStatusBarItem.text = "$(error) AgUnblock: Error";
            vscode.window.showErrorMessage(`Failed to start background agent: ${error.message}`);
        }
    });

    const configureAgentCommand = vscode.commands.registerCommand('agunblock.configureAgent', async () => {
        const config = vscode.workspace.getConfiguration('agunblock');
        
        const agentType = await vscode.window.showQuickPick([
            { label: 'GitHub Copilot', value: 'copilot', description: 'Enhanced code assistance with background processing' },
            { label: 'Codex', value: 'codex', description: 'OpenAI Codex for code generation' },
            { label: 'Devin', value: 'devin', description: 'Autonomous software engineer' },
            { label: 'Replit Agent', value: 'replit', description: 'Cloud-based development assistant' }
        ], {
            placeHolder: 'Select background agent type',
            title: 'Configure AgUnblock Agent'
        });

        if (agentType) {
            await config.update('agentType', agentType.value, vscode.ConfigurationTarget.Global);
            
            const autoStart = await vscode.window.showQuickPick([
                { label: 'Yes', value: true },
                { label: 'No', value: false }
            ], {
                placeHolder: 'Auto-start agent on VS Code startup?'
            });

            if (autoStart) {
                await config.update('autoStart', autoStart.value, vscode.ConfigurationTarget.Global);
            }

            vscode.window.showInformationMessage(`Agent configured: ${agentType.label}`);
            agentStatusBarItem.text = `$(robot) AgUnblock: ${agentType.label}`;
        }
    });

    const viewStatusCommand = vscode.commands.registerCommand('agunblock.viewAgentStatus', () => {
        const config = vscode.workspace.getConfiguration('agunblock');
        const agentType = config.get('agentType');
        const autoStart = config.get('autoStart');
        
        const panel = vscode.window.createWebviewPanel(
            'agentStatus',
            'AgUnblock Agent Status',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getStatusWebviewContent(agentType, autoStart);
    });

    context.subscriptions.push(startAgentCommand, configureAgentCommand, viewStatusCommand, agentStatusBarItem);

    const config = vscode.workspace.getConfiguration('agunblock');
    if (config.get('autoStart')) {
        vscode.commands.executeCommand('agunblock.startAgent');
    }
}

function startBackgroundTasks() {
    const interval = setInterval(() => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'javascript' || document.languageId === 'typescript' || document.languageId === 'python') {
                console.log('AgUnblock: Analyzing code in background...');
            }
        }
    }, 30000);

    return interval;
}

function getStatusWebviewContent(agentType, autoStart) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgUnblock Agent Status</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }
        .status-card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .status-active {
            border-left: 4px solid var(--vscode-charts-green);
        }
        .status-inactive {
            border-left: 4px solid var(--vscode-charts-red);
        }
        h2 {
            margin-top: 0;
            color: var(--vscode-titleBar-activeForeground);
        }
        .config-item {
            margin: 8px 0;
        }
        .config-label {
            font-weight: bold;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <h2>🤖 AgUnblock Agent Status</h2>
    
    <div class="status-card status-active">
        <h3>Agent Configuration</h3>
        <div class="config-item">
            <span class="config-label">Agent Type:</span> ${agentType || 'Not configured'}
        </div>
        <div class="config-item">
            <span class="config-label">Auto-start:</span> ${autoStart ? 'Enabled' : 'Disabled'}
        </div>
        <div class="config-item">
            <span class="config-label">Status:</span> Active and monitoring
        </div>
    </div>

    <div class="status-card">
        <h3>Background Tasks</h3>
        <ul>
            <li>Code analysis: Running</li>
            <li>GitHub Copilot integration: Active</li>
            <li>Workflow optimization: Monitoring</li>
            <li>Agent communication: Connected</li>
        </ul>
    </div>

    <div class="status-card">
        <h3>Recent Activity</h3>
        <ul>
            <li>Extension activated successfully</li>
            <li>Background agent started</li>
            <li>Monitoring active editor for code changes</li>
            <li>Ready to assist with development tasks</li>
        </ul>
    </div>
</body>
</html>`;
}

function deactivate() {
    if (agentProcess) {
        agentProcess.kill();
    }
    if (agentStatusBarItem) {
        agentStatusBarItem.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};
