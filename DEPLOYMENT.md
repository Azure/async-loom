# Async-Loom Deployment Guide

This guide will walk you through deploying the async-loom application to Azure Container Apps. The application consists of four main components:

1. **Backend** (FastAPI Python app) - Port 8000
2. **Frontend** (React/Vite app) - Port 80
3. **Copilot Extension** (Node.js app) - Port 3000
4. **Teams SDK** (Node.js app) - Port 3978

## Prerequisites

Before deploying, ensure you have the following installed:

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (version 2.37.0 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local testing only)
- [Docker Compose](https://docs.docker.com/compose/install/) (for local testing only)

> **Note:** Docker is only required for local testing. Azure deployment uses `az acr build` which builds images directly in Azure.

## Quick Start

### 1. Local Testing (Recommended First)

Test the application locally before deploying to Azure:

```bash
# Make scripts executable (Linux/macOS)
chmod +x deploy-local.sh deploy.sh

# Run local deployment
./deploy-local.sh
```

This will:
- Build all Docker images locally
- Create a docker-compose.yml file
- Start all services locally
- Run health checks

**Local URLs:**
- Frontend: http://localhost
- Backend: http://localhost:8000
- Backend Health: http://localhost:8000/healthz
- Copilot Extension: http://localhost:3000
- Copilot Extension Health: http://localhost:3000/health
- Teams SDK: http://localhost:3978 (uses internal health monitoring)

### 2. Azure Deployment

Deploy to Azure Container Apps:

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Run deployment script
./deploy.sh
```

The deployment script will:
1. Add/upgrade the Container Apps extension
2. Create a resource group
3. Create an Azure Container Registry (ACR) with ARM token authentication
4. Build and push all Docker images using `az acr build`
5. Create a Container Apps environment
6. Deploy all four container apps
7. Configure networking and health checks
8. Display URLs and configuration commands

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### Step 1: House-keeping and Azure Resources

```bash
# Set variables
RG="async-loom-rg"
LOC="eastus"
ACR="asyncloomacr${RANDOM}"  # must be globally unique
ENV="async-loom-env"

# Add Container Apps extension
az extension add --upgrade --name containerapp

# Create resource group
az group create -n "$RG" -l "$LOC"

# Create container registry with ARM token authentication
az acr create -n "$ACR" -g "$RG" -l "$LOC" --sku Basic
az acr config authentication-as-arm update -n "$ACR" --status enabled

# Create container apps environment
az containerapp env create -n "$ENV" -g "$RG" -l "$LOC"
```

### Step 2: Build and Push Images with az acr build

```bash
# Build all images directly in Azure (no local Docker required)
az acr build -t backend:v1 -r "$ACR" ./backend
az acr build -t frontend:v1 -r "$ACR" ./frontend
az acr build -t copilot-extension:v1 -r "$ACR" ./copilot-extension
az acr build -t teams-sdk:v1 -r "$ACR" ./teams-v2-sdk
```

### Step 3: Deploy Container Apps

```bash
# Deploy Backend
az containerapp create \
    -n backend \
    -g "$RG" \
    --environment "$ENV" \
    --ingress external \
    --target-port 8000 \
    --transport http \
    --registry-server "${ACR}.azurecr.io" \
    --image "${ACR}.azurecr.io/backend:v1" \
    --cpu 0.5 \
    --memory 1Gi \
    --min-replicas 1 \
    --max-replicas 10 \
    --env-vars PORT=8000

# Get backend URL for other services
BACKEND_FQDN=$(az containerapp show -n backend -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)

# Deploy Frontend
az containerapp create \
    -n frontend \
    -g "$RG" \
    --environment "$ENV" \
    --ingress external \
    --target-port 80 \
    --transport http \
    --registry-server "${ACR}.azurecr.io" \
    --image "${ACR}.azurecr.io/frontend:v1" \
    --env-vars BACKEND_URL="https://${BACKEND_FQDN}" \
    --cpu 0.25 \
    --memory 0.5Gi \
    --min-replicas 1 \
    --max-replicas 5

# Deploy Copilot Extension
az containerapp create \
    -n copilot-extension \
    -g "$RG" \
    --environment "$ENV" \
    --ingress external \
    --target-port 3000 \
    --transport http \
    --registry-server "${ACR}.azurecr.io" \
    --image "${ACR}.azurecr.io/copilot-extension:v1" \
    --env-vars PORT=3000 BACKEND_URL="https://${BACKEND_FQDN}" \
    --cpu 0.5 \
    --memory 1Gi \
    --min-replicas 1 \
    --max-replicas 3

# Deploy Teams SDK
az containerapp create \
    -n teams-sdk \
    -g "$RG" \
    --environment "$ENV" \
    --ingress external \
    --target-port 3978 \
    --transport http \
    --registry-server "${ACR}.azurecr.io" \
    --image "${ACR}.azurecr.io/teams-sdk:v1" \
    --env-vars PORT=3978 BACKEND_URL="https://${BACKEND_FQDN}" \
    --cpu 0.5 \
    --memory 1Gi \
    --min-replicas 1 \
    --max-replicas 3
```

## Configuration

### Setting Up Secrets

After deployment, you need to configure secrets for API keys and tokens:

```bash
# Backend secrets
az containerapp secret set \
    -n backend \
    -g "$RG" \
    --secrets \
    devin-api-key=YOUR_DEVIN_API_KEY \
    github-token=YOUR_GITHUB_TOKEN \
    postgres-connection=YOUR_POSTGRES_CONNECTION_STRING

# Copilot Extension secrets
az containerapp secret set \
    -n copilot-extension \
    -g "$RG" \
    --secrets \
    openai-api-key=YOUR_OPENAI_API_KEY

# Teams SDK secrets
az containerapp secret set \
    -n teams-sdk \
    -g "$RG" \
    --secrets \
    teams-app-id=YOUR_TEAMS_APP_ID \
    teams-app-password=YOUR_TEAMS_APP_PASSWORD
```

### Update Environment Variables to Use Secrets

```bash
# Update backend to use secrets
az containerapp update \
    -n backend \
    -g "$RG" \
    --set-env-vars \
    DEVIN_API_KEY=secretref:devin-api-key \
    GITHUB_TOKEN=secretref:github-token \
    DATABASE_URL=secretref:postgres-connection

# Update copilot extension to use secrets
az containerapp update \
    -n copilot-extension \
    -g "$RG" \
    --set-env-vars \
    OPENAI_API_KEY=secretref:openai-api-key

# Update teams SDK to use secrets
az containerapp update \
    -n teams-sdk \
    -g "$RG" \
    --set-env-vars \
    TEAMS_APP_ID=secretref:teams-app-id \
    TEAMS_APP_PASSWORD=secretref:teams-app-password
```

## Monitoring and Maintenance

### Health Checks

All services include health monitoring:
- Backend: `/healthz`
- Copilot Extension: `/health`
- Teams SDK: Internal health monitoring (no custom endpoint)

### Viewing Logs

```bash
# View logs for specific service
az containerapp logs show \
    -n backend \
    -g "$RG" \
    --follow

# View logs for all services
for app in backend frontend copilot-extension teams-sdk; do
    echo "=== $app logs ==="
    az containerapp logs show -n $app -g "$RG" --tail 50
done
```

### Scaling

```bash
# Scale a specific service
az containerapp update \
    -n backend \
    -g "$RG" \
    --min-replicas 2 \
    --max-replicas 20
```

### Updating Applications

```bash
# Rebuild and update an application
az acr build -t backend:v2 -r "$ACR" ./backend
az containerapp update \
    -n backend \
    -g "$RG" \
    --image "${ACR}.azurecr.io/backend:v2"
```

## Troubleshooting

### Common Issues

1. **Build failures**: Check `az acr build` output for detailed error messages
2. **Health check failures**: Verify health endpoints are accessible and returning 200 status
3. **Connection issues**: Ensure all services can communicate with each other
4. **Secret access**: Verify secrets are properly configured and accessible

### Debugging Commands

```bash
# Check container app status
az containerapp show \
    -n backend \
    -g "$RG" \
    --query properties.runningStatus

# Check environment variables
az containerapp show \
    -n backend \
    -g "$RG" \
    --query properties.template.containers[0].env

# Check recent revisions
az containerapp revision list \
    -n backend \
    -g "$RG" \
    --query '[].{Name:name,CreatedTime:properties.createdTime,Active:properties.active}'

# Check ACR build logs
az acr build-task logs -r "$ACR" --build-id <build-id>
```

## Cost Optimization

- Use appropriate CPU/memory allocations based on usage
- Set minimum replicas to 0 for non-production environments
- Use Azure Container Registry Basic tier for development
- Monitor usage with Azure Cost Management
- Use `az acr build` instead of maintaining local Docker images

## Security Considerations

- Use ARM token authentication for ACR (automatically configured)
- Use Azure Key Vault for sensitive secrets in production
- Enable managed identity for container apps
- Configure network security groups if needed
- Regularly update base images and dependencies

## Cleanup

To remove all resources:

```bash
# Delete the entire resource group
az group delete -n "$RG" --yes --no-wait
```

## Support

For issues or questions:
1. Check the health endpoints first
2. Review application logs using `az containerapp logs`
3. Verify configuration and secrets
4. Check Azure Container Apps documentation

## Advantages of This Approach

### Using `az acr build` vs Local Docker:
- ✅ **No local Docker required** for deployment
- ✅ **Faster builds** - parallel building in Azure
- ✅ **Better security** - ARM tokens vs manual credentials
- ✅ **More reliable** - no network issues with local Docker
- ✅ **Easier CI/CD** - works from any environment with Azure CLI

### Azure Container Apps Benefits:
- ✅ **Serverless scaling** - scale to zero when not in use
- ✅ **Integrated networking** - services communicate seamlessly
- ✅ **Built-in health checks** - automatic monitoring
- ✅ **Easy secrets management** - secure configuration
- ✅ **Cost effective** - pay only for what you use

## File Structure

```
async-loom/
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   └── main.py
│   ├── pyproject.toml
│   └── poetry.lock
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── copilot-extension/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── teams-v2-sdk/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── deploy.sh              # Azure deployment script
├── deploy-local.sh        # Local testing script
├── azure-container-apps.yaml
└── DEPLOYMENT.md
```

## Example Deployment Output

When you run `./deploy.sh`, you'll see output like:

```
🎉 === APPLICATION URLS ===
🌐 Frontend: https://frontend.happybeach-12345.eastus.azurecontainerapps.io
⚡ Backend: https://backend.happybeach-12345.eastus.azurecontainerapps.io
🔍 Backend Health: https://backend.happybeach-12345.eastus.azurecontainerapps.io/healthz
🤖 Copilot Extension: https://copilot-extension.happybeach-12345.eastus.azurecontainerapps.io
💚 Copilot Extension Health: https://copilot-extension.happybeach-12345.eastus.azurecontainerapps.io/health
📱 Teams SDK: https://teams-sdk.happybeach-12345.eastus.azurecontainerapps.io
```

This deployment guide provides a complete walkthrough for deploying the async-loom application to Azure Container Apps using modern Azure best practices. 