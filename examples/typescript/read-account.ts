import { FiveSocket, FiveSocketError } from "./fivesocket.ts"

const client = new FiveSocket()

try {
    const accounts = await client.accounts()
    if (accounts.length === 0) {
        console.log("No linked accounts. Link one at https://fivesocket.com first.")
        process.exit(1)
    }
    const accountId = process.argv[2] ?? accounts[0].id
    const symbol = process.argv[3] ?? "EURUSD"

    const balance = await client.balance(accountId)
    console.log(`${balance.company} ${balance.login} on ${balance.server}`)
    console.log(`Balance ${balance.balance} ${balance.currency}, equity ${balance.equity}, free margin ${balance.marginFree}`)

    const positions = await client.positions(accountId)
    console.log(`\n${positions.length} open positions`)
    for (const p of positions) {
        console.log(`  ${p.symbol.padEnd(10)} ${p.side.padEnd(4)} ${p.volume.padStart(6)} @ ${p.openPrice}  profit ${p.profit}`)
    }

    const to = new Date()
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
    const trades = await client.trades(accountId, from.toISOString(), to.toISOString())
    const closing = trades.filter((t) => t.entry === "out" || t.entry === "inout" || t.entry === "out_by")
    const net = closing.reduce((sum, t) => sum + Number(t.profit) + Number(t.commission) + Number(t.swap) + Number(t.fee), 0)
    console.log(`\n${closing.length} closing deals in the last 7 days, net ${net.toFixed(2)} ${balance.currency}`)

    const candles = await client.candles(accountId, symbol, "H1", 5)
    console.log(`\nLast ${candles.length} completed H1 candles for ${symbol}`)
    for (const c of candles) {
        console.log(`  ${c.openTime}  O ${c.open}  H ${c.high}  L ${c.low}  C ${c.close}`)
    }
} catch (error) {
    if (error instanceof FiveSocketError) {
        console.error(error.message)
        process.exit(1)
    }
    throw error
}
