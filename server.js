import http from "node:http";
import { serveStatic } from "./utils/serveStatic.js";
import { handleApi } from "./utils/handleApi.js";
import { startLivePriceTicker } from "./utils/livePrice.js";
const PORT = Number(process.env.PORT) || 8001;

const __dirname = import.meta.dirname;

startLivePriceTicker();

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith("/api")) {
    return await serveStatic(req, res, __dirname);
  }
  return handleApi(req, res);
});

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Connected on http://0.0.0.0:${PORT}`)
);
