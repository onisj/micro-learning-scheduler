# Project Rules for Personalized Micro-Learning Scheduler

These rules define how Trae should respond to queries related to the Personalized Micro-Learning Scheduler project, located at `./micro-learning-scheduler/`. Trae must follow these rules when interacting within this project.

## Project Context

- **Description**: A system for delivering personalized 5-minute micro-learning sessions, scheduled based on user calendar availability, powered by n8n workflows, Airtable, Google Sheets, OpenAI, Google Calendar, Twilio, and Gmail.
- **Architecture**: Composed of three main n8n workflows (User Registration, Daily Content Delivery, Engagement Monitoring), with frontend interfaces, backend services, and external API integrations.
- **Primary Tools**:
  - Automation: n8n
  - Storage: Airtable (Users, Lessons tables), Google Sheets (Engagement, Analytics)
  - APIs: Google Calendar, Google Sheets, OpenAI, Twilio (WhatsApp), Gmail
  - Frontend: HTML/CSS/JavaScript for registration form, admin dashboard, user portal
  - Backend: Node.js with Express (optional for custom APIs)
  - Deployment: Docker, Kubernetes (optional), Terraform

## Framework Versions and Dependencies

- **Node.js**: v20.x (based on `@types/node@^20.10.6` in `package.json`).
- **n8n**: Latest stable version compatible with the nodes defined in `n8n_workflow.md` (e.g., `n8n-nodes-base.webhook`, `n8n-nodes-base.airtable`).
- **Dependencies** (from `package.json` in `project-structure.md`):
  - `express`: ^4.18.2
  - `airtable`: ^0.12.2
  - `googleapis`: ^118.0.0
  - `openai`: ^4.28.0
  - `twilio`: ^4.19.3
  - `nodemailer`: ^6.9.8
  - `node-cron`: ^3.0.3
  - `dotenv`: ^16.3.1
  - `axios`: ^1.6.5
  - `moment-timezone`: ^0.5.43
  - `winston`: ^3.11.0
- **Dev Dependencies**:
  - `jest`: ^29.7.0
  - `nodemon`: ^3.0.2
  - `eslint`: ^8.56.0
  - `@types/node`: ^20.10.6
- **Frontend**: Plain HTML/CSS/JavaScript (no frameworks like React or Vue, as per `frontend/registration-form/index.html`).
- **Containerization**: Docker (defined in `deployment/docker/`) with Docker Compose (e.g., `docker-compose.yml`).
- **Infrastructure**: Terraform (defined in `deployment/terraform/`).

## Testing Framework

- **Framework**: Jest (^29.7.0, as specified in `package.json`).
- **Test Structure** (from `project-structure.md`):
  - Unit Tests: Located in `./backend/tests/unit/` (e.g., `user-tests.js`, `lesson-tests.js`).
  - Integration Tests: Located in `./backend/tests/integration/` (e.g., `workflow-tests.js`, `api-tests.js`).
  - Fixtures: Mock data in `./backend/tests/fixtures/` (e.g., `sample-users.json`, `mock-calendar-data.json`).
- **Test Scripts**:
  - Run all tests: `npm test`
  - Watch mode: `npm run test:watch`
- **Conventions**:
  - Write unit tests for all utility functions (e.g., `./n8n-workflows/functions/user-validation.js`).
  - Write integration tests for n8n workflows and API endpoints.
  - Use mock data for external API calls (e.g., Google Calendar, OpenAI).
  - Aim for >80% code coverage for backend services and utilities.
- **Tools**:
  - ESLint (^8.56.0) for linting: Run with `npm run lint`.
  - Mocking: Use Jest’s built-in mocking for API clients (e.g., `airtable-client.js`, `calendar-client.js`).
  - Performance Testing: Use scripts in `./tools/performance-testing.js`.

## APIs to Avoid

- **Restricted APIs**:
  - Do not use Firebase (any services, including Firestore, Authentication, or Realtime Database) due to project reliance on Airtable and Google Sheets for storage.
  - Avoid Slack APIs for notifications, as the project uses Twilio (WhatsApp) and Gmail.
  - Do not use AWS-specific services (e.g., S3, Lambda) unless explicitly requested, as deployment is Docker/Kubernetes-based with Terraform.
  - Avoid deprecated Google APIs (e.g., older versions of Google Calendar API; use `googleapis@^118.0.0`).
  - Do not use SMS services other than Twilio for messaging to maintain consistency with WhatsApp delivery.
- **Reasoning**: These restrictions ensure compatibility with the existing tech stack, minimize dependency sprawl, and align with the project’s infrastructure choices.

## File Structure

- **Reference**: Follow the project structure defined in `project-structure.md` (e.g., `n8n-workflows/`, `database/`, `frontend/`, `backend/`, `integrations/`).
- **Path References**: Use relative paths based on the root directory (`./micro-learning-scheduler/`). Example:
  - n8n workflow: `./n8n-workflows/exports/1-user-registration-workflow.json`
  - Airtable setup: `./database/airtable/setup/airtable-setup.js`
  - Registration form: `./frontend/registration-form/index.html`
- **File Naming**: Adhere to existing naming conventions (e.g., kebab-case for files, camelCase for JavaScript variables).

## Code Conventions

- **Language Versions**: JavaScript with ES Modules.
- **Error Handling**: Follow patterns in `n8n_workflow.md` (e.g., throwing errors for missing fields, logging errors in Airtable/Google Sheets scripts).
- **Comments**: Include detailed comments for n8n function nodes and JavaScript files, as shown in `code-implementation.md` and `system-implementation.md`.
- **Time Handling**: Use `moment-timezone` for timezone conversions and `DateTime` (Luxon) in n8n function nodes, as per `n8n_workflow.md`.

## Database Conventions

- **Airtable**:
  - Base ID: Reference `appXXXXXXXXXXXXXX` (placeholder in `code-implementation.md`).
  - Tables: Follow schema in `n8n_workflow.md` and `code-implementation.md` (Users, Lessons).
  - Field Types: Respect field types (e.g., `Single line text`, `Multiple select`) as defined in `database/airtable/schema/`.
- **Google Sheets**:
  - Spreadsheet ID: Reference `1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (placeholder in `code-implementation.md`).
  - Sheets: Use `Engagement`, `Analytics`, `Performance` sheets with headers defined in `google-sheets-config.js`.
  - Logging: Follow engagement logging format in `n8n_workflow.md` (e.g., Timestamp, User ID, Lesson Title).

## Workflow Conventions

- **n8n Workflows**:
  - Follow the three workflows defined in `n8n_workflow.md`:
    1. User Registration & Profile Setup
    2. Daily Content Delivery
    3. Engagement Monitoring
  - Node Naming: Use descriptive names (e.g., `Validate & Process User Data`, `Generate Personalized Learning Plan`).
  - Node Notes: Include notes for each node, as shown in `n8n_workflow.md`.
- **Triggers**:
  - Webhook: Use `POST` to `/learning-signup` for registration.
  - Schedule: Daily at 8 AM for content delivery, 8 PM for engagement monitoring.
- **OpenAI**:
  - Model: `gpt-4` for learning plan and content generation.
  - Prompts: Follow prompt structures in `n8n_workflow.md` and `integrations/openai/prompt-templates.js`.

## API Integration Conventions

- **Google Calendar**: Use `googleapis@^118.0.0` for calendar access, respecting `integrations/google/calendar/` utilities.
- **Twilio**: Use `twilio@^4.19.3` for WhatsApp delivery, with message templates in `templates/whatsapp/`.
- **Gmail**: Use `nodemailer@^6.9.8` or n8n’s Gmail node for email delivery, with templates in `templates/email/`.
- **OpenAI**: Use `openai@^4.28.0` SDK for content generation, following `integrations/openai/` utilities.
- **Airtable**: Use `airtable@^0.12.2` SDK, respecting `integrations/airtable/` utilities.

## Response Guidelines

- **Technical Depth**: Assume I’m familiar with the project’s tech stack (n8n, Node.js, Airtable, etc.) and provide implementation-focused answers.
- **Examples**: When explaining workflows or code, reference specific nodes or files (e.g., `Node 2: Validate User Data` in `1-user-registration-workflow.json`, `airtable-setup.js`).
- **Clarifications**: If my query involves a specific workflow, node, or file, confirm the context (e.g., “Are you referring to the User Registration workflow in `n8n-workflows/exports/1-user-registration-workflow.json`?”).
- **Suggestions**: After answering, suggest related tasks or improvements (e.g., “Would you like to add user feedback collection to the Daily Content Delivery workflow?”).
- **Documentation**: Reference files in `docs/` (e.g., `setup-guide.md`, `workflow-guide.md`) when relevant.

## Output Formatting

- **Code**: Use language-specific code blocks (e.g., ```javascript,```json, ```html).
- **Workflows**: Format n8n workflows as JSON with clear node annotations.
- **Diagrams**: Offer Mermaid diagrams for workflow or architecture explanations if I request visuals.
- **Tables**: Use Markdown tables for comparing configurations, schemas, or options.
- **File Paths**: Always include the full relative path when referencing files (e.g., `./frontend/registration-form/index.html`).

These rules ensure Trae provides accurate, project-specific responses that align with the Personalized Micro-Learning Scheduler’s architecture, dependencies, testing practices, and API restrictions.
