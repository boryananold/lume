#!/bin/bash
# Usage: ./supabase/run-query.sh "SELECT 1"
# Or pipe a file: cat supabase/migration.sql | ./supabase/run-query.sh
set -e

source "$(dirname "$0")/../.env"

PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | cut -d'.' -f1)
TOKEN="$SUPABASE_ACCESS_TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN not set in .env"
  exit 1
fi

QUERY="${1:-$(cat /dev/stdin)}"

RESULT=$(curl -s -X POST \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$QUERY" | jq -Rs .)}")

if echo "$RESULT" | jq -e '.message' > /dev/null 2>&1; then
  echo "Error: $(echo "$RESULT" | jq -r '.message')"
  exit 1
fi

echo "Done: $RESULT"
