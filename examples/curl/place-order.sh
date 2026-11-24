#!/usr/bin/env bash
# Place one market order through the FiveSocket REST API.
# This trades a real MT5 account. Try it on a demo account first.
#
# Usage:
#   FIVESOCKET_KEY=mt5_live_... ./place-order.sh <accountId> <symbol> <buy|sell> <volume>
#
# Requirements:
#   - an API key with the trading:execute scope;
#   - the account linked with its trading password, not the investor password;
#   - execution enabled for the account with the symbol on its allowlist, for example:
#       curl -X PUT "$BASE/v1/accounts/<accountId>/execution" \
#         -H "Authorization: Bearer $FIVESOCKET_KEY" -H "Content-Type: application/json" \
#         -d '{"symbols":[{"symbol":"EURUSD","maxVolume":"0.10"}]}'
set -euo pipefail

: "${FIVESOCKET_KEY:?Set FIVESOCKET_KEY to a FiveSocket API key}"
if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <accountId> <symbol> <buy|sell> <volume>" >&2
  exit 2
fi

BASE="${FIVESOCKET_BASE_URL:-https://api.fivesocket.com}"
account_id="$1"
symbol="$2"
side="$3"
volume="$4"
client_order_id="ex-$(date -u +%s)"

curl -sS -X POST "$BASE/v1/accounts/$account_id/execution/orders" \
  -H "Authorization: Bearer ${FIVESOCKET_KEY}" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $client_order_id" \
  -d "{\"clientOrderId\":\"$client_order_id\",\"symbol\":\"$symbol\",\"side\":\"$side\",\"type\":\"market\",\"volume\":\"$volume\"}"
echo
echo "If the outcome is commit_unknown, do not resend. Poll:"
echo "  GET $BASE/v1/accounts/$account_id/execution/commands/<commandId>"
