"""Place one market order. This trades a real MT5 account: try it on a demo first.

Usage:
    export FIVESOCKET_KEY=mt5_live_...
    python3 place_order.py <accountId> <symbol> <buy|sell> <volume>

Requirements: an API key with trading:execute, the account linked with its
trading password, and execution enabled for the account with the symbol on its
allowlist (PUT /v1/accounts/{accountId}/execution, see https://docs.fivesocket.com).
"""

import json
import sys

from fivesocket_client import FiveSocket, FiveSocketError


def main() -> int:
    if len(sys.argv) != 5 or sys.argv[3] not in ("buy", "sell"):
        print(__doc__)
        return 2
    account_id, symbol, side, volume = sys.argv[1:]
    try:
        command = FiveSocket().market_order(account_id, symbol, side, volume)
    except FiveSocketError as err:
        print(err, file=sys.stderr)
        return 1
    print(json.dumps(command, indent=2))
    if command.get("outcome") == "commit_unknown":
        print(f"Outcome unknown. Do not resend; poll /v1/accounts/{account_id}/execution/commands/{command['commandId']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
