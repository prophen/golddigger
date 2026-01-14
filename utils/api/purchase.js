import path from "node:path";
import fs from "node:fs/promises";
import { sendResponse } from "../sendResponse.js";
import { getLivePrice } from "../livePrice.js";
import { transactionEvents } from "../../events/transactionEvents.js";

const LOG_FILE = path.join(
  import.meta.dirname,
  "..",
  "..",
  "logs",
  "transactions.log"
);

async function readRequestBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  return body;
}

export async function handlePurchase(req, res) {
  const body = await readRequestBody(req);

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
    return;
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    sendResponse(
      res,
      400,
      "application/json",
      JSON.stringify({ error: "Amount must be a positive number." })
    );
    return;
  }

  const pricePerOz = getLivePrice();
  const ounces = (amount / pricePerOz).toFixed(2);
  const total = amount.toFixed(2);
  const logLine = `${new Date().toISOString()}, amount paid: £${total}, price per Oz: £${pricePerOz.toFixed(
    2
  )}, gold sold: ${ounces} Oz\n`;

  try {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    await fs.appendFile(LOG_FILE, logLine);
    transactionEvents.emit("new-transaction", logLine);
  } catch (error) {
    console.error("Failed to record transaction.", error);
    sendResponse(
      res,
      500,
      "application/json",
      JSON.stringify({ error: "Failed to record transaction." })
    );
    return;
  }

  sendResponse(
    res,
    200,
    "application/json",
    JSON.stringify({ ounces, total })
  );
}
