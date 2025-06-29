#!/usr/bin/env bash
set -e

echo "🔍 Python caches…"
find . -type d -name "__pycache__"   -prune -exec rm -rf {} +
find . -type d -name ".pytest_cache" -prune -exec rm -rf {} +
find . -type d -name ".mypy_cache"   -prune -exec rm -rf {} +
rm -f .coverage

echo "🗑 Node & build artefacts…"
# Core Node modules
find . -type d -name "node_modules" -prune -exec rm -rf {} +

# Next.js build dir
find . -type d -name ".next" -prune -exec rm -rf {} +

# Other common JS/TS build caches
find . -type d \( -name ".turbo" -o -name ".parcel-cache" -o \
                 -name ".nuxt"  -o -name "dist" -o -name "coverage" \
               \) -prune -exec rm -rf {} +

rm -f **/.eslintcache

echo "🗑 Editor/OS cruft…"
rm -rf .vscode
find . -type f -name ".DS_Store" -delete

echo "✅  Clean-up complete."
echo "💡  Tip: run 'git clean -Xdff' afterwards for a Git-ignored sweep if your .gitignore lists .next/ and node_modules/."
