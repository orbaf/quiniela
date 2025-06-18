# -------- Base stage (for Production) --------
FROM node:22.1.0-slim AS base

# Install curl for HEALTHCHECK
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 quinielauser

WORKDIR /app

COPY package.json yarn.lock ./

# -------- Development stage --------
FROM node:22.1.0 AS development

# Create a non-root user and group since we are not using the base stage
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 quinielauser

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --prefer-offline

# Evita conflictos de volumen con node_modules en el host
COPY . .

# Use the non-root user
USER quinielauser

EXPOSE 3000

CMD ["npx", "nodemon", "index.js"]

# -------- Production stage --------
FROM base AS production

# Instalación de solo dependencias necesarias
RUN yarn install --production --frozen-lockfile --prefer-offline

COPY . .

# Change ownership to non-root user
RUN chown -R quinielauser:nodejs /app
USER quinielauser

EXPOSE 3000

# Healthcheck for the application
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

CMD ["node", "index.js"]
    