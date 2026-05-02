# Backend Node.js Dockerfile for Stellar Games (DDD Architecture)
FROM node:20-alpine

# Install git for GitHub backup
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Make startup script executable
RUN chmod +x scripts/startup.sh

# Expose API port
EXPOSE 5000

# Start with startup script (creates admin then starts server)
CMD ["sh", "scripts/startup.sh"]
