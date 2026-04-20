/**
 * J Fire — script.js
 * ─────────────────────────────────────────────────────────────
 * Responsibilities:
 *  1. Auth overlay (sign-up / sign-in via localStorage user store)
 *  2. Project form — save & load via localStorage
 *  3. Finance overview — live validation + summary display
 *  4. Fixed cost form — live running total
 *  5. Variable cost form — live running total
 *  6. Budget overview — combined totals with overhead applied
 *  7. 5-year chart — live update via Chart.js
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS & STORAGE KEYS
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEYS = {
  USERS:   'jfire_users',
  SESSION: 'jfire_session',
  PROJECT: 'jfire_project',
};

/* ═══════════════════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════════════════ */

/** Format a number as a USD string with two decimal places. */
function formatUSD(amount) {
  return '$' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Parse a numeric input value; return 0 if empty or NaN. */
function parseNum(id) {
  const val = parseFloat(document.getElementById(id)?.value ?? '');
  return isNaN(val) ? 0 : val;
}

/** Show a status message inside a .jf-status element. */
function showStatus(el, message, isError = false) {
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  el.classList.toggle('error', isError);
}

/** Hide a .jf-status element. */
function hideStatus(el) {
  if (!el) return;
  el.classList.remove('visible', 'error');
  el.textContent = '';
}

/** Sum the values of all inputs matching a CSS selector. */
function sumInputs(selector) {
  return Array.from(document.querySelectorAll(selector))
    .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
}

/* ═══════════════════════════════════════════════════════════
   USER STORE (localStorage)
   A simple client-side user store for portfolio demonstration.
   In production, replace with a real auth backend.
   ═══════════════════════════════════════════════════════════ */

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) ?? '{}');
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getSession() {
  return localStorage.getItem(STORAGE_KEYS.SESSION);
}

function setSession(username) {
  localStorage.setItem(STORAGE_KEYS.SESSION, username);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/* ═══════════════════════════════════════════════════════════
   AUTH OVERLAY
   ═══════════════════════════════════════════════════════════ */

function initAuth() {
  const overlay     = document.getElementById('auth-overlay');
  const signoutBtn  = document.getElementById('signout-btn');
  const authMessage = document.getElementById('auth-message');
  const signupForm  = document.getElementById('signup-form');
  const signinForm  = document.getElementById('signin-form');

  // Tab switching
  const tabSigninBtn  = document.getElementById('tab-signin-btn');
  const tabSignupBtn  = document.getElementById('tab-signup-btn');
  const tabSignin     = document.getElementById('tab-signin');
  const tabSignup     = document.getElementById('tab-signup');

  function switchTab(tab) {
    const isSignin = tab === 'signin';
    tabSigninBtn.classList.toggle('active', isSignin);
    tabSignupBtn.classList.toggle('active', !isSignin);
    tabSignin.classList.toggle('active', isSignin);
    tabSignup.classList.toggle('active', !isSignin);
    tabSigninBtn.setAttribute('aria-selected', String(isSignin));
    tabSignupBtn.setAttribute('aria-selected', String(!isSignin));
    authMessage.textContent = '';
  }

  tabSigninBtn.addEventListener('click', () => switchTab('signin'));
  tabSignupBtn.addEventListener('click', () => switchTab('signup'));

  // Show or hide overlay based on session
  function checkSession() {
    if (getSession()) {
      overlay.classList.add('hidden');
    } else {
      overlay.classList.remove('hidden');
      // Focus first focusable field for accessibility
      setTimeout(() => document.getElementById('signin-username')?.focus(), 50);
    }
  }

  // Sign-up handler
  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!username || !email || !password) {
      authMessage.textContent = 'Please fill in all fields.';
      return;
    }
    if (password.length < 6) {
      authMessage.textContent = 'Password must be at least 6 characters.';
      return;
    }

    const users = getUsers();
    if (users[username]) {
      authMessage.textContent = 'Username already taken. Try signing in.';
      return;
    }

    // Store credentials (plain text — demo only; use hashing in production)
    users[username] = { email, password, createdAt: new Date().toISOString() };
    saveUsers(users);
    setSession(username);
    checkSession();
  });

  // Sign-in handler
  signinForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value;

    const users = getUsers();
    if (!users[username] || users[username].password !== password) {
      authMessage.textContent = 'Incorrect username or password.';
      return;
    }

    setSession(username);
    checkSession();
  });

  // Sign-out handler
  signoutBtn?.addEventListener('click', () => {
    clearSession();
    checkSession();
  });

  // Trap focus inside overlay when visible (basic implementation)
  overlay?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || overlay.classList.contains('hidden')) return;
    const focusable = overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });

  checkSession();
}

/* ═══════════════════════════════════════════════════════════
   PROJECT FORM — Save & Load
   ═══════════════════════════════════════════════════════════ */

/** Fields that belong to the project setup form. */
const PROJECT_FIELDS = [
  'budget-name', 'sponsor-name', 'protocol-name',
  'study-name', 'disease-name', 'category-name', 'initial-date',
];

function initProjectForm() {
  const form           = document.getElementById('project-form');
  const loadBtn        = document.getElementById('load-project-btn');
  const statusEl       = document.getElementById('project-status');
  const badge          = document.getElementById('project-badge');
  const badgeName      = document.getElementById('project-badge-name');
  const formsWrapper   = document.getElementById('budget-forms-wrapper');

  /** Unlock the budget forms section. */
  function unlockForms(projectName) {
    formsWrapper?.classList.remove('locked');
    formsWrapper?.classList.add('unlocked');
    if (badge)     badge.classList.add('visible');
    if (badgeName) badgeName.textContent = `Saved: ${projectName}`;
  }

  /** Check on page load whether a project was already saved. */
  function checkExistingProject() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECT) ?? 'null');
      if (saved?.budgetName) unlockForms(saved.budgetName);
    } catch { /* no saved project */ }
  }

  // Save project
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    hideStatus(statusEl);

    // Validate all fields
    const missing = PROJECT_FIELDS.filter(id => !document.getElementById(id)?.value.trim());
    if (missing.length) {
      showStatus(statusEl, 'Please fill in all required fields.', true);
      document.getElementById(missing[0])?.focus();
      return;
    }

    const project = {};
    PROJECT_FIELDS.forEach(id => {
      project[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] =
        document.getElementById(id).value.trim();
    });
    project.savedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
    showStatus(statusEl, `Project "${project.budgetName}" saved successfully.`);
    unlockForms(project.budgetName);
  });

  // Load project
  loadBtn?.addEventListener('click', () => {
    hideStatus(statusEl);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECT) ?? 'null');
      if (!saved) {
        showStatus(statusEl, 'No saved project found.', true);
        return;
      }

      // Map camelCase keys back to hyphen-case input IDs
      PROJECT_FIELDS.forEach(id => {
        const key = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const el  = document.getElementById(id);
        if (el && saved[key] !== undefined) el.value = saved[key];
      });

      const savedDate = saved.savedAt ? new Date(saved.savedAt).toLocaleString() : '—';
      showStatus(statusEl, `Loaded "${saved.budgetName}" (last saved ${savedDate}).`);
      unlockForms(saved.budgetName);
    } catch {
      showStatus(statusEl, 'Could not load project — data may be corrupted.', true);
    }
  });

  checkExistingProject();
}

/* ═══════════════════════════════════════════════════════════
   FINANCE OVERVIEW FORM — live summary
   ═══════════════════════════════════════════════════════════ */

function initFinanceForm() {
  const form    = document.getElementById('finance-form');
  const summary = document.getElementById('finance-summary');
  const inputs  = form?.querySelectorAll('input') ?? [];

  function renderSummary() {
    const start       = document.getElementById('enrollment-start')?.value;
    const end         = document.getElementById('close-out-date')?.value;
    const low         = parseInt(document.getElementById('patients-low')?.value)  || 0;
    const high        = parseInt(document.getElementById('patients-high')?.value) || 0;
    const sfRate      = parseFloat(document.getElementById('screen-fail-rate')?.value) || 0;
    const overhead    = parseFloat(document.getElementById('overhead-rate')?.value)    || 0;
    const inflation   = parseFloat(document.getElementById('inflation-rate')?.value)   || 0;

    if (!start && !end && !low && !high) { summary.innerHTML = ''; return; }

    const expectedLow  = Math.round(low  * (1 - sfRate / 100));
    const expectedHigh = Math.round(high * (1 - sfRate / 100));
    const midPatients  = Math.round((expectedLow + expectedHigh) / 2);

    summary.innerHTML = `
      <dl>
        <dt>Enrollment window</dt>
        <dd>${start || '—'} → ${end || '—'}</dd>
        <dt>Patient range (enrolled)</dt>
        <dd>${low} – ${high}</dd>
        <dt>After screen failure (${sfRate}%)</dt>
        <dd>${expectedLow} – ${expectedHigh}</dd>
        <dt>Mid-range patients (used for estimates)</dt>
        <dd>${midPatients}</dd>
        <dt>Overhead rate</dt>
        <dd>${overhead.toFixed(2)}%</dd>
        <dt>Annual inflation</dt>
        <dd>${inflation.toFixed(2)}%</dd>
      </dl>
    `;

    updateBudgetOverview();
  }

  inputs.forEach(input => input.addEventListener('input', renderSummary));

  // Prevent native submit — form is 100% live/reactive
  form?.addEventListener('submit', (e) => e.preventDefault());
}

/* ═══════════════════════════════════════════════════════════
   FIXED COST FORM — live total
   ═══════════════════════════════════════════════════════════ */

function initFixedCostForm() {
  const form    = document.getElementById('fixed-cost-form');
  const display = document.getElementById('fixed-cost-total');

  function update() {
    const total = sumInputs('.fixed-input');
    if (display) display.textContent = formatUSD(total);
    updateBudgetOverview();
  }

  form?.querySelectorAll('.fixed-input').forEach(el => el.addEventListener('input', update));
  form?.addEventListener('submit', (e) => e.preventDefault());
}

/* ═══════════════════════════════════════════════════════════
   VARIABLE COST FORM — live total
   ═══════════════════════════════════════════════════════════ */

function initVariableCostForm() {
  const form    = document.getElementById('variable-cost-form');
  const display = document.getElementById('variable-cost-total');

  function update() {
    const total = sumInputs('.variable-input');
    if (display) display.textContent = formatUSD(total);
    updateBudgetOverview();
  }

  form?.querySelectorAll('.variable-input').forEach(el => el.addEventListener('input', update));
  form?.addEventListener('submit', (e) => e.preventDefault());
}

/* ═══════════════════════════════════════════════════════════
   BUDGET OVERVIEW — combined totals
   ═══════════════════════════════════════════════════════════ */

function updateBudgetOverview() {
  const fixedTotal    = sumInputs('.fixed-input');
  const variablePerPt = sumInputs('.variable-input');
  const overhead      = parseFloat(document.getElementById('overhead-rate')?.value) || 0;
  const patientsLow   = parseInt(document.getElementById('patients-low')?.value)  || 0;
  const patientsHigh  = parseInt(document.getElementById('patients-high')?.value) || 0;
  const sfRate        = parseFloat(document.getElementById('screen-fail-rate')?.value) || 0;

  const midPatients   = Math.round(((patientsLow + patientsHigh) / 2) * (1 - sfRate / 100));
  const variableTotal = variablePerPt * midPatients;
  const subtotal      = fixedTotal + variableTotal;
  const overheadAmt   = subtotal * (overhead / 100);
  const grandTotal    = subtotal + overheadAmt;

  // Update text elements
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = formatUSD(val); };
  set('ov-fixed',    fixedTotal);
  set('ov-variable', variableTotal);
  set('ov-overhead', overheadAmt);
  set('ov-total',    grandTotal);

  updateChart(grandTotal, overhead);
}

/* ═══════════════════════════════════════════════════════════
   5-YEAR BUDGET CHART (Chart.js)
   ═══════════════════════════════════════════════════════════ */

let budgetChartInstance = null;

function buildChartData(baseTotal, inflation) {
  const years  = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
  const rate   = 1 + (parseFloat(inflation) || 0) / 100;
  const totals = years.map((_, i) => +(baseTotal * Math.pow(rate, i)).toFixed(2));
  return { years, totals };
}

function initChart() {
  const canvas = document.getElementById('budgetChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  budgetChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      datasets: [
        {
          label: 'Projected budget ($)',
          data: [0, 0, 0, 0, 0],
          backgroundColor: 'rgba(54, 176, 235, 0.18)',
          borderColor:     '#36B0EB',
          borderWidth:     2,
          borderRadius:    4,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ' ' + formatUSD(ctx.raw),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => formatUSD(val),
            font: { family: "'DM Mono', monospace", size: 11 },
            color: '#666',
          },
          grid: { color: '#e8e8e8' },
        },
        x: {
          ticks: { font: { size: 12 }, color: '#444' },
          grid: { display: false },
        },
      },
    },
  });
}

function updateChart(baseTotal, inflation) {
  if (!budgetChartInstance) return;
  const { totals } = buildChartData(baseTotal, inflation);
  budgetChartInstance.data.datasets[0].data = totals;
  budgetChartInstance.update();
}

/* ═══════════════════════════════════════════════════════════
   SIGN-OUT — wipe budget forms (but keep user store)
   ═══════════════════════════════════════════════════════════ */

function initSignout() {
  document.getElementById('signout-btn')?.addEventListener('click', () => {
    // Lock the budget forms again visually
    const wrapper = document.getElementById('budget-forms-wrapper');
    wrapper?.classList.remove('unlocked');
    wrapper?.classList.add('locked');
    document.getElementById('project-badge')?.classList.remove('visible');
  });
}

/* ═══════════════════════════════════════════════════════════
   ENROLLMENT DATE — set minimum to today
   ═══════════════════════════════════════════════════════════ */

function setDateMin() {
  const today = new Date().toISOString().split('T')[0];
  const el = document.getElementById('enrollment-start');
  if (el) el.min = today;
}

/* ═══════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initProjectForm();
  initFinanceForm();
  initFixedCostForm();
  initVariableCostForm();
  initChart();
  initSignout();
  setDateMin();
});