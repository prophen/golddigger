import path from "node:path";
import fs from "node:fs/promises";
import { sendResponse } from "./sendResponse.js";
import { getLivePrice } from "./livePrice.js";
import { transactionEvents } from "../events/transactionEvents.js";

const LOG_FILE = path.join(
  import.meta.dirname,
  "..",
  "logs",
  "transactions.log"
);

export async function handleApi(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  if (requestUrl.pathname === "/api/price-stream" && req.method === "GET") {
    const streamIntervalMs = 3000;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(`data: ${JSON.stringify({ price: getLivePrice() })}\n\n`);

    const intervalId = setInterval(() => {
      res.write(`data: ${JSON.stringify({ price: getLivePrice() })}\n\n`);
    }, streamIntervalMs);

    req.on("close", () => {
      clearInterval(intervalId);
    });

    return true;
  }

  if (requestUrl.pathname === "/api/price" && req.method === "GET") {
    sendResponse(
      res,
      200,
      "application/json",
      JSON.stringify({ price: getLivePrice() })
    );
    return true;
  }

  if (requestUrl.pathname === "/api/purchase" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    let payload;
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      sendResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: "Invalid JSON body." })
      );
      return true;
    }

    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      sendResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: "Amount must be a positive number." })
      );
      return true;
    }

    const pricePerOz = getLivePrice();
    const ounces = (amount / pricePerOz).toFixed(2);
    const total = amount.toFixed(2);
    const logLine = `${new Date().toISOString()}, amount paid: £${total}, price per Oz: £${pricePerOz.toFixed(
      2
    )}, gold sold: ${ounces} Oz\n`;
    try {
      await fs.appendFile(LOG_FILE, logLine);
      transactionEvents.emit("new-transaction", logLine);
    } catch {
      sendResponse(
        res,
        500,
        "application/json",
        JSON.stringify({ error: "Failed to record transaction." })
      );
      return true;
    }
    sendResponse(
      res,
      200,
      "application/json",
      JSON.stringify({ ounces, total })
    );
    return true;
  }

  sendResponse(
    res,
    404,
    "application/json",
    JSON.stringify({ error: "Not found." })
  );
  return true;
}
