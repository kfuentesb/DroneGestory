# Stage 1: Build de la aplicación React con Node
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiamos archivos de dependencias para aprovechar la caché de capas de Docker
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y generamos el build de producción
COPY . .
RUN npm run build

# Stage 2: Servidor web ligero con Nginx
FROM nginx:alpine

# Borramos la configuración por defecto de Nginx (opcional pero limpio)
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra configuración personalizada para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos generados por Vite (carpeta dist) a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Arrancamos Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]