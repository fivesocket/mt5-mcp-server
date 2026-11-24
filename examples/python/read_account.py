"""Print balance, open positions, last week's closed trades and recent candles.

Usage:
    export FIVESOCKET_KEY=mt5_live_...
    python3 read_account.py [accountId] [symbol]

The API key needs the accounts:read and data:read scopes.
"""

import sys
from datetime import datetime, timedelta, timezone

from fivesocket_client import FiveSocket, FiveSocketError


def iso(moment: datetime) -> str:
    return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


def main() -> int:
    client = FiveSocket()
    try:
        accounts = client.accounts()
        if not accounts:
            print("No linked accounts. Link one at https://fivesocket.com first.")
            return 1
        account_id = sys.argv[1] if len(sys.argv) > 1 else accounts[0]["id"]
        symbol = sys.argv[2] if len(sys.argv) > 2 else "EURUSD"

        balance = client.balance(account_id)
        print(f"{balance['company']} {balance['login']} on {balance['server']}")
        print(f"Balance {balance['balance']} {balance['currency']}, equity {balance['equity']}, free margin {balance['marginFree']}")

        positions = client.positions(account_id)
        print(f"\n{len(positions)} open positions")
        for p in positions:
            print(f"  {p['symbol']:<10} {p['side']:<4} {p['volume']:>6} @ {p['openPrice']}  profit {p['profit']}")

        now = datetime.now(timezone.utc)
        trades = client.trades(account_id, iso(now - timedelta(days=7)), iso(now))
        closing = [t for t in trades if t["entry"] in ("out", "inout", "out_by")]
        total = sum(float(t["profit"]) + float(t["commission"]) + float(t["swap"]) + float(t["fee"]) for t in closing)
        print(f"\n{len(closing)} closing deals in the last 7 days, net {total:.2f} {balance['currency']}")

        candles = client.candles(account_id, symbol, "H1", 5)
        print(f"\nLast {len(candles)} completed H1 candles for {symbol}")
        for c in candles:
            print(f"  {c['openTime']}  O {c['open']}  H {c['high']}  L {c['low']}  C {c['close']}")
    except FiveSocketError as err:
        print(err, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
