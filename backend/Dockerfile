# --- Fase 1: Compilación de TypeScript ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Fase 2: Ejecución en producción ---
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
