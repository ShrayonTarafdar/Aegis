# --- STEP 1: Build the Frontend ---
FROM node:18-alpine AS build-step
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# This creates the "build" folder (for Create-React-App)
RUN npm run build

# --- STEP 2: Setup the Backend ---
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libjpeg-dev zlib1g-dev && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
RUN mkdir -p /app/data

# CHANGE dist TO build HERE:
COPY --from=build-step /app/frontend/build ./frontend/build

ENV PYTHONPATH=/app
ENV PORT=10000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]