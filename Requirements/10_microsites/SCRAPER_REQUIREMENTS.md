# Menu Scraper System Requirements & Architecture

## Overview
The PaySurity Menu Scraper is a production-grade infrastructure designed to harvest menu data (items, descriptions, prices, and images) from third-party storefronts (e.g., Grubhub) and synchronize them with the PaySurity production database.

## 1. Execution Environment (Docker)
The scraper runs in a specialized headless Chrome environment to bypass modern web protections and handle heavy asynchronous rendering.

### Base Image
- `node:20-slim`

### System Dependencies (Hardened)
The following Linux libraries are required for Playwright/Chromium stability in a containerized environment:
- `libnss3`, `libatk1.0-0`, `libatk-bridge2.0-0`, `libcups2`, `libdrm2`, `libxkbcommon0`, `libxcomposite1`, `libxdamage1`, `libxext6`, `libxfixes3`, `libxrandr2`, `libgbm1`, `libasound2`, `libpango-1.0-0`, `libcairo2`.

### Key Environment Variables
- `PLAYWRIGHT_BROWSERS_PATH`: Set to `/app/pw-browsers` to ensure persistent browser binaries.
- `SOURCE_CSV`: GCS path to the ground-truth menu.
- `TARGET_BUCKET`: GCS bucket for image assets and SQL output.
- `DATABASE_URL`: Pulled from Secret Manager during the sync phase.

## 2. Scraping Logic (Playwright)
### User-Agent Spoofing
Uses a realistic Chrome User-Agent to prevent bot-detection triggers.

### Lazy-Load Handling
- **Automated Scrolling**: Implements a smooth scrolling function that traverses the entire page height to trigger lazy-loaded images and menu sections.
- **Wait Strategies**: Uses `load` navigation events combined with a 5s post-scroll stabilization timeout.

### Extraction & Normalization
- **Broad Selectors**: Targets `[data-testid*="menu-item"]` and generic card classes to adapt to Grubhub's dynamic DOM.
- **Normalized Matching**: 
  - Alphanumeric stripping (lowercase + remove non-a-z0-9).
  - Handles hyphenation and spacing variations (e.g., "Chicken-dum" vs "Chicken Dum").

## 3. Synchronization Pipeline (Cloud Build)
### Phase 1: Data Harvest
- Triggers `apps/menu-scraper/index.js`.
- Downloads source CSV.
- Scrapes target URL.
- Uploads images to GCS.
- Generates `updates.sql`.

### Phase 2: Secure Database Sync
- Uses `cloudbuild-db-sync.yaml`.
- Pulls `paysurity-db-url` from Secret Manager.
- Executes `scripts/apply-hob-updates.js` using TypeORM.
- Updates both `base_price` and `display_price` for 100% price parity.

## 4. Maintenance & Scaling
- **Debug Mode**: Automatically captures `debug_screenshot.png` to GCS for visual forensic analysis of rendering failures.
- **Idempotency**: Scraper can be re-run safely; SQL updates target specific `tenant_id` and item names.
