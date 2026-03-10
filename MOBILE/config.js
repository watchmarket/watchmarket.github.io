// ============================================================
// CEXDEX-COMPARE — config.js
// Dev-only config. Diisi oleh developer, TIDAK diubah user.
// ============================================================

const APP_DEV_CONFIG = {
  appVersion: "03.10",
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
  defaultInterval: 300,
  defaultSseTimeout: 6000,
  defaultQuoteCountMetax: 3,   // jumlah quote MetaMask SSE (0 = matikan)
  defaultQuoteCountJumpx: 0,   // jumlah quote Jumper/LiFi  (0 = matikan)
  defaultAutoLevel: false,     // Auto Level CEX (false = nonaktif, true = aktif)
  defaultLevelCount: 2,        // jumlah level orderbook (1–4)
  telegramCooldown: 5,   // menit
  defaultEnableKyber: false,    // KyberSwap DEX (false = nonaktif, true = aktif)
  defaultEnableOkx: false,      // OKX DEX Aggregator (false = nonaktif, true = aktif)
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

// ============================================================
// OKX DEX API KEY POOL
// Digunakan oleh fetchDexQuotesOkx() di app.js
// Key pool di-rotate secara random untuk menghindari rate limit.
// ============================================================
const apiKeysOKXDEX = [
  { ApiKeyOKX: "28bc65f0-8cd1-4ecb-9b53-14d84a75814b", secretKeyOKX: "E8C92510E44400D8A709FBF140AABEC1", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "04f923ec-98f2-4e60-bed3-b8f2d419c773", secretKeyOKX: "3D7D0BD3D985C8147F70592DF6BE3C48", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "cf214e57-8af2-42bf-8afa-3b7880c5a152", secretKeyOKX: "26AA1E415682BD8BBDF44A9B1CFF4759", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "a77871bd-7855-484c-a675-e429bad3490e", secretKeyOKX: "830C9BB8D963F293857DB0CCA5459089", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "87db4731-fbe3-416f-8bb4-a4f5e5cb64f7", secretKeyOKX: "B773838680FF09F2069AEE28337BBCD0", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "aec98aef-e2b6-4fb2-b63b-89e358ba1fe1", secretKeyOKX: "DB683C83FF6FB460227ACB57503F9233", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "6636873a-e8ab-4063-a602-7fbeb8d85835", secretKeyOKX: "B83EF91AFB861BA3E208F2680FAEDDC3", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "989d75b7-49ff-40a1-9c8a-ba94a5e76793", secretKeyOKX: "C30FCABB0B95BE4529D5BA1097954D34", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "43c169db-db8c-4aeb-9c25-a2761fdcae49", secretKeyOKX: "7F812C175823BBD9BD5461B0E3A106F5", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "904cefba-08ce-48e9-9e8b-33411bf44a0f", secretKeyOKX: "91F2761A0B77B1DEED87A54E75BE1CCE", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "bfbd60b5-9aee-461d-9c17-3b401f9671d1", secretKeyOKX: "D621020540042C41D984E2FB78BED5E4", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "86f40277-661c-4290-929b-29a25b851a87", secretKeyOKX: "9274F990B5BEDAB5EB0C035188880081", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "32503ada-3d34-411a-b50b-b3e0f36f3b47", secretKeyOKX: "196658185E65F93963323870B521A6F6", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "80932e81-45b1-497e-bc14-81bdb6ed38d5", secretKeyOKX: "4CA9689FA4DE86F4E4CBF2B777CBAA91", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "a81d5a32-569a-401c-b207-3f0dd8f949c7", secretKeyOKX: "307D988DA44D37C911AA8A171B0975DB", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "ca59e403-4bcb-410a-88bb-3e931a2829d5", secretKeyOKX: "AC7C6D593C29F3378BF93E7EDF74CB6D", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "97439591-ea8e-4d78-86bb-bdac8e43e835", secretKeyOKX: "54970C78369CE892E2D1B8B296B4E572", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "f7a23981-af15-47f4-8775-8200f9fdfe5d", secretKeyOKX: "4F61764255CEDE6D5E151714B3E1E93B", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "4f708f99-2e06-4c81-88cb-3c8323fa42c5", secretKeyOKX: "A5B7DCA10A874922F54DC2204D6A0435", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "61061ef4-6d0a-412a-92a9-bdc29c6161a7", secretKeyOKX: "4DDF73FD7C38EB50CD09BF84CDB418ED", PassphraseOKX: "Regi!#007" },
  { ApiKeyOKX: "adad55d1-bf90-43ac-ac03-0a43dc7ccee2", secretKeyOKX: "528AFB3ECC88653A9070F05CC3839611", PassphraseOKX: "Cek_Horeg_911" },
  { ApiKeyOKX: "6866441f-6510-4175-b032-342ad6798817", secretKeyOKX: "E6E4285106CB101B39FECC385B64CAB1", PassphraseOKX: "Arekpinter123." },
  { ApiKeyOKX: "45e4e1f1-1229-456f-ad23-8e1341e76683", secretKeyOKX: "1BD8AC02C9461A6D1BEBDFE31B3BFF9F", PassphraseOKX: "Regi!#007" },
];
