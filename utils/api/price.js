import { sendResponse } from "../sendResponse.js";
import { getLivePrice } from "../livePrice.js";

export function handlePrice(req, res) {
  sendResponse(
    res,
    200,
    "application/json",
    JSON.stringify({ price: getLivePrice() })
  );
}
