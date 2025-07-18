from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg
import requests
import base64
import json
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class WorkflowRequest(BaseModel):
    repo_name: str
    github_token: str
    task: str
    agent_type: str = "codex"

class SecretsRequest(BaseModel):
    repo_name: str
    github_token: str
    secrets: Dict[str, str]

class TriggerWorkflowRequest(BaseModel):
    repo_name: str
    github_token: str
    task: str

CODEX_WORKFLOW_TEMPLATE = """name: Codex CLI Agent
on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task description'
        required: true
        type: string

jobs:
  codex_refactor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Codex agent
        run: |
          npm install -g @openai/codex
          export AZURE_OPENAI_API_KEY=${{ secrets.AZURE_OPENAI_API_KEY }}
          export OPENAI_API_KEY=${{ secrets.AZURE_OPENAI_API_KEY }}
          codex -p azure "${{ github.event.inputs.task }}"
"""

GITHUB_COPILOT_WORKFLOW_TEMPLATE = """name: GitHub Copilot Agent
on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task description'
        required: true
        type: string

jobs:
  copilot_task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install GitHub Copilot CLI
        run: |
          npm install -g @githubnext/github-copilot-cli
      - name: Run GitHub Copilot task
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "Running GitHub Copilot with task: ${{ github.event.inputs.task }}"
          github-copilot-cli "${{ github.event.inputs.task }}"
"""

DEVIN_WORKFLOW_TEMPLATE = """name: Devin Agent
on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task description'
        required: true
        type: string

jobs:
  devin_task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Run Devin agent
        env:
          DEVIN_API_KEY: ${{ secrets.DEVIN_API_KEY }}
        run: |
          echo "Running Devin with task: ${{ github.event.inputs.task }}"
          curl -X POST "https://api.devin.ai/v1/sessions" \
            -H "Authorization: Bearer $DEVIN_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"task\": \"${{ github.event.inputs.task }}\", \"repo_url\": \"${{ github.server_url }}/${{ github.repository }}\"}"
"""

REPLIT_WORKFLOW_TEMPLATE = """name: Replit Agent
on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task description'
        required: true
        type: string

jobs:
  replit_task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Run Replit Agent
        env:
          REPLIT_TOKEN: ${{ secrets.REPLIT_TOKEN }}
        run: |
          echo "Running Replit Agent with task: ${{ github.event.inputs.task }}"
          npx @replit/agent-cli run --task "${{ github.event.inputs.task }}" --token "$REPLIT_TOKEN"
"""

cards_data = [
    {
        "id": 1,
        "title": "SDLC Agents on Azure",
        "description": "Minimize software engineer bottlenecks in Software Development Lifecycle (SDLC). Configure repositories for SWE, SRE and other agents, compounding software development time with async development.",
        "url": "https://gitagu.com",
        "category": "Repository Configuration",
        "features": [
            "AI-powered repository analysis",
            "Custom agent configuration",
            "SDLC workflow optimization",
            "Automated code reviews"
        ],
        "video_placeholder": "/videos/gitagu-asyncloom.gif",
        "icon": "GitBranch"
    },
    {
        "id": 5,
        "title": "Azure AI Foundry Agent Catalog",
        "description": "Reduce solution engineer bottlenecks by customizing Azure AI Foundry Agent Service Catalog of agents for your customer scenario using Agents.",
        "url": "https://aifoundry.app",
        "category": "Solution Templates",
        "features": [
            "Customizable solution templates",
            "Customer scenario modeling",
            "SWE Agent integration",
            "Rapid prototyping tools"
        ],
        "video_placeholder": "/videos/foundry-asyncloom.gif",
        "icon": "Template"
    },
    {
        "id": 2,
        "title": "Teams App",
        "description": "Downloadable Microsoft Teams app with Devin integration for GitHub workflow automation. Includes local testing environment and complete setup instructions.",
        "url": "#teams-integration",
        "category": "Collaboration",
        "features": [
            "Downloadable Teams app package",
            "GitHub workflow automation via Teams",
            "Local testing environment",
            "Adaptive card interfaces",
            "Bot Framework integration",
            "Complete setup documentation"
        ],
        "video_placeholder": "/videos/teams-async.gif",
        "icon": "Users",
        "buttons": [
            {
                "label": "Manual Install",
                "url": "#manual-install-teams",
                "variant": "default"
            },
            {
                "label": "Install in Teams",
                "url": "https://teams.microsoft.com/l/app/",
                "variant": "outline"
            }
        ]
    },
    {
        "id": 3,
        "title": "GitHub Actions",
        "description": "Configure agents as part of your CI/CD pipeline with GitHub Actions workflow integration.",
        "url": "https://github.com/marketplace?type=actions",
        "category": "CI/CD",
        "features": [
            "GitHub Actions integration",
            "Automated CI/CD workflows",
            "Agent-powered testing",
            "Deployment automation"
        ],
        "video_placeholder": "/videos/actions-asyncloom.gif",
        "icon": "Workflow",
        "buttons": [
            {
                "label": "Explore on Github actions workflows page",
                "url": "https://github.com/marketplace?type=actions",
                "variant": "outline"
            },
            {
                "label": "Configure GitHub Actions",
                "url": "#configure-actions",
                "variant": "default"
            }
        ],
        "modal": {
            "title": "Configure GitHub Actions with AI Agents",
            "content": "Select an AI agent and configure your GitHub Actions workflow:\n\n🤖 **Available Agents:**\n• Codex - OpenAI's code generation model\n• GitHub Copilot Coding Agent - Enhanced code assistance\n• Devin - Autonomous software engineer\n• Replit Agent - Cloud-based development assistant\n\n📝 **Setup Instructions:**\n\n1. **Choose your agent** from the dropdown below\n2. **Describe your task** (e.g., 'refactor authentication module')\n3. **Add secrets** to your GitHub repository:\n   - Go to Settings → Secrets and variables → Actions\n   - Add required API keys (shown below based on your agent choice)\n4. **Copy the generated workflow** to `.github/workflows/agent-workflow.yml`\n\n🔐 **Required Secrets:**\n• AZURE_OPENAI_API_KEY (for Codex)\n• OPENAI_API_KEY (for GitHub Copilot)\n• DEVIN_API_KEY (for Devin)\n• REPLIT_TOKEN (for Replit Agent)\n\n⚡ **Example Workflow:**\n```yaml\nname: AI Agent Workflow\non: [push, pull_request]\njobs:\n  agent_task:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run AI Agent\n        run: |\n          # Agent-specific commands will be generated\n          echo \"Running selected agent...\"\n```"
        }
    },
    {
        "id": 4,
        "title": "AGU Copilot Extension",
        "description": "Use @agu in GitHub Copilot to select and unblock agents directly from your IDE. Agent unblock (AGU) seamlessly integrates background agents into your development workflow.",
        "url": "#copilot-extension",
        "category": "Background Agents",
        "features": [
            "Agent selection with @agu command",
            "Task assignment from Copilot Chat",
            "Real-time agent status monitoring",
            "Seamless IDE integration",
            "Support for SWE, SRE, QA, and DevOps agents"
        ],
        "video_placeholder": "/videos/copilot-asyncloom.gif",
        "icon": "Bot",
        "buttons": [
            {
                "label": "Download Extension",
                "action": "open_modal",
                "variant": "default"
            },
            {
                "label": "Install in VSCode",
                "url": "vscode:extension/agu.copilot-extension",
                "variant": "outline"
            }
        ],
        "modal": {
            "title": "Download AgUnblock GitHub Copilot Extension",
            "content": "Enhance your GitHub Copilot experience with background AI agents:\n\n### 🚀 **Quick Download & Install**\n\n1. **Download** the extension package using the button below\n2. **Extract** the downloaded zip file\n3. **Open Visual Studio Code**\n4. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)\n5. **Type** \"Extensions: Install from VSIX...\"\n6. **Navigate** to the extracted folder and select the extension files\n7. **Restart** VS Code when prompted\n\n### ⚙️ **First-Time Setup**\n\n1. **Open Command Palette** (`Ctrl+Shift+P`)\n2. **Type** \"AgUnblock: Configure Agent Settings\"\n3. **Enter your AgUnblock API key** (get one at https://agunblock.com)\n4. **Select your preferred agent type**:\n   - GitHub Copilot (Enhanced)\n   - Codex (OpenAI)\n   - Devin (Autonomous)\n   - Replit Agent (Cloud)\n5. **Start the background agent** with \"AgUnblock: Start Background Agent\"\n\n### ✨ **Features**\n\n- **Background Code Analysis** - Continuous monitoring and optimization\n- **Enhanced GitHub Copilot** - Augmented with additional AI capabilities\n- **Workflow Automation** - Streamline development tasks\n- **Multi-Agent Support** - Choose from various AI agents\n\n### 📋 **Requirements**\n\n- Visual Studio Code 1.74.0+\n- AgUnblock API key (free tier available)\n- Internet connection for agent communication\n\n### 💡 **Need Help?**\n\n- **Documentation**: https://docs.agunblock.com\n- **Support**: https://agunblock.com/support\n- **API Keys**: https://agunblock.com/dashboard\n\nThe downloaded package includes detailed installation instructions and troubleshooting guide."
        }
    },
    {
        "id": 6,
        "title": "M365 Copilot Extension",
        "description": "Invoke and work with SWE agents directly from Microsoft 365 Copilot for seamless productivity and development workflows.",
        "url": "#m365-copilot-extension",
        "category": "Microsoft 365",
        "features": [
            "Microsoft 365 Copilot integration",
            "SWE agent invocation from Office apps",
            "Cross-platform productivity workflows",
            "Seamless document and code collaboration"
        ],
        "video_placeholder": "/videos/m365-asyncloom.gif",
        "icon": "Bot"
    }
]

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/cards")
async def get_cards() -> List[Dict[str, Any]]:
    """Get all integration cards data"""
    return cards_data

@app.get("/api/cards/{card_id}")
async def get_card(card_id: int) -> Dict[str, Any]:
    """Get specific card data by ID"""
    card = next((card for card in cards_data if card["id"] == card_id), None)
    if not card:
        return {"error": "Card not found"}
    return card

@app.get("/api/categories")
async def get_categories() -> List[str]:
    """Get all unique categories"""
    categories = list(set(card["category"] for card in cards_data))
    return sorted(categories)

@app.post("/api/github/workflows")
async def create_workflow(request: WorkflowRequest):
    try:
        headers = {
            "Authorization": f"token {request.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        workflow_templates = {
            "codex": CODEX_WORKFLOW_TEMPLATE,
            "github_copilot": GITHUB_COPILOT_WORKFLOW_TEMPLATE,
            "devin": DEVIN_WORKFLOW_TEMPLATE,
            "replit": REPLIT_WORKFLOW_TEMPLATE
        }
        
        if request.agent_type not in workflow_templates:
            raise HTTPException(status_code=400, detail=f"Invalid agent type: {request.agent_type}")
        
        workflow_template = workflow_templates[request.agent_type]
        workflow_content = base64.b64encode(workflow_template.encode()).decode()
        
        agent_names = {
            "codex": "Codex CLI",
            "github_copilot": "GitHub Copilot",
            "devin": "Devin",
            "replit": "Replit Agent"
        }
        
        agent_name = agent_names[request.agent_type]
        filename = f"{request.agent_type.replace('_', '-')}-workflow.yml"
        
        data = {
            "message": f"Add {agent_name} workflow",
            "content": workflow_content,
            "branch": "main"
        }
        
        url = f"https://api.github.com/repos/{request.repo_name}/contents/.github/workflows/{filename}"
        response = requests.put(url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            return {
                "status": "success",
                "workflow_url": f"https://github.com/{request.repo_name}/actions/workflows/{filename}",
                "message": f"{agent_name} workflow created successfully"
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to create workflow: {response.text}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/github/secrets")
async def manage_secrets(request: SecretsRequest):
    try:
        headers = {
            "Authorization": f"token {request.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        repo_url = f"https://api.github.com/repos/{request.repo_name}"
        repo_response = requests.get(repo_url, headers=headers)
        
        if repo_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Repository not found or access denied")
        
        public_key_url = f"https://api.github.com/repos/{request.repo_name}/actions/secrets/public-key"
        key_response = requests.get(public_key_url, headers=headers)
        
        if key_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get repository public key")
        
        public_key_data = key_response.json()
        
        results = {}
        for secret_name, secret_value in request.secrets.items():
            try:
                from cryptography.hazmat.primitives import serialization, hashes
                from cryptography.hazmat.primitives.asymmetric import padding, rsa
                
                public_key_bytes = base64.b64decode(public_key_data["key"])
                public_key = serialization.load_der_public_key(public_key_bytes)
                
                if isinstance(public_key, rsa.RSAPublicKey):
                    encrypted_value = public_key.encrypt(
                        secret_value.encode(),
                        padding.OAEP(
                            mgf=padding.MGF1(algorithm=hashes.SHA256()),
                            algorithm=hashes.SHA256(),
                            label=None
                        )
                    )
                else:
                    raise ValueError("Unsupported key type for encryption")
                
                encrypted_value_b64 = base64.b64encode(encrypted_value).decode()
                
                secret_data = {
                    "encrypted_value": encrypted_value_b64,
                    "key_id": public_key_data["key_id"]
                }
                
                secret_url = f"https://api.github.com/repos/{request.repo_name}/actions/secrets/{secret_name}"
                secret_response = requests.put(secret_url, headers=headers, json=secret_data)
                
                if secret_response.status_code in [201, 204]:
                    results[secret_name] = "success"
                else:
                    results[secret_name] = f"failed: {secret_response.text}"
                    
            except ImportError:
                results[secret_name] = "failed: cryptography library not available"
            except Exception as e:
                results[secret_name] = f"failed: {str(e)}"
        
        return {"status": "completed", "results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/github/runs/{run_id}")
async def get_workflow_run(run_id: str, github_token: str):
    try:
        headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        url = f"https://api.github.com/repos/runs/{run_id}"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            run_data = response.json()
            return {
                "status": run_data.get("status", "unknown"),
                "conclusion": run_data.get("conclusion"),
                "progress": f"Run {run_data.get('status', 'unknown')}",
                "logs": f"Workflow run: {run_data.get('html_url', 'N/A')}"
            }
        else:
            return {
                "status": "not_found",
                "progress": "Run not found or access denied"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/github/trigger-workflow")
async def trigger_workflow(request: TriggerWorkflowRequest):
    try:
        headers = {
            "Authorization": f"token {request.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        data = {
            "ref": "main",
            "inputs": {
                "task": request.task
            }
        }
        
        url = f"https://api.github.com/repos/{request.repo_name}/actions/workflows/codex-cli.yml/dispatches"
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 204:
            return {
                "status": "triggered",
                "run_id": f"triggered-{request.repo_name}-{request.task[:20]}",
                "message": "Workflow dispatch successful"
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to trigger workflow: {response.text}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/teams/build")
async def build_teams_app():
    """Build the teams-v2-sdk application"""
    try:
        import subprocess
        import os
        
        teams_sdk_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "teams-v2-sdk")
        
        if not os.path.exists(teams_sdk_path):
            raise HTTPException(status_code=404, detail="Teams SDK not found")
        
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=teams_sdk_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            return {
                "status": "success",
                "message": "Teams app built successfully",
                "output": result.stdout
            }
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Build failed: {result.stderr}"
            )
            
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Build timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/teams/package")
async def package_teams_app():
    """Package the Teams app as a zip file for download"""
    try:
        import subprocess
        import os
        import tempfile
        import shutil
        
        teams_sdk_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "teams-v2-sdk")
        app_package_path = os.path.join(teams_sdk_path, "appPackage")
        
        if not os.path.exists(app_package_path):
            raise HTTPException(status_code=404, detail="Teams app package not found")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            package_dir = os.path.join(temp_dir, "teams-app-package")
            os.makedirs(package_dir)
            
            manifest_path = os.path.join(app_package_path, "manifest.json")
            color_icon_path = os.path.join(app_package_path, "color.png")
            outline_icon_path = os.path.join(app_package_path, "outline.png")
            
            if os.path.exists(manifest_path):
                shutil.copy2(manifest_path, package_dir)
            if os.path.exists(color_icon_path):
                shutil.copy2(color_icon_path, package_dir)
            if os.path.exists(outline_icon_path):
                shutil.copy2(outline_icon_path, package_dir)
            
            readme_content = """# Teams App Package


1. **Azure Bot Registration**:
   - Go to Azure Portal and create a new Azure Bot resource
   - Note the Bot ID and App Password
   - Set messaging endpoint to your deployed bot URL

2. **Environment Configuration**:
   Create a .env file with:
   ```
   BOT_ID=your-bot-id-from-azure
   BOT_PASSWORD=your-bot-password-from-azure
   DEVIN_API_KEY=your-devin-api-key
   GITHUB_TOKEN=your-github-token
   ```

3. **Update Manifest**:
   - Replace ${{BOT_ID}} with your actual Bot ID
   - Replace ${{TEAMS_APP_ID}} with a unique app ID
   - Update validDomains with your bot domain

4. **Install in Teams**:
   - Zip the manifest.json and icon files
   - Upload to Teams via Apps → Manage your apps → Upload an app

For more details, see the full documentation.
"""
            
            readme_path = os.path.join(package_dir, "README.md")
            with open(readme_path, "w") as f:
                f.write(readme_content)
            
            zip_path = os.path.join(temp_dir, "devin-teams-app.zip")
            shutil.make_archive(zip_path[:-4], 'zip', package_dir)
            
            permanent_zip_path = os.path.join(teams_sdk_path, "devin-teams-app.zip")
            shutil.move(zip_path, permanent_zip_path)
            
            return {
                "status": "success",
                "message": "Teams app packaged successfully",
                "package_path": permanent_zip_path
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/teams/download")
async def download_teams_app():
    """Serve the packaged Teams app for download"""
    try:
        import os
        from fastapi.responses import FileResponse
        
        teams_sdk_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "teams-v2-sdk")
        zip_path = os.path.join(teams_sdk_path, "devin-teams-app.zip")
        
        if not os.path.exists(zip_path):
            await package_teams_app()
        
        if os.path.exists(zip_path):
            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename="devin-teams-app.zip"
            )
        else:
            raise HTTPException(status_code=404, detail="Teams app package not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

teams_app_process = None

@app.post("/api/teams/start")
async def start_teams_app():
    """Start the teams-v2-sdk locally for testing"""
    global teams_app_process
    try:
        import subprocess
        import os
        
        if teams_app_process and teams_app_process.poll() is None:
            return {
                "status": "already_running",
                "message": "Teams app is already running",
                "port": 3978
            }
        
        teams_sdk_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "teams-v2-sdk")
        
        if not os.path.exists(teams_sdk_path):
            raise HTTPException(status_code=404, detail="Teams SDK not found")
        
        teams_app_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=teams_sdk_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        return {
            "status": "started",
            "message": "Teams app started successfully",
            "port": 3978,
            "devtools_url": "http://localhost:3979/devtools",
            "process_id": teams_app_process.pid
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/teams/stop")
async def stop_teams_app():
    """Stop the locally running teams-v2-sdk"""
    global teams_app_process
    try:
        import subprocess
        
        if teams_app_process and teams_app_process.poll() is None:
            teams_app_process.terminate()
            teams_app_process.wait(timeout=10)
            teams_app_process = None
            return {
                "status": "stopped",
                "message": "Teams app stopped successfully"
            }
        else:
            return {
                "status": "not_running",
                "message": "Teams app was not running"
            }
            
    except subprocess.TimeoutExpired:
        teams_app_process.kill()
        teams_app_process = None
        return {
            "status": "force_stopped",
            "message": "Teams app force stopped"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/teams/status")
async def get_teams_app_status():
    """Get the status of the locally running teams-v2-sdk"""
    global teams_app_process
    try:
        if teams_app_process and teams_app_process.poll() is None:
            return {
                "status": "running",
                "port": 3978,
                "devtools_url": "http://localhost:3979/devtools",
                "process_id": teams_app_process.pid
            }
        else:
            return {
                "status": "stopped"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/api/copilot/package")
async def package_copilot_extension():
    """Package the GitHub Copilot extension as a zip file for download"""
    try:
        import subprocess
        import os
        import tempfile
        import shutil
        
        copilot_extension_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "copilot-extension")
        
        if not os.path.exists(copilot_extension_path):
            raise HTTPException(status_code=404, detail="GitHub Copilot extension not found")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            package_dir = os.path.join(temp_dir, "agunblock-copilot-extension")
            os.makedirs(package_dir)
            
            package_json_path = os.path.join(copilot_extension_path, "package.json")
            extension_js_path = os.path.join(copilot_extension_path, "extension.js")
            readme_path = os.path.join(copilot_extension_path, "README.md")
            
            if os.path.exists(package_json_path):
                shutil.copy2(package_json_path, package_dir)
            if os.path.exists(extension_js_path):
                shutil.copy2(extension_js_path, package_dir)
            if os.path.exists(readme_path):
                shutil.copy2(readme_path, package_dir)
            
            install_guide_content = """# Installation Guide


1. **Extract this zip file** to a temporary location
2. **Open Visual Studio Code**
3. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
4. **Type** "Extensions: Install from VSIX..."
5. **Navigate** to the extracted folder and select the extension files
6. **Restart** VS Code when prompted


1. **Copy the extension folder** to your VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\\.vscode\\extensions\\agunblock-copilot-extension`
   - **macOS**: `~/.vscode/extensions/agunblock-copilot-extension`
   - **Linux**: `~/.vscode/extensions/agunblock-copilot-extension`
2. **Restart** Visual Studio Code
3. **Verify installation** by checking the Extensions panel


1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type** "AgUnblock: Configure Agent Settings"
3. **Enter your AgUnblock API key** (get one at https://agunblock.com)
4. **Select your preferred agent type**
5. **Start the background agent** with "AgUnblock: Start Background Agent"


- **Extension not appearing**: Check that all files were copied correctly
- **Commands not working**: Restart VS Code and check the Output panel for errors
- **API key issues**: Verify your key at https://agunblock.com/dashboard

For support, visit: https://agunblock.com/support
"""
            
            install_guide_path = os.path.join(package_dir, "INSTALL.md")
            with open(install_guide_path, "w") as f:
                f.write(install_guide_content)
            
            zip_path = os.path.join(temp_dir, "agunblock-copilot-extension.zip")
            shutil.make_archive(zip_path[:-4], 'zip', package_dir)
            
            permanent_zip_path = os.path.join(copilot_extension_path, "agunblock-copilot-extension.zip")
            shutil.move(zip_path, permanent_zip_path)
            
            return {
                "status": "success",
                "message": "GitHub Copilot extension packaged successfully",
                "package_path": permanent_zip_path
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/copilot/download")
async def download_copilot_extension():
    """Serve the packaged GitHub Copilot extension for download"""
    try:
        import os
        from fastapi.responses import FileResponse
        
        copilot_extension_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "copilot-extension")
        zip_path = os.path.join(copilot_extension_path, "agunblock-copilot-extension.zip")
        
        if not os.path.exists(zip_path):
            await package_copilot_extension()
        
        if os.path.exists(zip_path):
            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename="agunblock-copilot-extension.zip"
            )
        else:
            raise HTTPException(status_code=404, detail="GitHub Copilot extension package not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/copilot-extension/download")
def download_copilot_extension_chat():
    """Download the AGU Copilot Extension package"""
    import os
    import zipfile
    from fastapi.responses import FileResponse
    
    copilot_extension_dir = os.path.join(os.path.dirname(__file__), "..", "..", "copilot-extension")
    zip_path = os.path.join(copilot_extension_dir, "agu-copilot-extension.zip")
    
    if not os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(copilot_extension_dir):
                dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
                for file in files:
                    if file.endswith('.zip'):
                        continue
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, copilot_extension_dir)
                    zipf.write(file_path, arcname)
    
    return FileResponse(
        zip_path,
        media_type='application/zip',
        filename='agu-copilot-extension.zip'
    )
