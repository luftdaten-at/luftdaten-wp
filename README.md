# WordPress Theme Development Environment

A Docker Compose setup for WordPress theme development with MariaDB.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Start the containers:**
   ```bash
   docker-compose up -d
   ```

2. **Access WordPress:**
   - Open your browser and navigate to: `http://localhost`
   - Follow the WordPress installation wizard

3. **Stop the containers:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (clean slate):**
   ```bash
   docker-compose down -v
   ```

## Project Structure

```
.
├── docker-compose.yml
├── README.md
└── luftdaten-wp/
```
