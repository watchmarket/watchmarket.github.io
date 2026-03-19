// ─── CEX Orderbook Fetch ─────────────────────
let usdtRate = 16000;
async function fetchUsdtRate() {
    const cached = cacheGet('usdtRate');
    if (cached !== undefined) { usdtRate = cached; return usdtRate; }
    try {
        const r = await fetch(APP_DEV_CONFIG.corsProxy + 'https://indodax.com/api/ticker/usdtidr');
        const d = await r.json();
        usdtRate = parseFloat(d.ticker?.last) || 16000;
        cacheSet('usdtRate', usdtRate, 60_000);
    } catch { }
    return usdtRate;
}

async function fetchOrderbook(cexKey, symbol) {
    const cacheKey = `ob:${cexKey}:${symbol}`;
    return cacheWrap(cacheKey, 1200, async () => {
        const cfg = CONFIG_CEX[cexKey];
        if (!cfg) return null;
        let url = cfg.ORDERBOOK.urlTpl(symbol);
        if (cfg.ORDERBOOK.proxy) url = APP_DEV_CONFIG.corsProxy + url;
        try {
            const r = await fetch(url);
            const d = await r.json();
            return parseOrderbook(d, cfg.ORDERBOOK.parser);
        } catch (e) { return { error: e.message }; }
    });
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
