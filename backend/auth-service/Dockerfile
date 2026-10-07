# =========================
# Stage 1: Build
# =========================
FROM node:24-alpine3.21 AS build

WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies required for building
RUN npm install

# Copy application source
COPY . .

# Build NestJS application
RUN npm run build

# Remove development dependencies
RUN rm -rf node_modules

# Install production dependencies only
RUN npm install --omit=dev


# =========================
# Stage 2: Prune
# =========================
# Use a minimal Alpine base for the prune utility to reduce OS-level CVEs while
# keeping the final production image lean and patched.
FROM golang:1.26-alpine AS prune

WORKDIR /usr/src/app

# Copy only production application files
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

# Install git and node-prune
RUN apk add --no-cache git \
    && go install github.com/tj/node-prune@latest

# Remove unnecessary files from node_modules
RUN node-prune


# =========================
# Stage 3: Production
# =========================
FROM node:24-alpine3.21 AS production

WORKDIR /usr/src/app

ENV NODE_ENV=container

# Copy pruned application
COPY --from=prune /usr/src/app /usr/src/app

# Auth service HTTP port
EXPOSE 8081

# Start NestJS application
CMD ["node", "dist/main.js"]