export enum TitanVerdict {
  GOD_MODE_BUY = "💎 GOD-MODE BUY",
  BUY = "✅ BUY",
  HOLD = "⚖️ HOLD",
  AVOID = "⚠️ AVOID",
  DESTROY = "💀 TERMINATE (DESTROY)"
}

export interface EmpireAudit {
  liquidCash: number;
  monthlyBurn: number;
  oneSkill: string;
  mentalBlock: string;
}

export interface StockData {
  ticker: string;
  name?: string;
  sector?: string;
  ltp: number; // Last Traded Price
  eps: number;
  nav: number; // Net Asset Value
  debt: number;
  nocfps?: number; // Net Operating Cash Flow Per Share
  dividendPercent?: number; // Cash Div %
  dividendYield?: number; // %
  directorHolding: number; // % (Sponsor Holding)
  foreignHolding?: number; // %
  category?: string; // A, B, G, N, Z
  roe?: number;
  pe?: number;
  debtToEquity?: number;
  pbRatio?: number;
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
  lossPreventionFirewall: boolean; 
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
}