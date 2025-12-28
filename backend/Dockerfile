# Use Python 3.11 slim image
FROM python:3.11-slim

# Install system dependencies for packages like Pillow or multipart
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Render uses port 10000 by default. FastAPI should listen on 0.0.0.0
EXPOSE 10000

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]