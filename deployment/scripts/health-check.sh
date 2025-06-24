#!/bin/bash

# Health Check Script for Micro-Learning Scheduler
# Validates application health across different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="micro-learning-scheduler"
MAX_RETRIES=10
RETRY_INTERVAL=30
TIMEOUT=10

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
    echo "  development  - Check development environment"
    echo "  staging      - Check staging environment"
    echo "  production   - Check production environment"
    echo ""
    echo "Options:"
    echo "  --quick      Perform quick health check only"
    echo "  --detailed   Perform detailed health check"
    echo "  --services   Check external services only"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 staging --detailed"
    echo "  $0 production --quick"
}

get_service_url() {
    local env=$1
    case $env in
        development)
            echo "http://localhost:3000"
            ;;
        staging)
            echo "https://staging.micro-learning-scheduler.com"
            ;;
        production)
            echo "https://micro-learning-scheduler.com"
            ;;
        *)
            log_error "Unknown environment: $env"
            exit 1
            ;;
    esac
}

check_http_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=${3:-"HTTP endpoint"}
    
    log_info "Checking $description: $url"
    
    local response
    local status_code
    
    response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
    status_code=$(echo "$response" | tail -n1)
    
    if [[ "$status_code" == "$expected_status" ]]; then
        log_success "$description is healthy (HTTP $status_code)"
        return 0
    else
        log_error "$description is unhealthy (HTTP $status_code)"
        return 1
    fi
}

check_application_health() {
    local base_url=$1
    local retries=0
    
    log_info "Checking application health endpoint..."
    
    while [[ $retries -lt $MAX_RETRIES ]]; do
        if check_http_endpoint "$base_url/health" 200 "Health endpoint"; then
            return 0
        fi
        
        retries=$((retries + 1))
        if [[ $retries -lt $MAX_RETRIES ]]; then
            log_warning "Health check failed, retrying in $RETRY_INTERVAL seconds... ($retries/$MAX_RETRIES)"
            sleep $RETRY_INTERVAL
        fi
    done
    
    log_error "Application health check failed after $MAX_RETRIES attempts"
    return 1
}

check_api_endpoints() {
    local base_url=$1
    local failed=0
    
    log_info "Checking API endpoints..."
    
    # Check main API endpoints
    local endpoints=(
        "/api/health:200"
        "/api/status:200"
        "/api/workflows:200"
        "/api/schedules:200"
    )
    
    for endpoint_config in "${endpoints[@]}"; do
        IFS=':' read -r endpoint expected_status <<< "$endpoint_config"
        if ! check_http_endpoint "$base_url$endpoint" "$expected_status" "API endpoint $endpoint"; then
            failed=$((failed + 1))
        fi
    done
    
    if [[ $failed -eq 0 ]]; then
        log_success "All API endpoints are healthy"
        return 0
    else
        log_error "$failed API endpoint(s) failed health check"
        return 1
    fi
}

check_database_connection() {
    local env=$1
    
    log_info "Checking database connection..."
    
    # Load environment variables
    if [[ -f ".env.$env" ]]; then
        source ".env.$env"
    fi
    
    case $env in
        development)
            # Check SQLite database
            if [[ -f "$DATABASE_PATH" ]]; then
                log_success "SQLite database file exists"
                return 0
            else
                log_error "SQLite database file not found: $DATABASE_PATH"
                return 1
            fi
            ;;
        staging|production)
            # Check PostgreSQL connection
            if command -v psql >/dev/null 2>&1; then
                if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
                    log_success "PostgreSQL database connection successful"
                    return 0
                else
                    log_error "PostgreSQL database connection failed"
                    return 1
                fi
            else
                log_warning "psql not available, skipping database connection test"
                return 0
            fi
            ;;
    esac
}

check_redis_connection() {
    local env=$1
    
    log_info "Checking Redis connection..."
    
    # Load environment variables
    if [[ -f ".env.$env" ]]; then
        source ".env.$env"
    fi
    
    if command -v redis-cli >/dev/null 2>&1; then
        local redis_host=${REDIS_HOST:-localhost}
        local redis_port=${REDIS_PORT:-6379}
        
        if redis-cli -h "$redis_host" -p "$redis_port" ping >/dev/null 2>&1; then
            log_success "Redis connection successful"
            return 0
        else
            log_error "Redis connection failed"
            return 1
        fi
    else
        log_warning "redis-cli not available, skipping Redis connection test"
        return 0
    fi
}

check_n8n_connection() {
    local env=$1
    
    log_info "Checking n8n connection..."
    
    # Load environment variables
    if [[ -f ".env.$env" ]]; then
        source ".env.$env"
    fi
    
    if [[ -n "$N8N_BASE_URL" ]]; then
        if check_http_endpoint "$N8N_BASE_URL/healthz" 200 "n8n health endpoint"; then
            return 0
        else
            log_error "n8n connection failed"
            return 1
        fi
    else
        log_warning "N8N_BASE_URL not configured, skipping n8n connection test"
        return 0
    fi
}

check_kubernetes_deployment() {
    local env=$1
    
    if [[ "$env" == "development" ]]; then
        return 0  # Skip for development
    fi
    
    log_info "Checking Kubernetes deployment status..."
    
    if ! command -v kubectl >/dev/null 2>&1; then
        log_warning "kubectl not available, skipping Kubernetes checks"
        return 0
    fi
    
    local namespace="$APP_NAME-$env"
    
    # Check if deployment exists and is ready
    if kubectl get deployment "$APP_NAME" -n "$namespace" >/dev/null 2>&1; then
        local ready_replicas
        ready_replicas=$(kubectl get deployment "$APP_NAME" -n "$namespace" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        local desired_replicas
        desired_replicas=$(kubectl get deployment "$APP_NAME" -n "$namespace" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
        
        if [[ "$ready_replicas" == "$desired_replicas" && "$ready_replicas" -gt 0 ]]; then
            log_success "Kubernetes deployment is healthy ($ready_replicas/$desired_replicas replicas ready)"
            return 0
        else
            log_error "Kubernetes deployment is unhealthy ($ready_replicas/$desired_replicas replicas ready)"
            return 1
        fi
    else
        log_error "Kubernetes deployment not found in namespace $namespace"
        return 1
    fi
}

check_docker_containers() {
    local env=$1
    
    if [[ "$env" != "development" ]]; then
        return 0  # Skip for non-development environments
    fi
    
    log_info "Checking Docker containers..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log_warning "Docker not available, skipping container checks"
        return 0
    fi
    
    # Check if containers are running
    local containers
    containers=$(docker-compose -f docker-compose.dev.yml ps -q 2>/dev/null || echo "")
    
    if [[ -n "$containers" ]]; then
        local running_count
        running_count=$(echo "$containers" | xargs docker inspect --format='{{.State.Status}}' 2>/dev/null | grep -c "running" || echo "0")
        local total_count
        total_count=$(echo "$containers" | wc -l)
        
        if [[ "$running_count" -gt 0 ]]; then
            log_success "Docker containers are running ($running_count/$total_count)"
            return 0
        else
            log_error "No Docker containers are running"
            return 1
        fi
    else
        log_error "No Docker containers found"
        return 1
    fi
}

perform_quick_check() {
    local env=$1
    local base_url
    base_url=$(get_service_url "$env")
    
    log_info "Performing quick health check for $env environment..."
    
    if check_application_health "$base_url"; then
        log_success "Quick health check passed"
        return 0
    else
        log_error "Quick health check failed"
        return 1
    fi
}

perform_detailed_check() {
    local env=$1
    local base_url
    base_url=$(get_service_url "$env")
    local failed=0
    
    log_info "Performing detailed health check for $env environment..."
    
    # Application health
    if ! check_application_health "$base_url"; then
        failed=$((failed + 1))
    fi
    
    # API endpoints
    if ! check_api_endpoints "$base_url"; then
        failed=$((failed + 1))
    fi
    
    # Infrastructure checks
    if [[ "$env" == "development" ]]; then
        if ! check_docker_containers "$env"; then
            failed=$((failed + 1))
        fi
    else
        if ! check_kubernetes_deployment "$env"; then
            failed=$((failed + 1))
        fi
    fi
    
    if [[ $failed -eq 0 ]]; then
        log_success "Detailed health check passed"
        return 0
    else
        log_error "Detailed health check failed ($failed checks failed)"
        return 1
    fi
}

perform_services_check() {
    local env=$1
    local failed=0
    
    log_info "Performing services health check for $env environment..."
    
    # Database
    if ! check_database_connection "$env"; then
        failed=$((failed + 1))
    fi
    
    # Redis
    if ! check_redis_connection "$env"; then
        failed=$((failed + 1))
    fi
    
    # n8n
    if ! check_n8n_connection "$env"; then
        failed=$((failed + 1))
    fi
    
    if [[ $failed -eq 0 ]]; then
        log_success "Services health check passed"
        return 0
    else
        log_error "Services health check failed ($failed services failed)"
        return 1
    fi
}

# Main function
main() {
    local env=$1
    shift
    
    # Parse options
    local check_type="detailed"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)
                check_type="quick"
                shift
                ;;
            --detailed)
                check_type="detailed"
                shift
                ;;
            --services)
                check_type="services"
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
    case $env in
        development|staging|production)
            ;;
        *)
            log_error "Invalid environment: $env"
            show_usage
            exit 1
            ;;
    esac
    
    log_info "Starting health check..."
    log_info "Environment: $env"
    log_info "Check type: $check_type"
    log_info "Timestamp: $(date)"
    
    # Perform health check based on type
    case $check_type in
        quick)
            perform_quick_check "$env"
            ;;
        detailed)
            perform_detailed_check "$env"
            ;;
        services)
            perform_services_check "$env"
            ;;
    esac
    
    local result=$?
    
    if [[ $result -eq 0 ]]; then
        log_success "Health check completed successfully!"
    else
        log_error "Health check failed!"
    fi
    
    log_info "Timestamp: $(date)"
    exit $result
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
