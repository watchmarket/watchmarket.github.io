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

// ─── Auto Level Calculation ──────────────────
// Hitung weighted avg price & actual modal dari orderbook depth
function calculateAutoVolume(orderbook, maxModal, levels, side) {
    try {
        const book = (orderbook[side] || []).slice(0, Math.min(levels, 4));
        if (!book.length) return null;
        let totalUSDT = 0, totalCoins = 0, lastPrice = 0, levelsUsed = 0;
        for (let i = 0; i < book.length; i++) {
            const price = parseFloat(book[i][0]), amount = parseFloat(book[i][1]);
            if (!price || !amount) continue;
            const volUSDT = price * amount;
            lastPrice = price;
            levelsUsed = i + 1;
            if (totalUSDT + volUSDT >= maxModal) {
                const remaining = maxModal - totalUSDT;
                totalCoins += remaining / price;
                totalUSDT = maxModal;
                break;
            }
            totalUSDT += volUSDT;
            totalCoins += amount;
        }
        if (totalCoins <= 0 || totalUSDT <= 0) return null;
        return { actualModal: totalUSDT, avgPrice: totalUSDT / totalCoins, lastLevelPrice: lastPrice, levelsUsed };
    } catch { return null; }
}

async function scanToken(tok) {
    const chainCfg = CONFIG_CHAINS[tok.chain];
    if (!chainCfg) return;
    const els = _cardEls.get(tok.id);
    const card = els?.card || document.getElementById('card-' + tok.id);
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
    // Cache orderbook for tooltip
    _obCache[tok.id] = { bids: obToken.bids || [], asks: obToken.asks || [], bidPrice: obToken.bidPrice, askPrice: obToken.askPrice };

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

    // 3. Auto Level: hitung weighted avg price & actual modal dari orderbook depth
    let alCtD = null, alDtC = null;
    if (CFG.autoLevel && obToken.asks.length && obToken.bids.length) {
        alCtD = calculateAutoVolume(obToken, tok.modalCtD, CFG.levelCount, 'asks');
        alDtC = calculateAutoVolume(obToken, tok.modalDtC, CFG.levelCount, 'bids');
    }
    const modalCtD   = alCtD ? alCtD.actualModal   : tok.modalCtD;
    const askCtD     = alCtD ? alCtD.avgPrice      : obToken.askPrice;
    const modalDtC   = alDtC ? alDtC.actualModal   : tok.modalDtC;
    const bidDtC     = alDtC ? alDtC.avgPrice      : obToken.bidPrice;
    // harga level terakhir (LX) sesuai kecukupan modal; fallback L1 jika auto level OFF
    const dispAskCtD = alCtD ? alCtD.lastLevelPrice : obToken.askPrice;
    const dispBidDtC = alDtC ? alDtC.lastLevelPrice : obToken.bidPrice;

    // Simpan dispAsk/dispBid ke cache agar tooltip bisa akses harga LX yang sama
    _obCache[tok.id].dispAsk = dispAskCtD;
    _obCache[tok.id].dispBid = dispBidDtC;

    // 4. Fetch DEX quotes from BOTH aggregators in parallel
    const weiCtD = toWei(askCtD > 0 ? modalCtD / askCtD : 0, tok.decToken);
    const weiDtC = toWei(isTriangular ? (askPair > 0 ? modalDtC / askPair : 0) : modalDtC, pairDec);

    // Update header modal: tampilkan actualModal + status jika Auto Level aktif
    const ctdHdr = els?.modalCtdHdr;
    const dtcHdr = els?.modalDtcHdr;
    if (CFG.autoLevel) {
        if (ctdHdr) {
            const full = !alCtD || alCtD.actualModal >= tok.modalCtD * 0.99;
            const amt  = alCtD ? alCtD.actualModal.toFixed(2) : tok.modalCtD;
            ctdHdr.innerHTML = `$${amt} <span class="al-badge ${full ? 'al-ok' : 'al-warn'}">${full ? '✅' : '⚠️'}</span><span class="tbl-status"></span>`;
        }
        if (dtcHdr) {
            const full = !alDtC || alDtC.actualModal >= tok.modalDtC * 0.99;
            const amt  = alDtC ? alDtC.actualModal.toFixed(2) : tok.modalDtC;
            dtcHdr.innerHTML = `$${amt} <span class="al-badge ${full ? 'al-ok' : 'al-warn'}">${full ? '✅' : '⚠️'}</span><span class="tbl-status"></span>`;
        }
    } else {
        if (ctdHdr) ctdHdr.innerHTML = `$${tok.modalCtD}<span class="tbl-status"></span>`;
        if (dtcHdr) dtcHdr.innerHTML = `$${tok.modalDtC}<span class="tbl-status"></span>`;
    }

    const diagCtD = diagnoseWei(weiCtD);
    const diagDtC = diagnoseWei(weiDtC);
    const chainId = chainCfg.Kode_Chain;
    const [mxCtD, mxDtC, jxCtD, jxDtC, kbCtD, kbDtC, okCtD, okDtC] = await Promise.all([
        fetchDexQuotesMetax(chainId, tok.scToken, pairSc, weiCtD),
        fetchDexQuotesMetax(chainId, pairSc, tok.scToken, weiDtC),
        fetchDexQuotesJumpx(chainId, tok.scToken, pairSc, weiCtD),
        fetchDexQuotesJumpx(chainId, pairSc, tok.scToken, weiDtC),
        fetchDexQuotesKyber(tok.chain, tok.scToken, pairSc, weiCtD, pairDec),
        fetchDexQuotesKyber(tok.chain, pairSc, tok.scToken, weiDtC, tok.decToken, pairDec, 'dtc'),
        fetchDexQuotesOkx(chainId, tok.scToken, pairSc, weiCtD, pairDec),
        fetchDexQuotesOkx(chainId, pairSc, tok.scToken, weiDtC, tok.decToken),
    ]);

    // helper: build list of {name, error} for empty columns
    function buildMissingLabels(allData, mxRaw, jxRaw, kbRaw, okRaw) {
        const labels = [];
        const mtIn = allData.filter(r => r.src === 'MX').length;
        const jxIn = allData.filter(r => r.src === 'JX').length;
        const kbIn = allData.some(r => r.src === 'KB');
        const okIn = allData.some(r => r.src === 'OX');
        for (let i = mtIn; i < CFG.quoteCountMetax; i++)
            labels.push({ name: 'METAX', error: mxRaw.length === 0 ? 'TIMEOUT' : 'NO ROUTE' });
        for (let i = jxIn; i < CFG.quoteCountJumpx; i++)
            labels.push({ name: 'JUMPER', error: jxRaw.length === 0 ? 'TIMEOUT' : 'NO ROUTE' });
        if (isKyberEnabled() && !kbIn)
            labels.push({ name: 'KYBER', error: kbRaw.length === 0 ? 'NO QUOTE' : 'NO ROUTE' });
        if (isOkxEnabled() && !okIn)
            labels.push({ name: 'OKX', error: okRaw.length === 0 ? 'NO QUOTE' : 'NO ROUTE' });
        return labels;
    }

    // 5. Combine & sort CTD quotes (METAX + JUMPX + KYBER + OKX) by PnL descending
    const tokMinPnl = (isFinite(tok.minPnl) && tok.minPnl !== null) ? tok.minPnl : 1;
    const allCtD = [];
    mxCtD.forEach(q => { const p = parseDexQuoteMetax(q); if (p) allCtD.push(computeQuotePnl(p, pairDec, bidPair, modalCtD, tok.cex, askCtD, 'ctd')); });
    jxCtD.forEach(q => { const p = parseDexQuoteJumpx(q); if (p) allCtD.push(computeQuotePnl(p, pairDec, bidPair, modalCtD, tok.cex, askCtD, 'ctd')); });
    kbCtD.forEach(q => { if (q) allCtD.push(computeQuotePnl(q, pairDec, bidPair, modalCtD, tok.cex, askCtD, 'ctd')); });
    okCtD.forEach(q => { if (q) allCtD.push(computeQuotePnl(q, pairDec, bidPair, modalCtD, tok.cex, askCtD, 'ctd')); });
    allCtD.sort((a, b) => b.pnl - a.pnl); // best first
    const ctdData = allCtD.slice(0, n);
    const missingCtdLabels = buildMissingLabels(allCtD, mxCtD, jxCtD, kbCtD, okCtD);

    // 6. Combine & sort DTC quotes by PnL descending (best first)
    const allDtC = [];
    mxDtC.forEach(q => { const p = parseDexQuoteMetax(q); if (p) allDtC.push(computeQuotePnl(p, tok.decToken, bidDtC, modalDtC, tok.cex, askCtD, 'dtc')); });
    jxDtC.forEach(q => { const p = parseDexQuoteJumpx(q); if (p) allDtC.push(computeQuotePnl(p, tok.decToken, bidDtC, modalDtC, tok.cex, askCtD, 'dtc')); });
    kbDtC.forEach(q => { if (q) allDtC.push(computeQuotePnl(q, tok.decToken, bidDtC, modalDtC, tok.cex, askCtD, 'dtc')); });
    okDtC.forEach(q => { if (q) allDtC.push(computeQuotePnl(q, tok.decToken, bidDtC, modalDtC, tok.cex, askCtD, 'dtc')); });
    allDtC.sort((a, b) => b.pnl - a.pnl); // best first
    const dtcData = allDtC.slice(0, n);
    const missingDtcLabels = buildMissingLabels(allDtC, mxDtC, jxDtC, kbDtC, okDtC);

    // 6. Fill CTD table
    const ctdStatus = els?.ctdStatus;
    if (ctdStatus) ctdStatus.textContent = '';
    for (let i = 0; i < n; i++) {
        const cexEl = els?.ctdCex[i];
        if (cexEl) { cexEl.textContent = `↑ ${fmtCompact(dispAskCtD)}$`; cexEl.className = 'mon-dex-cell mc-ask'; }
    }
    if (!ctdData.length) {
        const reason = diagCtD || 'TIDAK ADA LP / DEX';
        const hdrEl0 = els?.ctdHdr[0];
        if (hdrEl0) { hdrEl0.textContent = reason; hdrEl0.className = 'mon-dex-hdr mon-dex-hdr-err'; }
        for (let i = 1; i < n; i++) { const h = els?.ctdHdr[i]; if (h) { h.textContent = '—'; h.className = 'mon-dex-hdr'; } }
        const hint = diagCtD === 'MODAL BESAR' ? '↓ Kecilkan Modal' : diagCtD === 'AMOUNT NOL' ? '↓ Cek Harga CEX' : '↓ KOIN TIDAK ADA DI DEX / LP';
        const dexEl0 = els?.ctdDex[0];
        if (dexEl0) { dexEl0.textContent = hint; dexEl0.className = 'mon-dex-cell mc-err'; }
        for (let i = 1; i < n; i++) { const d = els?.ctdDex[i]; if (d) { d.textContent = '—'; d.className = 'mon-dex-cell mc-muted'; } }
    } else {
        ctdData.forEach((r, i) => {
            const hdrEl = els?.ctdHdr[i];
            const cexEl = els?.ctdCex[i];
            const dexEl = els?.ctdDex[i];
            const feeEl = els?.ctdFee[i];
            const pnlEl = els?.ctdPnl[i];
            const isSignal = r.pnl >= tokMinPnl;
            const sigCls = isSignal ? ' col-signal' : '';
            const srcTag = r.src === 'MX' ? '<span class="src-tag mx">MT</span>' : r.src === 'JX' ? '<span class="src-tag jx">JM</span>' : '';
            if (hdrEl) { hdrEl.innerHTML = (srcTag ? srcTag + ' ' : '') + r.name; hdrEl.className = 'mon-dex-hdr'; hdrEl.dataset.effprice = r.effPrice; }
            if (cexEl) { cexEl.textContent = `↑ ${fmtCompact(dispAskCtD)}$`; cexEl.className = 'mon-dex-cell mc-ask' + sigCls; }
            if (dexEl) { dexEl.textContent = `↓ ${fmtCompact(r.effPrice)}$`; dexEl.className = 'mon-dex-cell mc-bid' + sigCls; }
            if (feeEl) { feeEl.textContent = `-${r.totalFee.toFixed(2)}$`; feeEl.className = 'mon-dex-cell mc-recv' + sigCls; }
            if (pnlEl) { const cls = r.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'; pnlEl.textContent = `${fmtPnl(r.pnl)}$`; pnlEl.className = `mon-dex-cell mc-pnl ${cls}` + sigCls; }
        });
        // Fill remaining empty columns with DEX name + error info
        for (let i = ctdData.length; i < n; i++) {
            const lbl = missingCtdLabels[i - ctdData.length];
            const h = els?.ctdHdr[i];
            const c = els?.ctdCex[i];
            const d = els?.ctdDex[i];
            const f = els?.ctdFee[i];
            const p = els?.ctdPnl[i];
            if (h) { h.textContent = lbl ? lbl.name : '—'; h.className = lbl ? 'mon-dex-hdr mon-dex-hdr-muted' : 'mon-dex-hdr'; }
            if (c) { c.textContent = '-'; c.className = 'mon-dex-cell mc-muted'; }
            if (d) { d.textContent = lbl ? lbl.error : '-'; d.className = lbl ? 'mon-dex-cell mc-err-sm' : 'mon-dex-cell mc-muted'; }
            if (f) { f.textContent = '-'; f.className = 'mon-dex-cell mc-muted'; }
            if (p) { p.textContent = '-'; p.className = 'mon-dex-cell mc-muted'; }
        }
    }

    // 7. Fill DTC table
    const dtcStatus = els?.dtcStatus;
    if (dtcStatus) dtcStatus.textContent = '';
    for (let i = 0; i < n; i++) {
        const cexEl = els?.dtcCex[i];
        if (cexEl) { cexEl.textContent = `↓ ${fmtCompact(dispBidDtC)}$`; cexEl.className = 'mon-dex-cell mc-bid'; }
    }
    if (!dtcData.length) {
        const reason = diagDtC || '';
        const hdrEl0 = els?.dtcHdr[0];
        if (hdrEl0) { hdrEl0.textContent = reason; hdrEl0.className = 'mon-dex-hdr mon-dex-hdr-err'; }
        for (let i = 1; i < n; i++) { const h = els?.dtcHdr[i]; if (h) { h.textContent = '—'; h.className = 'mon-dex-hdr'; } }
        const hint = diagDtC === 'MODAL BESAR' ? '↓ Kecilkan Modal' : diagDtC === 'AMOUNT NOL' ? '↓ Cek Harga CEX' : '↓ KOIN TIDAK ADA DI DEX / LP';
        const dexEl0 = els?.dtcDex[0];
        if (dexEl0) { dexEl0.textContent = hint; dexEl0.className = 'mon-dex-cell mc-err'; }
        for (let i = 1; i < n; i++) { const d = els?.dtcDex[i]; if (d) { d.textContent = '—'; d.className = 'mon-dex-cell mc-muted'; } }
    } else {
        dtcData.forEach((r, i) => {
            const hdrEl = els?.dtcHdr[i];
            const cexEl = els?.dtcCex[i];
            const dexEl = els?.dtcDex[i];
            const feeEl = els?.dtcFee[i];
            const pnlEl = els?.dtcPnl[i];
            const isSignal = r.pnl >= tokMinPnl;
            const sigCls = isSignal ? ' col-signal' : '';
            const srcTag = r.src === 'MX' ? '<span class="src-tag mx">MT</span>' : r.src === 'JX' ? '<span class="src-tag jx">JM</span>' : '';
            if (hdrEl) { hdrEl.innerHTML = (srcTag ? srcTag + ' ' : '') + r.name; hdrEl.className = 'mon-dex-hdr'; hdrEl.dataset.effprice = r.effPrice; }
            if (cexEl) { cexEl.textContent = `↓ ${fmtCompact(dispBidDtC)}$`; cexEl.className = 'mon-dex-cell mc-bid' + sigCls; }
            if (dexEl) { dexEl.textContent = `↑ ${fmtCompact(r.effPrice)}$`; dexEl.className = 'mon-dex-cell mc-ask' + sigCls; }
            if (feeEl) { feeEl.textContent = `-${r.totalFee.toFixed(2)}$`; feeEl.className = 'mon-dex-cell mc-recv' + sigCls; }
            if (pnlEl) { const cls = r.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'; pnlEl.textContent = `${fmtPnl(r.pnl)}$`; pnlEl.className = `mon-dex-cell mc-pnl ${cls}` + sigCls; }
        });
        // Fill remaining empty columns with DEX name + error info
        for (let i = dtcData.length; i < n; i++) {
            const lbl = missingDtcLabels[i - dtcData.length];
            const h = els?.dtcHdr[i];
            const c = els?.dtcCex[i];
            const d = els?.dtcDex[i];
            const f = els?.dtcFee[i];
            const p = els?.dtcPnl[i];
            if (h) { h.textContent = lbl ? lbl.name : '—'; h.className = lbl ? 'mon-dex-hdr mon-dex-hdr-muted' : 'mon-dex-hdr'; }
            if (c) { c.textContent = '-'; c.className = 'mon-dex-cell mc-muted'; }
            if (d) { d.textContent = lbl ? lbl.error : '-'; d.className = lbl ? 'mon-dex-cell mc-err-sm' : 'mon-dex-cell mc-muted'; }
            if (f) { f.textContent = '-'; f.className = 'mon-dex-cell mc-muted'; }
            if (p) { p.textContent = '-'; p.className = 'mon-dex-cell mc-muted'; }
        }
    }

    // 8. Signal chip & card highlight — best from all combined quotes
    const bestCtD = ctdData.length ? ctdData[0].pnl : -999;
    const bestDtC = dtcData.length ? dtcData[0].pnl : -999;
    const best = Math.max(bestCtD, bestDtC);
    const isCtd = bestCtD >= bestDtC;
    const bestDir = isCtd ? 'CTD' : 'DTC';
    updateSignalChip(tok, best, bestDir);
    if (best >= tokMinPnl) {
        card.classList.add('has-signal');
        const bestRow = isCtd ? ctdData[0] : dtcData[0];
        const tgInfo = bestRow ? {
            dexName: bestRow.name,
            dexSrc: bestRow.src,
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
    const id = card.id.replace('card-', '');
    const els = _cardEls.get(id);
    const statEls = els ? [els.ctdStatus, els.dtcStatus].filter(Boolean)
                        : Array.from(card.querySelectorAll('.tbl-status'));
    statEls.forEach(el => {
        el.textContent = msg ? ` ⚠ ${msg}` : '';
        el.className = msg ? 'tbl-status tbl-status-err' : 'tbl-status';
    });
}

// ─── Telegram + Android Notification ─────────────────────────────────────
// Cooldown berlaku untuk keduanya (Telegram & Android bridge)
async function sendTelegram(tok, pnl, info) {
    const now = Date.now();
    const last = tgCooldown.get(tok.id) || 0;
    if (now - last < APP_DEV_CONFIG.telegramCooldown * 60000) return;
    tgCooldown.set(tok.id, now);
    playSignalSound();

    const appName = APP_DEV_CONFIG.appName || 'MONITORING PRICE';
    const appVer  = APP_DEV_CONFIG.appVersion ? ' v' + APP_DEV_CONFIG.appVersion : '';
    const chain  = CONFIG_CHAINS[tok.chain]?.label || tok.chain.toUpperCase();
    const cexLbl = CONFIG_CEX[tok.cex]?.label || tok.cex;
    const dexName = info?.dexName || 'DEX';
    const dexSrc  = info?.dexSrc  || '';
    const dexBadge = dexSrc === 'MX' ? ' <code>[MT]</code>' : dexSrc === 'JX' ? ' <code>[JM]</code>' : '';
    const dir   = info?.dir || 'CEX↔DEX';
    const fee   = info?.totalFee != null ? info.totalFee.toFixed(2) : '-';
    const modal = info?.modal ?? tok.modalCtD;
    const pairLbl = tok.tickerPair && tok.tickerPair !== tok.ticker ? tok.tickerPair : tok.ticker;
    const wallet = CFG.wallet
        ? CFG.wallet.slice(0, 10) + '.....' + CFG.wallet.slice(-10)
        : '-';
    const pnlSign = pnl >= 0 ? '+' : '';
    const dirArrow = dir === 'CEX→DEX' ? '⬆️' : '⬇️';
    const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // ── Android native notification (via WebView JS Bridge) ──────────────
    if (window.AndroidBridge) {
        const title = `🟢 ${appName} — SIGNAL: ${tok.ticker}↔${pairLbl}`;
        const body = `${cexLbl} ➜ ${dexName} [${chain}] [${dir}]\nPnL: ${pnlSign}${pnl.toFixed(2)}$  |  Modal: $${modal}`;
        window.AndroidBridge.showNotification(title, body);
    }

    // ── Telegram ──────────────────────────────────────────────────────────
    if (!APP_DEV_CONFIG.telegramBotToken || APP_DEV_CONFIG.telegramBotToken.length < 20) return;

    const msg =
`🟢 <b>${esc(appName)}${appVer}</b>
👤 @${esc(CFG.username || 'user')}  •  🔗 <b>${esc(chain)}</b>
━━━━━━━━━━━━━━━
🪙 <b>${esc(tok.ticker)} ⇄ ${esc(pairLbl)}</b> [ ${dirArrow} <i>${esc(dir)}</i> ]
🏦 ${esc(cexLbl).toUpperCase()} ➜ <b>${esc(dexName).toUpperCase()}</b>${dexBadge}
💵 Modal : $${esc(modal)}
💰 PnL : <b>${pnlSign}${pnl.toFixed(2)}$</b> | 💸 Fee  :  -$${esc(fee)}
━━━━━━━━━━━━━━━
👛 <code>${esc(wallet)}</code>`;

    try {
        await fetch(`https://api.telegram.org/bot${APP_DEV_CONFIG.telegramBotToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: APP_DEV_CONFIG.telegramGroupId, text: msg, parse_mode: 'HTML' })
        });
    } catch { }
}

// ─── Reset Monitor Cells ──────────────────────
// Kosongkan semua sel tabel dan sinyal setelah setiap ronde selesai
function resetMonitorCells() {
    const n = totalQuoteCount();
    _cardEls.forEach(els => {
        const card = els.card;
        if (!card) return;
        card.classList.remove('has-signal');
        card.querySelectorAll('.card-status').forEach(el => el.textContent = '');
        if (els.ctdStatus) { els.ctdStatus.textContent = ''; els.ctdStatus.className = 'tbl-status'; }
        if (els.dtcStatus) { els.dtcStatus.textContent = ''; els.dtcStatus.className = 'tbl-status'; }
        for (let i = 0; i < n; i++) {
            const ctdH = els.ctdHdr[i]; if (ctdH) { ctdH.textContent = '-'; ctdH.className = 'mon-dex-hdr'; }
            const ctdC = els.ctdCex[i]; if (ctdC) { ctdC.textContent = '-'; ctdC.className = 'mon-dex-cell'; }
            const ctdD = els.ctdDex[i]; if (ctdD) { ctdD.textContent = '-'; ctdD.className = 'mon-dex-cell'; }
            const ctdF = els.ctdFee[i]; if (ctdF) { ctdF.textContent = '-'; ctdF.className = 'mon-dex-cell'; }
            const ctdP = els.ctdPnl[i]; if (ctdP) { ctdP.textContent = '-'; ctdP.className = 'mon-dex-cell'; }
            const dtcH = els.dtcHdr[i]; if (dtcH) { dtcH.textContent = '-'; dtcH.className = 'mon-dex-hdr'; }
            const dtcC = els.dtcCex[i]; if (dtcC) { dtcC.textContent = '-'; dtcC.className = 'mon-dex-cell'; }
            const dtcD = els.dtcDex[i]; if (dtcD) { dtcD.textContent = '-'; dtcD.className = 'mon-dex-cell'; }
            const dtcF = els.dtcFee[i]; if (dtcF) { dtcF.textContent = '-'; dtcF.className = 'mon-dex-cell'; }
            const dtcP = els.dtcPnl[i]; if (dtcP) { dtcP.textContent = '-'; dtcP.className = 'mon-dex-cell'; }
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
    $('#notStartedNotice').hide();
    $('#scanDoneNotice').hide();
    $('#scanStopNotice').hide();
    updateNoSignalNotice();
    lockTabs();
    if (!getFilteredTokens().length) { showToast('Tidak ada token aktif! Periksa filter di Pengaturan.'); stopScan(); return; }
    showToast('▶ Scanning dimulai…');
    // Start Android Foreground Service (keeps CPU alive when screen off)
    try { if (window.AndroidBridge && AndroidBridge.startBackgroundService) AndroidBridge.startBackgroundService(); } catch (e) { }
    await fetchUsdtRate();

    const BATCH_SIZE = 8; // scan 8 koin paralel sekaligus
    while (!scanAbort) {
        _scanRound++;
        // Clear orderbook cache to free memory each round
        for (const k in _obCache) delete _obCache[k];
        await fetchUsdtRate();
        // Re-fetch tokens setiap ronde: update hapus/tambah & acak ulang jika random
        if (monitorSort === 'rand') _shuffledTokens = null;
        const tokens = getFilteredTokens();
        if (!tokens.length) break;
        buildMonitorRows(tokens); // rebuild cards dengan urutan sama persis
        for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
            if (scanAbort) break;
            const batch = tokens.slice(i, Math.min(i + BATCH_SIZE, tokens.length));
            const pct = Math.round(Math.min(i + BATCH_SIZE, tokens.length) / tokens.length * 100);
            $('#scanBar').css('width', pct + '%');
            $('#btnScanCount').text(`[ ${Math.min(i + BATCH_SIZE, tokens.length)}/${tokens.length}] KOIN`);
            await Promise.all(batch.map(tok => scanToken(tok)));
            if (!scanAbort) await new Promise(r => setTimeout(r, CFG.interval));
        }
        if (!scanAbort) {
            $('#scanBar').css('width', '0%');
            if (!autoReload) {
                // Sekali scan: selesai langsung stop, hasil tetap tampil
                showToast(`✅ Scan selesai!`);
                playCompleteSound();
                break;
            }
            // Auto-reload: jeda 10 detik lalu mulai ronde berikutnya
            showToast(`✅ Ronde ${_scanRound} selesai — jeda 10 detik...`, 9500);
            playCompleteSound();
            await new Promise(r => setTimeout(r, 10000));
            if (!scanAbort) {
                resetMonitorCells();
                document.querySelectorAll('.signal-chip').forEach(c => c.remove());
                updateNoSignalNotice();
            }
        }
    }
    // Jika loop keluar karena selesai natural (bukan scanAbort dari user), tandai 'done'
    stopScan(scanAbort ? 'manual' : 'done');
}
function stopScan(reason = 'manual') {
    scanning = false; scanAbort = true;  // keep true so orphaned loop exits
    $('#btnScanIcon').text('▶'); $('#btnScanLbl').text('START'); $('#btnScan').removeClass('stop');
    updateScanCount();
    $('#scanBadge').removeClass('active');
    $('#scanBar').css('width', '0%');
    // Tampilkan notice sesuai kondisi
    $('#notStartedNotice').hide();
    $('#scanDoneNotice').hide();
    $('#scanStopNotice').hide();
    $('#noSignalNotice').hide();
    if (_scanRound === 0) {
        // Belum pernah scan sama sekali
        $('#notStartedNotice').show();
    } else if (reason === 'done') {
        // Scan selesai natural (semua koin sudah discan)
        $('#scanDoneNotice').show();
        showToast('✅ Scanning selesai');
    } else {
        // Dihentikan manual oleh user
        $('#scanStopNotice').show();
        showToast('■ Scanning dihentikan');
    }
    unlockTabs();
    // Stop Android Foreground Service
    try { if (window.AndroidBridge && AndroidBridge.stopBackgroundService) AndroidBridge.stopBackgroundService(); } catch (e) { }
}
$('#btnScan').on('click', () => {
    if (scanning) { scanAbort = true; stopScan('manual'); }
    else { runScan(); }
});

// ─── Auto-Reload Toggle ───────────────────────
function _applyAutoReload() {
    const btn = document.getElementById('btnAutoReload');
    if (!btn) return;
    if (autoReload) {
        btn.classList.add('active');
        btn.textContent = '🔁';
        btn.title = 'Mode: Auto-Reload (aktif)';
    } else {
        btn.classList.remove('active');
        btn.textContent = '🔄';
        btn.title = 'Mode: Sekali Scan';
    }
}
$('#btnAutoReload').on('click', function () {
    if (scanning) return; // jangan ubah saat scanning berlangsung
    autoReload = !autoReload;
    localStorage.setItem('scanAutoReload', autoReload ? '1' : '0');
    _applyAutoReload();
    showToast(autoReload ? '🔁 Auto Reload Scanner Aktif' : '🔂 Sekali Scan Aktif');
});
