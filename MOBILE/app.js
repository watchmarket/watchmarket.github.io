/* ═══════════════════════════════════════════════
   SCANNER PRICE CRYPTO — app.js
   Dual DEX Aggregator: METAX + JUMPX
   Full application logic (jQuery 3.7 + Native JS)
═══════════════════════════════════════════════ */

// ─── LocalStorage Keys ───────────────────────
const LS_TOKENS = 'cexdex_tokens';
const LS_SETTINGS = 'cexdex_settings';

// ─── App Dialog Modal ─────────────────────────
// Menggantikan alert() dan confirm() bawaan browser
const MODAL_ICONS = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅', delete: '🗑️' };

function _showModal(icon, title, bodyHtml, buttons, bodyLeft = false) {
    $('#appModalIcon').text(icon);
    $('#appModalTitle').text(title);
    $('#appModalBody').html(bodyHtml).toggleClass('text-left', bodyLeft);
    $('#appModalFooter').html(
        buttons.map((b, i) =>
            `<button class="app-modal-btn ${b.cls}" data-idx="${i}">${b.label}</button>`
        ).join('')
    );
    $('#appModal').addClass('open');
    $('#appModalFooter').off('click').on('click', '[data-idx]', function () {
        $('#appModal').removeClass('open');
        const cb = buttons[+$(this).data('idx')].action;
        if (cb) cb();
    });
}

function showAlert(msg, title, type, onClose) {
    const icon = MODAL_ICONS[type] || MODAL_ICONS.info;
    _showModal(icon, title || 'Info', msg,
        [{ label: 'OK', cls: 'btn-ok', action: onClose }]);
}

function showAlertList(items, title, onClose) {
    const body = '<ul>' + items.map(s => `<li>${s}</li>`).join('') + '</ul>';
    _showModal(MODAL_ICONS.warn, title || 'Perhatian', body,
        [{ label: 'OK', cls: 'btn-ok', action: onClose }], true);
}

function showConfirm(msg, title, labelOk, onOk, onCancel) {
    _showModal(MODAL_ICONS.delete, title || 'Konfirmasi', msg, [
        { label: 'Batal', cls: 'btn-cancel', action: onCancel },
        { label: labelOk || 'Ya', cls: 'btn-ok btn-danger', action: onOk },
    ]);
}

// ─── Runtime State ───────────────────────────
let CFG = {
    username: '',
    wallet: '',
    interval: APP_DEV_CONFIG.defaultInterval,
    sseTimeout: APP_DEV_CONFIG.defaultSseTimeout,
    quoteCountMetax: APP_DEV_CONFIG.defaultQuoteCountMetax,
    quoteCountJumpx: APP_DEV_CONFIG.defaultQuoteCountJumpx,
    soundMuted: false,
    activeCex: [],    // [] = semua aktif
    activeChains: [], // [] = semua aktif
};
function totalQuoteCount() { return CFG.quoteCountMetax + CFG.quoteCountJumpx; }
function isJumpxEnabled() { return APP_DEV_CONFIG.defaultQuoteCountJumpx > 0; }

// Kembalikan token yang lolos filter CEX+chain, diurutkan sesuai monitorSort
let monitorSort = 'az'; // 'az' | 'za' | 'rand'
function getFilteredTokens() {
    const filtered = getTokens()
        .filter(t => {
            const cexOk = CFG.activeCex.length === 0 || CFG.activeCex.includes(t.cex);
            const chainOk = CFG.activeChains.length === 0 || CFG.activeChains.includes(t.chain);
            return cexOk && chainOk;
        });
    if (monitorSort === 'za') return filtered.sort((a, b) => (b.ticker || '').localeCompare(a.ticker || ''));
    if (monitorSort === 'rand') return filtered.sort(() => Math.random() - 0.5);
    return filtered.sort((a, b) => (a.ticker || '').localeCompare(b.ticker || ''));
}

// ─── Signal Sound ─────────────────────────────
const _signalAudio = new Audio('audio.mp3');
_signalAudio.preload = 'auto';
function playSignalSound() {
    // Android WebView: selalu bunyi (bypass setting mute di web)
    // Browser biasa: ikuti setting CFG.soundMuted
    if (!window.AndroidBridge && CFG.soundMuted) return;
    try {
        _signalAudio.currentTime = 0;
        _signalAudio.play().catch(() => { });
    } catch { }
}

// ─── Complete Sound (ronde selesai) ───────────
function playCompleteSound() {
    if (!window.AndroidBridge && CFG.soundMuted) return;
    try {
        const audio = document.getElementById('audioComplete');
        if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
    } catch { }
}
let scanning = false;
let scanAbort = false;
let signalCache = [];
const tgCooldown = new Map(); // tokenId → timestamp
const wmCache = {};           // chain → data array

// ─── Utility ─────────────────────────────────
const getTokens = () => { try { return JSON.parse(localStorage.getItem(LS_TOKENS)) || []; } catch { return []; } };
const saveTokens = (a) => localStorage.setItem(LS_TOKENS, JSON.stringify(a));
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const toWei = (amt, dec) => {
    const n = Math.round(amt * 10 ** dec);
    if (!isFinite(n) || isNaN(n) || n <= 0) return '0';
    return BigInt(n).toString();
};
const fromWei = (w, dec) => parseFloat(w) / 10 ** dec;

// Diagnose problematic wei amounts before sending to DEX API
// Returns a short reason string, or null if amount looks OK
const MAX_SAFE_WEI = BigInt('1' + '0'.repeat(27)); // 1e27 upper limit
function diagnoseWei(amtWei) {
    if (amtWei === '0') return 'AMOUNT NOL';
    try { if (BigInt(amtWei) > MAX_SAFE_WEI) return 'MODAL BESAR'; } catch { }
    return null;
}
const fmt = (v, d = 5) => (+v).toFixed(d);
const fmtPnl = (v) => (v >= 0 ? '+' : '') + (+v).toFixed(2);

// Compact format: 0.0007950 → "0.{3}7950", 0.085 → "0.0850", 1.23 → "1.23"
function fmtCompact(v, sigfigs = 4) {
    if (!isFinite(v) || isNaN(v) || v === 0) return '0';
    const abs = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    if (abs >= 1) return sign + abs.toFixed(2);
    if (abs >= 0.01) return sign + abs.toFixed(4);
    const str = abs.toFixed(20);
    const dec = str.split('.')[1] || '';
    const zeros = dec.match(/^0*/)[0].length;
    const sig = dec.slice(zeros, zeros + sigfigs);
    return `${sign}0.{${zeros}}${sig}`;
}

// ─── Settings ────────────────────────────────
function updateScanCount() {
    const n = getFilteredTokens().length;
    $('#filterCoinCount').text(n);
    if (!scanning) $('#btnScanCount').text('[' + n + ' KOIN ]');
}

function renderFilterChips() {
    // CEX filter chips (multi-select toggle)
    $('#filterCexChips').html(Object.entries(CONFIG_CEX).map(([k, v]) => {
        const on = CFG.activeCex.length === 0 || CFG.activeCex.includes(k);
        return `<span class="fchip${on ? ' on' : ''}" data-key="${k}" data-type="cex"
          style="${on ? `background:${v.WARNA};color:#fff;` : ''}"
          onclick="toggleFilterChip(this,'cex')">
          <img src="icons/cex/${k}.png" class="chip-icon" onerror="this.style.display='none'">
          ${v.label}</span>`;
    }).join(''));
    // Chain filter chips (multi-select toggle)
    $('#filterChainChips').html(Object.entries(CONFIG_CHAINS).map(([k, v]) => {
        const on = CFG.activeChains.length === 0 || CFG.activeChains.includes(k);
        return `<span class="fchip${on ? ' on' : ''}" data-key="${k}" data-type="chain"
          style="${on ? `background:${v.WARNA};color:#fff;` : ''}"
          onclick="toggleFilterChip(this,'chain')">
          <img src="icons/chains/${k}.png" class="chip-icon" onerror="this.style.display='none'">
          ${v.label}</span>`;
    }).join(''));
}
function toggleFilterChip(el, type) {
    const key = el.dataset.key;
    const arr = type === 'cex' ? CFG.activeCex : CFG.activeChains;
    const cfg = type === 'cex' ? CONFIG_CEX : CONFIG_CHAINS;
    const idx = arr.indexOf(key);
    // Jika semua aktif (arr kosong), berarti kita mulai dari "semua ON"
    // Klik pertama pada salah satu = matikan yang lain, aktifkan hanya ini
    if (arr.length === 0) {
        // Set semua menjadi aktif, lalu matikan yang diklik
        const all = Object.keys(cfg);
        arr.push(...all.filter(k => k !== key));
    } else if (idx >= 0) {
        arr.splice(idx, 1);
    } else {
        arr.push(key);
        // Jika semua aktif kembali → reset ke "semua" (arr kosong)
        if (arr.length === Object.keys(cfg).length) arr.splice(0);
    }
    renderFilterChips();
    updateScanCount();
}

function loadSettings() {
    try { const s = JSON.parse(localStorage.getItem(LS_SETTINGS)); if (s) Object.assign(CFG, s); } catch { }
    if (!Array.isArray(CFG.activeCex)) CFG.activeCex = [];
    if (!Array.isArray(CFG.activeChains)) CFG.activeChains = [];
    // Migration from old single quoteCount
    if (CFG.quoteCount && !CFG.quoteCountMetax) { CFG.quoteCountMetax = CFG.quoteCount; delete CFG.quoteCount; }
    $('#setUsername').val(CFG.username);
    $('#setWallet').val(CFG.wallet);
    $('#setInterval').val(CFG.interval);
    $('#setQuoteMetax').val(CFG.quoteCountMetax);
    $('#setQuoteJumpx').val(CFG.quoteCountJumpx);
    // Hide Jumpx settings row if disabled in config
    if (!isJumpxEnabled()) {
        $('#setQuoteJumpx').closest('.settings-row-col').hide();
    }
    $('#setSoundMuted').prop('checked', !!CFG.soundMuted);
    $('#topUsername').text('@' + (CFG.username || '-'));
    // Display version
    const ver = APP_DEV_CONFIG.appVersion || '';
    const verEl = document.getElementById('appVersion');
    if (verEl) verEl.textContent = 'v' + ver;
    const obVer = document.getElementById('onboardVersion');
    if (obVer) obVer.textContent = 'v' + ver;
    renderFilterChips();
    updateScanCount();
}
const EVM_RE = /^0x[0-9a-fA-F]{40}$/;
function saveSettings() {
    const username = $('#setUsername').val().trim();
    const wallet = $('#setWallet').val().trim();
    const intervalRaw = $('#setInterval').val();
    const interval = parseInt(intervalRaw);
    const qMetax = parseInt($('#setQuoteMetax').val());
    const qJumpx = parseInt($('#setQuoteJumpx').val());

    // Validasi semua input
    $('#tabSettings .settings-input').removeClass('input-error');
    const errs = [];
    if (!username)
        errs.push(['setUsername', 'Username wajib diisi']);
    if (!wallet)
        errs.push(['setWallet', 'Wallet Address wajib diisi']);
    else if (!EVM_RE.test(wallet))
        errs.push(['setWallet', 'Wallet Address tidak valid — harus 0x + tepat 40 karakter hex']);
    if (intervalRaw === '' || isNaN(interval) || interval < 100)
        errs.push(['setInterval', 'Jeda KOIN minimal 100 ms']);
    if (isNaN(qMetax) || qMetax < 1 || qMetax > 5)
        errs.push(['setQuoteMetax', 'DEX METAX harus antara 1–5']);
    if (isJumpxEnabled() && (isNaN(qJumpx) || qJumpx < 1 || qJumpx > 5))
        errs.push(['setQuoteJumpx', 'DEX JUMPX harus antara 1–5']);

    if (errs.length) {
        errs.forEach(([id]) => $('#' + id).addClass('input-error'));
        const firstEl = document.getElementById(errs[0][0]);
        if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showAlertList(errs.map(e => e[1]), 'Validasi Settings');
        return;
    }

    CFG.username = username;
    CFG.wallet = wallet;
    CFG.interval = interval;
    CFG.quoteCountMetax = Math.min(5, Math.max(1, qMetax));
    CFG.quoteCountJumpx = isJumpxEnabled() ? Math.min(5, Math.max(1, qJumpx)) : 0;
    CFG.soundMuted = $('#setSoundMuted').prop('checked');
    localStorage.setItem(LS_SETTINGS, JSON.stringify(CFG));
    $('#topUsername').text('@' + (CFG.username || '-'));
    if (!scanning) { buildMonitorRows(); }
    showToast('✓ Settings tersimpan!');
}

// ─── Onboarding ──────────────────────────────
function checkOnboarding() {
    if (!CFG.username || !CFG.wallet) openOnboarding();
}
function openOnboarding() {
    $('#obUsername').val(CFG.username); $('#obWallet').val(CFG.wallet);
    $('#onboardOverlay').addClass('open');
}
$('#btnOnboard').on('click', () => {
    const u = $('#obUsername').val().trim();
    const w = $('#obWallet').val().trim();
    $('#obUsername, #obWallet').removeClass('input-error');
    if (!u || !w) {
        if (!u) $('#obUsername').addClass('input-error');
        if (!w) $('#obWallet').addClass('input-error');
        showAlert('Username dan Wallet Address wajib diisi sebelum melanjutkan.', 'Data Belum Lengkap', 'warn');
        return;
    }
    if (!EVM_RE.test(w)) {
        $('#obWallet').addClass('input-error');
        showAlert('Wallet Address tidak valid.<br>Format: <b>0x</b> + tepat <b>40</b> karakter hex (0-9, a-f).', 'Format Wallet Salah', 'warn');
        return;
    }
    CFG.username = u; CFG.wallet = w;
    localStorage.setItem(LS_SETTINGS, JSON.stringify(CFG));
    $('#topUsername').text('@' + u);
    loadSettings();
    $('#onboardOverlay').removeClass('open');
});

// ─── Tab Lock / Unlock ────────────────────────
function lockTabs() {
    $('#navToken, #navSettings').addClass('disabled');
    $('.top-tab-btn[data-tab="tabToken"], .top-tab-btn[data-tab="tabSettings"]').addClass('disabled');
    $('#monSortBar .sort-btn').addClass('disabled').prop('disabled', true);
}
function unlockTabs() {
    $('#navToken, #navSettings').removeClass('disabled');
    $('.top-tab-btn[data-tab="tabToken"], .top-tab-btn[data-tab="tabSettings"]').removeClass('disabled');
    $('#monSortBar .sort-btn').removeClass('disabled').prop('disabled', false);
}

// ─── Bottom Navigation ───────────────────────
function switchTab(tabId) {
    if (!tabId) return;
    if (scanning && tabId !== 'tabMonitor') return; // locked during scan
    $('.nav-item').removeClass('active');
    $(`.nav-item[data-tab="${tabId}"]`).addClass('active');
    $('.top-tab-btn').removeClass('active');
    $(`.top-tab-btn[data-tab="${tabId}"]`).addClass('active');
    // Show scan footer (sort + start) only on monitor tab
    $('#scanFooter').css('display', tabId === 'tabMonitor' ? 'flex' : 'none');
    $('.tab-pane').removeClass('active');
    $('#' + tabId).addClass('active');
    if (tabId === 'tabToken') renderTokenList();
}
$('.nav-item[data-tab]').on('click', function () { switchTab($(this).data('tab')); });
$('.top-tab-btn[data-tab]').on('click', function () { switchTab($(this).data('tab')); });


// ─── Bottom Sheet ────────────────────────────
function openSheet(id) {
    resetSheetForm();
    if (id) fillSheetForm(id);
    $('#sheetTitle').text(id ? 'Edit Token' : 'Tambah Token');
    $('#editId').val(id || '');
    $('#sheetOverlay').addClass('open');
    setTimeout(() => $('#tokenSheet').addClass('open'), 10);
}
function closeSheet() {
    $('#tokenSheet').removeClass('open');
    $('#sheetOverlay').removeClass('open');
    $('#acToken, #acPair').hide();
    $('#tokenSheet .form-input').removeClass('input-error');
    $('#chainChips, #cexChips').removeClass('input-error');
}
$('#sheetOverlay, #btnSheetCancel').on('click', closeSheet);
$('#fabAdd').on('click', () => openSheet());
// Auto-hapus highlight error saat user mulai edit field
$('#tokenSheet').on('input change', '.form-input', function () { $(this).removeClass('input-error'); });

// ─── CEX & Chain Chips ───────────────────────
function renderCexChips(selected) {
    const html = Object.entries(CONFIG_CEX).map(([k, v]) =>
        `<span class="chip ${selected === k ? 'selected' : ''}" data-cex="${k}"
      style="${selected === k ? `background:${v.WARNA};` : ''}"
      onclick="selectCex('${k}')">
      <img src="icons/cex/${k}.png" class="chip-icon" onerror="this.style.display='none'">
      ${v.label}
    </span>`
    ).join('');
    $('#cexChips').html(html);
}
function selectCex(key) {
    renderCexChips(key);
    autoFillSymbols();
    const ticker = $('#fTicker').val().trim().toUpperCase();
    const pairTk = $('#fTickerPair').val().trim().toUpperCase();
    if (ticker && !isUsdtNoSymbol(key, ticker)) $('#fSymbolToken').attr('placeholder', 'sandIDR');
    if (pairTk && !isUsdtNoSymbol(key, pairTk)) $('#fSymbolPair').attr('placeholder', 'eduIDR');
}
function selectedCex() { return $('#cexChips .chip.selected').data('cex') || Object.keys(CONFIG_CEX)[0]; }

function renderChainChips(selected) {
    const html = Object.entries(CONFIG_CHAINS).map(([k, v]) =>
        `<span class="chip ${selected === k ? 'selected' : ''}" data-chain="${k}"
      style="${selected === k ? `background:${v.WARNA};` : ''}"
      onclick="selectChain('${k}')">
      <img src="icons/chains/${k}.png" class="chip-icon" onerror="this.style.display='none'">
      ${v.label}
    </span>`
    ).join('');
    $('#chainChips').html(html);
}
function selectChain(key) { renderChainChips(key); }
function selectedChain() { return $('#chainChips .chip.selected').data('chain') || 'bsc'; }

// ─── Auto-fill Symbol ────────────────────────
// USDT as ticker/pair never needs a CEX orderbook — 1 USDT = $1 by definition.
// e.g. Binance would generate invalid "USDTUSDT", Gate "USDT_USDT", etc.
const isUsdtNoSymbol = (_cex, ticker) => ticker.toUpperCase() === 'USDT';

function autoFillSymbols() {
    const cex = selectedCex();
    const ticker = $('#fTicker').val().trim();
    const pairTk = $('#fTickerPair').val().trim();
    const cfg = CONFIG_CEX[cex];

    if (ticker) {
        if (isUsdtNoSymbol(cex, ticker)) {
            $('#fSymbolToken').val('').attr('placeholder', 'USDT — otomatis $1');
        } else {
            $('#fSymbolToken').attr('placeholder', 'sandIDR').val(cfg.symbolFmt(ticker));
        }
    }
    if (pairTk) {
        if (isUsdtNoSymbol(cex, pairTk)) {
            $('#fSymbolPair').val('').attr('placeholder', 'USDT — otomatis $1');
        } else {
            $('#fSymbolPair').attr('placeholder', 'eduIDR').val(cfg.symbolFmt(pairTk));
        }
    }
}

// ─── Autocomplete ────────────────────────────
let acDebounce = null;
let acStore = { token: [], pair: [] };

function onTickerInput(type) {
    clearTimeout(acDebounce);
    autoFillSymbols();
    acDebounce = setTimeout(() => triggerAc(type), 300);
}
async function triggerAc(type) {
    const chain = selectedChain();
    const isToken = type === 'token';
    const q = (isToken ? $('#fTicker') : $('#fTickerPair')).val().trim().toUpperCase();
    const box = isToken ? $('#acToken') : $('#acPair');
    if (!q) { box.hide(); return; }

    box.html('<div class="ac-loading">⏳ Memuat...</div>').show();
    const data = await loadWm(chain);
    const res = data.filter(d =>
        d.ticker.toUpperCase().includes(q) || (d.nama_token || '').toUpperCase().includes(q)
    ).slice(0, 8);

    if (!res.length) { box.html('<div class="ac-loading">Tidak ditemukan — isi manual</div>'); return; }

    acStore[type] = res;
    const scShort = (sc) => sc ? sc.slice(0, 6) + '...' + sc.slice(-4) : '-';

    box.html(res.map((d, i) => `
    <div class="ac-item" data-type="${type}" data-idx="${i}">
      <span class="ac-ticker">${d.ticker}</span>
      <span class="ac-name">${d.nama_token || ''} | dec:${d.decimals} | ${scShort(d.sc)}</span>
    </div>`
    ).join('')).show();
}

$(document).on('click', '.ac-item', function () {
    const type = $(this).data('type');
    const idx = parseInt($(this).data('idx'));
    const d = acStore[type]?.[idx];
    if (d) acSelect(d, type);
});

function acSelect(d, type) {
    // Independent fills: TOKEN AC → only fills TOKEN fields; PAIR AC → only fills PAIR fields
    if (type === 'token') {
        $('#fTicker').val(d.ticker);
        $('#fScToken').val(d.sc || '');
        $('#fDecToken').val(d.decimals || 18);
        $('#acToken').hide();
    } else {
        $('#fTickerPair').val(d.ticker);
        $('#fScPair').val(d.sc || '');
        $('#fDecPair').val(d.decimals || 18);
        $('#acPair').hide();
    }
    autoFillSymbols();
}
async function loadWm(chain) {
    if (wmCache[chain]) return wmCache[chain];
    try {
        const url = CONFIG_CHAINS[chain]?.DATAJSON;
        if (!url) return [];
        const r = await fetch(url);
        wmCache[chain] = await r.json();
        return wmCache[chain];
    } catch { return []; }
}
$(document).on('click', function (e) {
    if (!$(e.target).closest('.ac-wrap').length) {
        $('#acToken,#acPair').hide();
    }
});

// ─── Sheet Form ──────────────────────────────
function resetSheetForm() {
    $('#fTicker,#fSymbolToken,#fScToken,#fTickerPair,#fSymbolPair,#fScPair').val('');
    $('#fDecToken,#fDecPair').val(18);
    $('#fModalCtD').val(100); $('#fModalDtC').val(80);
    renderCexChips('binance'); renderChainChips('bsc');
    $('#acToken,#acPair').hide();
}
function fillSheetForm(id) {
    const t = getTokens().find(x => x.id === id);
    if (!t) return;
    $('#fTicker').val(t.ticker); $('#fSymbolToken').val(t.symbolToken);
    $('#fScToken').val(t.scToken); $('#fDecToken').val(t.decToken);
    $('#fTickerPair').val(t.tickerPair); $('#fSymbolPair').val(t.symbolPair);
    $('#fScPair').val(t.scPair); $('#fDecPair').val(t.decPair);
    $('#fModalCtD').val(t.modalCtD); $('#fModalDtC').val(t.modalDtC);
    $('#fMinPnl').val(t.minPnl ?? '');
    renderCexChips(t.cex); renderChainChips(t.chain);
}

$('#btnSheetSave').on('click', () => {
    const ticker = $('#fTicker').val().trim().toUpperCase();
    const cex = selectedCex();
    const symbolToken = $('#fSymbolToken').val().trim().toUpperCase();
    const scToken = $('#fScToken').val().trim();
    const decTokenRaw = $('#fDecToken').val();
    const decToken = parseInt(decTokenRaw);
    const tickerPairRaw = $('#fTickerPair').val().trim().toUpperCase();
    const symbolPair = $('#fSymbolPair').val().trim().toUpperCase();
    const scPair = $('#fScPair').val().trim();
    const decPairRaw = $('#fDecPair').val();
    const decPair = parseInt(decPairRaw);
    const chain = selectedChain();
    const modalCtDRaw = $('#fModalCtD').val();
    const modalDtCRaw = $('#fModalDtC').val();
    const modalCtD = parseFloat(modalCtDRaw);
    const modalDtC = parseFloat(modalDtCRaw);
    const minPnlRaw = $('#fMinPnl').val().trim();
    const minPnl = parseFloat(minPnlRaw);

    // Hapus highlight error sebelumnya
    $('#tokenSheet .form-input').removeClass('input-error');
    $('#chainChips, #cexChips').removeClass('input-error');

    // Kumpulkan error: [fieldId, pesan]
    const errs = [];
    if (!cex) errs.push(['cexChips', 'Exchanger (CEX) belum dipilih']);
    if (!chain) errs.push(['chainChips', 'Network (Chain) belum dipilih']);

    // TOKEN — semua wajib
    if (!ticker)
        errs.push(['fTicker', 'Symbol TOKEN wajib diisi']);
    else if (!/^[A-Z0-9]+$/.test(ticker))
        errs.push(['fTicker', 'Symbol TOKEN hanya huruf/angka (A-Z, 0-9)']);

    if (!symbolToken)
        errs.push(['fSymbolToken', 'Ticker CEX Token wajib diisi']);

    if (!scToken)
        errs.push(['fScToken', 'SC Token wajib diisi']);
    else if (!/^0x[0-9a-fA-F]{40}$/.test(scToken))
        errs.push(['fScToken', 'SC Token tidak valid — harus 0x + tepat 40 karakter hex']);

    if (decTokenRaw === '' || isNaN(decToken) || decToken < 0 || decToken > 30)
        errs.push(['fDecToken', 'Decimal Token harus angka antara 0–30']);

    // PAIR — opsional untuk stablecoin (USDT)
    // Jika Symbol PAIR kosong → default pair = stablecoin (USDT), SC auto-fill dari USDT_SC
    if (tickerPairRaw && !/^[A-Z0-9]+$/.test(tickerPairRaw))
        errs.push(['fTickerPair', 'Symbol PAIR hanya huruf/angka (A-Z, 0-9)']);

    const tickerPair = tickerPairRaw || ticker;
    const isPairUsdt = tickerPair.toUpperCase() === 'USDT';
    const isPairSame = tickerPair === ticker;
    const pairNeedsData = !isPairSame && !isPairUsdt;

    // Jika PAIR bukan USDT dan bukan sama dgn TOKEN → data pair wajib lengkap
    if (pairNeedsData) {
        if (!symbolPair)
            errs.push(['fSymbolPair', 'Ticker CEX Pair wajib diisi jika PAIR bukan USDT']);
        if (!scPair)
            errs.push(['fScPair', 'SC Pair wajib diisi jika PAIR bukan USDT']);
        else if (!/^0x[0-9a-fA-F]{40}$/.test(scPair))
            errs.push(['fScPair', 'SC Pair tidak valid — harus 0x + tepat 40 karakter hex']);
    } else if (scPair && !/^0x[0-9a-fA-F]{40}$/.test(scPair)) {
        errs.push(['fScPair', 'SC Pair tidak valid — harus 0x + tepat 40 karakter hex']);
    }

    if (decPairRaw === '' || isNaN(decPair) || decPair < 0 || decPair > 30)
        errs.push(['fDecPair', 'Decimal Pair harus angka antara 0–30']);

    // Modal — semua wajib
    if (modalCtDRaw === '' || isNaN(modalCtD) || modalCtD <= 0)
        errs.push(['fModalCtD', 'Modal CEX→DEX harus angka lebih dari 0']);
    if (modalDtCRaw === '' || isNaN(modalDtC) || modalDtC <= 0)
        errs.push(['fModalDtC', 'Modal DEX→CEX harus angka lebih dari 0']);

    // Min PnL — wajib diisi
    if (minPnlRaw === '' || isNaN(minPnl) || minPnl < 0)
        errs.push(['fMinPnl', 'Min PnL wajib diisi (angka ≥ 0)']);

    if (errs.length) {
        errs.forEach(([id]) => $('#' + id).addClass('input-error'));
        const firstEl = document.getElementById(errs[0][0]);
        if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showAlertList(errs.map(e => e[1]), 'Validasi Form');
        return;
    }

    const tokens = getTokens();
    const id = $('#editId').val() || genId();
    const tok = {
        id, ticker, cex, symbolToken, scToken, decToken,
        tickerPair, symbolPair, scPair, decPair,
        chain, modalCtD, modalDtC,
        minPnl: isFinite(minPnl) ? minPnl : null,   // null = use global setting
    };
    const idx = tokens.findIndex(x => x.id === id);
    if (idx >= 0) tokens[idx] = tok; else tokens.push(tok);
    saveTokens(tokens);
    renderTokenList();
    showToast(idx >= 0 ? '✅ Koin berhasil diperbarui' : '✅ Koin berhasil ditambahkan');
    closeSheet();
});

// ─── Token List ──────────────────────────────
function isValidToken(t) {
    return !!(t.ticker && t.scToken && CONFIG_CEX[t.cex] && CONFIG_CHAINS[t.chain] &&
        (t.symbolToken || isUsdtNoSymbol(t.cex, t.ticker)));
}

let tokenSort = 'az'; // 'az' | 'za'
let tokenSearchQuery = '';

function renderTokenList() {
    let tokens = getTokens();
    // Sorting
    if (tokenSort === 'za') tokens = tokens.sort((a, b) => (b.ticker || '').localeCompare(a.ticker || ''));
    else tokens = tokens.sort((a, b) => (a.ticker || '').localeCompare(b.ticker || ''));
    // Search filter
    if (tokenSearchQuery) {
        const q = tokenSearchQuery.toLowerCase();
        tokens = tokens.filter(t => {
            const ticker = (t.ticker || '').toLowerCase();
            const pair = (t.tickerPair || '').toLowerCase();
            const cex = (CONFIG_CEX[t.cex]?.label || t.cex || '').toLowerCase();
            const chain = (CONFIG_CHAINS[t.chain]?.label || t.chain || '').toLowerCase();
            return ticker.includes(q) || pair.includes(q) || cex.includes(q) || chain.includes(q);
        });
    }
    $('#tokenCount').text('TOTAL ' + tokens.length + ' KOIN');
    if (!tokens.length) {
        $('#tokenList').html('<div class="token-list-empty">Belum ada token. Ketuk + untuk menambah.</div>');
    } else {
        $('#tokenList').html(tokens.map(t => {
            const cexCfg = CONFIG_CEX[t.cex] || {};
            const chainCfg = CONFIG_CHAINS[t.chain] || {};
            const tri = t.tickerPair && t.tickerPair !== t.ticker ? '↔️' : '→';
            const pnlTxt = (isFinite(t.minPnl) && t.minPnl !== null) ? `💰 Min PnL: $${t.minPnl}` : '💰 Min PnL: default';
            const valid = isValidToken(t);
            const invalidBadge = valid ? '' : ' <span class="token-invalid-badge">⚠ Data kurang</span>';
            return `
    <div class="token-list-item${valid ? '' : ' token-invalid'}" id="li-${t.id}">
      <div class="token-list-badges">
        <span class="badge-cex" style="background:${cexCfg.WARNA || '#555'}">
          <img src="icons/cex/${t.cex}.png" class="badge-icon" onerror="this.style.display='none'">${cexCfg.label || t.cex}
        </span>
        <span class="badge-chain" style="background:${chainCfg.WARNA || '#555'}">
          <img src="icons/chains/${t.chain}.png" class="badge-icon" onerror="this.style.display='none'">${chainCfg.label || t.chain}
        </span>
      </div>
      <div class="token-list-info">
        <div class="token-list-sym">${t.ticker} ${tri} ${t.tickerPair || t.ticker}${invalidBadge}</div>
        <div class="token-list-sub">$${t.modalCtD}/$${t.modalDtC} &nbsp;|&nbsp; ${pnlTxt}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div class="token-list-actions">
          <button class="btn-icon" onclick="openSheet('${t.id}')">✏️</button>
          <button class="btn-icon danger" onclick="deleteToken('${t.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
        }).join(''));
    }
    // Rebuild monitor skeleton — skip during active scan agar tidak ganggu proses
    if (!scanning) buildMonitorRows();
    updateScanCount();
}

function deleteToken(id) {
    const tok = getTokens().find(x => x.id === id);
    const name = tok ? tok.ticker : 'token ini';
    showConfirm(
        `Koin <b>${name}</b> akan dihapus permanen dan tidak bisa dikembalikan.`,
        'Hapus Koin',
        'Hapus',
        () => {
            saveTokens(getTokens().filter(x => x.id !== id));
            if (scanning) {
                // Saat scanning: hapus card & chip dari DOM saja, jangan rebuild semua
                const card = document.getElementById('card-' + id);
                if (card) card.remove();
                const chip = document.getElementById('chip-' + id);
                if (chip) chip.remove();
                updateScanCount();
                showToast(`🗑️ ${name} dihapus`);
            } else {
                renderTokenList();
            }
        }
    );
}

// ─── CSV Export / Import ─────────────────────
const CSV_COLS = ['ticker', 'cex', 'symbolToken', 'scToken', 'decToken', 'tickerPair', 'symbolPair', 'scPair', 'decPair', 'chain', 'modalCtD', 'modalDtC', 'minPnl'];

$('#btnExport').on('click', () => {
    const tokens = getTokens();
    const rows = [CSV_COLS.join(','), ...tokens.map(t => CSV_COLS.map(c => `"${t[c] ?? ''}"`).join(','))];
    const csvContent = rows.join('\n');

    // Android WebView: blob URL download tidak didukung — pakai native bridge
    if (window.AndroidBridge) {
        window.AndroidBridge.saveFile('cexdex-tokens.csv', csvContent);
        return;
    }

    // Browser biasa: gunakan blob download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cexdex-tokens.csv'; a.click();
});
$('#btnImportTrigger').on('click', () => $('#importFile').click());
// Parser CSV yang benar: menangani cell kosong, quoted value, dan CRLF
function parseCSVLine(line) {
    const result = [];
    let i = 0, val = '';
    while (i < line.length) {
        if (line[i] === '"') {
            i++;
            while (i < line.length) {
                if (line[i] === '"' && line[i + 1] === '"') { val += '"'; i += 2; } // escaped quote
                else if (line[i] === '"') { i++; break; }
                else { val += line[i++]; }
            }
            // skip trailing chars until comma
            while (i < line.length && line[i] !== ',') i++;
        } else if (line[i] === ',') {
            result.push(val.trim());
            val = ''; i++;
            continue;
        } else {
            val += line[i++];
        }
        if (i < line.length && line[i] === ',') { result.push(val.trim()); val = ''; i++; }
    }
    result.push(val.replace(/\r/g, '').trim()); // last field
    return result;
}

$('#importFile').on('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
        try {
            const lines = ev.target.result.trim().split(/\r?\n/);
            // Baca header — strip BOM, quotes, whitespace
            const headers = parseCSVLine(lines[0]).map(h => h.replace(/^\uFEFF/, '').replace(/["\r]/g, '').trim());
            // Validasi: header 'ticker' harus ada
            if (!headers.includes('ticker')) {
                showAlert('Baris pertama file harus berisi header kolom dan minimal ada kolom <b>ticker</b>.', 'Format CSV Salah', 'error');
                return;
            }
            const tokens = lines.slice(1)
                .filter(line => line.trim()) // skip baris benar-benar kosong
                .map(line => {
                    const vals = parseCSVLine(line);
                    const obj = {};
                    // Map by header name — urutan kolom tidak harus sama
                    headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').replace(/["\r]/g, '').trim(); });
                    obj.decToken = parseInt(obj.decToken) || 18;
                    obj.decPair = parseInt(obj.decPair) || 18;
                    obj.modalCtD = parseFloat(obj.modalCtD) || 100;
                    obj.modalDtC = parseFloat(obj.modalDtC) || 80;
                    const pnlRaw = parseFloat(obj.minPnl);
                    obj.minPnl = isFinite(pnlRaw) ? pnlRaw : null;
                    obj.id = obj.id || genId();
                    return obj;
                })
                .filter(t => t.ticker); // skip baris tanpa ticker
            if (!tokens.length) {
                showAlert('Tidak ada baris data koin yang valid di dalam file CSV.', 'Import Gagal', 'error');
                return;
            }
            const invalidCount = tokens.filter(t => !isValidToken(t)).length;
            saveTokens(tokens); renderTokenList();
            showToast(`✅ ${tokens.length} koin berhasil diimpor`);
        } catch (err) { showAlert('Terjadi kesalahan saat membaca file:<br>' + err.message, 'Error Import', 'error'); }
    };
    r.readAsText(f);
    e.target.value = '';
});

// ─── CEX Orderbook Fetch ─────────────────────
let usdtRate = 16000;
async function fetchUsdtRate() {
    try {
        const r = await fetch(APP_DEV_CONFIG.corsProxy + 'https://indodax.com/api/ticker/usdtidr');
        const d = await r.json();
        usdtRate = parseFloat(d.ticker?.last) || 16000;
    } catch { }
}

async function fetchOrderbook(cexKey, symbol) {
    const cfg = CONFIG_CEX[cexKey];
    if (!cfg) return null;
    let url = cfg.ORDERBOOK.urlTpl(symbol);
    if (cfg.ORDERBOOK.proxy) url = APP_DEV_CONFIG.corsProxy + url;
    try {
        const r = await fetch(url);
        const d = await r.json();
        return parseOrderbook(d, cfg.ORDERBOOK.parser);
    } catch (e) { return { error: e.message }; }
}

function parseOrderbook(raw, parser) {
    try {
        let bids, asks;
        if (parser === 'standard') { bids = raw.bids; asks = raw.asks; }
        else if (parser === 'indodax') {
            // Indodax depth API: both buy & sell return [price_idr, amount_coin]
            bids = (raw.buy || []).map(b => [b[0] / usdtRate, b[1]]);
            asks = (raw.sell || []).map(s => [s[0] / usdtRate, s[1]]);
        }
        if (!bids || !asks) return { error: 'no data' };
        const toNum = (arr) => arr.slice(0, 5).map(e => [parseFloat(e[0]), parseFloat(e[1])]);
        return {
            bids: toNum(bids),
            asks: toNum(asks),
            askPrice: parseFloat(asks[0]?.[0] || 0),
            bidPrice: parseFloat(bids[0]?.[0] || 0),
        };
    } catch (e) { return { error: e.message }; }
}

// ─── METAX: MetaMask Bridge SSE ──────────────
function fetchDexQuotesMetax(chainId, srcToken, destToken, amountWei) {
    return new Promise(resolve => {
        const dummy = CFG.wallet || '0x7809151CFEF645A14a52F5903dE04CB9D2a0D14b';
        const params = new URLSearchParams({
            walletAddress: dummy, destWalletAddress: dummy,
            srcChainId: chainId, destChainId: chainId,
            srcTokenAddress: srcToken, destTokenAddress: destToken,
            srcTokenAmount: amountWei,
            insufficientBal: 'true', resetApproval: 'false',
            gasIncluded: 'true', gasIncluded7702: 'false', slippage: '0.5'
        });
        const url = `https://bridge.api.cx.metamask.io/getQuoteStream?${params}`;
        const quotes = []; let done = false;
        const es = new EventSource(url);
        const timer = setTimeout(() => { if (!done) { done = true; es.close(); resolve(quotes); } }, CFG.sseTimeout);
        es.addEventListener('quote', ev => {
            try {
                quotes.push(JSON.parse(ev.data));
                if (quotes.length >= CFG.quoteCountMetax) { done = true; clearTimeout(timer); es.close(); resolve(quotes); }
            } catch { }
        });
        es.onerror = () => { if (!done) { done = true; clearTimeout(timer); es.close(); resolve(quotes); } };
    });
}

function parseDexQuoteMetax(q) {
    try {
        const dest = q.quote?.destTokenAmount || q.destTokenAmount || '0';
        const dec = q.quote?.destAsset?.decimals || 18;
        const name = (q.quote?.bridgeId || q.bridgeId || 'DEX').toString().toUpperCase();
        return { amount: parseFloat(dest), dec, name, src: 'MX' };
    } catch { return null; }
}

// ─── JUMPX: LiFi/Jumper REST API ─────────────
const _lifiKeys = [
    "e057a54c-1459-44ab-ac50-faa645763c43.a87045f9-d438-4f5a-8707-57f2b7c239b3",
    "8ed53cb9-d883-4f85-9429-116c0193e8f4.3341cd43-bbd1-40e2-ac1b-1969af85a2c6",
    "632e463a-7cf2-4c51-b962-ef78a6608419.98102f8e-7b7c-4a4a-aa3d-d37424b1b4df",
    "057a2f7f-cba7-4db0-b325-ba402737550e.e8851b8d-492a-491d-bf75-80a755f890eb",
    "bcb65083-bbfd-4a0d-89e3-f07abd43a65c.92d118b0-1544-4cf7-8fcb-53a326497bdd",
    "eeee2d0d-dc45-4342-922f-501d26580116.b6bfc1b2-98ca-4ceb-a558-e82de853523b",
    "d251802b-39e2-4134-94e9-447449fc5371.a4d8e5e6-5c94-4124-9466-5d84831544e2",
    "be4bfb73-abcf-47e3-b3b2-edf2241b887b.6a740544-f414-4402-aff8-9ca9a9e3516e",
    "3579f473-a800-46b2-8d03-dbe3988961b8.33739a98-dadc-4b76-b8e7-cb7fd79a12d3",
    "14ddac76-3343-4009-91d4-af6c1d355cac.12384c4a-2844-46e9-add8-7408c0c4d687",
    "6a460b8c-1fcd-42e6-9e04-0f5c6610428d.31f97303-23f1-476b-ad5d-d138926fa4f6",
    "5b976d7c-7b3d-4cea-ba67-b76e34bda0d1.c725a0da-caa2-4eb4-9062-fc722705f79b",
    "3e4c820e-9b71-48fd-80b0-f363ea3c8bc0.20cd7488-25fc-4f82-b063-38bbc26dd878",
    "0877c8c3-66b9-41d5-8082-b33767a32f87.3d522860-428b-4aa3-aa38-f430635a5475",
    "55ce89b2-1b62-426e-bbcf-a34feb9d9a01.f14ad8fb-8286-44a8-8e6f-02cb79f9f801",
    "463c3300-ab2c-4c90-bbfe-c77de13c5b70.eab3e0a8-5199-4a83-91da-e44aae7184f8",
    "a6f75d89-282c-4865-a588-1987d3a00da8.c22a17e7-1aa5-41b8-8d83-efd24a0a684a",
    "12d54546-961e-4706-bf7c-3d868a26c5bf.862448ac-1cbe-411c-9803-5e77d4f38a54",
    "876c98f2-6c5f-451c-9305-2f834e855daf.8bb1259a-bd7b-461a-960c-ecd254b48f50",
    "ce36f6d6-303c-4514-946f-8693000ef077.58a4926e-8e5f-4c20-925e-811470a5064c",
    "e190ef8a-3eff-4fd6-ab41-69c23e765032.c113ce05-1ead-4c66-8a76-b48b893bbee5",
    "114f7124-f64a-42ee-963b-254819128e6d.5aacb323-2c24-4b20-9f85-080c31ac50d6",
    "100f9d4d-2d7d-453b-ae0c-ef531b47f003.0f2f6e44-b8f3-4480-b873-4a17fd8806c7",
    "5f682b5a-ae54-4f2d-94c3-cd33e3600591.6bbe0750-bebe-4b3e-a2eb-626ef9fe89c9",
    "8b2c8447-d90d-4a5d-b244-a31a09d45119.c52d9228-9896-410e-843f-e69f0e65a693",
    "abf49d98-2271-4a8d-9e35-f0a9390bbb0d.a7d1e0ad-b667-444c-a9c0-3f53e10715f1",
    "a8c20c8f-3e22-4563-9a0c-85279121fff1.3fb1a1ea-bd1a-4a23-96f2-2c72c6a59999",
    "0c316940-f3a0-456f-a475-10d0fa258e6a.754d4b65-6c1a-4da3-becc-93935d069907",
    "141b50c8-4286-4e0f-9fd5-25839061dddc.a8cb5c0b-93ce-49f2-abce-07d1d6acb845",
    "d4cb0ef9-2353-4592-a5fc-ebdc84e4f286.e3394885-f29a-431f-acac-5861e950de57",
    "77e9eb6b-b249-49fb-b14f-87a0b6c73da3.8b3ecf40-382b-41ea-9686-e7506b2886a7",
    "17af0ac7-b1f2-4865-bc68-5a838b8ea1b0.299004de-2548-43f2-a26c-c7bd8dd5863e",
    "df8c9a43-70e1-4c14-bfb4-ed41bcc2b9a3.24d92c87-9741-4f65-b4f5-b48305905261",
    "36df52b4-5b1d-4d50-9a0d-ee0a0114b95e.fff847c2-3e91-489f-b3d6-055c567e0bb7",
    "d51f303f-9178-4df1-8c55-1f0041e5cee0.bee4b96d-f689-4a27-9dcd-b016bcfcc630",
    "86cd6fe3-2ecb-4c0a-ae89-2d72a1245ec6.8f46d456-eea0-4d83-87fd-c54cec99bae6",
    "9d7307ce-211c-4e5d-9c67-cc2a4071fa8a.c2a3002a-4d2a-40d8-a9bd-87c4c6cf4064",
    "8a3af21e-22c3-4df3-a1dc-d34325fe5956.d6a84b30-916c-4b75-95d8-fdba1c93d44a",
    "cb0b4641-13b8-4363-bbe7-a2ce1d33ae25.45d5b10a-14f0-41fd-8812-5aeba8520b19",
    "8be66370-651b-4d3f-9351-8168a3a8c34f.5bb01420-cdd6-4d2e-83e0-8d5d100f1b01"
];
function _lifiApiKey() { return _lifiKeys[Math.floor(Math.random() * _lifiKeys.length)]; }

function fetchDexQuotesJumpx(chainId, srcToken, destToken, amountWei) {
    if (!isJumpxEnabled()) return Promise.resolve([]);
    return new Promise(async resolve => {
        try {
            const userAddr = CFG.wallet || '0x0000000000000000000000000000000000000000';
            const body = {
                fromChainId: Number(chainId),
                toChainId: Number(chainId),
                fromTokenAddress: srcToken.toLowerCase(),
                toTokenAddress: destToken.toLowerCase(),
                fromAmount: amountWei.toString(),
                fromAddress: userAddr,
                toAddress: userAddr,
                options: { slippage: 0.03, order: 'RECOMMENDED', allowSwitchChain: false }
            };
            const resp = await fetch('https://li.quest/v1/advanced/routes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-lifi-api-key': _lifiApiKey()
                },
                body: JSON.stringify(body)
            });
            if (!resp.ok) { resolve([]); return; }
            const data = await resp.json();
            const routes = data?.routes || [];
            resolve(routes.slice(0, CFG.quoteCountJumpx));
        } catch { resolve([]); }
    });
}

function parseDexQuoteJumpx(route) {
    try {
        if (!route || !route.toAmount) return null;
        const amount = parseFloat(route.toAmount);
        const dec = route.toToken?.decimals || 18;
        let name = 'JUMPX';
        try { const t = route.steps?.[0]?.toolDetails?.name; if (t) name = String(t).toUpperCase(); } catch { }
        return { amount, dec, name, src: 'JX' };
    } catch { return null; }
}

// ─── PnL Calculator ──────────────────────────
function calcPnl(modal, pairAmt, bidPair, cexKey) {
    const fee = APP_DEV_CONFIG.fees[cexKey] || 0.001;
    const pairValue = pairAmt * bidPair;
    const cexFee1 = modal * fee;        // fee trader (CEX beli/jual)
    const cexFee2 = pairValue * fee;    // fee swap (gas/bridge)
    return { pnl: pairValue - modal - cexFee1 - cexFee2, pairValue, cexFee1, cexFee2, totalFee: cexFee1 + cexFee2 };
}

// ─── Scan Engine (Dual Aggregator: METAX + JUMPX) ─────
// Parse & compute PnL from a single parsed quote object
function computeQuotePnl(parsed, destDec, bidPrice, modal, cexKey, askPrice, direction) {
    const recv = fromWei(parsed.amount + '', parsed.dec || destDec);
    const recvUSDT = recv * bidPrice;
    if (direction === 'ctd') {
        const tokensIn = askPrice > 0 ? modal / askPrice : 0;
        const effPrice = tokensIn > 0 ? recvUSDT / tokensIn : 0;
        const { pnl, cexFee1, cexFee2, totalFee } = calcPnl(modal, recv, bidPrice, cexKey);
        return { name: parsed.name, src: parsed.src, recvUSDT, effPrice, pnl, cexFee1, cexFee2, totalFee };
    } else {
        const effPrice = recv > 0 ? modal / recv : 0;
        const { pnl, cexFee1, cexFee2, totalFee } = calcPnl(modal, recv, bidPrice, cexKey);
        return { name: parsed.name, src: parsed.src, recvUSDT, effPrice, pnl, cexFee1, cexFee2, totalFee };
    }
}

async function scanToken(tok) {
    const chainCfg = CONFIG_CHAINS[tok.chain];
    if (!chainCfg) return;
    const card = document.getElementById('card-' + tok.id);
    if (!card) return;
    const n = totalQuoteCount();

    // 1. Fetch CEX orderbook for TOKEN
    let obToken;
    if (!tok.symbolToken) {
        obToken = { askPrice: 1.0, bidPrice: 1.0, bids: [], asks: [] };
    } else {
        obToken = await fetchOrderbook(tok.cex, tok.symbolToken);
        if (!obToken || obToken.error) { setCardStatus(card, 'ERROR: KONEKSI EXCHANGER'); return; }
    }

    // 2. Fetch CEX orderbook for PAIR (if triangular)
    let bidPair = 1, askPair = 1;
    const isTriangular = tok.tickerPair && tok.tickerPair !== tok.ticker && tok.symbolPair
        && tok.tickerPair.toUpperCase() !== 'USDT';
    if (isTriangular) {
        const obPair = await fetchOrderbook(tok.cex, tok.symbolPair);
        if (obPair && !obPair.error) { askPair = obPair.askPrice; bidPair = obPair.bidPrice; }
    }

    let pairSc = tok.scPair || '';
    let pairDec = tok.decPair || 18;
    if (tok.tickerPair && tok.tickerPair.toUpperCase() === 'USDT') {
        pairSc = USDT_SC[tok.chain] || pairSc;
        pairDec = USDT_DEC[tok.chain] ?? pairDec;
    }
    if (!pairSc || !tok.scToken) { setCardStatus(card, 'SC kosong'); return; }

    // 3. Fetch DEX quotes from BOTH aggregators in parallel
    const weiCtD = toWei(obToken.askPrice > 0 ? tok.modalCtD / obToken.askPrice : 0, tok.decToken);
    const weiDtC = toWei(isTriangular ? (askPair > 0 ? tok.modalDtC / askPair : 0) : tok.modalDtC, pairDec);
    const diagCtD = diagnoseWei(weiCtD);
    const diagDtC = diagnoseWei(weiDtC);
    const chainId = chainCfg.Kode_Chain;
    const [mxCtD, mxDtC, jxCtD, jxDtC] = await Promise.all([
        fetchDexQuotesMetax(chainId, tok.scToken, pairSc, weiCtD),
        fetchDexQuotesMetax(chainId, pairSc, tok.scToken, weiDtC),
        fetchDexQuotesJumpx(chainId, tok.scToken, pairSc, weiCtD),
        fetchDexQuotesJumpx(chainId, pairSc, tok.scToken, weiDtC),
    ]);

    // 4. Combine & sort CTD quotes (METAX + JUMPX) by PnL descending
    const tokMinPnl = (isFinite(tok.minPnl) && tok.minPnl !== null) ? tok.minPnl : 1;
    const allCtD = [];
    mxCtD.forEach(q => { const p = parseDexQuoteMetax(q); if (p) allCtD.push(computeQuotePnl(p, pairDec, bidPair, tok.modalCtD, tok.cex, obToken.askPrice, 'ctd')); });
    jxCtD.forEach(q => { const p = parseDexQuoteJumpx(q); if (p) allCtD.push(computeQuotePnl(p, pairDec, bidPair, tok.modalCtD, tok.cex, obToken.askPrice, 'ctd')); });
    allCtD.sort((a, b) => b.pnl - a.pnl); // best first
    const ctdData = allCtD.slice(0, n);

    // 5. Combine & sort DTC quotes by PnL ascending (best rightmost)
    const allDtC = [];
    mxDtC.forEach(q => { const p = parseDexQuoteMetax(q); if (p) allDtC.push(computeQuotePnl(p, tok.decToken, obToken.bidPrice, tok.modalDtC, tok.cex, obToken.askPrice, 'dtc')); });
    jxDtC.forEach(q => { const p = parseDexQuoteJumpx(q); if (p) allDtC.push(computeQuotePnl(p, tok.decToken, obToken.bidPrice, tok.modalDtC, tok.cex, obToken.askPrice, 'dtc')); });
    allDtC.sort((a, b) => a.pnl - b.pnl); // best last
    const dtcData = allDtC.slice(0, n);

    // 6. Fill CTD table
    const ctdStatus = card.querySelector('.ctd-table .tbl-status');
    if (ctdStatus) ctdStatus.textContent = '';
    for (let i = 0; i < n; i++) {
        const cexEl = card.querySelector(`[data-ctd-cex="${i}"]`);
        if (cexEl) { cexEl.textContent = `↑ ${fmtCompact(obToken.askPrice)}$`; cexEl.className = 'mon-dex-cell mc-ask'; }
    }
    if (!ctdData.length) {
        const reason = diagCtD || 'TIDAK ADA LP / DEX';
        const hdrEl0 = card.querySelector('[data-ctd-hdr="0"]');
        if (hdrEl0) { hdrEl0.textContent = reason; hdrEl0.className = 'mon-dex-hdr mon-dex-hdr-err'; }
        for (let i = 1; i < n; i++) { const h = card.querySelector(`[data-ctd-hdr="${i}"]`); if (h) { h.textContent = '—'; h.className = 'mon-dex-hdr'; } }
        const hint = diagCtD === 'MODAL BESAR' ? '↓ Kecilkan Modal' : diagCtD === 'AMOUNT NOL' ? '↓ Cek Harga CEX' : '↓ KOIN TIDAK ADA DI DEX / LP';
        const dexEl0 = card.querySelector('[data-ctd-dex="0"]');
        if (dexEl0) { dexEl0.textContent = hint; dexEl0.className = 'mon-dex-cell mc-err'; }
        for (let i = 1; i < n; i++) { const d = card.querySelector(`[data-ctd-dex="${i}"]`); if (d) { d.textContent = '—'; d.className = 'mon-dex-cell mc-muted'; } }
    } else {
        ctdData.forEach((r, i) => {
            const hdrEl = card.querySelector(`[data-ctd-hdr="${i}"]`);
            const cexEl = card.querySelector(`[data-ctd-cex="${i}"]`);
            const dexEl = card.querySelector(`[data-ctd-dex="${i}"]`);
            const feeEl = card.querySelector(`[data-ctd-fee="${i}"]`);
            const pnlEl = card.querySelector(`[data-ctd-pnl="${i}"]`);
            const isSignal = r.pnl >= tokMinPnl;
            const sigCls = isSignal ? ' col-signal' : '';
            const srcTag = r.src === 'MX' ? '<span class="src-tag mx">MX</span>' : '<span class="src-tag jx">JX</span>';
            if (hdrEl) { hdrEl.innerHTML = r.name + ' ' + srcTag; hdrEl.className = 'mon-dex-hdr'; }
            if (cexEl) { cexEl.textContent = `↑ ${fmtCompact(obToken.askPrice)}$`; cexEl.className = 'mon-dex-cell mc-ask' + sigCls; }
            if (dexEl) { dexEl.textContent = `↓ ${fmtCompact(r.effPrice)}$`; dexEl.className = 'mon-dex-cell mc-bid' + sigCls; }
            if (feeEl) { feeEl.textContent = `-${r.cexFee1.toFixed(2)}|${r.cexFee2.toFixed(2)}`; feeEl.className = 'mon-dex-cell mc-recv' + sigCls; }
            if (pnlEl) { const cls = r.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'; pnlEl.textContent = `${fmtPnl(r.pnl)}$`; pnlEl.className = `mon-dex-cell mc-pnl ${cls}` + sigCls; }
        });
        // Fill remaining empty columns with explanation
        for (let i = ctdData.length; i < n; i++) {
            const h = card.querySelector(`[data-ctd-hdr="${i}"]`);
            const c = card.querySelector(`[data-ctd-cex="${i}"]`);
            const d = card.querySelector(`[data-ctd-dex="${i}"]`);
            const f = card.querySelector(`[data-ctd-fee="${i}"]`);
            const p = card.querySelector(`[data-ctd-pnl="${i}"]`);
            if (h) { h.textContent = 'NO DATA'; h.className = 'mon-dex-hdr mon-dex-hdr-err'; }
            if (c) { c.textContent = '-'; c.className = 'mon-dex-cell mc-muted'; }
            if (d) { d.textContent = '-'; d.className = 'mon-dex-cell mc-muted'; }
            if (f) { f.textContent = '-'; f.className = 'mon-dex-cell mc-muted'; }
            if (p) { p.textContent = '-'; p.className = 'mon-dex-cell mc-muted'; }
        }
    }

    // 7. Fill DTC table
    const dtcStatus = card.querySelector('.dtc-table .tbl-status');
    if (dtcStatus) dtcStatus.textContent = '';
    for (let i = 0; i < n; i++) {
        const cexEl = card.querySelector(`[data-dtc-cex="${i}"]`);
        if (cexEl) { cexEl.textContent = `↑ ${fmtCompact(obToken.bidPrice)}$`; cexEl.className = 'mon-dex-cell mc-ask'; }
    }
    if (!dtcData.length) {
        const reason = diagDtC || '';
        const hdrEl0 = card.querySelector('[data-dtc-hdr="0"]');
        if (hdrEl0) { hdrEl0.textContent = reason; hdrEl0.className = 'mon-dex-hdr mon-dex-hdr-err'; }
        for (let i = 1; i < n; i++) { const h = card.querySelector(`[data-dtc-hdr="${i}"]`); if (h) { h.textContent = '—'; h.className = 'mon-dex-hdr'; } }
        const hint = diagDtC === 'MODAL BESAR' ? '↓ Kecilkan Modal' : diagDtC === 'AMOUNT NOL' ? '↓ Cek Harga CEX' : '↓ KOIN TIDAK ADA DI DEX / LP';
        const dexEl0 = card.querySelector('[data-dtc-dex="0"]');
        if (dexEl0) { dexEl0.textContent = hint; dexEl0.className = 'mon-dex-cell mc-err'; }
        for (let i = 1; i < n; i++) { const d = card.querySelector(`[data-dtc-dex="${i}"]`); if (d) { d.textContent = '—'; d.className = 'mon-dex-cell mc-muted'; } }
    } else {
        dtcData.forEach((r, i) => {
            const hdrEl = card.querySelector(`[data-dtc-hdr="${i}"]`);
            const cexEl = card.querySelector(`[data-dtc-cex="${i}"]`);
            const dexEl = card.querySelector(`[data-dtc-dex="${i}"]`);
            const feeEl = card.querySelector(`[data-dtc-fee="${i}"]`);
            const pnlEl = card.querySelector(`[data-dtc-pnl="${i}"]`);
            const isSignal = r.pnl >= tokMinPnl;
            const sigCls = isSignal ? ' col-signal' : '';
            const srcTag = r.src === 'MX' ? '<span class="src-tag mx">MX</span>' : '<span class="src-tag jx">JX</span>';
            if (hdrEl) { hdrEl.innerHTML = r.name + ' ' + srcTag; hdrEl.className = 'mon-dex-hdr'; }
            if (cexEl) { cexEl.textContent = `↑ ${fmtCompact(r.effPrice)}$`; cexEl.className = 'mon-dex-cell mc-ask' + sigCls; }
            if (dexEl) { dexEl.textContent = `↓ ${fmtCompact(obToken.bidPrice)}$`; dexEl.className = 'mon-dex-cell mc-bid' + sigCls; }
            if (feeEl) { feeEl.textContent = `-${r.cexFee1.toFixed(2)}|${r.cexFee2.toFixed(2)}`; feeEl.className = 'mon-dex-cell mc-recv' + sigCls; }
            if (pnlEl) { const cls = r.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'; pnlEl.textContent = `${fmtPnl(r.pnl)}$`; pnlEl.className = `mon-dex-cell mc-pnl ${cls}` + sigCls; }
        });
        // Fill remaining empty columns with explanation
        for (let i = dtcData.length; i < n; i++) {
            const h = card.querySelector(`[data-dtc-hdr="${i}"]`);
            const c = card.querySelector(`[data-dtc-cex="${i}"]`);
            const d = card.querySelector(`[data-dtc-dex="${i}"]`);
            const f = card.querySelector(`[data-dtc-fee="${i}"]`);
            const p = card.querySelector(`[data-dtc-pnl="${i}"]`);
            if (h) { h.textContent = 'NO DATA'; h.className = 'mon-dex-hdr mon-dex-hdr-err'; }
            if (c) { c.textContent = '-'; c.className = 'mon-dex-cell mc-muted'; }
            if (d) { d.textContent = '-'; d.className = 'mon-dex-cell mc-muted'; }
            if (f) { f.textContent = '-'; f.className = 'mon-dex-cell mc-muted'; }
            if (p) { p.textContent = '-'; p.className = 'mon-dex-cell mc-muted'; }
        }
    }

    // 8. Signal chip & card highlight — best from all combined quotes
    const bestCtD = ctdData.length ? ctdData[0].pnl : -999;
    const bestDtC = dtcData.length ? dtcData[dtcData.length - 1].pnl : -999;
    const best = Math.max(bestCtD, bestDtC);
    const isCtd = bestCtD >= bestDtC;
    const bestDir = isCtd ? 'CTD' : 'DTC';
    updateSignalChip(tok, best, bestDir);
    if (best >= tokMinPnl) {
        card.classList.add('has-signal');
        const bestRow = isCtd ? ctdData[0] : dtcData[dtcData.length - 1];
        const tgInfo = bestRow ? {
            dexName: bestRow.name + (bestRow.src === 'MX' ? ' [METAX]' : ' [JUMPX]'),
            totalFee: bestRow.totalFee,
            modal: isCtd ? tok.modalCtD : tok.modalDtC,
            dir: isCtd ? 'CEX→DEX' : 'DEX→CEX',
        } : null;
        sendTelegram(tok, best, tgInfo);
    } else {
        card.classList.remove('has-signal');
    }
    setCardStatus(card, '');
}

// Show error/status in both sub-table headers; clear when msg is empty
function setCardStatus(card, msg) {
    card.querySelectorAll('.tbl-status').forEach(el => {
        el.textContent = msg ? ` ⚠ ${msg}` : '';
        el.className = msg ? 'tbl-status tbl-status-err' : 'tbl-status';
    });
}

// ─── Monitor Cards Build ──────────────────────
const MON_CTD_COLOR = '#579a69'; // hijau CEXtoDEX
const MON_DTC_COLOR = '#d56666'; // merah DEXtoCEX

function buildMonitorRows() {
    const tokens = getFilteredTokens();
    if (!tokens.length) {
        $('#monitorList').html('<div class="token-list-empty">Tidak ada token. Tambahkan KOIN di menu DATA KOIN.</div>');
        return;
    }
    const n = totalQuoteCount();
    const dexHdr = (pfx, color) => Array.from({ length: n }, (_, i) =>
        `<td class="mon-dex-hdr" data-${pfx}-hdr="${i}" style="background:${color}">-</td>`
    ).join('');
    const dexRow = (pfx, attr) => Array.from({ length: n }, (_, i) =>
        `<td class="mon-dex-cell" data-${pfx}-${attr}="${i}">-</td>`
    ).join('');

    $('#monitorList').html(tokens.map((t, idx) => {
        const cc = CONFIG_CEX[t.cex] || {};
        const ch = CONFIG_CHAINS[t.chain] || {};
        const cexColor = cc.WARNA || '#555';
        const cexLabel = cc.label || t.cex;
        const chainLabel = ch.label || t.chain;
        const tri = t.tickerPair && t.tickerPair !== t.ticker;
        const sym = t.ticker + (tri ? '↔' + t.tickerPair : '');
        const pairTk = t.tickerPair || t.ticker;
        const minPnlLbl = (isFinite(t.minPnl) && t.minPnl !== null) ? t.minPnl : APP_DEV_CONFIG.defaultMinPnl;
        return `<div class="mon-card" id="card-${t.id}" style="border-left:3px solid ${cexColor}">
  <div class="mon-card-hdr" style="background:linear-gradient(90deg,${cexColor}22 0%,var(--surface) 100%)">
    <img src="icons/cex/${t.cex}.png" class="mon-hdr-icon" onerror="this.style.display='none'">
    <img src="icons/chains/${t.chain}.png" class="mon-hdr-icon" onerror="this.style.display='none'">
    <span class="mon-cex-chain">${cexLabel.toUpperCase()}-${chainLabel.toUpperCase()}</span>
    <span class="mon-sym"><span class="mon-num">[${idx + 1}]</span> ${sym}</span>
    
    <span class="mon-card-actions">
      <button class="btn-icon mon-act" onclick="openSheet('${t.id}')" title="Edit Koin">✏️</button>
      <button class="btn-icon danger mon-act" onclick="deleteToken('${t.id}')" title="Hapus Koin">🗑️</button>
    </span>
  </div>
  <div class="mon-tables-wrap">
  <div class="mon-table-scroll">
  <table class="mon-sub-table ctd-table">
    <thead><tr class="mon-sub-hdr">
      <td class="mon-lbl-hdr" style="background:${MON_CTD_COLOR}">$${t.modalCtD}<span class="tbl-status"></span></td>
      ${dexHdr('ctd', MON_CTD_COLOR)}
    </tr></thead>
    <tbody>
      <tr class="mon-row-cex"><td class="mon-lbl-side"><span style='color:green;'>BELI CEX ↑</span></td>${dexRow('ctd', 'cex')}</tr>
      <tr class="mon-row-dex"><td class="mon-lbl-side">${t.ticker}→${pairTk}</td>${dexRow('ctd', 'dex')}</tr>
      <tr class="mon-row-recv"><td class="mon-lbl-side">Trade & Swap</td>${dexRow('ctd', 'fee')}</tr>
      <tr class="mon-row-pnl"><td class="mon-lbl-side">💰 PNL <span class="lbl-minpnl">($${minPnlLbl})</span></td>${dexRow('ctd', 'pnl')}</tr>
    </tbody>
  </table>
  </div>
  <div class="mon-table-scroll">
  <table class="mon-sub-table dtc-table">
    <thead><tr class="mon-sub-hdr">
      <td class="mon-lbl-hdr" style="background:${MON_DTC_COLOR}">$${t.modalDtC}<span class="tbl-status"></span></td>
      ${dexHdr('dtc', MON_DTC_COLOR)}
    </tr></thead>
    <tbody>
      <tr class="mon-row-cex"><td class="mon-lbl-side">${pairTk}→${t.ticker}</td>${dexRow('dtc', 'cex')}</tr>
      <tr class="mon-row-dex"><td class="mon-lbl-side lbl-pair"><span style='color:red;'>JUAL CEX ↓</span></td>${dexRow('dtc', 'dex')}</tr>
      <tr class="mon-row-recv"><td class="mon-lbl-side">Trade & Swap</td>${dexRow('dtc', 'fee')}</tr>
      <tr class="mon-row-pnl"><td class="mon-lbl-side">💰 PNL <span class="lbl-minpnl">($${minPnlLbl})</span></td>${dexRow('dtc', 'pnl')}</tr>
    </tbody>
  </table>
  </div>
  </div>
</div>`;
    }).join(''));
}

// ─── Signal Chips ─────────────────────────────
function updateNoSignalNotice() {
    const el = document.getElementById('noSignalNotice');
    if (!el) return;
    const hasSignal = !!document.querySelector('#signalBar .signal-chip');
    el.style.display = (scanning && !hasSignal) ? 'inline-flex' : 'none';
}

function updateSignalChip(tok, pnl, dir) {
    const tokMinPnl = (isFinite(tok.minPnl) && tok.minPnl !== null) ? tok.minPnl : 1;
    const chipId = 'chip-' + tok.id;
    let chip = document.getElementById(chipId);
    if (pnl >= tokMinPnl) {
        if (!chip) {
            chip = document.createElement('div');
            chip.className = 'signal-chip';
            chip.id = chipId;
            chip.onclick = () => {
                const card = document.getElementById('card-' + tok.id);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            document.getElementById('signalBar').appendChild(chip);
        }
        const cexCfg = CONFIG_CEX[tok.cex] || {};
        const chainCfg = CONFIG_CHAINS[tok.chain] || {};
        const cexLabel = (cexCfg.label || tok.cex || '').toUpperCase();
        const chainLabel = (chainCfg.label || tok.chain || '').toUpperCase();
        const dirLabel = dir === 'CTD' ? 'CEX→DEX' : 'DEX→CEX';
        const dirClass = dir === 'CTD' ? 'dir-ctd' : 'dir-dtc';
        const pnlClass = pnl >= 0 ? 'chip-pnl-pos' : 'chip-pnl-neg';
        const modalLbl = dir === 'CTD' ? `$${tok.modalCtD}` : `$${tok.modalDtC}`;

        chip.innerHTML = `
            <div class="chip-row-top">
                <img src="icons/cex/${tok.cex}.png" class="chip-icon" onerror="this.style.display='none'">
                <img src="icons/chains/${tok.chain}.png" class="chip-icon" onerror="this.style.display='none'">
                <span class="chip-cex">${cexLabel}</span>
                <span class="chip-dir ${dirClass}">${dirLabel}</span>
            </div>
            <div class="chip-row-bottom">
                <span class="chip-ticker">${tok.ticker}</span>
                <span class="chip-sep">|</span>
                <span class="chip-modal">${modalLbl}</span>
                <span class="chip-sep">|</span>
                <span class="chip-pnl ${pnlClass}">${fmtPnl(pnl)}$</span>
            </div>`;
        chip.className = 'signal-chip' + (pnl < 0 ? ' loss' : '');
    } else if (chip) {
        chip.remove();
    }
    updateNoSignalNotice();
}

// ─── Telegram + Android Notification ─────────────────────────────────────
// Cooldown berlaku untuk keduanya (Telegram & Android bridge)
async function sendTelegram(tok, pnl, info) {
    const now = Date.now();
    const last = tgCooldown.get(tok.id) || 0;
    if (now - last < APP_DEV_CONFIG.telegramCooldown * 60000) return;
    tgCooldown.set(tok.id, now);
    playSignalSound();

    const chain = CONFIG_CHAINS[tok.chain]?.label || tok.chain;
    const cexLbl = CONFIG_CEX[tok.cex]?.label || tok.cex;
    const dexLbl = info?.dexName || 'DEX';
    const dir = info?.dir || 'CEX↔DEX';
    const fee = info?.totalFee != null ? info.totalFee.toFixed(2) : '-';
    const modal = info?.modal ?? tok.modalCtD;
    const pairLbl = tok.tickerPair && tok.tickerPair !== tok.ticker ? tok.tickerPair : tok.ticker;
    const wallet = CFG.wallet
        ? CFG.wallet.slice(0, 10) + '.....' + CFG.wallet.slice(-10)
        : '-';

    // ── Android native notification (via WebView JS Bridge) ──────────────
    if (window.AndroidBridge) {
        const title = `🟢 SIGNAL: ${tok.ticker}↔${pairLbl}`;
        const body = `${cexLbl}↔${dexLbl} [${chain}] [${dir}]\nPnL: ${fmtPnl(pnl)}$  |  Modal: $${modal}`;
        window.AndroidBridge.showNotification(title, body);
    }

    // ── Telegram ──────────────────────────────────────────────────────────
    if (!APP_DEV_CONFIG.telegramBotToken || APP_DEV_CONFIG.telegramBotToken.length < 20) return;

    const msg =
        `🟢 SIGNAL SCANNER | @${CFG.username || 'user'}
Token: ${tok.ticker}↔${pairLbl}
Proses: ${cexLbl} ↔ ${dexLbl}
PnL & Fee: ${fmtPnl(pnl)}$ | $${fee}
Modal: $${modal} [${dir}]
Wallet: ${wallet}
--------------------------------------------------------------`;

    try {
        await fetch(`https://api.telegram.org/bot${APP_DEV_CONFIG.telegramBotToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: APP_DEV_CONFIG.telegramGroupId, text: msg })
        });
    } catch { }
}

// ─── Toast ────────────────────────────────────
let _toastTimer = null;
function showToast(msg, duration = 2200) {
    const el = document.getElementById('toastMsg');
    if (!el) return;
    clearTimeout(_toastTimer);
    el.textContent = msg;
    el.classList.add('show');
    _toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ─── Reset Monitor Cells ──────────────────────
// Kosongkan semua sel tabel dan sinyal setelah setiap ronde selesai
function resetMonitorCells() {
    const n = totalQuoteCount();
    document.querySelectorAll('.mon-card').forEach(card => {
        card.classList.remove('has-signal');
        card.querySelectorAll('.card-status').forEach(el => el.textContent = '');
        card.querySelectorAll('.tbl-status').forEach(el => {
            el.textContent = ''; el.className = 'tbl-status';
        });
        for (let i = 0; i < n; i++) {
            ['ctd', 'dtc'].forEach(pfx => {
                const hdr = card.querySelector(`[data-${pfx}-hdr="${i}"]`);
                const cex = card.querySelector(`[data-${pfx}-cex="${i}"]`);
                const dex = card.querySelector(`[data-${pfx}-dex="${i}"]`);
                const fee = card.querySelector(`[data-${pfx}-fee="${i}"]`);
                const pnl = card.querySelector(`[data-${pfx}-pnl="${i}"]`);
                if (hdr) { hdr.textContent = '-'; hdr.className = 'mon-dex-hdr'; }
                if (cex) { cex.textContent = '-'; cex.className = 'mon-dex-cell'; }
                if (dex) { dex.textContent = '-'; dex.className = 'mon-dex-cell'; }
                if (fee) { fee.textContent = '-'; fee.className = 'mon-dex-cell'; }
                if (pnl) { pnl.textContent = '-'; pnl.className = 'mon-dex-cell'; }
            });
        }
    });
    document.querySelectorAll('.signal-chip').forEach(c => c.remove());
}

// ─── Scan Loop ───────────────────────────────
let _scanRound = 0;
async function runScan() {
    if (scanning) return;
    scanning = true; scanAbort = false;
    $('#btnScanIcon').text('■'); $('#btnScanLbl').text('STOP'); $('#btnScan').addClass('stop');
    $('#btnScanCount').text('');
    $('#scanBadge').addClass('active');
    // Clear previous signal chips and reset table
    document.querySelectorAll('.signal-chip').forEach(c => c.remove());
    updateNoSignalNotice();
    lockTabs();
    const tokens = getFilteredTokens();
    if (!tokens.length) { showToast('Tidak ada token aktif! Periksa filter di Pengaturan.'); stopScan(); return; }
    showToast('▶ Scanning dimulai…');
    // Start Android Foreground Service (keeps CPU alive when screen off)
    try { if (window.AndroidBridge && AndroidBridge.startBackgroundService) AndroidBridge.startBackgroundService(); } catch (e) { }
    await fetchUsdtRate();

    const BATCH_SIZE = 2; // scan 2 koin paralel sekaligus
    while (!scanAbort) {
        _scanRound++;
        for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
            if (scanAbort) break;
            const batch = tokens.slice(i, Math.min(i + BATCH_SIZE, tokens.length));
            const pct = Math.round(Math.min(i + BATCH_SIZE, tokens.length) / tokens.length * 100);
            $('#scanBar').css('width', pct + '%');
            $('#btnScanCount').text(`[ ${Math.min(i + BATCH_SIZE, tokens.length)}/${tokens.length}] KOIN`);
            await fetchUsdtRate();
            await Promise.all(batch.map(tok => scanToken(tok)));
            if (!scanAbort) await new Promise(r => setTimeout(r, CFG.interval));
        }
        if (!scanAbort) {
            // Jeda 10 detik dulu — tabel & sinyal masih tampil agar bisa dilihat
            $('#scanBar').css('width', '0%');
            showToast(`✅ Ronde ${_scanRound} selesai — jeda 10 detik...`, 9500);
            playCompleteSound();
            await new Promise(r => setTimeout(r, 10000));
            // Baru kosongkan tabel & notif sinyal, lalu mulai ronde berikutnya
            if (!scanAbort) {
                resetMonitorCells();
                document.querySelectorAll('.signal-chip').forEach(c => c.remove());
                updateNoSignalNotice();
            }
        }
    }
    stopScan();
}
function stopScan() {
    scanning = false; scanAbort = true;  // keep true so orphaned loop exits
    $('#btnScanIcon').text('▶'); $('#btnScanLbl').text('START'); $('#btnScan').removeClass('stop');
    updateScanCount();
    updateNoSignalNotice();
    $('#scanBadge').removeClass('active');
    $('#scanBar').css('width', '0%');
    unlockTabs();
    showToast('■ Scanning dihentikan');
    // Stop Android Foreground Service
    try { if (window.AndroidBridge && AndroidBridge.stopBackgroundService) AndroidBridge.stopBackgroundService(); } catch (e) { }
}
$('#btnScan').on('click', () => {
    if (scanning) { scanAbort = true; stopScan(); }
    else { runScan(); }
});

// ─── Settings Binding ─────────────────────────
$('#btnSaveSettings').on('click', saveSettings);

// ─── Reload with Toast ───────────────────────
function reloadWithToast() {
    sessionStorage.setItem('justReloaded', '1');
    location.reload();
}

// ─── Sort & Search Handlers ──────────────────
// Scanner sort
$('#monSortBar').on('click', '.sort-btn', function () {
    monitorSort = $(this).data('sort');
    $('#monSortBar .sort-btn').removeClass('active');
    $(this).addClass('active');
    if (!scanning) buildMonitorRows();
});

// Koin sort
$('#tokSortAZ, #tokSortZA').on('click', function () {
    tokenSort = $(this).data('sort');
    $('#tokSortAZ, #tokSortZA').removeClass('active');
    $(this).addClass('active');
    renderTokenList();
});

// Koin search
$('#tokenSearch').on('input', function () {
    tokenSearchQuery = $(this).val().trim();
    renderTokenList();
});

// ─── Init ────────────────────────────────────
$(function () {
    loadSettings();
    renderCexChips('indodax');
    renderChainChips('bsc');
    renderTokenList();   // also builds monitor skeleton via buildMonitorRows()
    checkOnboarding();
    // Toast after reload
    if (sessionStorage.getItem('justReloaded')) {
        sessionStorage.removeItem('justReloaded');
        showToast('Reload berhasil!');
    }
});
