#!/usr/bin/env bash
# Read live MT5 data with the FiveSocket REST API.
# Usage: FIVESOCKET_KEY=mt5_live_... ./read-account.sh [accountId]
# Needs an API key with accounts:read and data:read. Without an accountId it
# lists your linked accounts and reads the first one.
set -euo pipefail

: "${FIVESOCKET_KEY:?Set FIVESOCKET_KEY to a FiveSocket API key}"
BASE="${FIVESOCKET_BASE_URL:-https://api.fivesocket.com}"
AUTH="Authorization: Bearer ${FIVESOCKET_KEY}"

get() {
  local body status
  body="$(curl -sS -w '\n%{http_code}' -H "$AUTH" "$BASE$1")"
  status="${body##*$'\n'}"
  body="${body%$'\n'*}"
  if [ "$status" -ge 300 ]; then
    echo "HTTP $status: $body" >&2
    exit 1
  fi
  printf '%s' "$body"
}

echo "== Linked accounts"
accounts="$(get /v1/accounts)"
echo "$accounts"

account_id="${1:-$(printf '%s' "$accounts" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d '"' -f 4)}"
if [ -z "$account_id" ]; then
  echo "No linked accounts. Link one at https://fivesocket.com first." >&2
  exit 1
fi

echo
echo "== Balance for $account_id"
get "/v1/accounts/$account_id/balance"

echo
echo
echo "== Open positions"
get "/v1/accounts/$account_id/positions"

to="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
from="$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)"

echo
echo
echo "== Closed trades, last 7 days"
get "/v1/accounts/$account_id/trades?from=$from&to=$to&limit=50"

echo
echo
echo "== Last 20 H1 candles for ${SYMBOL:-EURUSD}"
get "/v1/accounts/$account_id/candles?symbol=${SYMBOL:-EURUSD}&timeframe=H1&count=20"
echo
