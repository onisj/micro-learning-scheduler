# Deployment Infrastructure - Phase 1.5

This directory contains all the infrastructure and deployment automation components for the Micro Learning Scheduler project. Phase 1.5 focuses on production-ready infrastructure, deployment automation, and comprehensive monitoring.

## 📁 Directory Structure

```
deployment/
├── docker/                    # Docker configurations
├── kubernetes/               # Kubernetes manifests
│   ├── namespace.yaml       # Environment namespaces and resource quotas
│   ├── configmaps.yaml      # Application and service configurations
│   ├── secrets.yaml         # Secrets templates (use manage-secrets.sh)
│   ├── services.yaml        # Service definitions
│   ├── deployments.yaml     # Application deployments
│   └── ingress.yaml         # External access configuration
├── scripts/                 # Deployment automation scripts
│   ├── deploy.sh           # Main deployment script
│   ├── health-check.sh     # Health monitoring script
│   └── rollback.sh         # Rollback automation
└── terraform/              # Infrastructure as Code (future)
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for staging/production)
- kubectl configured
- OpenSSL (for secrets generation)

### 1. Generate Secrets

```bash
# Generate secrets for development environment
./security/scripts/manage-secrets.sh generate development

# Generate secrets for staging environment
./security/scripts/manage-secrets.sh generate staging

# Generate secrets for production environment
./security/scripts/manage-secrets.sh generate production
```

### 2. Deploy to Development

```bash
# Deploy using Docker Compose
./deployment/scripts/deploy.sh development
```

### 3. Deploy to Staging/Production

```bash
# Deploy to staging
./deployment/scripts/deploy.sh staging

# Deploy to production (requires confirmation)
./deployment/scripts/deploy.sh production
```

## 🐳 Docker Configuration

### Multi-Stage Dockerfile

Our Dockerfile supports three build targets:

- **development**: Includes dev dependencies and debugging tools
- **staging**: Production-like with additional monitoring
- **production**: Optimized for security and performance

### Build Commands

```bash
# Development build
docker build --target development -t micro-learning-scheduler:dev .

# Staging build
docker build --target staging -t micro-learning-scheduler:staging .

# Production build
docker build --target production -t micro-learning-scheduler:prod .
```

## ☸️ Kubernetes Configuration

### Environments

Three separate environments with isolated namespaces:

- `micro-learning-scheduler-development`
- `micro-learning-scheduler-staging`
- `micro-learning-scheduler-production`

### Resource Management

- **Development**: Basic resource limits for local testing
- **Staging**: Production-like resources for testing
- **Production**: High availability with resource quotas

### Security Features

- Network policies for traffic isolation
- Pod security contexts
- Secret management
- TLS termination
- Security headers

## 🔧 Deployment Scripts

### deploy.sh

Main deployment script with features:

- Environment validation
- Prerequisite checks
- Test execution
- Docker image building and pushing
- Health checks
- Rollback on failure

**Usage:**
```bash
./deployment/scripts/deploy.sh <environment> [options]

Options:
  --skip-tests     Skip test execution
  --skip-build     Skip Docker image build
  --force          Force deployment without confirmation
  --dry-run        Show what would be deployed
```

### health-check.sh

Comprehensive health monitoring:

- HTTP endpoint checks
- Database connectivity
- Redis connectivity
- n8n service status
- Kubernetes deployment status

**Usage:**
```bash
./deployment/scripts/health-check.sh <environment> [options]

Options:
  --timeout <seconds>  Health check timeout (default: 300)
  --retries <count>    Number of retries (default: 5)
  --verbose           Enable verbose output
```

### rollback.sh

Automated rollback capabilities:

- Version management
- Data backup before rollback
- Health verification after rollback
- Support for Docker Compose and Kubernetes

**Usage:**
```bash
./deployment/scripts/rollback.sh <environment> [version] [options]

Options:
  --list           List available versions
  --force          Force rollback without confirmation
  --backup         Create backup before rollback
```

## 🔐 Secrets Management

### manage-secrets.sh

Comprehensive secrets management:

- Generate new secrets
- Rotate existing secrets
- Backup and restore
- Kubernetes synchronization
- Validation

**Usage:**
```bash
./security/scripts/manage-secrets.sh <command> <environment>

Commands:
  generate     Generate new secrets
  rotate       Rotate existing secrets
  backup       Backup current secrets
  restore      Restore from backup
  validate     Validate secrets
  sync         Sync to Kubernetes
  list         List available secrets
```

### Secret Types

- Database credentials
- Redis passwords
- JWT secrets
- API keys (OpenAI, SendGrid, Slack, etc.)
- Webhook secrets
- TLS certificates

## 📊 Monitoring and Logging

### Prometheus Configuration

- Application metrics collection
- Service discovery for Kubernetes
- Alert rules for critical issues
- Multi-environment support

### Logging

- Structured JSON logging for production
- Log rotation and retention
- Separate audit and performance logs
- Centralized log aggregation ready

### Health Checks

- Liveness and readiness probes
- Custom health endpoints
- Database and Redis connectivity
- External API availability

## 🔄 CI/CD Integration

### GitHub Actions

Automated pipeline with:

- Code quality checks (linting, type checking)
- Security scanning
- Automated testing
- Docker image building
- Multi-environment deployment
- Rollback on failure

### Pipeline Stages

1. **Test**: Unit tests, integration tests, security scans
2. **Build**: Multi-platform Docker images
3. **Deploy**: Environment-specific deployments
4. **Verify**: Health checks and smoke tests
5. **Cleanup**: Old image cleanup

## 🌐 Ingress and Networking

### Domain Configuration

- **Development**: `dev.micro-learning-scheduler.local`
- **Staging**: `staging.micro-learning-scheduler.com`
- **Production**: `micro-learning-scheduler.com`

### SSL/TLS

- Let's Encrypt certificates
- Automatic certificate renewal
- HTTPS redirect
- Security headers

### Rate Limiting

- Connection limits
- Request rate limits
- DDoS protection

## 🔧 Configuration Management

### Environment Variables

Environment-specific configurations:

- Database connections
- Redis settings
- API endpoints
- Feature flags
- Resource limits

### ConfigMaps

- Application configuration
- Service discovery
- Nginx configuration
- Monitoring settings

## 📈 Scaling and Performance

### Horizontal Pod Autoscaling

- CPU-based scaling
- Memory-based scaling
- Custom metrics scaling

### Resource Management

- Resource requests and limits
- Quality of Service classes
- Node affinity rules

## 🛡️ Security

### Network Security

- Network policies
- Service mesh ready
- Traffic encryption

### Pod Security

- Security contexts
- Non-root containers
- Read-only filesystems
- Capability dropping

### Secrets Security

- Encrypted at rest
- Rotation policies
- Access controls
- Audit logging

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Failures**
   ```bash
   # Check deployment status
   kubectl get deployments -n micro-learning-scheduler-<env>
   
   # Check pod logs
   kubectl logs -f deployment/micro-learning-scheduler -n micro-learning-scheduler-<env>
   ```

2. **Health Check Failures**
   ```bash
   # Run manual health check
   ./deployment/scripts/health-check.sh <environment> --verbose
   ```

3. **Secret Issues**
   ```bash
   # Validate secrets
   ./security/scripts/manage-secrets.sh validate <environment>
   
   # Regenerate secrets
   ./security/scripts/manage-secrets.sh rotate <environment>
   ```

### Debugging Commands

```bash
# Check all resources in namespace
kubectl get all -n micro-learning-scheduler-<env>

# Describe problematic pods
kubectl describe pod <pod-name> -n micro-learning-scheduler-<env>

# Check events
kubectl get events -n micro-learning-scheduler-<env> --sort-by='.lastTimestamp'

# Port forward for local debugging
kubectl port-forward service/micro-learning-scheduler-service 3000:3000 -n micro-learning-scheduler-<env>
```

## 📚 Additional Resources

- [Architecture Overview](../docs/architecture-overview.md)
- [Setup Guide](../docs/setup-guide.md)
- [Troubleshooting Guide](../docs/troubleshooting.md)
- [API Documentation](../docs/api-documentation.md)

## 🤝 Contributing

When making changes to the deployment infrastructure:

1. Test in development environment first
2. Update documentation
3. Follow security best practices
4. Test rollback procedures
5. Update monitoring and alerts

## 📝 Next Steps

After Phase 1.5 completion:

1. Proceed to Phase 2: Database Setup
2. Implement Terraform for infrastructure as code
3. Add service mesh (Istio) for advanced traffic management
4. Implement GitOps with ArgoCD
5. Add chaos engineering testing