const form = document.querySelector("form");
const dialog = document.querySelector("dialog.outputs");
const summary = document.querySelector("#investment-summary");
const closeBtn = dialog.querySelector("button");
const priceDisplay = document.querySelector("#price-display");
const connectionStatus = document.querySelector("#connection-status");
let priceStream = null;

const setConnectionStatus = (isLive) => {
  connectionStatus.textContent = isLive ? "Live Price 🟢" : "Live Price 🔴";
};

const updatePriceDisplay = (price) => {
  if (!Number.isFinite(price)) {
    return;
  }
  priceDisplay.textContent = price.toFixed(2);
  setConnectionStatus(true);
};

const connectPriceStream = () => {
  if (priceStream) {
    priceStream.close();
  }

  priceStream = new EventSource("/api/price-stream");

  priceStream.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data);
      updatePriceDisplay(payload.price);
    } catch {
      setConnectionStatus(false);
    }
  });

  priceStream.addEventListener("error", () => {
    setConnectionStatus(false);
  });
};

connectPriceStream();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const amount = Number(document.querySelector("#investment-amount").value);
  if (!Number.isFinite(amount) || amount <= 0) {
    summary.textContent = "Enter a valid amount to invest.";
    dialog.showModal();
    return;
  }

  try {
    const response = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const result = await response.json();

    if (!response.ok) {
      summary.textContent =
        result?.error || "Purchase failed. Please try again.";
      dialog.showModal();
      return;
    }

    summary.textContent = `You just bought ${result.ounces} ounces (ozt) for £${result.total}. You will receive documentation shortly.`;
    dialog.showModal();
  } catch {
    summary.textContent = "Network error. Please try again.";
    dialog.showModal();
  }
});

closeBtn.addEventListener("click", () => {
  dialog.close();
});
