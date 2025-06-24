# Personalized Micro-Learning Scheduler

An AI-powered system for delivering personalized 5-minute micro-learning sessions, scheduled based on user calendar availability. Built with n8n workflows, Airtable, Google Sheets, OpenAI, and multiple communication channels.

## 🚀 Features

- **Intelligent Scheduling**: Automatically finds optimal learning slots in user calendars
- **AI-Powered Content**: Personalized learning content generated using OpenAI GPT-4
- **Multi-Channel Delivery**: Content delivered via WhatsApp, Email, and web portal
- **Progress Tracking**: Comprehensive engagement monitoring and analytics
- **Adaptive Learning**: Content difficulty adjusts based on user performance

## 🏗️ Architecture

The system consists of three main n8n workflows:

1. **User Registration & Profile Setup**: Handles new user onboarding and profile creation
2. **Daily Content Delivery**: Schedules and delivers personalized learning content
3. **Engagement Monitoring**: Tracks user interactions and learning progress

## 🛠️ Tech Stack

- **Automation**: n8n (Latest stable)
- **Backend**: Node.js v20.x with Express
- **Database**: Airtable (Users, Lessons) + Google Sheets (Analytics)
- **AI**: OpenAI GPT-4
- **Integrations**: Google Calendar, Twilio (WhatsApp), Gmail
- **Frontend**: HTML/CSS/JavaScript
- **Deployment**: Docker, Kubernetes, Terraform
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Security**: Automated secrets management
- **Logging**: Structured logging with Logback

## 📋 Prerequisites

- Node.js v20.x or higher
- npm or yarn package manager
- Docker and Docker Compose
- Kubernetes cluster (for production deployment)
- Terraform (for infrastructure management)
- Access to required APIs:
  - Airtable API
  - Google Calendar API
  - OpenAI API
  - Twilio API
  - Gmail API

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd micro-learning-scheduler
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env.development
```

Edit `.env.development` with your API credentials:

```env
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id

# Google APIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_SHEETS_ID=your_sheets_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number

# Email
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_app_password
```

### 3. Development Setup

```bash
# Setup development environment
npm run setup:dev

# Start development server with Docker
docker-compose -f docker-compose.dev.yml up

# Or start locally
npm run dev
```

### 4. Access the Application

- **Registration Form**: `http://localhost:3000/registration`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **User Portal**: `http://localhost:3000/portal`
- **API Health Check**: `http://localhost:3000/api/health`

## 📁 Project Structure

```
micro-learning-scheduler/
├── backend/                 # Node.js backend services
│   ├── src/
│   │   ├── app.js          # Main application entry
│   │   ├── controllers/    # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── scripts/            # Maintenance scripts
│   └── tests/              # Jest test suites
├── frontend/               # Web interfaces
│   ├── registration-form/  # User registration
│   ├── admin-dashboard/    # Admin interface
│   └── user-portal/        # User dashboard
├── n8n-workflows/          # n8n workflow definitions
│   ├── exports/            # Workflow JSON files
│   ├── functions/          # Custom function nodes
│   └── templates/          # Workflow templates
├── database/               # Database configurations
│   ├── airtable/           # Airtable setup and schemas
│   └── google-sheets/      # Google Sheets configurations
├── integrations/           # External API clients
│   ├── airtable/           # Airtable integration
│   ├── google/             # Google APIs
│   ├── openai/             # OpenAI integration
│   └── twilio/             # Twilio/WhatsApp
├── deployment/             # Deployment configurations
│   ├── README.md           # Deployment documentation
│   ├── docker/             # Docker configurations
│   ├── kubernetes/         # K8s manifests
│   ├── scripts/            # Deployment automation
│   └── terraform/          # Infrastructure as code
├── monitoring/             # Observability stack
│   ├── alerts/             # Alert configurations
│   ├── dashboards/         # Grafana dashboards
│   ├── logging/            # Log configurations
│   ├── metrics/            # Custom metrics
│   └── prometheus.yml      # Prometheus config
├── security/               # Security configurations
│   ├── certificates/       # SSL certificates
│   ├── policies/           # Security policies
│   └── scripts/            # Security automation
├── .github/                # GitHub Actions
│   └── workflows/          # CI/CD pipelines
└── docs/                   # Documentation
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## 🚀 Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Staging
```bash
docker-compose -f docker-compose.staging.yml up
```

### Production

#### Using Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Using Kubernetes
```bash
# Deploy to Kubernetes
kubectl apply -f deployment/kubernetes/

# Check deployment status
kubectl get pods -n micro-learning
```

#### Using Deployment Scripts
```bash
# Automated deployment
./deployment/scripts/deploy.sh

# Health check
./deployment/scripts/health-check.sh

# Rollback if needed
./deployment/scripts/rollback.sh
```

#### Infrastructure with Terraform
```bash
cd deployment/terraform
terraform init
terraform plan
terraform apply
```

## 📊 Monitoring & Observability

### Health Checks
```bash
# Application health
npm run health-check

# Deployment health check
./deployment/scripts/health-check.sh
```

### Monitoring Stack
- **Prometheus**: Metrics collection (`monitoring/prometheus.yml`)
- **Grafana**: Visualization dashboards
- **Alerts**: Application and infrastructure alerts (`monitoring/alerts/`)
- **Logs**: Structured logging with Logback (`monitoring/logging/`)

### Accessing Monitoring
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`
- **Application Logs**: `docker logs <container_name>`

### Backup & Recovery
```bash
# Database backup
npm run backup

# Configuration backup
./security/scripts/manage-secrets.sh backup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `docs(scope): description` - Documentation updates
- `test(scope): description` - Test additions/updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` directory
- **Troubleshooting**: See `docs/troubleshooting.md`
- **Setup Guide**: Detailed setup in `docs/setup-guide.md`
- **API Documentation**: Available in `docs/api-documentation.md`

## 🗺️ Roadmap

- [ ] Phase 1: Project Setup ✅
- [ ] Phase 2: Database Configuration
- [ ] Phase 3: n8n Workflow Implementation
- [ ] Phase 4: API Integrations & Frontend
- [ ] Phase 5: Testing & Deployment

---

**Built with ❤️ for personalized learning experiences**
