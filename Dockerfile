# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ---- Production Stage ----
FROM node:20-alpine
LABEL maintainer="MHS3 Wiki"

ARG BUILD_VERSION=dev
ENV BUILD_VERSION=${BUILD_VERSION}

RUN apk add --no-cache tini
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/

# Inject build version into HTML for cache busting (?v=<git-sha>)
RUN sed -i "s/?v=[a-zA-Z0-9]*/?v=${BUILD_VERSION}/g" src/public/index.html

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/app.js"]
