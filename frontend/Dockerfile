# Multi-stage Dockerfile para optimizar el peso de la imagen de producción

# --- Fase 1: Compilación ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Fase 2: Servidor Web Nginx para servir el contenido estático ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copiamos configuración personalizada de Nginx para SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
