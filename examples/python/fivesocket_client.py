"""A small FiveSocket REST API client using only the Python standard library.

Docs: https://docs.fivesocket.com
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from typing import Any

DEFAULT_BASE_URL = "https://api.fivesocket.com"
RETRYABLE_STATUSES = {202, 429, 503}


class FiveSocketError(Exception):
    def __init__(self, status: int, code: str, message: str, request_id: str | None):
        super().__init__(f"{status} {code}: {message} (requestId {request_id})")
        self.status = status
        self.code = code
        self.request_id = request_id


class FiveSocket:
    def __init__(self, api_key: str | None = None, base_url: str | None = None, max_attempts: int = 4):
        self.api_key = api_key or os.environ["FIVESOCKET_KEY"]
        self.base_url = (base_url or os.environ.get("FIVESOCKET_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
        self.max_attempts = max_attempts

    def request(
        self,
        method: str,
        path: str,
        query: dict[str, Any] | None = None,
        body: dict[str, Any] | None = None,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        url = self.base_url + path
        if query:
            url += "?" + urllib.parse.urlencode({k: v for k, v in query.items() if v is not None})
        headers = {"Authorization": f"Bearer {self.api_key}", "Accept": "application/json"}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key

        for attempt in range(1, self.max_attempts + 1):
            req = urllib.request.Request(url, data=data, method=method, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=120) as res:
                    status, payload, retry_after = res.status, json.load(res), res.headers.get("Retry-After")
            except urllib.error.HTTPError as err:
                raw = err.read()
                status, retry_after = err.code, err.headers.get("Retry-After")
                payload = json.loads(raw) if raw else {}

            is_error_envelope = "error" in payload
            if status == 200 or (status < 300 and not is_error_envelope and method != "GET"):
                return payload
            if status in RETRYABLE_STATUSES and is_error_envelope and attempt < self.max_attempts:
                time.sleep(min(int(retry_after or 2), 30))
                continue
            if not is_error_envelope:
                return payload
            error = payload["error"]
            raise FiveSocketError(status, error.get("code", "unknown"), error.get("message", ""), error.get("requestId"))
        raise RuntimeError("unreachable")

    def accounts(self) -> list[dict[str, Any]]:
        return self.request("GET", "/v1/accounts")["data"]

    def balance(self, account_id: str) -> dict[str, Any]:
        return self.request("GET", f"/v1/accounts/{account_id}/balance")

    def positions(self, account_id: str) -> list[dict[str, Any]]:
        return self.request("GET", f"/v1/accounts/{account_id}/positions")["positions"]

    def trades(self, account_id: str, start: str, end: str, limit: int = 100) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        page = self.request("GET", f"/v1/accounts/{account_id}/trades", {"from": start, "to": end, "limit": limit})
        while True:
            rows.extend(page["data"])
            cursor = page.get("nextCursor")
            if not cursor:
                return rows
            page = self.request("GET", f"/v1/accounts/{account_id}/trades", {"cursor": cursor, "limit": limit})

    def candles(self, account_id: str, symbol: str, timeframe: str = "H1", count: int = 100) -> list[dict[str, Any]]:
        query = {"symbol": symbol, "timeframe": timeframe, "count": count}
        return self.request("GET", f"/v1/accounts/{account_id}/candles", query)["data"]

    def market_order(self, account_id: str, symbol: str, side: str, volume: str) -> dict[str, Any]:
        client_order_id = "ex-" + uuid.uuid4().hex[:20]
        body = {"clientOrderId": client_order_id, "symbol": symbol, "side": side, "type": "market", "volume": volume}
        return self.request(
            "POST", f"/v1/accounts/{account_id}/execution/orders", body=body, idempotency_key=client_order_id
        )
