import { handlePriceStream } from "./api/priceStream.js";
import { handlePrice } from "./api/price.js";
import { handlePurchase } from "./api/purchase.js";
import { handleNotFound } from "./api/notFound.js";

export async function handleApi(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  if (requestUrl.pathname === "/api/price-stream" && req.method === "GET") {
    handlePriceStream(req, res);
    return true;
  }

  if (requestUrl.pathname === "/api/price" && req.method === "GET") {
    handlePrice(req, res);
    return true;
  }

  if (requestUrl.pathname === "/api/purchase" && req.method === "POST") {
    await handlePurchase(req, res);
    return true;
  }

  handleNotFound(res);
  return true;
}
