#!/bin/bash

# Secrets Management Script for Micro Learning Scheduler
# Handles creation, rotation, and management of secrets across environments

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SECRETS_DIR="$PROJECT_ROOT/security/secrets"
TEMP_DIR="/tmp/micro-learning-secrets"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Usage function
show_usage() {
    cat << EOF
Usage: $0 <command> [options]

Commands:
  generate <environment>     Generate new secrets for environment
  rotate <environment>       Rotate existing secrets for environment
  backup <environment>       Backup secrets for environment
  restore <environment>      Restore secrets from backup
  validate <environment>     Validate secrets configuration
  sync <environment>         Sync secrets to Kubernetes
  list <environment>         List available secrets
  clean                      Clean temporary files

Environments:
  development, staging, production

Options:
  -h, --help                Show this help message
  -v, --verbose             Enable verbose output
  --dry-run                 Show what would be done without executing
  --force                   Force operation without confirmation

Examples:
  $0 generate development
  $0 rotate production --force
  $0 backup staging
  $0 sync production

EOF
}

# Environment validation
validate_environment() {
    local env="$1"
    case "$env" in
        development|staging|production)
            return 0
            ;;
        *)
            log_error "Invalid environment: $env"
            log_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    local missing_tools=()
    
    # Check required tools
    command -v openssl >/dev/null 2>&1 || missing_tools+=("openssl")
    command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
    command -v base64 >/dev/null 2>&1 || missing_tools+=("base64")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install the missing tools and try again."
        exit 1
    fi
    
    # Create directories if they don't exist
    mkdir -p "$SECRETS_DIR" "$TEMP_DIR"
}

# Generate random password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Generate JWT secret
generate_jwt_secret() {
    openssl rand -hex 64
}

# Generate database password
generate_db_password() {
    openssl rand -base64 24 | tr -d "=+/" | cut -c1-24
}

# Generate API key
generate_api_key() {
    echo "sk-$(openssl rand -hex 24)"
}

# Generate secrets for environment
generate_secrets() {
    local env="$1"
    local secrets_file="$SECRETS_DIR/$env-secrets.env"
    
    log_info "Generating secrets for $env environment..."
    
    # Create secrets file
    cat > "$secrets_file" << EOF
# Generated secrets for $env environment
# Generated on: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Database credentials
DATABASE_PASSWORD=$(generate_db_password)
DATABASE_ROOT_PASSWORD=$(generate_db_password)

# Redis password
REDIS_PASSWORD=$(generate_password 16)

# JWT secrets
JWT_SECRET=$(generate_jwt_secret)
JWT_REFRESH_SECRET=$(generate_jwt_secret)

# Session secret
SESSION_SECRET=$(generate_password 32)

# n8n credentials
N8N_ENCRYPTION_KEY=$(generate_password 32)
N8N_USER_MANAGEMENT_JWT_SECRET=$(generate_jwt_secret)

# API Keys (placeholder - replace with actual keys)
OPENAI_API_KEY=sk-placeholder-openai-key
SENDGRID_API_KEY=SG.placeholder-sendgrid-key
SLACK_BOT_TOKEN=xoxb-placeholder-slack-token
SLACK_SIGNING_SECRET=$(generate_password 32)
GOOGLE_CLIENT_SECRET=$(generate_password 32)
TWILIO_AUTH_TOKEN=$(generate_password 32)

# Webhook secrets
WEBHOOK_SECRET=$(generate_password 32)
GITHUB_WEBHOOK_SECRET=$(generate_password 32)

# Monitoring secrets
PROMETHEUS_PASSWORD=$(generate_password 16)
GRAFANA_ADMIN_PASSWORD=$(generate_password 16)

# Docker registry
DOCKER_REGISTRY_PASSWORD=$(generate_password 24)
EOF

    # Set secure permissions
    chmod 600 "$secrets_file"
    
    log_success "Secrets generated and saved to $secrets_file"
    log_warning "Please update placeholder API keys with actual values!"
}

# Rotate secrets
rotate_secrets() {
    local env="$1"
    local secrets_file="$SECRETS_DIR/$env-secrets.env"
    
    if [[ ! -f "$secrets_file" ]]; then
        log_error "Secrets file not found: $secrets_file"
        log_info "Run 'generate $env' first to create initial secrets."
        exit 1
    fi
    
    # Backup current secrets
    backup_secrets "$env"
    
    log_info "Rotating secrets for $env environment..."
    
    # Create new secrets file with rotated values
    local temp_file="$TEMP_DIR/$env-secrets-new.env"
    
    # Source current secrets to preserve API keys
    source "$secrets_file"
    
    cat > "$temp_file" << EOF
# Rotated secrets for $env environment
# Rotated on: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Database credentials (rotated)
DATABASE_PASSWORD=$(generate_db_password)
DATABASE_ROOT_PASSWORD=$(generate_db_password)

# Redis password (rotated)
REDIS_PASSWORD=$(generate_password 16)

# JWT secrets (rotated)
JWT_SECRET=$(generate_jwt_secret)
JWT_REFRESH_SECRET=$(generate_jwt_secret)

# Session secret (rotated)
SESSION_SECRET=$(generate_password 32)

# n8n credentials (rotated)
N8N_ENCRYPTION_KEY=$(generate_password 32)
N8N_USER_MANAGEMENT_JWT_SECRET=$(generate_jwt_secret)

# API Keys (preserved from previous configuration)
OPENAI_API_KEY=${OPENAI_API_KEY:-sk-placeholder-openai-key}
SENDGRID_API_KEY=${SENDGRID_API_KEY:-SG.placeholder-sendgrid-key}
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN:-xoxb-placeholder-slack-token}
SLACK_SIGNING_SECRET=$(generate_password 32)
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-$(generate_password 32)}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN:-$(generate_password 32)}

# Webhook secrets (rotated)
WEBHOOK_SECRET=$(generate_password 32)
GITHUB_WEBHOOK_SECRET=$(generate_password 32)

# Monitoring secrets (rotated)
PROMETHEUS_PASSWORD=$(generate_password 16)
GRAFANA_ADMIN_PASSWORD=$(generate_password 16)

# Docker registry (preserved)
DOCKER_REGISTRY_PASSWORD=${DOCKER_REGISTRY_PASSWORD:-$(generate_password 24)}
EOF

    # Replace old secrets file
    mv "$temp_file" "$secrets_file"
    chmod 600 "$secrets_file"
    
    log_success "Secrets rotated for $env environment"
    log_warning "Remember to update applications with new secrets!"
}

# Backup secrets
backup_secrets() {
    local env="$1"
    local secrets_file="$SECRETS_DIR/$env-secrets.env"
    local backup_dir="$SECRETS_DIR/backups"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$backup_dir/$env-secrets-$timestamp.env"
    
    if [[ ! -f "$secrets_file" ]]; then
        log_error "Secrets file not found: $secrets_file"
        exit 1
    fi
    
    mkdir -p "$backup_dir"
    cp "$secrets_file" "$backup_file"
    
    log_success "Secrets backed up to $backup_file"
}

# Restore secrets from backup
restore_secrets() {
    local env="$1"
    local backup_dir="$SECRETS_DIR/backups"
    
    if [[ ! -d "$backup_dir" ]]; then
        log_error "No backups found in $backup_dir"
        exit 1
    fi
    
    log_info "Available backups for $env:"
    ls -la "$backup_dir"/$env-secrets-*.env 2>/dev/null || {
        log_error "No backups found for $env environment"
        exit 1
    }
    
    echo
    read -p "Enter backup filename to restore: " backup_filename
    
    local backup_file="$backup_dir/$backup_filename"
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    local secrets_file="$SECRETS_DIR/$env-secrets.env"
    cp "$backup_file" "$secrets_file"
    chmod 600 "$secrets_file"
    
    log_success "Secrets restored from $backup_file"
}

# Validate secrets
validate_secrets() {
    local env="$1"
    local secrets_file="$SECRETS_DIR/$env-secrets.env"
    
    if [[ ! -f "$secrets_file" ]]; then
        log_error "Secrets file not found: $secrets_file"
        exit 1
    fi
    
    log_info "Validating secrets for $env environment..."
    
    # Source secrets file
    source "$secrets_file"
    
    # Check required secrets
    local required_secrets=(
        "DATABASE_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
        "SESSION_SECRET"
        "N8N_ENCRYPTION_KEY"
    )
    
    local missing_secrets=()
    for secret in "${required_secrets[@]}"; do
        if [[ -z "${!secret:-}" ]]; then
            missing_secrets+=("$secret")
        fi
    done
    
    if [[ ${#missing_secrets[@]} -gt 0 ]]; then
        log_error "Missing required secrets: ${missing_secrets[*]}"
        exit 1
    fi
    
    # Check placeholder values
    local placeholder_secrets=()
    [[ "$OPENAI_API_KEY" == "sk-placeholder-openai-key" ]] && placeholder_secrets+=("OPENAI_API_KEY")
    [[ "$SENDGRID_API_KEY" == "SG.placeholder-sendgrid-key" ]] && placeholder_secrets+=("SENDGRID_API_KEY")
    [[ "$SLACK_BOT_TOKEN" == "xoxb-placeholder-slack-token" ]] && placeholder_secrets+=("SLACK_BOT_TOKEN")
    
    if [[ ${#placeholder_secrets[@]} -gt 0 ]]; then
        log_warning "Placeholder values found for: ${placeholder_secrets[*]}"
        log_warning "Please update these with actual API keys."
    fi
    
    log_success "Secrets validation completed for $env environment"
}

# Sync secrets to Kubernetes
sync_secrets() {
    local env="$1"
    local secrets_file="$SECRETS_DIR/$env-secrets.env"
    local namespace="micro-learning-scheduler-$env"
    
    if [[ ! -f "$secrets_file" ]]; then
        log_error "Secrets file not found: $secrets_file"
        exit 1
    fi
    
    log_info "Syncing secrets to Kubernetes namespace: $namespace"
    
    # Check if namespace exists
    if ! kubectl get namespace "$namespace" >/dev/null 2>&1; then
        log_error "Namespace $namespace does not exist"
        log_info "Create the namespace first: kubectl create namespace $namespace"
        exit 1
    fi
    
    # Create Kubernetes secret from env file
    kubectl create secret generic app-secrets \
        --from-env-file="$secrets_file" \
        --namespace="$namespace" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Secrets synced to Kubernetes namespace: $namespace"
}

# List secrets
list_secrets() {
    local env="$1"
    local secrets_file="$SECRETS_DIR/$env-secrets.env"
    
    if [[ ! -f "$secrets_file" ]]; then
        log_error "Secrets file not found: $secrets_file"
        exit 1
    fi
    
    log_info "Secrets for $env environment:"
    echo
    
    # Show secret names without values
    grep -E '^[A-Z_]+=' "$secrets_file" | cut -d'=' -f1 | sort
}

# Clean temporary files
clean_temp() {
    log_info "Cleaning temporary files..."
    rm -rf "$TEMP_DIR"
    log_success "Temporary files cleaned"
}

# Main function
main() {
    local command="${1:-}"
    local environment="${2:-}"
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                set -x
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
    
    if [[ -z "$command" ]]; then
        log_error "No command specified"
        show_usage
        exit 1
    fi
    
    check_prerequisites
    
    case "$command" in
        generate)
            if [[ -z "$environment" ]]; then
                log_error "Environment required for generate command"
                show_usage
                exit 1
            fi
            validate_environment "$environment"
            generate_secrets "$environment"
            ;;
        rotate)
            if [[ -z "$environment" ]]; then
                log_error "Environment required for rotate command"
                show_usage
                exit 1
            fi
            validate_environment "$environment"
            rotate_secrets "$environment"
            ;;
        backup)
            if [[ -z "$environment" ]]; then
                log_error "Environment required for backup command"
                show_usage
                exit 1
            fi
            validate_environment "$environment"
            backup_secrets "$environment"
            ;;
        restore)
            if [[ -z "$environment" ]]; then
                log_error "Environment required for restore command"
                show_usage
                exit 1
            fi
            validate_environment "$environment"
            restore_secrets "$environment"
            ;;
        validate)
            if [[ -z "$environment" ]]; then
                log_error "Environment required for validate command"
                show_usage
                exit 1
            fi
            validate_environment "$environment"
            validate_secrets "$environment"
            ;;
        sync)
            if [[ -z "$environment" ]]; then
                log_error "Environment required for sync command"
                show_usage
                exit 1
            fi
            validate_environment "$environment"
            sync_secrets "$environment"
            ;;
        list)
            if [[ -z "$environment" ]]; then
                log_error "Environment required for list command"
                show_usage
                exit 1
            fi
            validate_environment "$environment"
            list_secrets "$environment"
            ;;
        clean)
            clean_temp
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"