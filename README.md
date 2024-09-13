# Advance Rate Limiter

## Overview

The **Advance Rate Limiter** is a Node.js API cluster designed to handle tasks with specific rate limits. It implements rate limiting and task queueing using Redis, ensuring that tasks are processed according to the limits set for each user ID.

### Features
- **Rate Limiting**: Enforces a limit of 1 task per second and 20 tasks per minute per user ID.
- **Task Queueing**: Manages tasks using Redis to ensure they are processed according to the rate limits.
- **Logging**: Logs task completions with user ID and timestamp to a log file.
- **Clustering**: Utilizes PM2 to run multiple API instances for load balancing and redundancy.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Redis server
- PM2 (for clustering)

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/advance-rate-limiter.git
    cd advance-rate-limiter
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Start Redis**:
    Ensure Redis is running on your local machine:
    ```bash
    redis-server
    ```

4. **Start the API cluster**:
    ```bash
    pm2 start app.js -i 2 --name "api-cluster"
    ```

### API Endpoints

- **POST /task**: Submits a task for processing.

**Request Body**:
```json
{
  "user_id": "user123"
}
