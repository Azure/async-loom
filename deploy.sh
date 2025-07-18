#!/bin/bash

# Azure Container Apps deployment script for async-loom
# This script builds and deploys all four components to Azure Container Apps using az acr build
# This script is idempotent - it can be run multiple times safely
#
# Usage:
#   ./deploy.sh            # Deploy normally (idempotent)
#   ./deploy.sh --clean    # Clean up old resources first, then deploy
#   ./deploy.sh --help     # Show help

set -e

# Configuration
RG="async-loom-rg"
LOC="eastus"
ACR="asyncloomacr"  # consistent name instead of random
ENV="async-loom-env"

# Parse command line arguments
CLEAN_FIRST=false
SHOW_HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_FIRST=true
            shift
            ;;
        --help)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [ "$SHOW_HELP" = true ]; then
    echo "Azure Container Apps deployment script for async-loom"
    echo
    echo "Usage:"
    echo "  ./deploy.sh            Deploy normally (idempotent)"
    echo "  ./deploy.sh --clean    Clean up old resources first, then deploy"
    echo "  ./deploy.sh --help     Show this help message"
    echo
    echo "The script will reuse existing resources when possible."
    echo "Use --clean to remove old ACR instances and start fresh."
    exit 0
fi

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Helper function to check if resource exists
resource_exists() {
    local resource_type=$1
    local name=$2
    local resource_group=$3
    
    case $resource_type in
        "group")
            az group show -n "$name" &> /dev/null
            ;;
        "acr")
            az acr show -n "$name" -g "$resource_group" &> /dev/null
            ;;
        "containerapp-env")
            az containerapp env show -n "$name" -g "$resource_group" &> /dev/null
            ;;
        "containerapp")
            az containerapp show -n "$name" -g "$resource_group" &> /dev/null
            ;;
        *)
            return 1
            ;;
    esac
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    log_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    log_error "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

log_info "Starting idempotent deployment for async-loom to Azure Container Apps..."
log_info "Using resource group: $RG"
log_info "Using location: $LOC"
log_info "Using ACR name: $ACR"
log_info "Using environment: $ENV"

# Step 0: Cleanup old resources if requested
if [ "$CLEAN_FIRST" = true ]; then
    log_warning "Cleaning up old resources..."
    
    # Remove old ACR instances with asyncloomacr prefix
    log_info "Searching for old ACR instances..."
    OLD_ACRS=$(az acr list -g "$RG" --query "[?starts_with(name, 'asyncloomacr') && name != '$ACR'].name" -o tsv 2>/dev/null || true)
    
    if [ -n "$OLD_ACRS" ]; then
        log_info "Found old ACR instances to clean up:"
        echo "$OLD_ACRS" | while read -r old_acr; do
            if [ -n "$old_acr" ]; then
                log_info "Deleting old ACR: $old_acr"
                az acr delete -n "$old_acr" -g "$RG" --yes 2>/dev/null || log_warning "Failed to delete $old_acr (it may not exist)"
            fi
        done
    else
        log_info "No old ACR instances found to clean up"
    fi
    
    # Remove old log analytics workspaces
    log_info "Searching for old log analytics workspaces..."
    OLD_WORKSPACES=$(az monitor log-analytics workspace list -g "$RG" --query "[?starts_with(name, 'workspace-asyncloom')].name" -o tsv 2>/dev/null || true)
    
    if [ -n "$OLD_WORKSPACES" ]; then
        log_info "Found old workspaces to clean up:"
        echo "$OLD_WORKSPACES" | while read -r old_workspace; do
            if [ -n "$old_workspace" ]; then
                log_info "Deleting old workspace: $old_workspace"
                az monitor log-analytics workspace delete -n "$old_workspace" -g "$RG" --yes 2>/dev/null || log_warning "Failed to delete $old_workspace (it may not exist)"
            fi
        done
    else
        log_info "No old workspaces found to clean up"
    fi
    
    log_success "Cleanup completed"
fi

# Step 1: House-keeping
log_info "Adding/upgrading Container Apps extension..."
az extension add --upgrade --name containerapp

# Step 2: Resource Group
if resource_exists "group" "$RG" ""; then
    log_info "Resource group $RG already exists, skipping creation"
else
    log_info "Creating resource group: $RG"
    az group create -n "$RG" -l "$LOC"
fi

# Step 3: Container Registry (with ARM-token pulls enabled)
if resource_exists "acr" "$ACR" "$RG"; then
    log_info "Azure Container Registry $ACR already exists, skipping creation"
else
    log_info "Creating Azure Container Registry: $ACR"
    az acr create -n "$ACR" -g "$RG" -l "$LOC" --sku Basic
fi

log_info "Ensuring ARM token authentication is enabled..."
az acr config authentication-as-arm update -n "$ACR" --status enabled

# Step 4: Container Apps environment
if resource_exists "containerapp-env" "$ENV" "$RG"; then
    log_info "Container Apps environment $ENV already exists, skipping creation"
else
    log_info "Creating Container Apps environment: $ENV"
    az containerapp env create -n "$ENV" -g "$RG" -l "$LOC"
fi

# Step 5: Build & Deploy Backend
log_info "Building backend image..."
az acr build -t backend:v1 -r "$ACR" ./backend

if resource_exists "containerapp" "backend" "$RG"; then
    log_info "Backend container app already exists, updating..."
    az containerapp update \
        -n backend \
        -g "$RG" \
        --image "${ACR}.azurecr.io/backend:v1"
else
    log_info "Creating backend container app..."
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
fi

BACKEND_FQDN=$(az containerapp show -n backend -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)
log_success "Backend running at https://${BACKEND_FQDN}"

# Step 6: Build & Deploy Frontend
log_info "Building frontend image with backend URL: https://${BACKEND_FQDN}"
az acr build -t frontend:v1 -r "$ACR" ./frontend --build-arg VITE_API_URL="https://${BACKEND_FQDN}"

if resource_exists "containerapp" "frontend" "$RG"; then
    log_info "Frontend container app already exists, updating..."
    az containerapp update \
        -n frontend \
        -g "$RG" \
        --image "${ACR}.azurecr.io/frontend:v1"
else
    log_info "Creating frontend container app..."
    az containerapp create \
        -n frontend \
        -g "$RG" \
        --environment "$ENV" \
        --ingress external \
        --target-port 80 \
        --transport http \
        --registry-server "${ACR}.azurecr.io" \
        --image "${ACR}.azurecr.io/frontend:v1" \
        --cpu 0.25 \
        --memory 0.5Gi \
        --min-replicas 1 \
        --max-replicas 5
fi

FRONTEND_FQDN=$(az containerapp show -n frontend -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)
log_success "Frontend running at https://${FRONTEND_FQDN}"

# Step 7: Build & Deploy Copilot Extension
log_info "Building copilot-extension image..."
az acr build -t copilot-extension:v1 -r "$ACR" ./copilot-extension

if resource_exists "containerapp" "copilot-extension" "$RG"; then
    log_info "Copilot Extension container app already exists, updating..."
    az containerapp update \
        -n copilot-extension \
        -g "$RG" \
        --image "${ACR}.azurecr.io/copilot-extension:v1" \
        --set-env-vars PORT=3000 BACKEND_URL="https://${BACKEND_FQDN}"
else
    log_info "Creating copilot-extension container app..."
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
fi

COPILOT_FQDN=$(az containerapp show -n copilot-extension -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)
log_success "Copilot Extension running at https://${COPILOT_FQDN}"

# Step 8: Build & Deploy Teams SDK
log_info "Building teams-sdk image..."
az acr build -t teams-sdk:v1 -r "$ACR" ./teams-v2-sdk

if resource_exists "containerapp" "teams-sdk" "$RG"; then
    log_info "Teams SDK container app already exists, updating..."
    az containerapp update \
        -n teams-sdk \
        -g "$RG" \
        --image "${ACR}.azurecr.io/teams-sdk:v1" \
        --set-env-vars PORT=3978 BACKEND_URL="https://${BACKEND_FQDN}"
else
    log_info "Creating teams-sdk container app..."
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
fi

TEAMS_FQDN=$(az containerapp show -n teams-sdk -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)
log_success "Teams SDK running at https://${TEAMS_FQDN}"

# Step 9: Display results
log_success "Deployment completed successfully!"
echo ""
echo "🎉 === APPLICATION URLS ==="
echo "🌐 Frontend: https://${FRONTEND_FQDN}"
echo "⚡ Backend: https://${BACKEND_FQDN}"
echo "🔍 Backend Health: https://${BACKEND_FQDN}/healthz"
echo "🤖 Copilot Extension: https://${COPILOT_FQDN}"
echo "💚 Copilot Extension Health: https://${COPILOT_FQDN}/health"
echo "📱 Teams SDK: https://${TEAMS_FQDN}"
echo ""
echo "📋 === RESOURCE INFORMATION ==="
echo "Resource Group: $RG"
echo "Container Registry: ${ACR}.azurecr.io"
echo "Environment: $ENV"
echo "Location: $LOC"
echo ""
echo "🔧 === NEXT STEPS ==="
echo "1. Test the health endpoints to ensure all services are running"
echo "2. Configure secrets for API keys and tokens (see commands below)"
echo "3. Update your Teams app manifest with the Teams SDK URL"
echo "4. Update your GitHub Copilot extension with the Copilot Extension URL"
echo ""
echo "🔐 === CONFIGURATION COMMANDS ==="
echo "# Add secrets to your container apps:"
echo "az containerapp secret set -n backend -g $RG --secrets \\"
echo "  devin-api-key=YOUR_DEVIN_API_KEY \\"
echo "  github-token=YOUR_GITHUB_TOKEN \\"
echo "  postgres-connection=YOUR_POSTGRES_CONNECTION_STRING"
echo ""
echo "az containerapp secret set -n copilot-extension -g $RG --secrets \\"
echo "  openai-api-key=YOUR_OPENAI_API_KEY"
echo ""
echo "az containerapp secret set -n teams-sdk -g $RG --secrets \\"
echo "  teams-app-id=YOUR_TEAMS_APP_ID \\"
echo "  teams-app-password=YOUR_TEAMS_APP_PASSWORD"
echo ""
echo "# Update environment variables to use secrets:"
echo "az containerapp update -n backend -g $RG --set-env-vars \\"
echo "  DEVIN_API_KEY=secretref:devin-api-key \\"
echo "  GITHUB_TOKEN=secretref:github-token \\"
echo "  DATABASE_URL=secretref:postgres-connection"
echo ""
echo "az containerapp update -n copilot-extension -g $RG --set-env-vars \\"
echo "  OPENAI_API_KEY=secretref:openai-api-key"
echo ""
echo "az containerapp update -n teams-sdk -g $RG --set-env-vars \\"
echo "  TEAMS_APP_ID=secretref:teams-app-id \\"
echo "  TEAMS_APP_PASSWORD=secretref:teams-app-password"
echo ""
echo "🗑️ === CLEANUP ==="
echo "# To remove all resources:"
echo "az group delete -n $RG --yes --no-wait"
echo ""
echo "# To clean up old ACR instances and redeploy:"
echo "./deploy.sh --clean"
echo ""
echo "📝 === IDEMPOTENT DEPLOYMENT ==="
echo "This script is idempotent. Running it multiple times will:"
echo "• Reuse existing resources when possible"
echo "• Only rebuild and redeploy when code changes"
echo "• Skip resource creation if resources already exist"
echo "• Use consistent naming instead of random names"
echo ""
log_success "Deployment script completed!" 