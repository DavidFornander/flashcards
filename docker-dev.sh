#!/bin/bash

# Docker Development Helper Script
# Usage: ./docker-dev.sh [start|stop|restart|logs|clean]

set -e

case "${1:-start}" in
  start)
    echo "🚀 Starting Flashcards app with Docker..."
    docker-compose up -d
    echo ""
    echo "✅ Services started!"
    echo "   Frontend: http://localhost:8100"
    echo "   Backend:  http://localhost:8101"
    echo ""
    echo "View logs: ./docker-dev.sh logs"
    ;;
  stop)
    echo "🛑 Stopping services..."
    docker-compose down
    echo "✅ Services stopped"
    ;;
  restart)
    echo "🔄 Restarting services..."
    docker-compose restart
    echo "✅ Services restarted"
    ;;
  logs)
    docker-compose logs -f
    ;;
  clean)
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Cleanup complete"
    ;;
  build)
    echo "🔨 Building Docker images..."
    docker-compose build --no-cache
    echo "✅ Build complete"
    ;;
  *)
    echo "Usage: $0 [start|stop|restart|logs|clean|build]"
    exit 1
    ;;
esac

