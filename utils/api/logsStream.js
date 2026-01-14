import path from "node:path";
import fs from "node:fs/promises";
import { transactionEvents } from "../../events/transactionEvents.js";

const LOG_FILE = path.join(
  import.meta.dirname,
  "..",
  "..",
  "logs",
  "transactions.log"
);

export async function handleLogsStream(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const content = await fs.readFile(LOG_FILE, "utf-8");
    const lines = content.split("\n").filter(Boolean);
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      res.write(`data: ${JSON.stringify({ line: lastLine })}\n\n`);
    }
  } catch {
    res.write(`data: ${JSON.stringify({ line: null })}\n\n`);
  }

  const onNewTransaction = (line) => {
    res.write(`data: ${JSON.stringify({ line })}\n\n`);
  };

  transactionEvents.on("new-transaction", onNewTransaction);

  req.on("close", () => {
    transactionEvents.off("new-transaction", onNewTransaction);
  });
}
