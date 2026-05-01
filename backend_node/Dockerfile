# Backend Node.js Dockerfile for Stellar Games (DDD Architecture)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Start server
CMD ["node", "src/index.js"]
