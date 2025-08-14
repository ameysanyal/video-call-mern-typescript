# Stage 1: Build the React application
FROM node:18 AS build
WORKDIR /app

# Copy package.json and install dependencies to leverage Docker's layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Pass environment variables and secrets to the build process
ARG VITE_BACKEND_URL
ARG VITE_MODE

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_MODE=$VITE_MODE

# Securely handle the VITE_STREAM_API_KEY using a build secret
# The `--secret` flag makes the secret available to this RUN command

RUN --mount=type=secret,id=VITE_STREAM_API_KEY,target=/run/secrets/api.key \
    VITE_STREAM_API_KEY=$(cat /run/secrets/api.key) npm run build 
   
# Stage 2: Serve the application with NGINX
# Use a lean nginx:alpine image for the final container
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy the built files from the first stage to the nginx public folder
COPY --from=build /app/dist .

# Expose port 80 and start nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]