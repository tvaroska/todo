# Use Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy poetry files
COPY poetry.lock pyproject.toml ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
