# Async Loom

Async Loom is a comprehensive platform that provides developers with various AI agent integrations for their Software Development Life Cycle (SDLC). This platform serves as a centralized hub for discovering, configuring, and integrating AI agents into your development workflow.

## Features

### 🎯 Main Integration Cards

1. **Azure SWE Agents** - Customize and configure AI agents for your repositories
2. **Teams Async Agents** - Background agents that work seamlessly with Microsoft Teams
3. **GitHub Actions Workflow** - CI/CD integrated agents for automated workflows
4. **GitHub Copilot Extension** - Background agents triggered through Copilot
5. **Azure AI Foundry Agent Catalog** - Customizable solution templates for customer scenarios

## Project Structure

```
agent-loom/
├── backend/          # FastAPI backend with Python
├── frontend/         # React frontend with shadcn/ui
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

## Development

This project uses:
- **Backend**: FastAPI with Python, Poetry for dependency management
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Package Manager**: pnpm for frontend, Poetry for backend

## Deployment

The application can be deployed using the built-in deployment commands for both frontend and backend components.
