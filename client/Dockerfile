# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
