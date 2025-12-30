
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
  dividendYield?: number; // %
  dividendPercent?: number; // %
  sector?: string;
  directorHolding: number; // %
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
