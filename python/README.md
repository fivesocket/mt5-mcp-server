# fivesocket-mt5-mcp: MT5 MCP server for stdio clients

Connect a MetaTrader 5 account to Claude Desktop, Cursor, VS Code or any stdio MCP client through [FiveSocket](https://fivesocket.com/mcp), a hosted MT5 MCP server. Ask about your balance, positions, trade history, candles and prop-firm limits, run backtests on your broker's data, and, if you allow it, place trades.

No Windows PC, no MT5 terminal and no broker password in a config file: the first run opens your browser to sign in to FiveSocket, where you link your MT5 account.

This package launches the npm package [`fivesocket-mt5-mcp`](https://www.npmjs.com/package/fivesocket-mt5-mcp), so it needs Node.js 20 or newer.

## Use it

```json
{
  "mcpServers": {
    "fivesocket-mt5": {
      "command": "uvx",
      "args": ["fivesocket-mt5-mcp"]
    }
  }
}
```

Add `"--read-only"` to `args` for account data only, with no trading tools.

Clients that support remote MCP servers (Claude on the web, ChatGPT, Claude Code, Cursor) can skip this package and add `https://api.fivesocket.com/mcp` directly. Setup for each client: https://fivesocket.com/mcp

Pricing: https://fivesocket.com/pricing · Docs: https://docs.fivesocket.com/mcp
