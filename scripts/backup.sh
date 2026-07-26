#!/bin/bash
# DiagnoConnect - Database Backup Script
set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/diagnosconnect_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

echo "Starting database backup..."
docker compose exec -T postgres pg_dump -U postgres diagnosconnect | gzip > $BACKUP_FILE

echo "Backup created: $BACKUP_FILE"
echo "Size: $(du -h $BACKUP_FILE | cut -f1)"

# Keep only last 30 backups
ls -t $BACKUP_DIR/diagnosconnect_*.sql.gz | tail -n +31 | xargs -r rm
echo "Old backups cleaned."
