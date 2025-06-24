#!/bin/bash

# Deploy Script for Micro-Learning Scheduler
# Supports development, staging, and production environments

set -e  # Exit on any error

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
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_INTERVAL=30

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
    echo "  development  - Deploy to development environment"
    echo "  staging      - Deploy to staging environment"
    echo "  production   - Deploy to production environment"
    echo ""
    echo "Options:"
    echo "  --build-only     Build Docker image only, don't deploy"
    echo "  --deploy-only    Deploy existing image, don't build"
    echo "  --skip-tests     Skip running tests before deployment"
    echo "  --force          Force deployment without confirmation"
    echo "  --rollback       Rollback to previous version"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 staging --skip-tests"
    echo "  $0 production --force"
    echo "  $0 production --rollback"
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
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed."; exit 1; }
    command -v git >/dev/null 2>&1 || { log_error "Git is required but not installed."; exit 1; }
    
    if [[ "$env" != "development" ]]; then
        command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required for $env deployment."; exit 1; }
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check if environment file exists
    if [[ ! -f ".env.$env" ]]; then
        log_error "Environment file .env.$env not found."
        exit 1
    fi
}

run_tests() {
    if [[ "$SKIP_TESTS" != "true" ]]; then
        log_info "Running tests..."
        npm test || {
            log_error "Tests failed. Deployment aborted."
            exit 1
        }
        log_success "Tests passed."
    else
        log_warning "Skipping tests as requested."
    fi
}

build_docker_image() {
    local env=$1
    local version=$2
    local image_tag="$DOCKER_REGISTRY/$APP_NAME:$version-$env"
    
    log_info "Building Docker image for $env environment..."
    log_info "Image tag: $image_tag"
    
    docker build \
        --target $env \
        --tag $image_tag \
        --tag "$DOCKER_REGISTRY/$APP_NAME:latest-$env" \
        --build-arg NODE_ENV=$env \
        --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
        --build-arg VCS_REF=$(git rev-parse --short HEAD) \
        . || {
        log_error "Docker build failed."
        exit 1
    }
    
    log_success "Docker image built successfully: $image_tag"
    
    # Push to registry for staging/production
    if [[ "$env" != "development" ]]; then
        log_info "Pushing image to registry..."
        docker push $image_tag
        docker push "$DOCKER_REGISTRY/$APP_NAME:latest-$env"
        log_success "Image pushed to registry."
    fi
}

deploy_development() {
    local version=$1
    
    log_info "Deploying to development environment..."
    
    # Stop existing containers
    docker-compose -f docker-compose.dev.yml down || true
    
    # Start services
    docker-compose -f docker-compose.dev.yml up -d
    
    log_success "Development deployment completed."
}

deploy_kubernetes() {
    local env=$1
    local version=$2
    
    log_info "Deploying to $env environment using Kubernetes..."
    
    # Apply namespace
    kubectl apply -f deployment/kubernetes/namespace.yaml
    
    # Apply configmaps and secrets
    kubectl apply -f deployment/kubernetes/configmaps.yaml
    kubectl apply -f deployment/kubernetes/secrets.yaml
    
    # Update deployment with new image
    kubectl set image deployment/$APP_NAME \
        $APP_NAME="$DOCKER_REGISTRY/$APP_NAME:$version-$env" \
        -n $APP_NAME-$env
    
    # Apply other manifests
    kubectl apply -f deployment/kubernetes/deployments.yaml
    kubectl apply -f deployment/kubernetes/services.yaml
    kubectl apply -f deployment/kubernetes/ingress.yaml
    
    # Wait for rollout to complete
    log_info "Waiting for deployment to complete..."
    kubectl rollout status deployment/$APP_NAME -n $APP_NAME-$env --timeout=$KUBECTL_TIMEOUT
    
    log_success "Kubernetes deployment completed."
}

perform_health_check() {
    local env=$1
    
    log_info "Performing health check..."
    
    # Run health check script
    ./deployment/scripts/health-check.sh $env || {
        log_error "Health check failed."
        return 1
    }
    
    log_success "Health check passed."
}

confirm_deployment() {
    local env=$1
    
    if [[ "$FORCE" != "true" && "$env" == "production" ]]; then
        echo ""
        log_warning "You are about to deploy to PRODUCTION environment."
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Deployment cancelled."
            exit 0
        fi
    fi
}

perform_rollback() {
    local env=$1
    
    log_info "Performing rollback for $env environment..."
    ./deployment/scripts/rollback.sh $env || {
        log_error "Rollback failed."
        exit 1
    }
    log_success "Rollback completed."
}

# Main deployment function
main() {
    local env=$1
    shift
    
    # Parse options
    BUILD_ONLY=false
    DEPLOY_ONLY=false
    SKIP_TESTS=false
    FORCE=false
    ROLLBACK=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build-only)
                BUILD_ONLY=true
                shift
                ;;
            --deploy-only)
                DEPLOY_ONLY=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
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
    
    # Validate environment
    validate_environment $env
    
    # Check prerequisites
    check_prerequisites $env
    
    # Get version from git
    VERSION=$(git describe --tags --always --dirty)
    
    log_info "Starting deployment process..."
    log_info "Environment: $env"
    log_info "Version: $VERSION"
    log_info "Timestamp: $(date)"
    
    # Handle rollback
    if [[ "$ROLLBACK" == "true" ]]; then
        perform_rollback $env
        exit 0
    fi
    
    # Confirm deployment for production
    confirm_deployment $env
    
    # Run tests
    if [[ "$DEPLOY_ONLY" != "true" ]]; then
        run_tests
    fi
    
    # Build Docker image
    if [[ "$DEPLOY_ONLY" != "true" ]]; then
        build_docker_image $env $VERSION
    fi
    
    # Deploy
    if [[ "$BUILD_ONLY" != "true" ]]; then
        case $env in
            development)
                deploy_development $VERSION
                ;;
            staging|production)
                deploy_kubernetes $env $VERSION
                ;;
        esac
        
        # Health check
        sleep 10  # Wait for services to start
        perform_health_check $env
    fi
    
    log_success "Deployment completed successfully!"
    log_info "Environment: $env"
    log_info "Version: $VERSION"
    log_info "Timestamp: $(date)"
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
