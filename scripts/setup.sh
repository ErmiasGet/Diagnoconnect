#!/bin/bash
# DiagnoConnect - Production Setup Script
set -e

echo "=================================="
echo "DiagnoConnect Setup"
echo "=================================="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required. Install it first."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo "Docker Compose is required."; exit 1; }

# Copy environment file
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "Please edit .env with your configuration!"
fi

# Generate secrets
echo "Generating secure secrets..."
JWT_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
DB_PASSWORD=$(openssl rand -hex 16)

# Update .env
sed -i "s/your-super-secure-jwt-secret-64-chars-minimum/$JWT_SECRET/" .env
sed -i "s/your-super-secure-refresh-secret-64-chars-minimum/$JWT_REFRESH_SECRET/" .env
sed -i "s/your-secure-database-password/$DB_PASSWORD/" .env

echo "Starting services..."
docker compose up -d

echo "Waiting for database..."
sleep 10

echo "Running database migrations..."
docker compose exec -T backend npx prisma migrate deploy

echo "Seeding database..."
docker compose exec -T backend npx tsx src/database/seed.ts

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Patient Portal:  http://localhost"
echo "Admin Dashboard: http://localhost:8080"
echo "API:             http://localhost:3000/api/v1"
echo ""
echo "Default Login:"
echo "  Admin: admin@diagnosconnect.com / Admin@123"
echo "  Hospital Admin: admin@citygeneral.hospital / Admin@123"
echo ""
