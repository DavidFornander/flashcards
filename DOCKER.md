# Docker Development Setup

This guide explains how to run the Flashcards app using Docker Compose for a simple, one-command startup.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Firebase service account JSON key file

## Quick Start

1. **Set up Firebase credentials:**
   ```bash
   # Copy your Firebase service account JSON to the secrets directory
   cp path/to/your-firebase-key.json backend/secrets/firebase-key.json
   ```

2. **Start the application:**
   ```bash
   docker-compose up
   ```
   
   Or use the convenience script:
   ```bash
   ./docker-dev.sh start
   ```

3. **Access the application:**
   - Frontend: http://localhost:8100
   - Backend API: http://localhost:8101
   - Health check: http://localhost:8101/health

## Project Structure

```
flashcards/
├── docker-compose.yml          # Main Docker Compose configuration
├── docker-dev.sh               # Convenience script for common operations
├── backend/
│   ├── Dockerfile.dev          # Backend development Dockerfile
│   └── secrets/
│       └── firebase-key.json   # Firebase credentials (gitignored)
└── frontend/
    └── Dockerfile.dev          # Frontend development Dockerfile
```

## Services

### Backend (`backend`)
- **Port:** 8101 (exposed to host)
- **Technology:** Node.js + Express + TypeScript
- **Hot Reload:** Yes (via volume mounts)
- **Credentials:** Firebase service account JSON via Docker secrets

### Frontend (`frontend`)
- **Port:** 8100 (exposed to host)
- **Technology:** React + Vite
- **Hot Reload:** Yes (via volume mounts)
- **API URL:** Automatically configured to use `http://backend:8101` in Docker

## Docker Commands

### Using docker-compose directly:

```bash
# Start services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild images
docker-compose build

# Rebuild and start
docker-compose up --build
```

### Using the convenience script:

```bash
# Start services
./docker-dev.sh start

# Stop services
./docker-dev.sh stop

# Restart services
./docker-dev.sh restart

# View logs
./docker-dev.sh logs

# Clean up (removes containers, volumes, and unused images)
./docker-dev.sh clean

# Rebuild images
./docker-dev.sh build
```

## Environment Variables

Environment variables can be set in a `.env` file in the project root (optional):

```env
DATA_PROVIDER=firestore
PORT=8101
```

The `docker-compose.yml` file sets these defaults:
- `DATA_PROVIDER=firestore` (default)
- `PORT=8101` (backend port)
- `VITE_API_URL=http://backend:8101` (frontend API URL)

## Firebase Credentials Setup

### Option 1: Docker Secrets (Recommended)

1. Place your Firebase service account JSON file in `backend/secrets/firebase-key.json`
2. The file is automatically mounted as a Docker secret
3. The backend reads it from `/run/secrets/firebase-key.json`

### Option 2: Environment Variable

You can also set `GOOGLE_APPLICATION_CREDENTIALS` to point to a mounted volume path.

## Hot Reload

Both services support hot reload:

- **Backend:** Source code changes in `backend/src/` are immediately reflected
- **Frontend:** Source code changes in `frontend/src/` trigger Vite HMR

Note: Only source files are mounted. `node_modules` are in Docker volumes for performance.

## Networking

- Services communicate internally using service names (`backend`, `frontend`)
- Frontend calls backend at `http://backend:8101` (internal Docker network)
- External access:
  - Frontend: `http://localhost:8100`
  - Backend: `http://localhost:8101`

## Troubleshooting

### Services won't start

1. **Check Docker is running:**
   ```bash
   docker ps
   ```

2. **Check logs:**
   ```bash
   docker-compose logs
   ```

3. **Verify Firebase credentials:**
   ```bash
   ls -la backend/secrets/firebase-key.json
   ```

### Port already in use

If ports 8100 or 8101 are already in use, you can change them in `docker-compose.yml`:

```yaml
ports:
  - "8100:8100"  # Change first number to available port
```

### Frontend can't connect to backend

- Ensure backend service is healthy (check `docker-compose ps`)
- Verify `VITE_API_URL` is set correctly in docker-compose.yml
- Check network connectivity: `docker-compose exec frontend ping backend`

### Rebuild after dependency changes

If you add new npm packages:

```bash
# Rebuild images
docker-compose build

# Or rebuild and restart
docker-compose up --build
```

## Development Workflow

1. **Make code changes** in `backend/src/` or `frontend/src/`
2. **Changes are automatically reflected** (hot reload)
3. **View logs** to debug: `docker-compose logs -f`
4. **Test changes** at http://localhost:8100

## Production Considerations

This setup is for **development only**. For production:

- Use production Dockerfiles (without dev dependencies)
- Build static frontend assets
- Use proper secrets management
- Set up proper health checks and monitoring
- Configure reverse proxy (nginx/traefik)
- Use Docker Swarm or Kubernetes for orchestration

## Cleanup

To completely remove all Docker resources:

```bash
./docker-dev.sh clean
```

Or manually:
```bash
docker-compose down -v
docker system prune -f
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [Backend README](backend/README.md) for backend-specific documentation

