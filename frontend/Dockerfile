# ---------- Build Stage ----------
FROM node:22.12.0-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Sets the working directory for the second stage to Nginx's default web server root.
WORKDIR /usr/share/nginx/html

# It copies only the built static files from the /app/dist directory of the build stage into the current directory of the production stage.
COPY --from=build /app/dist .

# Copy your custom nginx.conf file
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Starts Nginx with the -g daemon off argument to run in the foreground. This allows the container to run indefinitely without the need for a separate process.
CMD ["nginx", "-g", "daemon off;"]
