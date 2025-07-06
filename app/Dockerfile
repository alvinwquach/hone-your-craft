# ---- Build Stage ----
FROM node:18.17.0 AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY ./client/package.json ./client/package-lock.json* ./
RUN npm install

# Copy project files
COPY ./client .

# Build the app
RUN npm run build

# ---- Production Stage ----
FROM node:18.17.0

# Set working directory
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/.env.production ./.env.production

# Set environment
ENV NODE_ENV=production

# Expose the Next.js default port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
