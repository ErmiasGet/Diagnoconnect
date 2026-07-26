# DiagnoConnect - Multi-stage Dockerfile for Backend API
# ============================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY packages/backend/package*.json ./
COPY packages/shared/package*.json ../shared/

# Install dependencies
RUN npm ci --workspace=packages/backend

# Copy source code
COPY packages/backend/ ./packages/backend/
COPY packages/shared/ ../shared/

# Generate Prisma client
RUN cd packages/backend && npx prisma generate

# Build TypeScript
RUN cd packages/backend && npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S diagnosconnect && \
    adduser -S diagnosconnect -u 1001

# Copy package files
COPY packages/backend/package*.json ./
COPY packages/shared/package*.json ../shared/

# Install production dependencies only
RUN npm ci --omit=dev --workspace=packages/backend

# Copy built files
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/backend/prisma ./prisma

# Create necessary directories
RUN mkdir -p uploads logs && chown -R diagnosconnect:diagnosconnect /app

USER diagnosconnect

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
