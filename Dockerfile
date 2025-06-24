# Dockerfile for Micro-Learning Scheduler
# Multi-stage build for development, staging, and production environments

# Base stage with common dependencies
FROM node:18-alpine AS base

# Install system dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    sqlite \
    postgresql-client \
    redis \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose development port
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Development command
CMD ["dumb-init", "npm", "run", "dev"]

# Dependencies stage for production optimization
FROM base AS deps

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder

# Install all dependencies for building
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Staging stage
FROM base AS staging

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copy configuration files
COPY .env.staging ./.env
COPY src/config ./src/config

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose staging port
EXPOSE 3001

# Health check for staging
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Staging command
CMD ["dumb-init", "node", "dist/index.js"]

# Production stage
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copy only necessary configuration files
COPY .env.production ./.env
COPY src/config ./src/config

# Create logs directory
RUN mkdir -p /app/logs

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose production port
EXPOSE 3000

# Health check for production
HEALTHCHECK --interval=60s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Production command with process management
CMD ["dumb-init", "node", "dist/index.js"]

# Labels for metadata
LABEL maintainer="Micro-Learning Scheduler Team"
LABEL version="1.0.0"
LABEL description="Micro-Learning Scheduler Application"
LABEL org.opencontainers.image.source="https://github.com/your-org/micro-learning-scheduler"