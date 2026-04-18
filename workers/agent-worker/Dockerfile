FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Build TypeScript
RUN npm install -D tsx typescript
RUN npx tsc --noEmit 2>/dev/null || true

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run worker with tsx (handles TypeScript path aliases)
CMD ["npx", "tsx", "--tsconfig", "tsconfig.json", "workers/agent-worker/index.ts"]
