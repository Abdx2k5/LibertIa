FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    wget curl gnupg ca-certificates \
    fonts-liberation libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 \
    libgtk-3-0 libnspr4 libnss3 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 xdg-utils xvfb \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install chromium
RUN playwright install-deps chromium
COPY . .
ENV PYTHONIOENCODING=utf-8
ENV DISPLAY=:99
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x800x24 & tail -f /dev/null"]
