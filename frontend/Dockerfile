# Step 1: Build the React app
FROM node:18-alphine AS build-stage
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy the build output to Nginx's default public folder
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy a custom nginx config to handle React Router (important for SPAs)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]