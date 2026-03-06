# Stage 1: Build React app
FROM node:20 AS build

WORKDIR /app

# Copiar solo los package.json primero para cachear npm install
COPY package*.json ./

RUN npm install

# Copiar todo el proyecto
COPY . .

# Build de producción
RUN npm run build

# Stage 2: Servir con Nginx
FROM nginx:alpine

# Copiar build de Vite a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]