const MONTHS = [
  {
    name: "იანვარი",
    short: "JAN",
    hours: 144,
    rates: [9.01, 9.73, 9.91],
  },
  {
    name: "თებერვალი",
    short: "FEB",
    hours: 160,
    rates: [8.11, 8.76, 8.92],
  },
  { name: "მარტი", short: "MAR", hours: 168, rates: [7.72, 8.34, 8.49] },
  { name: "აპრილი", short: "APR", hours: 152, rates: [8.54, 9.22, 9.39] },
  { name: "მაისი", short: "MAY", hours: 152, rates: [8.54, 9.22, 9.39] },
  { name: "ივნისი", short: "JUN", hours: 176, rates: [7.37, 7.96, 8.11] },
  { name: "ივლისი", short: "JUL", hours: 184, rates: [7.05, 7.61, 7.76] },
  {
    name: "აგვისტო",
    short: "AUG",
    hours: 160,
    rates: [8.11, 8.76, 8.92],
  },
  {
    name: "სექტემბერი",
    short: "SEP",
    hours: 176,
    rates: [7.37, 7.96, 8.11],
  },
  {
    name: "ოქტომბერი",
    short: "OCT",
    hours: 168,
    rates: [7.72, 8.34, 8.49],
  },
  {
    name: "ნოემბერი",
    short: "NOV",
    hours: 160,
    rates: [8.11, 8.76, 8.92],
  },
  {
    name: "დეკემბერი",
    short: "DEC",
    hours: 184,
    rates: [7.05, 7.61, 7.76],
  },
];
const PAYMENT_DATES = [
  "12 თებერვალი",
  "12 მარტი",
  "10 აპრილი",
  "12 მაისი",
  "12 ივნისი",
  "10 ივლისი",
  "12 აგვისტო",
  "12 სექტემბერი",
  "12 ოქტომბერი",
  "12 ნოემბერი",
  "11 დეკემბერი",
  "12 იანვარი",
];
const SA_NET = [1297.52, 1401, 1427],
  SA_GROSS = [1655, 1787, 1820];
const SL_NET = [1687.2, 1805, 1805],
  SL_GROSS = [2152, 2302, 2302];

let state = {
  role: null,
  months: null,
  monthIdx: null,
  insXL: false,
  fitpass: false,
  adds: {
    night: 0,
    holiday: 0,
    holidaynight: 0,
    ot: 0,
    otnight: 0,
    otholiday: 0,
    otholidaynight: 0,
  },
};
let maxVisited = 0;

// ── THEME ──
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  document.getElementById("themeIcon").textContent = isDark ? "☾" : "☀";
  document.getElementById("themeLabel").textContent = isDark ? "DARK" : "LIGHT";
  // Update select SVG arrow color
  const arrow = isDark
    ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239e7a3f' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")"
    : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c8a96e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")";
  document
    .querySelectorAll("select")
    .forEach((s) => (s.style.backgroundImage = arrow));
}

// ── HELPERS ──
function getTier(m) {
  return m <= 6 ? 0 : m <= 12 ? 1 : 2;
}
function getTierLabel(m) {
  return m <= 6 ? "0–6 months" : m <= 12 ? "7–12 months" : "13+ months";
}

function buildMonthGrid() {
  const g = document.getElementById("monthGrid");
  g.innerHTML = "";
  MONTHS.forEach((m, i) => {
    const d = document.createElement("div");
    d.className = "month-btn" + (state.monthIdx === i ? " selected" : "");
    d.innerHTML = `${m.short}<span class="hours">${state.role === "PT SA" ? m.hours / 2 : m.hours}h</span>`;
    d.onclick = () => {
      document
        .querySelectorAll(".month-btn")
        .forEach((b) => b.classList.remove("selected"));
      d.classList.add("selected");
      state.monthIdx = i;
    };
    g.appendChild(d);
  });
}

function selectRole(el) {
  document
    .querySelectorAll(".option-card")
    .forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");
  state.role = el.dataset.role;
  document.getElementById("roleErr").style.display = "none";
}

function toggleIns() {
  state.insXL = !state.insXL;
  document.getElementById("insToggle").classList.toggle("active", state.insXL);
}
function toggleFit() {
  state.fitpass = !state.fitpass;
  document
    .getElementById("fitToggle")
    .classList.toggle("active", state.fitpass);
}

document.getElementById("months").addEventListener("input", function () {
  const v = parseInt(this.value);
  if (!isNaN(v) && v >= 0) {
    state.months = v;
    document.getElementById("tierLabel").textContent = "→ " + getTierLabel(v);
  } else {
    document.getElementById("tierLabel").textContent = "";
  }
});

// ── NAVIGATION ──
function dotClick(n) {
  // Only allow clicking steps already visited
  if (n <= maxVisited) setStep(n);
}

function goStep(n) {
  if (n === 1) {
    if (!state.role) {
      document.getElementById("roleErr").style.display = "block";
      return;
    }
    buildMonthGrid();
  }
  if (n === 2) {
    const m = parseInt(document.getElementById("months").value);
    if (isNaN(m) || m < 0 || state.monthIdx === null) {
      document.getElementById("detailErr").style.display = "block";
      return;
    }
    state.months = m;
    document.getElementById("detailErr").style.display = "none";
  }
  if (n > maxVisited) maxVisited = n;
  setStep(n);
}

function setStep(n) {
  document
    .querySelectorAll(".step")
    .forEach((s, i) => s.classList.toggle("active", i === n));
  [0, 1, 2, 3].forEach((i) => {
    const dot = document.getElementById("dot" + i),
      lbl = document.getElementById("lbl" + i);
    dot.classList.remove("active", "done", "clickable");
    lbl.classList.remove("active", "clickable");

    if (i < n) {
      dot.classList.add("done");
      dot.textContent = "✓";
      if (i <= maxVisited) {
        dot.classList.add("clickable");
        lbl.classList.add("clickable");
      }
    } else if (i === n) {
      dot.classList.add("active");
      dot.textContent = String(i + 1).padStart(2, "0");
      lbl.classList.add("active");
    } else {
      dot.textContent = String(i + 1).padStart(2, "0");
      if (i <= maxVisited) {
        dot.classList.add("clickable");
        lbl.classList.add("clickable");
      }
    }

    if (i < 3)
      document.getElementById("line" + i).classList.toggle("done", i < n);
  });
}

// ── CALCULATION ──
function getHourlyRate() {
  const tier = getTier(state.months),
    m = MONTHS[state.monthIdx];
  if (state.role === "SA" || state.role === "PT SA") return m.rates[tier];
  return (tier === 0 ? SL_NET[0] : SL_NET[1]) / m.hours;
}
function getBaseSalary() {
  const tier = getTier(state.months);
  if (state.role === "SA") return SA_NET[tier];
  if (state.role === "PT SA") return SA_NET[tier] * 0.5;
  return tier === 0 ? SL_NET[0] : SL_NET[1];
}
function getGrossSalary() {
  const tier = getTier(state.months);
  if (state.role === "SA") return SA_GROSS[tier];
  if (state.role === "SL") return tier === 0 ? SL_GROSS[0] : SL_GROSS[1];
  return null;
}

function getVal(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function calculate() {
  state.adds.night = getVal("add_night");
  state.adds.holiday = getVal("add_holiday");
  state.adds.holidaynight = getVal("add_holidaynight");
  state.adds.ot = getVal("add_ot");
  state.adds.otnight = getVal("add_otnight");
  state.adds.otholiday = getVal("add_otholiday");
  state.adds.otholidaynight = getVal("add_otholidaynight");

  const base = getBaseSalary(),
    hourly = getHourlyRate(),
    m = MONTHS[state.monthIdx],
    gross = getGrossSalary();

  const nightAmt = state.adds.night * hourly * 1.4;
  const holidayAmt = state.adds.holiday * hourly * 1.25;
  const holidaynightAmt = state.adds.holidaynight * hourly * 1.5;
  const otAmt = state.adds.ot * hourly * 2.0;
  const otnightAmt = state.adds.otnight * hourly * 3.4;
  const otholidayAmt = state.adds.otholiday * hourly * 3.25;
  const otholidaynightAmt = state.adds.otholidaynight * hourly * 3.5;

  const totalAdds =
    nightAmt +
    holidayAmt +
    holidaynightAmt +
    otAmt +
    otnightAmt +
    otholidayAmt +
    otholidaynightAmt;
  const deductions = (state.insXL ? 33 : 0) + (state.fitpass ? 88 : 0);
  const total = base + totalAdds - deductions;

  renderResult(base, gross, hourly, totalAdds, deductions, total, m, {
    nightAmt,
    holidayAmt,
    holidaynightAmt,
    otAmt,
    otnightAmt,
    otholidayAmt,
    otholidaynightAmt,
  });
  if (3 > maxVisited) maxVisited = 3;
  setStep(3);
}

function renderResult(
  base,
  gross,
  hourly,
  totalAdds,
  deductions,
  total,
  m,
  adds,
) {
  const payDate = PAYMENT_DATES[state.monthIdx];
  const tierStr = getTierLabel(state.months);
  const hoursUsed = state.role === "PT SA" ? m.hours / 2 : m.hours;

  const grossLine = gross
    ? `<div class="result-gross">GROSS ₾${gross.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · before tax</div>`
    : "";

  const addDefs = [
    { label: "🌙 Night", val: adds.nightAmt },
    { label: "🎌 Bank Holiday", val: adds.holidayAmt },
    { label: "🌙🎌 Holiday Night", val: adds.holidaynightAmt },
    { label: "⏱ Overtime", val: adds.otAmt },
    { label: "⏱🌙 Overtime Night", val: adds.otnightAmt },
    { label: "⏱🎌 Overtime Holiday", val: adds.otholidayAmt },
    {
      label: "⏱🌙🎌 Overtime Holiday Night",
      val: adds.otholidaynightAmt,
    },
  ];
  const addRows = addDefs
    .filter((a) => a.val > 0)
    .map(
      (a) =>
        `<div class="result-row"><span class="result-row-label">${a.label}</span><span class="result-row-val positive">+${a.val.toFixed(2)} ₾</span></div>`,
    )
    .join("");

  document.getElementById("resultContent").innerHTML = `
      <div class="step-title" style="margin-bottom:6px">Your Salary</div>
      <div class="step-hint" style="margin-bottom:20px">For ${m.name} — paid on ${payDate}</div>

      <div class="summary-chips">
        <span class="chip accent">${state.role}</span>
        <span class="chip">${tierStr}</span>
        <span class="chip">${m.name} · ${hoursUsed}h</span>
        <span class="chip">${hourly.toFixed(4)} ₾/h</span>
      </div>

      <div class="payment-info">
        <span class="payment-icon">📅</span>
        <div>
          <div class="payment-date">${payDate}</div>
          <div class="payment-desc">Expected payment date · may shift if weekend or Georgian public holiday</div>
        </div>
      </div>

      <div class="result-card">
        <div class="result-header">
          <div>
            <div class="result-label">Net Pay</div>
            <div class="result-net-amount"><span class="result-net-currency">₾</span>${total.toFixed(2)}</div>
            ${grossLine}
          </div>
          <div style="text-align:right">
            <div class="result-label">Base (net)</div>
            <div style="font-family:'DM Mono',monospace;font-size:16px;color:var(--text)">${base.toFixed(2)} ₾</div>
          </div>
        </div>
        <div class="result-body">
          <div class="result-row"><span class="result-row-label">Base Salary</span><span class="result-row-val">${base.toFixed(2)} ₾</span></div>
          ${addRows}
          ${totalAdds > 0 ? `<div class="result-row"><span class="result-row-label">Total Additions</span><span class="result-row-val positive">+${totalAdds.toFixed(2)} ₾</span></div>` : ""}
          ${state.insXL ? `<div class="result-row"><span class="result-row-label">XL Insurance</span><span class="result-row-val negative">−33.00 ₾</span></div>` : ""}
          ${state.fitpass ? `<div class="result-row"><span class="result-row-label">FitPass</span><span class="result-row-val negative">−88.00 ₾</span></div>` : ""}
          <div class="result-final-row">
            <span class="result-final-label">Final Amount</span>
            <span class="result-final-value">₾${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="edit-section">
        <div class="edit-section-title">Edit Deductions</div>
        <div class="toggle-row ${state.insXL ? "active" : ""}" id="resInsToggle"
          onclick="state.insXL=!state.insXL;document.getElementById('resInsToggle').classList.toggle('active',state.insXL);calculate();">
          <div class="toggle-left"><span class="toggle-name">XL Insurance</span><span class="toggle-meta">−33.00 GEL / month</span></div>
          <div class="toggle-switch"></div>
        </div>
        <div class="toggle-row ${state.fitpass ? "active" : ""}" id="resFitToggle"
          onclick="state.fitpass=!state.fitpass;document.getElementById('resFitToggle').classList.toggle('active',state.fitpass);calculate();">
          <div class="toggle-left"><span class="toggle-name">FitPass Subscription</span><span class="toggle-meta">−88.00 GEL / month</span></div>
          <div class="toggle-switch"></div>
        </div>
      </div>

      <div class="note-box">
        ✦ Payment date may be moved earlier if it falls on a Saturday, Sunday, or Georgian public holiday.
      </div>

      <div class="btn-row">
        <button class="btn btn-ghost" onclick="setStep(2)">← Edit Additions</button>
        <button class="btn btn-primary" onclick="resetAll()">New Calculation ✦</button>
      </div>
    `;
}

function resetAll() {
  state = {
    role: null,
    months: null,
    monthIdx: null,
    insXL: false,
    fitpass: false,
    adds: {},
  };
  maxVisited = 0;
  document
    .querySelectorAll(".option-card")
    .forEach((c) => c.classList.remove("selected"));
  document.getElementById("months").value = "";
  document.getElementById("tierLabel").textContent = "";
  document.getElementById("insToggle").classList.remove("active");
  document.getElementById("fitToggle").classList.remove("active");
  [
    "add_night",
    "add_holiday",
    "add_holidaynight",
    "add_ot",
    "add_otnight",
    "add_otholiday",
    "add_otholidaynight",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  setStep(0);
}
