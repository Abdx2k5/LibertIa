FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    wget curl ca-certificates xvfb \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libdbus-1-3 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libpango-1.0-0 libcairo2 libasound2 \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m playwright install chromium
COPY . .
ENV PYTHONIOENCODING=utf-8
ENV DISPLAY=:99
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x800x24 & tail -f /dev/null"]
