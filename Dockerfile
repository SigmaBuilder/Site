FROM node:22-alpine

# Set to production environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Expose port 3002
EXPOSE 3002

# Set runtime port environment variable
ENV PORT=3002

# Start command
CMD ["node", "src/app.js"]
