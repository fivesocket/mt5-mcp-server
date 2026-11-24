import { FiveSocket, FiveSocketError } from "./fivesocket.ts"

const [accountId, symbol, side, volume] = process.argv.slice(2)
if (!accountId || !symbol || (side !== "buy" && side !== "sell") || !volume) {
    console.log("Usage: node place-order.ts <accountId> <symbol> <buy|sell> <volume>")
    console.log("This trades a real MT5 account. Try it on a demo first.")
    console.log("Needs an API key with trading:execute and execution enabled for the account and symbol.")
    process.exit(2)
}

try {
    const command = await new FiveSocket().marketOrder(accountId, symbol, side, volume)
    console.log(JSON.stringify(command, null, 2))
    if (command.outcome === "commit_unknown") {
        console.log(`Outcome unknown. Do not resend; poll /v1/accounts/${accountId}/execution/commands/${command.commandId}`)
    }
} catch (error) {
    if (error instanceof FiveSocketError) {
        console.error(error.message)
        process.exit(1)
    }
    throw error
}
