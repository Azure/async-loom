# AgUnblock Extensions

This directory contains two different types of GitHub Copilot extensions for AgUnblock:

## 1. VS Code Extension (AgUnblock GitHub Copilot Extension)

Enhance your development workflow with background AI agents that integrate seamlessly with GitHub Copilot in Visual Studio Code.

### Features

- **Background Agent Integration**: Run AI agents in the background while you code
- **GitHub Copilot Enhancement**: Augment GitHub Copilot with additional AI capabilities
- **Multiple Agent Types**: Support for Codex, GitHub Copilot, Devin, and Replit agents
- **Automatic Code Analysis**: Continuous monitoring and optimization suggestions
- **Workflow Automation**: Streamline development tasks with intelligent automation

### Installation

#### Option 1: Install from VSIX (Recommended)

1. **Download** the extension package from AgUnblock
2. **Open Visual Studio Code**
3. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
4. **Type** "Extensions: Install from VSIX..."
5. **Select** the downloaded `.vsix` file
6. **Restart** VS Code when prompted

#### Option 2: Manual Installation

1. **Extract** the downloaded zip file
2. **Copy** the extension folder to your VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **macOS**: `~/.vscode/extensions/`
   - **Linux**: `~/.vscode/extensions/`
3. **Restart** Visual Studio Code

### Configuration

#### Initial Setup

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type** "AgUnblock: Configure Agent Settings"
3. **Select your preferred agent type**:
   - **GitHub Copilot**: Enhanced code assistance with background processing
   - **Codex**: OpenAI Codex for advanced code generation
   - **Devin**: Autonomous software engineer capabilities
   - **Replit Agent**: Cloud-based development assistance
4. **Enter your AgUnblock API key** when prompted
5. **Choose auto-start preference**

#### Settings

Configure the extension through VS Code settings:

```json
{
  "agunblock.apiKey": "your-api-key-here",
  "agunblock.agentType": "copilot",
  "agunblock.autoStart": false
}
```

### Usage

#### Starting the Agent

1. **Click** the AgUnblock status bar item (bottom right)
2. **Or use Command Palette**: "AgUnblock: Start Background Agent"
3. **Monitor status** via the status bar indicator

#### Available Commands

- `AgUnblock: Start Background Agent` - Activate the background agent
- `AgUnblock: Configure Agent Settings` - Modify agent configuration
- `AgUnblock: View Agent Status` - Display detailed status information

#### Status Indicators

- 🤖 **AgUnblock: Inactive** - Agent not running
- ⏳ **AgUnblock: Starting...** - Agent initialization in progress
- ✅ **AgUnblock: Active** - Agent running and monitoring
- ❌ **AgUnblock: Error** - Agent encountered an issue

## 2. GitHub Copilot Chat Extension (AGU Copilot Extension)

A GitHub Copilot extension that allows users to interact with AGU (Agent Unblock) agents directly from Copilot Chat using the `@agu` command.

### Features

- **Agent Discovery**: List all available AGU agents with their capabilities
- **Agent Selection**: Select specific agents for task assignment
- **Task Assignment**: Assign tasks to agents with priority levels
- **Status Monitoring**: Check agent status and activity

### Available Agents

- **Software Engineering Agent**: Handles code reviews, bug fixes, and development tasks
- **Site Reliability Engineering Agent**: Manages infrastructure, monitoring, and deployment
- **Quality Assurance Agent**: Performs testing, validation, and quality checks
- **DevOps Agent**: Handles CI/CD pipelines, automation, and tooling

### Usage in Copilot Chat

1. **List available agents**:
   ```
   @agu list all available agents
   ```

2. **Select an agent**:
   ```
   @agu select the SWE agent
   ```

3. **Assign a task**:
   ```
   @agu assign a high priority task to review the authentication code
   ```

4. **Check agent status**:
   ```
   @agu what's the status of the SRE agent?
   ```

### Development

#### Prerequisites

- Node.js 18+
- npm or yarn

#### Setup

```bash
cd copilot-extension
npm install
npm run build
```

#### Running locally

```bash
npm run dev
```

The extension will be available at `http://localhost:3000`.

#### Building for production

```bash
npm run build
npm start
```

### GitHub App Configuration

To use this extension, you need to:

1. Create a GitHub App with Copilot Extension permissions
2. Configure the app's webhook URL to point to your deployed extension
3. Install the app in your organization or repositories

### Environment Variables

- `PORT`: Server port (default: 3000)
- `GITHUB_APP_ID`: Your GitHub App ID
- `GITHUB_PRIVATE_KEY`: Your GitHub App private key

## API Key Setup

To use the AgUnblock extensions, you need an API key:

1. **Visit** [AgUnblock Platform](https://agunblock.com)
2. **Sign up** for an account
3. **Generate** an API key from your dashboard
4. **Configure** the extension with your API key

## Requirements

- **Visual Studio Code** 1.74.0 or higher (for VS Code extension)
- **GitHub Copilot subscription** (for Chat extension)
- **Internet connection** for agent communication
- **AgUnblock API key** (free tier available)

## Privacy & Security

- **Local processing**: Code analysis happens locally when possible
- **Secure transmission**: All API communications use HTTPS
- **No code storage**: Your code is not stored on AgUnblock servers
- **Configurable privacy**: Control what data is shared with agents

## License

MIT

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

**Enhance your coding experience with AI-powered background agents!**

For more information, visit [AgUnblock.com](https://agunblock.com)
