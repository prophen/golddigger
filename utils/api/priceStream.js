import { getLivePrice } from "../livePrice.js";

const STREAM_INTERVAL_MS = 3000;

export function handlePriceStream(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify({ price: getLivePrice() })}\n\n`);

  const intervalId = setInterval(() => {
    res.write(`data: ${JSON.stringify({ price: getLivePrice() })}\n\n`);
  }, STREAM_INTERVAL_MS);

  req.on("close", () => {
    clearInterval(intervalId);
  });
}
