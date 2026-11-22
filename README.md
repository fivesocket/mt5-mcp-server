# MT5 MCP Server: connect MetaTrader 5 to Claude, ChatGPT and Cursor

**FiveSocket is a hosted MT5 MCP server.** Link your MetaTrader 5 account once in the browser, then ask Claude, ChatGPT, Cursor or any MCP client about your balance, positions, trade history and charts. With your permission, it can also place trades.

No Windows PC, no VPS, no MT5 terminal left running, no Python, and no broker password in a config file.

- **Server URL:** `https://api.fivesocket.com/mcp`
- **Read-only server URL:** `https://api.fivesocket.com/mcp/read`
- **Website and setup guide:** https://fivesocket.com/mcp
- **Docs:** https://docs.fivesocket.com/mcp
- **Free trial:** 5 days, no card required. Start at https://fivesocket.com

> This repository holds setup instructions and client configs for the hosted FiveSocket MT5 MCP server. The server itself runs at the URLs above; there is nothing to install or build.

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

1. Start a free trial at https://fivesocket.com and link your MT5 account (login, password and server name) in the browser. The password goes straight to FiveSocket over HTTPS and is never shown to your assistant.
2. Add the server to your assistant using one of the guides below.
3. Sign in and approve what the assistant may do: see your accounts, read account data, and (only if you allow it) trade.
4. Ask: "What's my balance?"

### Claude (claude.ai, Desktop, iPhone and Android)

**Read-only, one click:** open https://claude.ai/directory/fivesocket-mt5 (or search for FiveSocket under Settings → Connectors) and choose **Connect**.

**With trading:** Settings → Connectors → **Add custom connector**, name it FiveSocket, paste `https://api.fivesocket.com/mcp`, and sign in. Custom connectors depend on your Claude plan.

Connectors you add on claude.ai or in Claude Desktop are also available in the Claude mobile apps.

Guide: https://fivesocket.com/connect-mt5-to-claude

### Claude Code

```sh
claude mcp add --transport http fivesocket https://api.fivesocket.com/mcp
```

Then run `/mcp` inside Claude Code and choose **fivesocket** to sign in.

### ChatGPT

1. Settings → Apps & Connectors → Advanced → turn on **Developer mode**.
2. Back in Apps & Connectors choose **Create**, name it FiveSocket, paste `https://api.fivesocket.com/mcp` as the MCP server URL, and choose **OAuth**.
3. Sign in to FiveSocket when asked.

Developer mode availability depends on your ChatGPT plan, and a workspace admin may need to allow custom connectors.

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

Guide for Cursor and VS Code: https://fivesocket.com/connect-mt5-to-cursor

### Any other MCP client

Use the Streamable HTTP URL `https://api.fivesocket.com/mcp` (or `https://api.fivesocket.com/mcp/read` for read-only access). The client must support OAuth sign-in for remote MCP servers.

## What you can ask

- "What's my balance and free margin across my MT5 accounts?"
- "Show my open positions and their floating profit."
- "Summarise my closed trades this month by symbol."
- "Pull the last 200 H1 candles for EURUSD and describe the trend."
- "What is the contract size and minimum lot on XAUUSD?"
- "Close half of my GBPUSD position." (only with trading allowed)

## Tools

**Read tools** (`/mcp` and `/mcp/read`): `list_connected_accounts`, `get_account_balance`, `get_open_positions`, `get_account_snapshot`, `list_closed_trades`, `list_deals`, `list_historical_orders`, `get_candles`, `get_symbol_specifications`, `export_history_page`.

**Trading tools** (`/mcp` only, and only after you allow trading): `get_execution_configuration`, `configure_execution`, `disable_execution`, `get_execution_capabilities`, `list_working_orders`, `get_order_status`, `get_executable_symbols`, `submit_order`, `modify_order`, `cancel_order`, `modify_position_protection`, `close_position`, `reconcile_execution_command`.

## Safety

- Read-only by default. Trading stays off until you enable it for an account, with an exact list of allowed symbols and a maximum volume.
- Your assistant never sees your broker password. It gets an OAuth token limited to the permissions you approved, which you can revoke at any time.
- Use your MT5 investor (read-only) password if you only want the assistant to read data.

## FAQ

**Which brokers work?** Any broker that offers MetaTrader 5, including prop firms such as FTMO. You supply the server name shown in your MT5 terminal. Broker guides: https://fivesocket.com/brokers

**Does it support MetaTrader 4?** No, MT5 only.

**Does it need Windows?** No. FiveSocket runs the MT5 terminal for you.

**Is there a free trial?** Yes, 5 days with no card.

**Is there a REST API too?** Yes: https://docs.fivesocket.com

## Links

- Product: https://fivesocket.com
- MT5 MCP server guide: https://fivesocket.com/mcp
- Documentation: https://docs.fivesocket.com
- Official MCP Registry: `com.fivesocket/mt5`
- Support: hello@fivesocket.com

FiveSocket is not affiliated with MetaQuotes. MetaTrader 5 is a trademark of MetaQuotes Ltd.
