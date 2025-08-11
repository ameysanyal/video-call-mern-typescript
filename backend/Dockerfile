# Use a lightweight Node.js base image (Alpine Linux)
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching for deps
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project into dist/
RUN npm run build

# Expose the API port (keep in sync with app/server configuration)
EXPOSE 5001

# Start the application in production mode
CMD ["npm", "run", "start"]
