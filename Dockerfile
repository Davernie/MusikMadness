# Base image with Node.js
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies - separate layer for better caching
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM deps AS builder
COPY . .
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Copy built files and necessary assets
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/public /app/public
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json ./

# Set correct permissions
RUN chown -R node:node /app
USER node

# Expose the port
EXPOSE 5173

# Start the application
CMD ["npm", "run", "preview"] 