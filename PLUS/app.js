/* ═══════════════════════════════════════════════
   CEXDEX-COMPARE — app.js
   Full application logic (jQuery 3.7 + Native JS)
═══════════════════════════════════════════════ */

// ─── LocalStorage Keys ───────────────────────
const LS_TOKENS = 'cexdex_tokens';
const LS_SETTINGS = 'cexdex_settings';

// ─── Runtime State ───────────────────────────
let CFG = {
    username: '',
    wallet: '',
    minPnl: APP_DEV_CONFIG.defaultMinPnl,
    interval: APP_DEV_CONFIG.defaultInterval,
    sseTimeout: APP_DEV_CONFIG.defaultSseTimeout,
    quoteCount: 3,
};
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
const fmt = (v, d = 5) => (+v).toFixed(d);
const fmtPnl = (v) => (v >= 0 ? '+' : '') + (+v).toFixed(2);

// Compact format: 0.0007950 → "0.{3}7950", 0.085 → "0.0850", 1.23 → "1.23"
function fmtCompact(v, sigfigs = 4) {
    if (!isFinite(v) || isNaN(v) || v === 0) return '0';
    const abs = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    if (abs >= 1)    return sign + abs.toFixed(2);
    if (abs >= 0.01) return sign + abs.toFixed(4);
    const str  = abs.toFixed(20);
    const dec  = str.split('.')[1] || '';
    const zeros = dec.match(/^0*/)[0].length;
    const sig   = dec.slice(zeros, zeros + sigfigs);
    return `${sign}0.{${zeros}}${sig}`;
}

// ─── Settings ────────────────────────────────
function loadSettings() {
    try { const s = JSON.parse(localStorage.getItem(LS_SETTINGS)); if (s) Object.assign(CFG, s); } catch { }
    $('#setUsername').val(CFG.username);
    $('#setWallet').val(CFG.wallet);
    $('#setMinPnl').val(CFG.minPnl);
    $('#setInterval').val(CFG.interval);
    $('#setQuote').val(CFG.quoteCount);
    $('#topUsername').text('@' + (CFG.username || '-'));
}
function saveSettings() {
    CFG.username = $('#setUsername').val().trim();
    CFG.wallet = $('#setWallet').val().trim();
    CFG.minPnl = parseFloat($('#setMinPnl').val()) || 1;
    CFG.interval = parseInt($('#setInterval').val()) || 700;
    CFG.quoteCount = Math.min(5, Math.max(1, parseInt($('#setQuote').val()) || 3));
    localStorage.setItem(LS_SETTINGS, JSON.stringify(CFG));
    $('#topUsername').text('@' + (CFG.username || '-'));
    $('#saveOk').show(); setTimeout(() => $('#saveOk').hide(), 2000);
}

// ─── Onboarding ──────────────────────────────
function checkOnboarding() {
    if (!CFG.username || !CFG.wallet) openOnboarding();
}
function openOnboarding() {
    $('#obUsername').val(CFG.username); $('#obWallet').val(CFG.wallet);
    $('#obQuote').val(CFG.quoteCount);
    $('#onboardOverlay').addClass('open');
}
$('#btnOnboard').on('click', () => {
    const u = $('#obUsername').val().trim();
    const w = $('#obWallet').val().trim();
    if (!u || !w) { alert('Username dan Wallet wajib diisi!'); return; }
    CFG.username = u; CFG.wallet = w;
    CFG.quoteCount = Math.min(5, Math.max(1, parseInt($('#obQuote').val()) || 3));
    localStorage.setItem(LS_SETTINGS, JSON.stringify(CFG));
    $('#topUsername').text('@' + u);
    loadSettings();
    $('#onboardOverlay').removeClass('open');
});

// ─── Tab Lock / Unlock ────────────────────────
function lockTabs() {
    $('#navToken, #navSettings').addClass('disabled');
    $('.top-tab-btn[data-tab="tabToken"], .top-tab-btn[data-tab="tabSettings"]').addClass('disabled');
}
function unlockTabs() {
    $('#navToken, #navSettings').removeClass('disabled');
    $('.top-tab-btn[data-tab="tabToken"], .top-tab-btn[data-tab="tabSettings"]').removeClass('disabled');
}

// ─── Bottom Navigation ───────────────────────
function switchTab(tabId) {
    if (!tabId) return;
    if (scanning && tabId !== 'tabMonitor') return; // locked during scan
    $('.nav-item').removeClass('active');
    $(`.nav-item[data-tab="${tabId}"]`).addClass('active');
    $('.top-tab-btn').removeClass('active');
    $(`.top-tab-btn[data-tab="${tabId}"]`).addClass('active');
    // Show scan FAB only on monitor tab
    $('#btnScan').css('display', tabId === 'tabMonitor' ? 'flex' : 'none');
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
}
$('#sheetOverlay, #btnSheetCancel').on('click', closeSheet);
$('#fabAdd').on('click', () => openSheet());

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
    renderCexChips('indodax'); renderChainChips('bsc');
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
    const symbolToken = $('#fSymbolToken').val().trim();
    const scToken = $('#fScToken').val().trim();
    const decToken = parseInt($('#fDecToken').val()) || 18;
    const tickerPair = $('#fTickerPair').val().trim().toUpperCase() || ticker;
    const symbolPair = $('#fSymbolPair').val().trim();
    const scPair = $('#fScPair').val().trim();
    const decPair = parseInt($('#fDecPair').val()) || 18;
    const chain = selectedChain();
    const modalCtD = parseFloat($('#fModalCtD').val()) || 100;
    const modalDtC = parseFloat($('#fModalDtC').val()) || 80;
    const minPnl   = parseFloat($('#fMinPnl').val());

    if (!ticker || !scToken) { alert('Ticker dan SC Token wajib diisi!'); return; }
    if (!symbolToken && !isUsdtNoSymbol(cex, ticker)) { alert('Symbol CEX Token wajib diisi!'); return; }

    const tokens = getTokens();
    const id = $('#editId').val() || genId();
    // Preserve existing status when editing; default true for new tokens
    const existing = tokens.find(x => x.id === id);
    const status = existing ? existing.status : true;
    const tok = {
        id, ticker, cex, symbolToken, scToken, decToken,
        tickerPair, symbolPair, scPair, decPair,
        chain, modalCtD, modalDtC, status,
        minPnl: isFinite(minPnl) ? minPnl : null,   // null = use global setting
    };
    const idx = tokens.findIndex(x => x.id === id);
    if (idx >= 0) tokens[idx] = tok; else tokens.push(tok);
    saveTokens(tokens);
    renderTokenList();
    closeSheet();
});

// ─── Token List ──────────────────────────────
function renderTokenList() {
    const tokens = getTokens();
    $('#tokenCount').text(tokens.length + ' token');
    if (!tokens.length) {
        $('#tokenList').html('<div class="token-list-empty">Belum ada token. Ketuk + untuk menambah.</div>');
    } else {
        $('#tokenList').html(tokens.map(t => {
            const cexCfg = CONFIG_CEX[t.cex] || {};
            const chainCfg = CONFIG_CHAINS[t.chain] || {};
            const tri = t.tickerPair && t.tickerPair !== t.ticker ? '↔️' : '→';
            return `
    <div class="token-list-item" id="li-${t.id}">
      <div class="token-list-badges">
        <span class="badge-cex" style="background:${cexCfg.WARNA || '#555'}">
          <img src="icons/cex/${t.cex}.png" class="badge-icon" onerror="this.style.display='none'">${cexCfg.label || t.cex}
        </span>
        <span class="badge-chain" style="background:${chainCfg.WARNA || '#555'}">
          <img src="icons/chains/${t.chain}.png" class="badge-icon" onerror="this.style.display='none'">${chainCfg.label || t.chain}
        </span>
      </div>
      <div class="token-list-info">
        <div class="token-list-sym">${t.ticker} ${tri} ${t.tickerPair || t.ticker}</div>
        <div class="token-list-sub">${t.symbolToken} | $${t.modalCtD}/$${t.modalDtC}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div class="status-dot ${t.status ? 'on' : ''}" onclick="toggleToken('${t.id}')" style="cursor:pointer"></div>
        <div class="token-list-actions">
          <button class="btn-icon" onclick="openSheet('${t.id}')">✏️</button>
          <button class="btn-icon danger" onclick="deleteToken('${t.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
        }).join(''));
    }
    // Rebuild monitor skeleton whenever token list changes — skip during active scan
    if (!scanning) buildMonitorRows();
}

function toggleToken(id) {
    const tokens = getTokens();
    const t = tokens.find(x => x.id === id);
    if (t) { t.status = !t.status; saveTokens(tokens); renderTokenList(); }
}
function deleteToken(id) {
    if (!confirm('Hapus token ini?')) return;
    saveTokens(getTokens().filter(x => x.id !== id));
    renderTokenList();
}

// ─── CSV Export / Import ─────────────────────
const CSV_COLS = ['ticker', 'cex', 'symbolToken', 'scToken', 'decToken', 'tickerPair', 'symbolPair', 'scPair', 'decPair', 'chain', 'modalCtD', 'modalDtC', 'status'];

$('#btnExport').on('click', () => {
    const tokens = getTokens();
    const rows = [CSV_COLS.join(','), ...tokens.map(t => CSV_COLS.map(c => `"${t[c] ?? ''}"`).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cexdex-tokens.csv'; a.click();
});
$('#btnImportTrigger').on('click', () => $('#importFile').click());
$('#importFile').on('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
        try {
            const lines = ev.target.result.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            const tokens = lines.slice(1).map(line => {
                const vals = line.match(/(".*?"|[^,]+)/g) || [];
                const obj = {};
                headers.forEach((h, i) => { obj[h] = (vals[i] || '').replace(/"/g, '').trim(); });
                obj.decToken = parseInt(obj.decToken) || 18;
                obj.decPair = parseInt(obj.decPair) || 18;
                obj.modalCtD = parseFloat(obj.modalCtD) || 100;
                obj.modalDtC = parseFloat(obj.modalDtC) || 80;
                obj.status = obj.status === 'true';
                obj.id = obj.id || genId();
                return obj;
            });
            saveTokens(tokens); renderTokenList();
            alert(`Import berhasil: ${tokens.length} token`);
        } catch (err) { alert('Error import: ' + err.message); }
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
            bids = (raw.buy  || []).map(b => [b[0] / usdtRate, b[1]]);
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

// ─── MetaMask Bridge SSE ─────────────────────
function fetchDexQuotes(chainId, srcToken, destToken, amountWei) {
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
                if (quotes.length >= CFG.quoteCount) { done = true; clearTimeout(timer); es.close(); resolve(quotes); }
            } catch { }
        });
        es.onerror = () => { if (!done) { done = true; clearTimeout(timer); es.close(); resolve(quotes); } };
    });
}

function parseDexQuote(q) {
    try {
        const dest = q.quote?.destTokenAmount || q.destTokenAmount || '0';
        const dec = q.quote?.destAsset?.decimals || 18;
        const name = (q.quote?.bridgeId || q.bridgeId || 'DEX').toString().toUpperCase();
        return { amount: parseFloat(dest), dec, name };
    } catch { return null; }
}

// ─── PnL Calculator ──────────────────────────
function calcPnl(modal, pairAmt, bidPair, cexKey) {
    const fee = APP_DEV_CONFIG.fees[cexKey] || 0.001;
    const pairValue = pairAmt * bidPair;
    const cexFee1 = modal * fee;
    const cexFee2 = pairValue * fee;
    return { pnl: pairValue - modal - cexFee1 - cexFee2, pairValue, cexFee1, cexFee2, totalFee: cexFee1 + cexFee2 };
}

function getBestPnl(quotes, destDec, bidPrice, modal, cexKey) {
    if (!quotes.length) return -999;
    const pnls = quotes.slice(0, CFG.quoteCount).map(q => {
        const p = parseDexQuote(q);
        if (!p) return -999;
        return calcPnl(modal, fromWei(p.amount + '', p.dec || destDec), bidPrice, cexKey).pnl;
    });
    return Math.max(...pnls);
}

// ─── Scan Engine ─────────────────────────────
async function scanToken(tok) {
    const chainCfg = CONFIG_CHAINS[tok.chain];
    if (!chainCfg) return;
    const card = document.getElementById('card-' + tok.id);
    if (!card) return;

    // 1. Fetch CEX orderbook for TOKEN
    // If symbolToken is empty (TOKEN = USDT), skip API call — price is always $1
    let obToken;
    if (!tok.symbolToken) {
        obToken = { askPrice: 1.0, bidPrice: 1.0, bids: [], asks: [] };
    } else {
        obToken = await fetchOrderbook(tok.cex, tok.symbolToken);
        if (!obToken || obToken.error) { setCardStatus(card, 'CEX err'); return; }
    }

    // 2. Fetch CEX orderbook for PAIR (if triangular)
    // USDT is always $1 — never needs a separate orderbook regardless of symbolPair saved value
    let bidPair = 1, askPair = 1;
    const isTriangular = tok.tickerPair && tok.tickerPair !== tok.ticker && tok.symbolPair
        && tok.tickerPair.toUpperCase() !== 'USDT';
    if (isTriangular) {
        const obPair = await fetchOrderbook(tok.cex, tok.symbolPair);
        if (obPair && !obPair.error) { askPair = obPair.askPrice; bidPair = obPair.bidPrice; }
    }

    // Use known USDT contract + decimals if pair is USDT — overrides any wrong/missing data saved by user
    let pairSc = tok.scPair || '';
    let pairDec = tok.decPair || 18;
    if (tok.tickerPair && tok.tickerPair.toUpperCase() === 'USDT') {
        pairSc  = USDT_SC[tok.chain]  || pairSc;
        pairDec = USDT_DEC[tok.chain] ?? pairDec;
    }
    if (!pairSc || !tok.scToken) { setCardStatus(card, 'SC kosong'); return; }

    // 3. Fetch DEX quotes for both directions in parallel
    const [quotesCtD, quotesDtC] = await Promise.all([
        fetchDexQuotes(chainCfg.Kode_Chain,
            tok.scToken, pairSc,
            toWei(obToken.askPrice > 0 ? tok.modalCtD / obToken.askPrice : 0, tok.decToken)),
        fetchDexQuotes(chainCfg.Kode_Chain,
            pairSc, tok.scToken,
            toWei(isTriangular ? (askPair > 0 ? tok.modalDtC / askPair : 0) : tok.modalDtC, pairDec)),
    ]);

    // 4. CEXtoDEX: sort DESCENDING by PnL → best (highest) DEX leftmost, closest to left label
    const tokMinPnl = tok.minPnl ?? CFG.minPnl; // per-token PnL threshold
    const ctdData = quotesCtD.slice(0, CFG.quoteCount).map(q => {
        const p = parseDexQuote(q);
        if (!p) return null;
        const recv      = fromWei(p.amount + '', p.dec || pairDec);
        const recvUSDT  = recv * bidPair;
        // effPrice: effective USDT returned per TOKEN via DEX (compare vs CEX ask ↑)
        const tokensIn  = obToken.askPrice > 0 ? tok.modalCtD / obToken.askPrice : 0;
        const effPrice  = tokensIn > 0 ? recvUSDT / tokensIn : 0;
        const { pnl, totalFee } = calcPnl(tok.modalCtD, recv, bidPair, tok.cex);
        return { name: p.name, recvUSDT, effPrice, pnl, totalFee };
    }).filter(Boolean).sort((a, b) => b.pnl - a.pnl); // desc: best first

    // DEX error: show in CTD sub-table header if no quotes returned
    const ctdStatus = card.querySelector('.ctd-table .tbl-status');
    if (ctdStatus) ctdStatus.textContent = !ctdData.length ? ' ⚠ DEX no quote' : '';

    // Fill CTD rows: cex (same for all), dex (effPrice), recv, pnl
    ctdData.forEach((r, i) => {
        const hdrEl  = card.querySelector(`[data-ctd-hdr="${i}"]`);
        const cexEl  = card.querySelector(`[data-ctd-cex="${i}"]`);
        const dexEl  = card.querySelector(`[data-ctd-dex="${i}"]`);
        const recvEl = card.querySelector(`[data-ctd-recv="${i}"]`);
        const pnlEl  = card.querySelector(`[data-ctd-pnl="${i}"]`);
        if (hdrEl) hdrEl.textContent = r.name;
        if (cexEl)  { cexEl.textContent = `↑ ${fmtCompact(obToken.askPrice)}$`; cexEl.className = 'mon-dex-cell mc-ask'; }
        if (dexEl)  { dexEl.textContent = `↓ ${fmtCompact(r.effPrice)}$`; dexEl.className = 'mon-dex-cell ' + (r.effPrice >= obToken.askPrice ? 'mc-ask' : 'mc-bid'); }
        if (recvEl) { recvEl.textContent = `-${fmtCompact(r.totalFee)}$`; recvEl.className = 'mon-dex-cell mc-bid'; }
        if (pnlEl)  { const cls = r.pnl >= tokMinPnl ? 'pnl-signal' : r.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'; pnlEl.textContent = `${fmtPnl(r.pnl)}$`; pnlEl.className = `mon-dex-cell mc-pnl ${cls}`; }
    });

    // 5. DEXtoCEX: sort ASCENDING by PnL → best (highest) DEX rightmost, closest to right label
    const dtcData = quotesDtC.slice(0, CFG.quoteCount).map(q => {
        const p = parseDexQuote(q);
        if (!p) return null;
        const recv      = fromWei(p.amount + '', p.dec || tok.decToken);
        const recvUSDT  = recv * obToken.bidPrice;
        // effPrice: effective DEX cost per TOKEN in USDT (compare vs CEX bid ↓)
        const effPrice  = recv > 0 ? tok.modalDtC / recv : 0;
        const { pnl, totalFee } = calcPnl(tok.modalDtC, recv, obToken.bidPrice, tok.cex);
        return { name: p.name, recvUSDT, effPrice, pnl, totalFee };
    }).filter(Boolean).sort((a, b) => a.pnl - b.pnl); // asc: best last (rightmost)

    // DEX error: show in DTC sub-table header if no quotes returned
    const dtcStatus = card.querySelector('.dtc-table .tbl-status');
    if (dtcStatus) dtcStatus.textContent = !dtcData.length ? ' ⚠ DEX no quote' : '';

    // Fill DTC rows: cex bid (same for all), dex cost, recv, pnl
    dtcData.forEach((r, i) => {
        const hdrEl  = card.querySelector(`[data-dtc-hdr="${i}"]`);
        const cexEl  = card.querySelector(`[data-dtc-cex="${i}"]`);
        const dexEl  = card.querySelector(`[data-dtc-dex="${i}"]`);
        const recvEl = card.querySelector(`[data-dtc-recv="${i}"]`);
        const pnlEl  = card.querySelector(`[data-dtc-pnl="${i}"]`);
        if (hdrEl) hdrEl.textContent = r.name;
        if (cexEl)  { cexEl.textContent = `↑ ${fmtCompact(obToken.bidPrice)}$`; cexEl.className = 'mon-dex-cell mc-ask'; }
        // DTC: DEX cost ↓ is green when cheaper than CEX bid (profitable)
        if (dexEl)  { dexEl.textContent = `↓ ${fmtCompact(r.effPrice)}$`; dexEl.className = 'mon-dex-cell ' + (r.effPrice <= obToken.bidPrice ? 'mc-ask' : 'mc-bid'); }
        if (recvEl) { recvEl.textContent = `-${fmtCompact(r.totalFee)}$`; recvEl.className = 'mon-dex-cell mc-bid'; }
        if (pnlEl)  { const cls = r.pnl >= tokMinPnl ? 'pnl-signal' : r.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'; pnlEl.textContent = `${fmtPnl(r.pnl)}$`; pnlEl.className = `mon-dex-cell mc-pnl ${cls}`; }
    });

    // 6. Signal chip & card highlight
    const bestCtD = getBestPnl(quotesCtD, pairDec, bidPair, tok.modalCtD, tok.cex);
    const bestDtC = getBestPnl(quotesDtC, tok.decToken, obToken.bidPrice, tok.modalDtC, tok.cex);
    const best = Math.max(bestCtD, bestDtC);
    updateSignalChip(tok, best);
    if (best >= tokMinPnl) {
        card.classList.add('has-signal');
        sendTelegram(tok, best);
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
    const tokens = getTokens().filter(t => t.status);
    if (!tokens.length) {
        $('#monitorList').html('<div class="token-list-empty">Tidak ada token aktif. Aktifkan di tab TOKEN.</div>');
        return;
    }
    const n = CFG.quoteCount;
    const dexHdr = (pfx, color) => Array.from({ length: n }, (_, i) =>
        `<td class="mon-dex-hdr" data-${pfx}-hdr="${i}" style="background:${color}">-</td>`
    ).join('');
    const dexRow = (pfx, attr) => Array.from({ length: n }, (_, i) =>
        `<td class="mon-dex-cell" data-${pfx}-${attr}="${i}">-</td>`
    ).join('');

    $('#monitorList').html(tokens.map(t => {
        const cc = CONFIG_CEX[t.cex] || {};
        const ch = CONFIG_CHAINS[t.chain] || {};
        const cexColor   = cc.WARNA || '#555';
        const cexLabel   = cc.label || t.cex;
        const chainLabel = ch.label || t.chain;
        const tri  = t.tickerPair && t.tickerPair !== t.ticker;
        const sym  = t.ticker + (tri ? '↔' + t.tickerPair : '');
        const pairTk = t.tickerPair || t.ticker;
        return `<div class="mon-card" id="card-${t.id}" style="border-left:3px solid ${cexColor}">
  <div class="mon-card-hdr" style="background:linear-gradient(90deg,${cexColor}22 0%,var(--surface) 100%)">
    <img src="icons/cex/${t.cex}.png" class="mon-hdr-icon" onerror="this.style.display='none'">
    <img src="icons/chains/${t.chain}.png" class="mon-hdr-icon" onerror="this.style.display='none'">
    <span class="mon-cex-chain">${cexLabel.toUpperCase()}-${chainLabel.toUpperCase()}</span>
    <span class="mon-sym">${sym}</span>
    <span class="card-status"></span>
  </div>
  <div class="mon-tables-wrap">
  <table class="mon-sub-table ctd-table">
    <thead><tr class="mon-sub-hdr">
      <td class="mon-lbl-hdr" style="background:${MON_CTD_COLOR}">${cexLabel}<span class="tbl-status"></span></td>
      ${dexHdr('ctd', MON_CTD_COLOR)}
    </tr></thead>
    <tbody>
      <tr class="mon-row-cex"><td class="mon-lbl-side">BELI CEX ↑</td>${dexRow('ctd','cex')}</tr>
      <tr class="mon-row-dex"><td class="mon-lbl-side lbl-pair">${t.ticker}→${pairTk}</td>${dexRow('ctd','dex')}</tr>
      <tr class="mon-row-recv"><td class="mon-lbl-side">Fee {Trade+Swap}</td>${dexRow('ctd','recv')}</tr>
      <tr class="mon-row-pnl"><td class="mon-lbl-side">💰 PNL</td>${dexRow('ctd','pnl')}</tr>
    </tbody>
  </table>
  <table class="mon-sub-table dtc-table">
    <thead><tr class="mon-sub-hdr">
      <td class="mon-lbl-hdr" style="background:${MON_DTC_COLOR}">${cexLabel}<span class="tbl-status"></span></td>
      ${dexHdr('dtc', MON_DTC_COLOR)}
    </tr></thead>
    <tbody>
      <tr class="mon-row-cex"><td class="mon-lbl-side">JUAL CEX ↑</td>${dexRow('dtc','cex')}</tr>
      <tr class="mon-row-dex"><td class="mon-lbl-side lbl-pair">${pairTk}→${t.ticker}</td>${dexRow('dtc','dex')}</tr>
      <tr class="mon-row-recv"><td class="mon-lbl-side">Fee {Trade+Swap}</td>${dexRow('dtc','recv')}</tr>
      <tr class="mon-row-pnl"><td class="mon-lbl-side">💰 PNL</td>${dexRow('dtc','pnl')}</tr>
    </tbody>
  </table>
  </div>
</div>`;
    }).join(''));
}

// ─── Signal Chips ─────────────────────────────
function updateSignalChip(tok, pnl) {
    const chipId = 'chip-' + tok.id;
    let chip = document.getElementById(chipId);
    if (pnl >= CFG.minPnl) {
        if (!chip) {
            chip = document.createElement('span');
            chip.className = 'signal-chip';
            chip.id = chipId;
            chip.onclick = () => {
                const card = document.getElementById('card-' + tok.id);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            document.getElementById('signalBar').appendChild(chip);
        }
        chip.textContent = `🟢 ${tok.ticker} ${fmtPnl(pnl)}$`;
        chip.className = 'signal-chip' + (pnl < 0 ? ' loss' : '');
    } else if (chip) {
        chip.remove();
    }
}

// ─── Telegram ────────────────────────────────
async function sendTelegram(tok, pnl) {
    if (!APP_DEV_CONFIG.telegramBotToken.includes('BOT')) return;
    const now = Date.now();
    const last = tgCooldown.get(tok.id) || 0;
    if (now - last < APP_DEV_CONFIG.telegramCooldown * 60000) return;
    tgCooldown.set(tok.id, now);
    const msg = `⚡ CEXDEX | @${CFG.username || 'user'}\n🟢 SIGNAL\nToken: ${tok.ticker}↔${tok.tickerPair} [${(CONFIG_CHAINS[tok.chain]?.label || tok.chain)}]\nCEX: ${CONFIG_CEX[tok.cex]?.label || tok.cex}\nPnL: ${fmtPnl(pnl)}$ | Modal: $${tok.modalCtD}/$${tok.modalDtC}`;
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

// ─── Scan Loop ───────────────────────────────
let _scanRound = 0;
async function runScan() {
    if (scanning) return;
    scanning = true; scanAbort = false;
    $('#btnScanIcon').text('■'); $('#btnScanLbl').text('STOP'); $('#btnScan').addClass('stop');
    $('#scanBadge').addClass('active');
    // Clear previous signal chips and reset table
    document.querySelectorAll('.signal-chip').forEach(c => c.remove());
    lockTabs();
    const tokens = getTokens().filter(t => t.status);
    if (!tokens.length) { showToast('Tidak ada token aktif!'); stopScan(); return; }
    showToast('▶ Scanning dimulai…');
    await fetchUsdtRate();

    while (!scanAbort) {
        _scanRound++;
        for (let i = 0; i < tokens.length; i++) {
            if (scanAbort) break;
            const pct = Math.round((i + 1) / tokens.length * 100);
            $('#scanBar').css('width', pct + '%');
            await fetchUsdtRate();
            await scanToken(tokens[i]);
            if (!scanAbort) await new Promise(r => setTimeout(r, CFG.interval));
        }
        if (!scanAbort) await new Promise(r => setTimeout(r, 500));
    }
    stopScan();
}
function stopScan() {
    scanning = false; scanAbort = false;
    $('#btnScanIcon').text('▶'); $('#btnScanLbl').text('START'); $('#btnScan').removeClass('stop');
    $('#scanBadge').removeClass('active');
    $('#scanBar').css('width', '0%');
    unlockTabs();
    showToast('■ Scanning dihentikan');
}
$('#btnScan').on('click', () => {
    if (scanning) { scanAbort = true; }
    else { runScan(); }
});

// ─── Settings Binding ─────────────────────────
$('#btnSaveSettings').on('click', saveSettings);

// ─── Reload with Toast ───────────────────────
function reloadWithToast() {
    sessionStorage.setItem('justReloaded', '1');
    location.reload();
}

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
