# Use Python 3.11 slim for a smaller image size
FROM python:3.11-slim

# Install system dependencies for Pillow (Image processing)
RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
# We copy the 'backend' folder content into 'backend' directory in container
COPY . /app/backend
COPY data /app/data

# Expose the port Render will use
ENV PORT=8000
EXPOSE 8000

# Set PYTHONPATH so 'from backend import ...' works
ENV PYTHONPATH=/app

# Run the application
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]