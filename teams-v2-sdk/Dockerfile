FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application and other necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/appPackage ./appPackage

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S teams -u 1001
RUN chown -R teams:nodejs /app
USER teams

# Expose port
EXPOSE 3978

# Health check - basic port availability
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3978/ || exit 1

# Start the application
CMD ["npm", "start"] 