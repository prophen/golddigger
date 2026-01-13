import { sendResponse } from "../sendResponse.js";

export function handleNotFound(res) {
  sendResponse(
    res,
    404,
    "application/json",
    JSON.stringify({ error: "Not found." })
  );
}
