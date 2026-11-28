# MT5 MCP Server: connect MetaTrader 5 to Claude, ChatGPT and Cursor

[![FiveSocket MT5 MCP connector](https://glama.ai/mcp/connectors/com.fivesocket/mt5/badges/score.svg)](https://glama.ai/mcp/connectors/com.fivesocket/mt5)

**FiveSocket is a hosted MT5 MCP server.** Link your MetaTrader 5 account once in the browser, then ask Claude, ChatGPT, Cursor or any MCP client about your balance, positions, trade history and charts. With your permission, it can also place trades.

No Windows PC, no VPS, no MT5 terminal left running, no Python, and no broker password in a config file.

- **Server URL:** `https://api.fivesocket.com/mcp`
- **Read-only server URL:** `https://api.fivesocket.com/mcp/read`
- **Website and setup guide:** https://fivesocket.com/mcp
- **Docs:** https://docs.fivesocket.com/mcp
- **Glama:** [server listing](https://glama.ai/mcp/servers/fivesocket/mt5-mcp-server) and [hosted connector](https://glama.ai/mcp/connectors/com.fivesocket/mt5)
- **REST API:** `https://api.fivesocket.com/v1`, reference at https://docs.fivesocket.com
- **Pricing:** Starter $9.99 a month for 1 MT5 account, Prop $19.99 for 3, Plus $29.99 for 5, Scale $79.99 for 20. Link your MT5 account and try it free, no card: 24 hours or 100 calls, whichever comes first. Then a 7-day free trial, card required. Cancel anytime. https://fivesocket.com/pricing

> The server runs at the URLs above, so there is nothing to install or build to use it from an assistant. This repository holds client configs for every MCP client and small, runnable examples that call the same accounts from your own code over the REST API.

## Install as a local (stdio) MCP server

For clients that only run local MCP servers, the connector packages start the same hosted server over stdio and open your browser to sign in:

- npm: [`fivesocket-mt5-mcp`](https://www.npmjs.com/package/fivesocket-mt5-mcp): `"command": "npx", "args": ["-y", "fivesocket-mt5-mcp"]`
- PyPI: [`fivesocket-mt5-mcp`](https://pypi.org/project/fivesocket-mt5-mcp/): `"command": "uvx", "args": ["fivesocket-mt5-mcp"]` (needs Node.js 20+)

Add `--read-only` for account data only. Source: [`npm/`](npm) and [`python/`](python).

## What's in this repo

| Path | What it is |
|---|---|
| [`configs/`](configs) | MCP configs for Claude Code, Cursor and VS Code, full access and read-only |
| [`examples/python/`](examples/python) | Python client (standard library only), plus scripts to read an account and place an order |
| [`examples/typescript/`](examples/typescript) | TypeScript client using `fetch`, runnable with Node 22.18+ or Bun, no dependencies |
| [`examples/curl/`](examples/curl) | Shell scripts: read an account, place an order, and walk the MCP OAuth discovery |

## Why a hosted MT5 MCP server

Most MT5 MCP servers are local Python projects. They need a Windows machine with the MetaTrader 5 terminal open and logged in, algorithmic trading switched on, and your login and password in a config file. They only reach apps on that same computer.

| | Self-hosted MT5 MCP servers | FiveSocket |
|---|---|---|
| Needs Windows or a VPS | Yes | No |
| MT5 terminal must stay open | Yes | No |
| Broker password stored in a config file | Usually | No. You enter it once in the browser and it is encrypted |
| Works in Claude on the web, ChatGPT and phone apps | Only if you publish it yourself | Yes |
| Sign-in | None or a static key | OAuth: you approve exactly what the assistant can do |
| Every MT5 broker, including prop firms | Yes | Yes |

A longer comparison: https://fivesocket.com/mt5-mcp-server-comparison

## Connect in about a minute

1. Sign up at https://fivesocket.com and link your MT5 account (login, password and server name) in the browser. The password goes straight to FiveSocket over HTTPS and is never shown to your assistant.
2. Add the server to your assistant using one of the guides below.
3. Sign in and approve what the assistant may do: see your accounts, read account data, and (only if you allow it) trade.
4. Ask: "What's my balance?"

### Claude (claude.ai, Claude Desktop, iPhone and Android)

**Read-only, one click:** open https://claude.ai/directory/fivesocket-mt5 (or search for FiveSocket under Settings → Connectors) and choose **Connect**.

**With trading:** Settings → Connectors → **Add custom connector**, name it FiveSocket, paste `https://api.fivesocket.com/mcp`, and sign in. Custom connectors depend on your Claude plan.

Claude Desktop uses the same Settings → Connectors screen; there is no `claude_desktop_config.json` entry to write, because FiveSocket is a remote server with OAuth sign-in. Connectors you add on claude.ai or in Claude Desktop are also available in the Claude mobile apps.

Guide: https://fivesocket.com/connect-mt5-to-claude

### Claude Code

```sh
claude mcp add --transport http fivesocket https://api.fivesocket.com/mcp
```

Then run `/mcp` inside Claude Code and choose **fivesocket** to sign in.

Read-only ([`configs/claude-code-read-only.sh`](configs/claude-code-read-only.sh)):

```sh
claude mcp add --transport http fivesocket-read https://api.fivesocket.com/mcp/read
```

### ChatGPT

1. Settings → Apps & Connectors → Advanced → turn on **Developer mode**.
2. Back in Apps & Connectors choose **Create**, name it FiveSocket, paste `https://api.fivesocket.com/mcp` as the MCP server URL, and choose **OAuth**.
3. Sign in to FiveSocket when asked.

Developer mode availability depends on your ChatGPT plan, and a workspace admin may need to allow custom connectors. For a read-only connection, paste `https://api.fivesocket.com/mcp/read` instead.

Guide: https://fivesocket.com/connect-mt5-to-chatgpt

### Cursor

Add this to `~/.cursor/mcp.json` (also in [`configs/cursor.json`](configs/cursor.json)):

```json
{
  "mcpServers": {
    "fivesocket": {
      "url": "https://api.fivesocket.com/mcp"
    }
  }
}
```

Read-only: [`configs/cursor-read-only.json`](configs/cursor-read-only.json).

### VS Code

Add this to `.vscode/mcp.json` (also in [`configs/vscode.json`](configs/vscode.json)):

```json
{
  "servers": {
    "fivesocket": {
      "type": "http",
      "url": "https://api.fivesocket.com/mcp"
    }
  }
}
```

Read-only: [`configs/vscode-read-only.json`](configs/vscode-read-only.json).

Guide for Cursor and VS Code: https://fivesocket.com/connect-mt5-to-cursor

### Any other MCP client

Use the Streamable HTTP URL `https://api.fivesocket.com/mcp` (or `https://api.fivesocket.com/mcp/read` for read-only access). The client must support OAuth sign-in for remote MCP servers. [`examples/curl/mcp-discovery.sh`](examples/curl/mcp-discovery.sh) shows the discovery a client performs: a `401` with `WWW-Authenticate`, the protected-resource metadata, then the authorization-server metadata (dynamic client registration, OAuth 2.1 with S256 PKCE).

## What you can ask

- "What's my balance and free margin across my MT5 accounts?"
- "Show my open positions and their floating profit."
- "Summarise my closed trades this month by symbol."
- "Pull the last 200 H1 candles for EURUSD and describe the trend."
- "What is the contract size and minimum lot on XAUUSD?"
- "Close half of my GBPUSD position." (only with trading allowed)

## Tools

**Read tools** (`/mcp` and `/mcp/read`): `list_connected_accounts`, `get_account_balance`, `get_open_positions`, `get_account_snapshot`, `list_closed_trades`, `list_deals`, `list_historical_orders`, `get_candles`, `get_symbol_specifications`, `export_history_page`, `prop_status`, `run_backtest`.

**Trading tools** (`/mcp` only, and only after you allow trading): `get_execution_configuration`, `configure_execution`, `disable_execution`, `get_execution_capabilities`, `list_working_orders`, `get_order_status`, `get_executable_symbols`, `submit_order`, `modify_order`, `cancel_order`, `modify_position_protection`, `close_position`, `reconcile_execution_command`.

Your assistant sees only the tools your approved scopes allow. Full descriptions: https://docs.fivesocket.com/mcp

## Use it from your own code (REST API)

The same accounts are available over a REST API with an API key, for scripts, dashboards, journals and bots. Create a key in the FiveSocket dashboard with the smallest set of scopes you need (`accounts:read` and `data:read` for reading; add `trading:execute` only to trade).

```sh
export FIVESOCKET_KEY=mt5_live_...

curl https://api.fivesocket.com/v1/accounts -H "Authorization: Bearer $FIVESOCKET_KEY"
curl https://api.fivesocket.com/v1/accounts/<accountId>/balance -H "Authorization: Bearer $FIVESOCKET_KEY"
```

Runnable examples, each printing balance, open positions, last week's closed trades and recent H1 candles:

```sh
cd examples/python && python3 read_account.py
cd examples/typescript && node read-account.ts
cd examples/curl && ./read-account.sh
```

Each folder also has a `place-order` example. It places a real market order, so it needs a key with `trading:execute`, an account linked with its trading password, and execution enabled for that account with the symbol on its allowlist. Try it on a demo account first.

| Endpoint | Returns |
|---|---|
| `GET /v1/accounts` | Linked accounts and their status |
| `GET /v1/accounts/{id}/balance` | Balance, equity, margin, free margin, leverage, currency |
| `GET /v1/accounts/{id}/positions` | Open positions with SL, TP, swap and profit |
| `GET /v1/accounts/{id}/trades?from=&to=` | Closed deals, cursor-paginated (`to` is required) |
| `GET /v1/accounts/{id}/candles?symbol=&timeframe=&count=` | Completed broker candles, M1 to D1 |
| `GET /v1/accounts/{id}/snapshot` | Balance, positions and recent trades in one call |
| `POST /v1/accounts/{id}/execution/orders` | Submit an order (needs `trading:execute` and an execution policy) |

Errors share one envelope, `{"error": {"code", "message", "requestId"}}`. `202 account_warming`, `429` and `503` carry `Retry-After`; the example clients honour it. Full reference: https://docs.fivesocket.com

## Safety

- Read-only by default. Trading stays off until you enable it for an account, with an exact list of allowed symbols and a maximum volume.
- Your assistant never sees your broker password. It gets an OAuth token limited to the permissions you approved, which you can revoke at any time.
- Use your MT5 investor (read-only) password if you only want the assistant to read data.

## FAQ

**Which brokers work?** Any broker that offers MetaTrader 5, including prop firms such as FTMO. You supply the server name shown in your MT5 terminal. Broker guides: https://fivesocket.com/brokers

**Does it support MetaTrader 4?** No, MT5 only.

**Does it need Windows?** No. FiveSocket runs the MT5 terminal for you.

**Is there a free trial?** Yes. Link your MT5 account and try it free, no card: 24 hours or 100 calls, whichever comes first. Then a 7-day free trial, card required. Cancel anytime.

**Is there a REST API too?** Yes. See [Use it from your own code](#use-it-from-your-own-code-rest-api) and https://docs.fivesocket.com

**Is it free?** No. It is a paid hosted service with a 7-day free trial (card required). The code in this repository is MIT licensed.

## Links

- Product: https://fivesocket.com
- MT5 MCP server guide: https://fivesocket.com/mcp
- Documentation: https://docs.fivesocket.com
- Official MCP Registry: `com.fivesocket/mt5`
- Support: hello@fivesocket.com, or open an issue in this repository

## License

The configs and examples in this repository are released under the [MIT License](LICENSE). The FiveSocket service is a hosted product with its own terms: https://fivesocket.com

FiveSocket is not affiliated with MetaQuotes. MetaTrader 5 is a trademark of MetaQuotes Ltd.
