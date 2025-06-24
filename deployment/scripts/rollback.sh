#!/bin/bash

# Rollback Script for Micro-Learning Scheduler
# Provides automated rollback capabilities for all environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="micro-learning-scheduler"
DOCKER_REGISTRY="ghcr.io/your-org"
KUBECTL_TIMEOUT="300s"
BACKUP_RETENTION_DAYS=30
MAX_ROLLBACK_ATTEMPTS=3

# Functions
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

show_usage() {
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Environments:"
    echo "  development  - Rollback development environment"
    echo "  staging      - Rollback staging environment"
    echo "  production   - Rollback production environment"
    echo ""
    echo "Options:"
    echo "  --to-version VERSION  Rollback to specific version"
    echo "  --previous           Rollback to previous version (default)"
    echo "  --list-versions      List available versions for rollback"
    echo "  --backup-data        Create data backup before rollback"
    echo "  --force              Force rollback without confirmation"
    echo "  --dry-run            Show what would be done without executing"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 staging --previous"
    echo "  $0 production --to-version v1.2.3"
    echo "  $0 development --list-versions"
    echo "  $0 production --backup-data --force"
}

validate_environment() {
    local env=$1
    case $env in
        development|staging|production)
            return 0
            ;;
        *)
            log_error "Invalid environment: $env"
            show_usage
            exit 1
            ;;
    esac
}

check_prerequisites() {
    local env=$1
    
    # Check required tools
    command -v git >/dev/null 2>&1 || { log_error "Git is required but not installed."; exit 1; }
    
    if [[ "$env" == "development" ]]; then
        command -v docker >/dev/null 2>&1 || { log_error "Docker is required for development rollback."; exit 1; }
        command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose is required for development rollback."; exit 1; }
    else
        command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required for $env rollback."; exit 1; }
        command -v docker >/dev/null 2>&1 || { log_error "Docker is required for image management."; exit 1; }
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
}

get_current_version() {
    local env=$1
    
    case $env in
        development)
            # Get version from running container
            local container_id
            container_id=$(docker-compose -f docker-compose.dev.yml ps -q $APP_NAME 2>/dev/null | head -n1)
            if [[ -n "$container_id" ]]; then
                docker inspect "$container_id" --format='{{index .Config.Labels "version"}}' 2>/dev/null || echo "unknown"
            else
                echo "none"
            fi
            ;;
        staging|production)
            # Get version from Kubernetes deployment
            local namespace="$APP_NAME-$env"
            if kubectl get deployment "$APP_NAME" -n "$namespace" >/dev/null 2>&1; then
                kubectl get deployment "$APP_NAME" -n "$namespace" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null | sed 's/.*://'
            else
                echo "none"
            fi
            ;;
    esac
}

get_previous_version() {
    local env=$1
    
    case $env in
        development)
            # Get previous version from git tags
            git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "none"
            ;;
        staging|production)
            # Get previous version from Kubernetes rollout history
            local namespace="$APP_NAME-$env"
            if kubectl rollout history deployment "$APP_NAME" -n "$namespace" >/dev/null 2>&1; then
                kubectl rollout history deployment "$APP_NAME" -n "$namespace" --revision=2 2>/dev/null | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+' | head -n1 || echo "none"
            else
                echo "none"
            fi
            ;;
    esac
}

list_available_versions() {
    local env=$1
    
    log_info "Available versions for $env environment:"
    
    case $env in
        development)
            # List git tags
            log_info "Git tags (last 10):"
            git tag --sort=-version:refname | head -n10 | while read -r tag; do
                echo "  - $tag"
            done
            ;;
        staging|production)
            # List Kubernetes rollout history
            local namespace="$APP_NAME-$env"
            if kubectl get deployment "$APP_NAME" -n "$namespace" >/dev/null 2>&1; then
                log_info "Kubernetes rollout history:"
                kubectl rollout history deployment "$APP_NAME" -n "$namespace" 2>/dev/null | tail -n +2 | while read -r line; do
                    echo "  - $line"
                done
            else
                log_warning "No deployment found in namespace $namespace"
            fi
            
            # List available Docker images
            log_info "Available Docker images:"
            docker images "$DOCKER_REGISTRY/$APP_NAME" --format "table {{.Tag}}\t{{.CreatedAt}}" 2>/dev/null | grep -E "$env|latest-$env" | head -n10
            ;;
    esac
}

create_data_backup() {
    local env=$1
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)_$env"
    
    log_info "Creating data backup for $env environment..."
    
    mkdir -p "$backup_dir"
    
    # Load environment variables
    if [[ -f ".env.$env" ]]; then
        source ".env.$env"
    fi
    
    case $env in
        development)
            # Backup SQLite database
            if [[ -f "$DATABASE_PATH" ]]; then
                cp "$DATABASE_PATH" "$backup_dir/database.sqlite"
                log_success "SQLite database backed up"
            fi
            ;;
        staging|production)
            # Backup PostgreSQL database
            if [[ -n "$DATABASE_URL" ]] && command -v pg_dump >/dev/null 2>&1; then
                pg_dump "$DATABASE_URL" > "$backup_dir/database.sql"
                log_success "PostgreSQL database backed up"
            else
                log_warning "PostgreSQL backup skipped (pg_dump not available or DATABASE_URL not set)"
            fi
            ;;
    esac
    
    # Backup configuration files
    cp ".env.$env" "$backup_dir/" 2>/dev/null || true
    cp -r "src/config" "$backup_dir/" 2>/dev/null || true
    
    # Create backup manifest
    cat > "$backup_dir/manifest.json" << EOF
{
  "environment": "$env",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version_before_rollback": "$(get_current_version $env)",
  "git_commit": "$(git rev-parse HEAD)",
  "backup_type": "pre_rollback"
}
EOF
    
    log_success "Data backup created: $backup_dir"
    echo "$backup_dir"
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $BACKUP_RETENTION_DAYS days)..."
    
    if [[ -d "./backups" ]]; then
        find ./backups -type d -name "*_*" -mtime +$BACKUP_RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
        log_success "Old backups cleaned up"
    fi
}

rollback_development() {
    local target_version=$1
    
    log_info "Rolling back development environment to version: $target_version"
    
    # Stop current containers
    log_info "Stopping current containers..."
    docker-compose -f docker-compose.dev.yml down || true
    
    # Checkout target version
    if [[ "$target_version" != "$(git describe --tags --exact-match HEAD 2>/dev/null || echo 'none')" ]]; then
        log_info "Checking out version: $target_version"
        git checkout "$target_version" || {
            log_error "Failed to checkout version: $target_version"
            return 1
        }
    fi
    
    # Rebuild and start services
    log_info "Rebuilding and starting services..."
    docker-compose -f docker-compose.dev.yml build || {
        log_error "Failed to build containers"
        return 1
    }
    
    docker-compose -f docker-compose.dev.yml up -d || {
        log_error "Failed to start containers"
        return 1
    }
    
    log_success "Development rollback completed"
}

rollback_kubernetes() {
    local env=$1
    local target_version=$2
    local namespace="$APP_NAME-$env"
    
    log_info "Rolling back $env environment to version: $target_version"
    
    if [[ "$target_version" == "previous" ]]; then
        # Rollback to previous revision
        log_info "Rolling back to previous revision..."
        kubectl rollout undo deployment "$APP_NAME" -n "$namespace" || {
            log_error "Failed to rollback to previous revision"
            return 1
        }
    else
        # Rollback to specific version
        local image_tag="$DOCKER_REGISTRY/$APP_NAME:$target_version-$env"
        
        # Check if image exists
        if ! docker manifest inspect "$image_tag" >/dev/null 2>&1; then
            log_error "Docker image not found: $image_tag"
            return 1
        fi
        
        log_info "Setting image to: $image_tag"
        kubectl set image deployment "$APP_NAME" "$APP_NAME=$image_tag" -n "$namespace" || {
            log_error "Failed to set image"
            return 1
        }
    fi
    
    # Wait for rollout to complete
    log_info "Waiting for rollback to complete..."
    kubectl rollout status deployment "$APP_NAME" -n "$namespace" --timeout="$KUBECTL_TIMEOUT" || {
        log_error "Rollback did not complete within timeout"
        return 1
    }
    
    log_success "Kubernetes rollback completed"
}

verify_rollback() {
    local env=$1
    
    log_info "Verifying rollback..."
    
    # Wait a moment for services to stabilize
    sleep 10
    
    # Run health check
    if ./deployment/scripts/health-check.sh "$env" --quick; then
        log_success "Rollback verification passed"
        return 0
    else
        log_error "Rollback verification failed"
        return 1
    fi
}

confirm_rollback() {
    local env=$1
    local target_version=$2
    local current_version=$3
    
    if [[ "$FORCE" != "true" ]]; then
        echo ""
        log_warning "You are about to rollback $env environment:"
        log_warning "  Current version: $current_version"
        log_warning "  Target version:  $target_version"
        echo ""
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Rollback cancelled."
            exit 0
        fi
    fi
}

# Main rollback function
main() {
    local env=$1
    shift
    
    # Parse options
    local target_version="previous"
    local list_versions=false
    local backup_data=false
    local force=false
    local dry_run=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --to-version)
                target_version="$2"
                shift 2
                ;;
            --previous)
                target_version="previous"
                shift
                ;;
            --list-versions)
                list_versions=true
                shift
                ;;
            --backup-data)
                backup_data=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Set global variables
    FORCE=$force
    
    # Validate environment
    validate_environment "$env"
    
    # Check prerequisites
    check_prerequisites "$env"
    
    # Handle list versions
    if [[ "$list_versions" == "true" ]]; then
        list_available_versions "$env"
        exit 0
    fi
    
    # Get current version
    local current_version
    current_version=$(get_current_version "$env")
    
    # Resolve target version
    if [[ "$target_version" == "previous" ]]; then
        target_version=$(get_previous_version "$env")
        if [[ "$target_version" == "none" ]]; then
            log_error "No previous version found for rollback"
            exit 1
        fi
    fi
    
    log_info "Starting rollback process..."
    log_info "Environment: $env"
    log_info "Current version: $current_version"
    log_info "Target version: $target_version"
    log_info "Timestamp: $(date)"
    
    if [[ "$dry_run" == "true" ]]; then
        log_info "DRY RUN: Would rollback from $current_version to $target_version"
        exit 0
    fi
    
    # Confirm rollback
    confirm_rollback "$env" "$target_version" "$current_version"
    
    # Create backup if requested
    local backup_dir=""
    if [[ "$backup_data" == "true" ]]; then
        backup_dir=$(create_data_backup "$env")
    fi
    
    # Perform rollback with retry logic
    local attempt=1
    local rollback_success=false
    
    while [[ $attempt -le $MAX_ROLLBACK_ATTEMPTS && "$rollback_success" == "false" ]]; do
        log_info "Rollback attempt $attempt/$MAX_ROLLBACK_ATTEMPTS"
        
        case $env in
            development)
                if rollback_development "$target_version"; then
                    rollback_success=true
                fi
                ;;
            staging|production)
                if rollback_kubernetes "$env" "$target_version"; then
                    rollback_success=true
                fi
                ;;
        esac
        
        if [[ "$rollback_success" == "true" ]]; then
            # Verify rollback
            if verify_rollback "$env"; then
                break
            else
                rollback_success=false
                log_warning "Rollback verification failed, will retry..."
            fi
        fi
        
        attempt=$((attempt + 1))
        if [[ $attempt -le $MAX_ROLLBACK_ATTEMPTS ]]; then
            log_warning "Waiting 30 seconds before retry..."
            sleep 30
        fi
    done
    
    if [[ "$rollback_success" == "true" ]]; then
        log_success "Rollback completed successfully!"
        log_info "Environment: $env"
        log_info "Rolled back from: $current_version"
        log_info "Rolled back to: $target_version"
        if [[ -n "$backup_dir" ]]; then
            log_info "Backup created: $backup_dir"
        fi
        log_info "Timestamp: $(date)"
        
        # Cleanup old backups
        cleanup_old_backups
        
        exit 0
    else
        log_error "Rollback failed after $MAX_ROLLBACK_ATTEMPTS attempts!"
        if [[ -n "$backup_dir" ]]; then
            log_info "Data backup available for recovery: $backup_dir"
        fi
        exit 1
    fi
}

# Script entry point
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

if [[ "$1" == "--help" ]]; then
    show_usage
    exit 0
fi

main "$@"
