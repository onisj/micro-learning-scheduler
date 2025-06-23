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

## 📋 Prerequisites

- Node.js v20.x or higher
- npm or yarn package manager
- Docker (for containerized deployment)
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

# Start development server
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
│   ├── docker/             # Docker configurations
│   ├── kubernetes/         # K8s manifests
│   └── terraform/          # Infrastructure as code
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
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Using deployment script
npm run deploy
```

## 📊 Monitoring

- **Health Checks**: `npm run health-check`
- **Logs**: Available in `monitoring/logs/`
- **Metrics**: Accessible via monitoring dashboard
- **Backup**: `npm run backup`

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
