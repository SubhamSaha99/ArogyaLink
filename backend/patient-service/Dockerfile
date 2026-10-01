# =========================
# Stage 1: Build
# =========================
FROM python:3.12-slim AS build

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy requirements first for better layer caching
COPY requirements.txt .

# Create production virtual environment
RUN uv venv /app/.venv

# Install dependencies into virtual environment
RUN uv pip install \
    --python /app/.venv/bin/python \
    --no-cache-dir \
    -r requirements.txt

# Copy application source
COPY src ./src


# =========================
# Stage 2: Prune
# =========================
FROM python:3.12-slim AS prune

WORKDIR /app

# Copy production virtual environment
COPY --from=build /app/.venv ./.venv

# Copy application
COPY --from=build /app/src ./src

# Remove Python cache files
RUN find /app/.venv /app/src \
    -type d -name "__pycache__" \
    -prune \
    -exec rm -rf {} + \
    && find /app/.venv /app/src \
    -type f \
    \( -name "*.pyc" -o -name "*.pyo" \) \
    -delete


# =========================
# Stage 3: Production
# =========================
FROM python:3.12-slim AS production

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Use production virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Copy pruned application
COPY --from=prune /app/.venv /app/.venv
COPY --from=prune /app/src /app/src

# Create upload directories
RUN mkdir -p \
    /app/uploads/temp \
    /app/uploads/patient-profile \
    /app/uploads/medical-record

# FastAPI HTTP
EXPOSE 8080

# gRPC
EXPOSE 50054

# Start FastAPI + gRPC
CMD ["python", "-m", "src.main"]