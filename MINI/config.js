// ============================================================
// CEXDEX-COMPARE — config.js
// Dev-only config. Diisi oleh developer, TIDAK diubah user.
// ============================================================

const APP_DEV_CONFIG = {
  appVersion: "2026.03.05",
  telegramBotToken: "8053447166:AAH7YYbyZ4eBoPX31D8h3bCYdzEeIaiG4JU",
  telegramGroupId: "-5271018516",
  corsProxy: "https://vercel-proxycors.vercel.app/?url=",
  fees: {
    indodax: 0.001,
    mexc: 0.001,
    gate: 0.002,
    binance: 0.001,
  },
  defaultMinPnl: 1,
  defaultInterval: 700,
  defaultSseTimeout: 6000,
  defaultQuoteCountMetax: 2,   // jumlah quote MetaMask SSE (0 = matikan)
  defaultQuoteCountJumpx: 2,   // jumlah quote Jumper/LiFi  (0 = matikan)
  telegramCooldown: 5,   // menit
};

// ============================================================
// CONFIG_CEX — 4 Exchange
// ============================================================
const CONFIG_CEX = {
  binance: {
    label: "Binance",
    ICON: "icons/cex/binance.png",
    WARNA: "#e0a50c",

    ORDERBOOK: {
      urlTpl: (symbol) => `https://data-api.binance.vision/api/v3/depth?limit=5&symbol=${symbol.toUpperCase()}`,
      parser: "standard",
      proxy: false,
    },
    symbolFmt: (ticker) => ticker.toUpperCase() + "USDT",
  },
  gate: {
    label: "Gate",
    ICON: "icons/cex/gate.png",
    WARNA: "#D5006D",

    ORDERBOOK: {
      urlTpl: (symbol) => `https://api.gateio.ws/api/v4/spot/order_book?limit=5&currency_pair=${symbol.toUpperCase()}`,
      parser: "standard",
      proxy: true,
    },
    symbolFmt: (ticker) => ticker.toUpperCase() + "_USDT",
  },
  mexc: {
    label: "MEXC",
    ICON: "icons/cex/mexc.png",
    WARNA: "#1448ce",

    ORDERBOOK: {
      urlTpl: (symbol) => `https://api.mexc.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=5`,
      parser: "standard",
      proxy: true,
    },
    symbolFmt: (ticker) => ticker.toUpperCase() + "USDT",
  },

  indodax: {
    label: "Indodax",
    ICON: "icons/cex/indodax.png",
    WARNA: "#2eb5f2",

    ORDERBOOK: {
      urlTpl: (symbol) => `https://indodax.com/api/depth/${symbol.toLowerCase()}`,
      parser: "indodax",
      proxy: true,
    },
    // auto-fill format: tickeridr
    symbolFmt: (ticker) => ticker.toLowerCase() + "idr",
  },

};

// ============================================================
// CONFIG_CHAINS — 5 Chain (tanpa Solana)
// ============================================================
const CONFIG_CHAINS = {
  bsc: {
    Kode_Chain: 56,
    label: "BSC",
    Nama_Pendek: "bsc",
    WARNA: "#f0af18",
    ICON: "icons/chains/bsc.png",
    URL_Chain: "https://bscscan.com",
    DATAJSON: "https://watchmarket.github.io/JSON/SNAPSHOT_koin_BSC.json",
    LINKS: {
      token: (addr) => `https://bscscan.com/token/${addr}`,
    }
  },
  ethereum: {
    Kode_Chain: 1,
    label: "Ethereum",
    Nama_Pendek: "erc",
    WARNA: "#8098ee",
    ICON: "icons/chains/ethereum.png",
    URL_Chain: "https://etherscan.io",
    DATAJSON: "https://watchmarket.github.io/JSON/SNAPSHOT_koin_ETHEREUM.json",
    LINKS: {
      token: (addr) => `https://etherscan.io/token/${addr}`,
    }
  },
  polygon: {
    Kode_Chain: 137,
    label: "Polygon",
    Nama_Pendek: "poly",
    WARNA: "#cd72f4",
    ICON: "icons/chains/polygon.png",
    URL_Chain: "https://polygonscan.com",
    DATAJSON: "https://watchmarket.github.io/JSON/SNAPSHOT_koin_POLYGON.json",
    LINKS: {
      token: (addr) => `https://polygonscan.com/token/${addr}`,
    }
  },
  arbitrum: {
    Kode_Chain: 42161,
    label: "Arbitrum",
    Nama_Pendek: "arb",
    WARNA: "#a6b0c3",
    ICON: "icons/chains/arbitrum.png",
    URL_Chain: "https://arbiscan.io",
    DATAJSON: "https://watchmarket.github.io/JSON/SNAPSHOT_koin_ARBITRUM.json",
    LINKS: {
      token: (addr) => `https://arbiscan.io/token/${addr}`,
    }
  },

  base: {
    Kode_Chain: 8453,
    label: "Base",
    Nama_Pendek: "base",
    WARNA: "#1e46f9",
    ICON: "icons/chains/base.png",
    URL_Chain: "https://basescan.org",
    DATAJSON: "https://watchmarket.github.io/JSON/SNAPSHOT_koin_BASE.json",
    LINKS: {
      token: (addr) => `https://basescan.org/token/${addr}`,
    }
  },
};

// ============================================================
// USDT_SC — known USDT contract addresses per chain
// Used as fallback when user pairs TOKEN↔USDT and scPair is empty/wrong
// ============================================================
const USDT_SC = {
  bsc: '0x55d398326f99059fF775485246999027B3197955',
  polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

// Decimals for USDT per chain (BSC Binance-Peg USDT = 18; others = 6)
const USDT_DEC = {
  bsc: 18,
  polygon: 6,
  arbitrum: 6,
  ethereum: 6,
  base: 6,
};
