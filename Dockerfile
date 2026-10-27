# ==============================================================================
# AquaSat AI: Production Multi-Stage Dockerfile
# Stage 1: Build React Vite SPA
# Stage 2: Package FastAPI Backend + TensorFlow U-Net Inference Engine
# ==============================================================================

# Stage 1: Frontend Build
FROM node:22-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend + Model Inference
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for Pillow and PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Application
COPY backend /app/backend

# Copy compiled frontend SPA from Stage 1
COPY --from=frontend-builder /build/dist /app/frontend/dist

# Create storage upload directories
RUN mkdir -p /app/backend/uploads/images \
             /app/backend/uploads/masks \
             /app/backend/uploads/overlays \
             /app/backend/model_weights

WORKDIR /app/backend

# Default port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
