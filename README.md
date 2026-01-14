# Gold Digger - Solo Project

Gold Digger is a Node.js-based solo project focused on practicing backend fundamentals like routing, request handling, and API structure. It was built as part of the Node.js module on [Scrimba](https://scrimba.com/?via=u0ms04)'s Fullstack Path, with an emphasis on wiring up endpoints and organizing server-side code for a small, real-world scenario.

Key features and endpoints:
- Live price ticker that updates every few seconds and powers pricing logic.
- `GET /api/price` returns the current gold price in JSON.
- `GET /api/price-stream` provides a server-sent events stream for live price updates.
- `POST /api/purchase` accepts an amount, calculates ounces purchased, logs the transaction, and returns totals.
- Transactions are appended to `logs/transactions.log` for basic record keeping.

How to run:
```bash
npm install
npm run dev
```

Example requests:
```bash
curl http://localhost:8001/api/price
```

```bash
curl http://localhost:8001/api/price-stream
```

```bash
curl -X POST http://localhost:8001/api/purchase \
  -H "Content-Type: application/json" \
  -d '{"amount": 150}'
```

Example responses:
```json
{ "price": 2312.45 }
```

```text
data: {"price":2312.45}
```

```json
{ "ounces": "0.06", "total": "150.00" }
```
