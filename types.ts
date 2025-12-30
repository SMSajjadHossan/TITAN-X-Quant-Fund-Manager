
export enum TitanVerdict {
  GOD_MODE_BUY = "💎 GOD-MODE BUY",
  BUY = "✅ BUY",
  HOLD = "⚖️ HOLD",
  AVOID = "⚠️ AVOID",
  DESTROY = "💀 TERMINATE (DESTROY)"
}

export interface StockData {
  ticker: string;
  name?: string;
  ltp: number; // Last Traded Price
  eps: number;
  nav: number; // Net Asset Value
  debt: number;
  nocfps?: number; // Net Operating Cash Flow Per Share
  dividendPercent?: number; // Cash Div % (e.g., 200%)
  dividendYield?: number; // %
  directorHolding: number; // % (Sponsor Holding)
  foreignHolding?: number; // %
  instituteHolding?: number; // %
  publicHolding?: number; // %
  marketCap?: number; // Million
  category?: string; // A, B, G, N, Z
  freeFloat?: number; // Million shares
  reserveSurplus?: number; // Million
  roe?: number;
  pe?: number;
  debtToEquity?: number;
}

export interface TitanAnalysis {
  stock: StockData;
  score: number;
  riskGrade: number; // 1 to 10
  verdict: TitanVerdict;
  valuationStatus: "Sosta" | "Dami" | "Fair";
  moatType: string;
  firstPrinciplesReasoning: string;
  redFlags: string[];
  banglaAdvice: string;
  lossPreventionFirewall: boolean; // True if passed safety checks
}
