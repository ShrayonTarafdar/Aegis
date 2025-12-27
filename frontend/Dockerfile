# Stage 1: Build React App
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build the app (ensure your fetch URLs in JS point to the RENDER backend URL)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy build files from Stage 1 (Change 'dist' to 'build' if using Create-React-App)
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Render needs Nginx to listen on a specific port
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]