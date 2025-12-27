# --- STEP 1: Build the Frontend ---
FROM node:18-alpine AS build-step
WORKDIR /app/frontend
# Copy only the package files to install dependencies
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend source code
COPY frontend/ ./
# This command CREATES the "dist" folder you were looking for
RUN npm run build

# --- STEP 2: Setup the Backend ---
FROM python:3.11-slim
WORKDIR /app

# Install system tools for image processing (Pillow)
RUN apt-get update && apt-get install -y \
    libjpeg-dev zlib1g-dev && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Backend code
COPY backend/ ./backend/
# Create data folder for SQLite
RUN mkdir -p /app/data

# Copy the "dist" folder from the build-step into the final image
COPY --from=build-step /app/frontend/dist ./frontend/dist

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=10000

# Start the server
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]