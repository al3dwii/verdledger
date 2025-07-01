#!/usr/bin/env bash
set -euo pipefail
base=${1:-http://localhost:4000}

curl -fs "$base/v1/skus" >/dev/null
curl -fs -X POST "$base/v1/tokens" -d '{"org":1}' \
     -H 'content-type:application/json' | jq -e '.secret'
echo "✅ backend smoke OK"
