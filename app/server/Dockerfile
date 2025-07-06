# Use official slim Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (e.g., for spacy)
RUN apt-get update && apt-get install -y gcc

# Optional: Install language models like en_core_web_md
RUN pip install --no-cache-dir spacy && python -m spacy download en_core_web_md

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code and skill json
COPY app/ ./app
COPY skills.json .

# Optionally copy .env if using python-dotenv (only for local/dev, not production secrets)
COPY .env .env

# Expose FastAPI port
EXPOSE 8000

# Run app
CMD ["uvicorn", "app.skills_api:app", "--host", "0.0.0.0", "--port", "8000"]
