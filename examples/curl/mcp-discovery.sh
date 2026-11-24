#!/usr/bin/env bash
# Show how an MCP client discovers FiveSocket's OAuth sign-in.
# No account or key needed. An unauthenticated request gets 401 with a
# WWW-Authenticate header pointing at the protected-resource metadata, which
# names the authorization server. Clients then register (RFC 7591), and run
# OAuth 2.1 with S256 PKCE in the browser.
set -euo pipefail

RESOURCE="${1:-https://api.fivesocket.com/mcp}"
ORIGIN="$(printf '%s' "$RESOURCE" | sed -E 's#(https?://[^/]+).*#\1#')"
RPATH="$(printf '%s' "$RESOURCE" | sed -E 's#https?://[^/]+##')"

echo "== POST $RESOURCE without a token"
curl -sS -o /dev/null -D - -X POST "$RESOURCE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"discovery-example","version":"1.0.0"}}}' \
  | grep -iE '^(HTTP|www-authenticate)'

echo
echo "== Protected-resource metadata"
curl -sS "$ORIGIN/.well-known/oauth-protected-resource$RPATH"
echo
echo
echo "== Authorization-server metadata"
curl -sS "$ORIGIN/.well-known/oauth-authorization-server"
echo
