#!/usr/bin/env node
import { spawn } from "node:child_process"
import { createRequire } from "node:module"

const fullEndpoint = "https://api.fivesocket.com/mcp"
const readOnlyEndpoint = "https://api.fivesocket.com/mcp/read"

const args = process.argv.slice(2)

if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`fivesocket-mt5-mcp: MT5 MCP server for stdio MCP clients

Connects Claude Desktop, Cursor, VS Code or any stdio MCP client to a MetaTrader 5
account through FiveSocket's hosted MT5 MCP server (${fullEndpoint}).
The first run opens your browser to sign in to FiveSocket with OAuth.

Usage: fivesocket-mt5-mcp [--read-only]

  --read-only   Use ${readOnlyEndpoint}: account data only, no trading tools.

Docs: https://fivesocket.com/mcp
`)
    process.exit(0)
}

const endpoint = args.includes("--read-only") ? readOnlyEndpoint : fullEndpoint
const passthrough = args.filter((arg) => arg !== "--read-only")
const proxy = createRequire(import.meta.url).resolve("mcp-remote/dist/proxy.js")

const child = spawn(process.execPath, [proxy, endpoint, ...passthrough], { stdio: "inherit" })

for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => child.kill(signal))
}

child.on("exit", (code, signal) => {
    if (signal !== null) {
        process.kill(process.pid, signal)
        return
    }
    process.exit(code ?? 1)
})
