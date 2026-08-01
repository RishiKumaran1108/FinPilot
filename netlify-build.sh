#!/bin/bash
set -euo pipefail

echo "🚀 Starting FinPilot build..."

# Run the full build — may partially fail at Nitro server bundle step
npm run build || NITRO_FAILED=1

# If .output/public was generated, we can still deploy the static assets
if [ -d ".output/public" ]; then
  echo "✅ .output/public found — deploying static assets"
  exit 0
fi

# If the whole thing failed, abort
echo "❌ Build failed: .output/public not found"
exit 1
