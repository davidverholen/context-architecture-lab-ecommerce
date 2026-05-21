FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json vitest.config.ts ./
COPY services ./services
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force

COPY --from=build --chown=node:node /app/dist ./dist

USER node

CMD ["node", "dist/services/akeneo-event-bridge/src/server.js"]
