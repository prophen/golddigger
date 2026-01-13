const DEFAULT_PRICE = 2300;
const MIN_PRICE = 1900;
const MAX_PRICE = 2800;
const UPDATE_INTERVAL_MS = 3000;

let currentPrice = DEFAULT_PRICE;
let intervalId = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundToCents = (value) => Math.round(value * 100) / 100;

const updatePrice = () => {
  const drift = (Math.random() - 0.5) * 0.008;
  const next = currentPrice * (1 + drift);
  currentPrice = clamp(roundToCents(next), MIN_PRICE, MAX_PRICE);
  return currentPrice;
};

export function startLivePriceTicker({
  initialPrice = DEFAULT_PRICE,
  updateIntervalMs = UPDATE_INTERVAL_MS,
} = {}) {
  if (intervalId) {
    return currentPrice;
  }

  if (Number.isFinite(initialPrice)) {
    currentPrice = clamp(roundToCents(initialPrice), MIN_PRICE, MAX_PRICE);
  }

  intervalId = setInterval(updatePrice, updateIntervalMs);
  return currentPrice;
}

export function getLivePrice() {
  return currentPrice;
}

export function stopLivePriceTicker() {
  if (!intervalId) {
    return;
  }
  clearInterval(intervalId);
  intervalId = null;
}
