#!/usr/bin/env bash
set -euo pipefail

echo "Starting Akeneo CE..."
npm run akeneo:up

echo "Starting local projection stack..."
docker compose up -d --build n8n product-projection-service mock-shopify akeneo-event-bridge

echo "Activating n8n product projection workflow..."
npm run n8n:activate-product-flow

echo "Configuring Akeneo webhook subscription..."
npm run akeneo:configure-webhook

echo "Starting Akeneo webhook worker..."
npm run akeneo:webhook-worker

echo "Seeding/updating Akeneo rug product..."
npm run akeneo:seed-rug

echo "Setup complete."
echo "Akeneo: http://localhost:8080"
echo "n8n: http://localhost:${N8N_PORT:-5678}"
echo "Mock Shopify dumps: .local/mock-shopify-dumps"
