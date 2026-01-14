import path from "node:path";
import fs from "node:fs/promises";
import { sendResponse } from "../sendResponse.js";

const LOG_FILE = path.join(
  import.meta.dirname,
  "..",
  "..",
  "logs",
  "transactions.log"
);

const LOG_PATTERN =
  /^(?<timestamp>[^,]+), amount paid: £(?<amount>[\d.]+), price per Oz: £(?<pricePerOz>[\d.]+), gold sold: (?<ounces>[\d.]+) Oz$/;

function parseLogLine(line) {
  const match = line.match(LOG_PATTERN);
  if (!match?.groups) {
    return { raw: line };
  }

  return {
    timestamp: match.groups.timestamp,
    amount: Number(match.groups.amount),
    pricePerOz: Number(match.groups.pricePerOz),
    ounces: Number(match.groups.ounces),
    raw: line,
  };
}

export async function handleLogs(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const limitParam = Number(requestUrl.searchParams.get("limit") || "200");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 1000)
    : 200;

  let lines = [];
  try {
    const content = await fs.readFile(LOG_FILE, "utf-8");
    lines = content.split("\n").filter(Boolean);
  } catch (err) {
    if (err.code !== "ENOENT") {
      sendResponse(
        res,
        500,
        "application/json",
        JSON.stringify({ error: "Failed to read logs." })
      );
      return;
    }
  }

  const sliced = lines.slice(-limit);
  const entries = sliced.map(parseLogLine);

  sendResponse(
    res,
    200,
    "application/json",
    JSON.stringify({
      entries,
      count: lines.length,
      returned: entries.length,
    })
  );
}
