# ---------- Build Stage ----------
# Use a full Node.js image to install all dependencies and build the app.
FROM node:22.12.0-alpine AS build
WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (production + development)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the app (needs dev dependencies like 'tsc').
RUN npm run build

# Remove dev dependencies to leave only production ones
RUN npm prune --production


# ---------- Production Stage ----------
# Use a new, minimal Node.js image to run the app.
FROM node:22.12.0-alpine AS production
WORKDIR /app

# Copy only production node_modules from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy build artifacts
COPY --from=build /app/dist ./dist

# Copy package.json (needed for npm start script)
COPY --from=build /app/package.json ./

# Expose the API port
EXPOSE 5001

# Start the application in production mode
CMD ["npm", "run", "start"]
