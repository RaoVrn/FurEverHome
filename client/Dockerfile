# Frontend Dockerfile for development
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Expose port
EXPOSE 3000

# Set development environment
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# Start the development server (can be overridden by docker-compose)
CMD ["npm", "start"]
