# Micro-Learning Scheduler Setup Guide

This guide will walk you through setting up the Micro-Learning Scheduler project from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [External Services Configuration](#external-services-configuration)
7. [Running the Application](#running-the-application)
8. [Docker Setup](#docker-setup)
9. [Monitoring Setup](#monitoring-setup)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git** (v2.30.0 or higher)
- **Docker** (v20.10.0 or higher) - for containerized deployment
- **Docker Compose** (v2.0.0 or higher) - for multi-container setup

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 2GB free space
- **OS**: macOS, Linux, or Windows with WSL2

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd micro-learning-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the appropriate environment file for your setup:

```bash
# For development
cp .env.development .env

# For staging
cp .env.staging .env

# For production
cp .env.production .env
```

## Configuration

### Environment Variables

Edit your `.env` file and configure the following sections:

#### Application Configuration
```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
```

#### Database Configuration
```env
# For development (SQLite)
DATABASE_URL=sqlite://./data/development.db

# For production (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/microlearning

REDIS_URL=redis://localhost:6379/0
```

#### Security Configuration
```env
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

## External Services Configuration

### 1. Airtable Setup

1. Create an Airtable account at [airtable.com](https://airtable.com)
2. Create a new base with the following tables:
   - **Users**: Store user information
   - **Lessons**: Store lesson content and metadata
3. Get your API key from [airtable.com/api](https://airtable.com/api)
4. Configure in `.env`:

```env
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
AIRTABLE_USERS_TABLE=Users
AIRTABLE_LESSONS_TABLE=Lessons
```

### 2. Google APIs Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Calendar API
   - Gmail API
4. Create credentials (OAuth 2.0 Client ID)
5. Configure in `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_SHEETS_ID=your_google_sheets_id_here
GOOGLE_CALENDAR_ID=primary
```

### 3. OpenAI Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Configure in `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

### 4. Twilio (WhatsApp) Setup

1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Set up WhatsApp Business API
3. Configure in `.env`:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_WEBHOOK_URL=http://localhost:3000/webhooks/twilio
```

### 5. Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Configure in `.env`:

```env
GMAIL_USER=your_gmail_address_here
GMAIL_APP_PASSWORD=your_gmail_app_password_here
GMAIL_FROM_NAME=Micro-Learning Scheduler
```

## Database Setup

### Development (SQLite)

```bash
# Create data directory
mkdir -p data

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Production (PostgreSQL)

```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Create database
psql -U postgres -c "CREATE DATABASE microlearning;"

# Run migrations
npm run db:migrate:prod
```

## Running the Application

### Development Mode

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:3000
```

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run backup` - Create database backup
- `npm run health` - Check application health

## Docker Setup

### Development with Docker

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Staging Environment

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up -d

# Check service status
docker-compose -f docker-compose.staging.yml ps
```

### Production Environment

```bash
# Create secrets directory
mkdir -p secrets

# Generate secure passwords
echo "$(openssl rand -base64 32)" > secrets/postgres_password.txt
echo "$(openssl rand -base64 32)" > secrets/n8n_password.txt
echo "$(openssl rand -base64 32)" > secrets/n8n_encryption_key.txt
echo "$(openssl rand -base64 32)" > secrets/grafana_password.txt
echo "$(openssl rand -base64 32)" > secrets/grafana_secret_key.txt

# Start production environment
docker-compose -f docker-compose.prod.yml up -d
```

## n8n Workflow Setup

### 1. Access n8n Interface

- **Development**: http://localhost:5678
- **Staging**: https://staging-n8n.micro-learning.com
- **Production**: https://n8n.micro-learning.com

### 2. Import Workflows

1. Navigate to the n8n interface
2. Go to "Workflows" > "Import"
3. Import workflows from `./n8n/workflows/` directory

### 3. Configure Credentials

Set up credentials for:
- Airtable
- Google APIs
- OpenAI
- Twilio
- Gmail

## Monitoring Setup

### Prometheus

- **URL**: http://localhost:9090
- **Configuration**: `./monitoring/prometheus.yml`

### Grafana

- **URL**: http://localhost:3001
- **Default Login**: admin/admin123 (development)
- **Dashboards**: Pre-configured in `./monitoring/grafana/dashboards/`

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check all services
npm run health
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 2. Database Connection Issues

- Verify database credentials in `.env`
- Ensure database server is running
- Check network connectivity

#### 3. External API Issues

- Verify API keys are correct
- Check API rate limits
- Ensure proper permissions are set

#### 4. Docker Issues

```bash
# Clean up Docker resources
docker system prune -a

# Rebuild containers
docker-compose build --no-cache
```

### Logs

```bash
# Application logs
tail -f logs/development.log

# Docker logs
docker-compose logs -f app

# System logs
journalctl -u micro-learning-scheduler
```

### Getting Help

- Check the [documentation](./README.md)
- Review [API documentation](./api-docs.md)
- Submit issues on GitHub
- Contact support team

## Next Steps

After successful setup:

1. **Phase 2**: [Database Setup](./database-setup.md)
2. **Phase 3**: [n8n Workflows](./workflow-setup.md)
3. **Phase 4**: [API Integration](./api-integration.md)
4. **Phase 5**: [Testing & Deployment](./testing-deployment.md)

---

**Note**: This setup guide covers Phase 1 requirements. Refer to the implementation phases documentation for complete project setup.