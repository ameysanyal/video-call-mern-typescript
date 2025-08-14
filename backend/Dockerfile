# Stage 1: Build Node.js app
FROM node:alpine3.18 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Run with Nginx and Node.js
FROM alpine:3.18

# Install Node.js, npm, and Nginx
RUN apk add --no-cache nodejs npm nginx

# Copy built Node.js app from previous stage
COPY --from=build /app /usr/src/app

# Copy Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Set working directory
WORKDIR /usr/src/app

# Expose ports (Nginx on 80)
EXPOSE 80

# Start both Node.js app and Nginx
CMD sh -c "node dist/src/server.js & nginx -g 'daemon off;'"
