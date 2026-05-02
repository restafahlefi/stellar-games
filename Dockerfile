# Multi-stage build for Railway All-in-One Deployment
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend_node/package*.json ./

# Install backend dependencies (production only)
RUN npm ci --only=production --legacy-peer-deps

# Stage 3: Production
FROM node:18-alpine

WORKDIR /app

# Copy backend dependencies and source
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY backend_node/ ./

# Copy built frontend to backend's public directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Railway will set PORT env var)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/index.js"]
