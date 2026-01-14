const entries = [];
const rowsEl = document.querySelector("#log-rows");
const emptyEl = document.querySelector("#empty-state");
const errorEl = document.querySelector("#error-state");
const filterInput = document.querySelector("#filter-input");
const totalEl = document.querySelector("[data-total]");
const volumeEl = document.querySelector("[data-volume]");
const lastEl = document.querySelector("[data-last]");
const statusEl = document.querySelector("[data-status]");
const refreshBtn = document.querySelector("#refresh-btn");
let lastSeenLine = null;

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
});

const LOG_PATTERN =
  /^(?<timestamp>[^,]+), amount paid: £(?<amount>[\d.]+), price per Oz: £(?<pricePerOz>[\d.]+), gold sold: (?<ounces>[\d.]+) Oz$/;

function parseLine(line) {
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

function formatTimestamp(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function renderRows(list) {
  rowsEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  list.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "log-row";
    row.innerHTML = `
      <div>${formatTimestamp(entry.timestamp)}</div>
      <div>${entry.amount ? currencyFormatter.format(entry.amount) : "--"}</div>
      <div>${entry.pricePerOz ? currencyFormatter.format(entry.pricePerOz) : "--"}</div>
      <div>${entry.ounces ? entry.ounces.toFixed(2) : "--"} Oz</div>
    `;
    fragment.appendChild(row);
  });
  rowsEl.appendChild(fragment);

  emptyEl.hidden = list.length !== 0;
}

function updateStats(list) {
  const total = list.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  totalEl.textContent = entries.length.toString();
  volumeEl.textContent = total
    ? currencyFormatter.format(total)
    : currencyFormatter.format(0);
  lastEl.textContent = list[0]?.timestamp
    ? formatTimestamp(list[0].timestamp)
    : "--";
}

function applyFilter() {
  const query = filterInput.value.trim().toLowerCase();
  if (!query) {
    renderRows(entries);
    updateStats(entries);
    return;
  }

  const filtered = entries.filter((entry) =>
    (entry.raw || "").toLowerCase().includes(query)
  );
  renderRows(filtered);
  updateStats(filtered);
}

async function fetchLogs() {
  errorEl.hidden = true;
  try {
    const response = await fetch("/api/logs?limit=250");
    if (!response.ok) {
      throw new Error("Failed to load logs.");
    }
    const payload = await response.json();
    entries.length = 0;
    payload.entries
      .slice()
      .reverse()
      .forEach((entry) => entries.push(entry));
    lastSeenLine = entries[0]?.raw || null;
    applyFilter();
  } catch (error) {
    errorEl.hidden = false;
  }
}

function prependEntry(entry) {
  entries.unshift(entry);
  applyFilter();
  const firstRow = rowsEl.firstElementChild;
  if (firstRow) {
    firstRow.classList.add("fresh");
    setTimeout(() => firstRow.classList.remove("fresh"), 800);
  }
}

function connectStream() {
  const stream = new EventSource("/api/logs-stream");
  statusEl.textContent = "Live";

  stream.addEventListener("message", (event) => {
    if (!event.data) return;
    const payload = JSON.parse(event.data);
    if (!payload.line) return;
    if (payload.line === lastSeenLine) return;
    const entry = parseLine(payload.line);
    entry.raw = payload.line;
    prependEntry(entry);
    lastSeenLine = payload.line;
  });

  stream.addEventListener("error", () => {
    statusEl.textContent = "Offline";
  });
}

filterInput.addEventListener("input", applyFilter);
refreshBtn.addEventListener("click", fetchLogs);

fetchLogs();
connectStream();
