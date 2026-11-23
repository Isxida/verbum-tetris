# Etapa 1: construir el sitio. Vite 8 exige Node 20.19+ o 22.12+; la imagen slim (glibc) evita problemas con los binarios nativos.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir dist con NGINX; la compresión y el caché están en nginx.conf.
# En Dokploy: Build Type "Dockerfile" y puerto 80 en el dominio.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
