# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Final Image (Python + Frontend Assets)
FROM python:3.11-slim
WORKDIR /app

# Install Backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend code
COPY backend/ .

# Copy built Frontend from Stage 1 into the Python app directory
COPY --from=frontend-build /frontend/build ./build

# Set Environment Variables
ENV PORT=10000

EXPOSE 10000

# Run Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]