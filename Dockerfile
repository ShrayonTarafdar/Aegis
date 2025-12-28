# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Final Image (Python + Built Frontend)
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies required for Pillow and py-webauthn (cryptography)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    libffi-dev \
    libssl-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements FIRST (optimizes Docker caching)
COPY backend/requirements.txt .

# Upgrade pip and install Python packages
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy Backend code
COPY backend/ .

# Copy built Frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/build ./build

# Render uses port 10000
EXPOSE 10000

# Start FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]