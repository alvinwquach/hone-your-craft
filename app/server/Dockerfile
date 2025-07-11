# Use official slim Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies needed for spaCy and building packages
RUN apt-get update && apt-get install -y gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies (including spaCy)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy English medium model
RUN python -m spacy download en_core_web_md

# Copy FastAPI source code
COPY skills_api.py /app/app/skills_api.py

# Copy skills.json
COPY skills.json /app/skills.json

# Expose FastAPI port
EXPOSE 8080

# Run the FastAPI app using uvicorn
CMD ["uvicorn", "app.skills_api:app", "--host", "0.0.0.0", "--port", "8080"]
