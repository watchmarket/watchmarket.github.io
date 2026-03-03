// ============================================================
// CEXDEX-COMPARE — config.js
// Dev-only config. Diisi oleh developer, TIDAK diubah user.
// ============================================================

const APP_DEV_CONFIG = {
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

// ============================================================
// API Keys LI.FI — dirandom setiap pemanggilan fetchLifiRoutes
// ============================================================
const apiKeysLIFI = [
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
  "8be66370-651b-4d3f-9351-8168a3a8c34f.5bb01420-cdd6-4d2e-83e0-8d5d100f1b01",
];
