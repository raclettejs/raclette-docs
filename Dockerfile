# Stage 1: Build the VitePress site
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files for better caching
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy source files
COPY . .

# Generate static files
RUN yarn build

# Stage 2: Serve with Nginx - this is our production target
FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html

# Copy the built files from the build stage
COPY --from=build /app/.vitepress/dist/ .

# Copy a custom nginx config
COPY provision/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

