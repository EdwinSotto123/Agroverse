FROM python:3.9-slim-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Variables de entorno
ENV GEMINI_API_KEY=""
ENV PORT=8080
ENV HOST="0.0.0.0"

EXPOSE 8080

CMD ["python", "server.py"]
