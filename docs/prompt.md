You are tasked with implementing the Personalized Micro-Learning Scheduler project in `./micro-learning-scheduler/`, a system for delivering personalized 5-minute micro-learning sessions using n8n workflows, Airtable, Google Sheets, OpenAI, Google Calendar, Twilio, and Gmail. n8n workflows constitute approximately 40-50% of the project’s effort. Follow the phased implementation plan in `docs/implementation_phases.md` and use the provided files (`docs/n8n_workflow.md`, `docs/project-structure.md`, `docs/code-implementation.md`, `docs/system-implementation.md`) as the primary source of truth, supplemented by the guidelines below.

## Objective

- Build three n8n workflows (User Registration, Daily Content Delivery, Engagement Monitoring), frontend interfaces (registration form, admin dashboard, user portal), optional Node.js/Express backend, and API integrations.
- Ensure adherence to the project structure, conventions, and deployment requirements.

## Implementation Guidelines

### 1. Follow Implementation Phases

- **Primary Reference**: Strictly adhere to the five phases in `docs/implementation_phases/`:
  1. **Phase 1: Project Setup and Environment Configuration** (10% effort): Initialize Git, set up `package.json`, create directories, configure environments (development, QA, staging, production).
  2. **Phase 2: Database Setup** (15%): Configure Airtable (`Users`, `Lessons`) and Google Sheets (`Engagement`, `Analytics`, `Performance`).
  3. **Phase 3: n8n Workflows** (40%): Implement User Registration, Daily Content Delivery, and Engagement Monitoring workflows.
  4. **Phase 4: API Integrations and Frontend** (25%): Develop API clients (Google Calendar, Twilio, etc.) and frontend interfaces.
  5. **Phase 5: Testing, Deployment, and Documentation** (10%): Write Jest tests, configure Docker/Terraform, finalize documentation.
- **Action**: Execute tasks in the order specified, completing each phase before moving to the next. Reference the deliverables, Git commit examples, and environment details in `docs/implementation_phases/` for each phase.

### 2. Read Provided Files

- **Files**:
  - `docs/n8n_workflow.md`: Details workflows, node types, triggers, and time handling.
  - `docs/project-structure.md`: Defines directory structure, `package.json`, and environment configurations.
  - `docs/code-implementation.md`: Provides code snippets for Airtable, Google Sheets, and n8n functions.
  - `docs/system-implementation.md`: Outlines architecture, API integrations, and deployment.
- **Action**: Use these files for implementation specifics, referencing paths (e.g., `./n8n-workflows/exports/1-user-registration-workflow.json`).

### 3. Framework and Dependencies

- **Node.js**: v20.x.
- **Dependencies**: Install from `docs/project-structure.md`’s `package.json` (e.g., `express@^4.18.2`, `airtable@^0.12.2`, `openai@^4.28.0`).
- **Dev Dependencies**: `jest@^29.7.0`, `nodemon@^3.0.2`, `eslint@^8.56.0`.
- **n8n**: Latest stable version compatible with nodes (e.g., `n8n-nodes-base.webhook`).
- **Frontend**: Plain HTML/CSS/JavaScript (no frameworks).
- **Action**: Initialize project with `npm init`, install dependencies, and set up `package.json` (Phase 1).

### 4. Git Workflow

- **Commit Messages** (as per `docs/implementation_phases/`):
  - Features: `git commit -m "feat(<scope>): <description>"` (e.g., `feat(workflow): implement user registration workflow`).
  - Bug Fixes: `git commit -m "fix(<scope>): <description>"` (e.g., `fix(api): resolve calendar integration timeout`).
  - Documentation: `git commit -m "docs(<scope>): <description>"` (e.g., `docs(readme): update setup instructions`).
  - Scopes: `auth`, `workflow`, `api`, `docs`, `frontend`, `backend`, `database`, `deployment`.
- **Branches**: Use `feature/<feature-name>`, `fix/<issue-name>`, `docs/<doc-name>`.
- **Action**: Initialize Git repository, set up `.gitignore` (exclude `.env` files), and follow commit format (Phase 1).

### 5. Environment Configurations

- **Environments** (as per `docs/implementation_phases/`):
  - Development: `./.env.development`, `./docker-compose.dev.yml`, `./configs/dev/`.
  - QA: `./.env.qa`, `./docker-compose.qa.yml`, `./configs/qa/`.
  - Staging: `./.env.staging`, `./docker-compose.staging.yml`, `./configs/staging/`.
  - Production: `./.env.production`, `./docker-compose.prod.yml`, `./configs/production/`.
- **Guidelines**:
  - Create `.env.<env>` files with variables (e.g., `AIRTABLE_API_KEY`).
  - Configure Docker Compose for each environment.
  - Store configs in `./configs/<env>/`.
  - Exclude `.env` files from Git.
- **Action**: Set up environment files and Docker Compose configurations (Phase 1).

### 6. Restricted APIs

- **Avoid**: Firebase, Slack, AWS services (e.g., S3, Lambda), deprecated Google APIs, non-Twilio SMS.
- **Action**: Use only approved APIs (Google Calendar, Twilio, OpenAI, Gmail, Airtable) as per `docs/system-implementation.md` (Phase 4).

### 7. Output Requirements

- Use code blocks (e.g., ```javascript).
- Include detailed comments in code.
- Reference files with relative paths (e.g., `./frontend/registration-form/index.html`).
- Log errors to `./monitoring/logs/` with `winston`.
- Follow Git commit format for all changes.

## Instructions

- **Start with Phase 1**: Initialize the project, set up environments, and create the directory structure as per `docs/implementation_phases/`.
- **Progress Sequentially**: Complete each phase before moving to the next, ensuring all tasks and deliverables are met.
- **Provide Updates**: After completing each phase, provide a summary of deliverables and Git commits.
- **Clarify Ambiguities**: If any requirements in the files or phases are unclear, ask for clarification before proceeding.
- **Suggest Improvements**: After each phase, suggest potential enhancements (e.g., adding user feedback collection in workflows).

Begin implementation with Phase 1, adhering to `docs/implementation_phases/` and the provided files. Ensure all commits follow the specified format.
