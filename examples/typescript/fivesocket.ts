const DEFAULT_BASE_URL = "https://api.fivesocket.com"
const RETRYABLE = new Set([202, 429, 503])

export type Account = {
    id: string
    login: string
    server: string
    status: "pending" | "active" | "invalid" | "disabled"
    readOnly?: boolean
    createdAt: string
}

export type Balance = {
    accountId: string
    login: string
    server: string
    observedAt: string
    balance: string
    equity: string
    margin: string
    marginFree: string
    profit: string
    currency: string
    leverage: string
    company: string
}

export type Position = {
    id: string
    symbol: string
    side: "buy" | "sell"
    volume: string
    openPrice: string
    currentPrice: string
    profit: string
    swap: string
    stopLoss?: string
    takeProfit?: string
    openedAt: string
}

export type Trade = {
    id: string
    symbol: string
    side: "buy" | "sell"
    volume: string
    entry: "in" | "out" | "inout" | "out_by" | "other"
    closePrice: string
    profit: string
    commission: string
    swap: string
    fee: string
    closedAt: string
}

export type Candle = {
    openTime: string
    open: string
    high: string
    low: string
    close: string
    tickVolume: string
}

export type ExecutionCommand = {
    commandId: string
    outcome: "accepted" | "rejected" | "commit_unknown" | "unresolved"
    status: string
    retcodeDescription: string
    orderId?: string
    positionId?: string
    volume: string
    price: string
    errorCode: string | null
}

export class FiveSocketError extends Error {
    readonly status: number
    readonly code: string
    readonly requestId: string | undefined

    constructor(status: number, code: string, message: string, requestId: string | undefined) {
        super(`${status} ${code}: ${message} (requestId ${requestId})`)
        this.status = status
        this.code = code
        this.requestId = requestId
    }
}

type Query = Record<string, string | number | undefined>

export class FiveSocket {
    readonly apiKey: string
    readonly baseUrl: string
    readonly maxAttempts: number

    constructor(options: { apiKey?: string; baseUrl?: string; maxAttempts?: number } = {}) {
        const apiKey = options.apiKey ?? process.env.FIVESOCKET_KEY
        if (!apiKey) throw new Error("Set FIVESOCKET_KEY to a FiveSocket API key")
        this.apiKey = apiKey
        this.baseUrl = (options.baseUrl ?? process.env.FIVESOCKET_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "")
        this.maxAttempts = options.maxAttempts ?? 4
    }

    async request<T>(method: string, path: string, options: { query?: Query; body?: unknown; idempotencyKey?: string } = {}): Promise<T> {
        const url = new URL(this.baseUrl + path)
        for (const [key, value] of Object.entries(options.query ?? {})) {
            if (value !== undefined) url.searchParams.set(key, String(value))
        }
        const headers: Record<string, string> = { Authorization: `Bearer ${this.apiKey}`, Accept: "application/json" }
        if (options.body !== undefined) headers["Content-Type"] = "application/json"
        if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey

        for (let attempt = 1; ; attempt++) {
            const response = await fetch(url, {
                method,
                headers,
                body: options.body === undefined ? undefined : JSON.stringify(options.body),
            })
            const text = await response.text()
            const payload = text ? JSON.parse(text) : {}
            const error = payload.error as { code?: string; message?: string; requestId?: string } | undefined
            if (!error) return payload as T
            if (RETRYABLE.has(response.status) && attempt < this.maxAttempts) {
                const seconds = Math.min(Number(response.headers.get("Retry-After")) || 2, 30)
                await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
                continue
            }
            throw new FiveSocketError(response.status, error.code ?? "unknown", error.message ?? "", error.requestId)
        }
    }

    async accounts(): Promise<Account[]> {
        return (await this.request<{ data: Account[] }>("GET", "/v1/accounts")).data
    }

    balance(accountId: string): Promise<Balance> {
        return this.request<Balance>("GET", `/v1/accounts/${accountId}/balance`)
    }

    async positions(accountId: string): Promise<Position[]> {
        return (await this.request<{ positions: Position[] }>("GET", `/v1/accounts/${accountId}/positions`)).positions
    }

    async trades(accountId: string, from: string, to: string, limit = 100): Promise<Trade[]> {
        const path = `/v1/accounts/${accountId}/trades`
        const rows: Trade[] = []
        let page = await this.request<{ data: Trade[]; nextCursor: string | null }>("GET", path, { query: { from, to, limit } })
        for (;;) {
            rows.push(...page.data)
            if (!page.nextCursor) return rows
            page = await this.request("GET", path, { query: { cursor: page.nextCursor, limit } })
        }
    }

    async candles(accountId: string, symbol: string, timeframe = "H1", count = 100): Promise<Candle[]> {
        const query = { symbol, timeframe, count }
        return (await this.request<{ data: Candle[] }>("GET", `/v1/accounts/${accountId}/candles`, { query })).data
    }

    marketOrder(accountId: string, symbol: string, side: "buy" | "sell", volume: string): Promise<ExecutionCommand> {
        const clientOrderId = `ex-${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`
        return this.request<ExecutionCommand>("POST", `/v1/accounts/${accountId}/execution/orders`, {
            body: { clientOrderId, symbol, side, type: "market", volume },
            idempotencyKey: clientOrderId,
        })
    }
}
