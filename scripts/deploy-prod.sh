#!/usr/bin/env bash
# Deploy production WITHOUT consuming Netlify cloud build minutes/credits.
# Builds locally and uploads — the reliable bypass while the Netlify account
# has a usage/credit cap that blocks server-side builds ("Skipped due to
# account credit usage exceeded"). Site is linked to live-toro-site.
set -euo pipefail
cd "$(dirname "$0")/.."
MSG="${1:-Manual prod deploy (local build)}"
netlify deploy --build --prod --message "$MSG"
