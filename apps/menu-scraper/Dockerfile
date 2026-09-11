FROM node:20-slim

# Install system dependencies for Playwright/Chromium
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && npx playwright install-deps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set custom path for browsers to ensure visibility in Cloud Build
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers

COPY package.json ./
RUN npm install

# Install Playwright browsers to the custom path
RUN npx playwright install chromium

COPY . .

CMD ["node", "/app/index.js"]
