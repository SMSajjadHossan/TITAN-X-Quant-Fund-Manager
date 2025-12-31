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
}

export interface StockData {
  ticker: string;
  ltp: number;
  eps: number;
  nav: number;
  debt: number;
  directorHolding: number;
  dividend?: number; // Added for Yield calculation
  sector?: string;
  category?: string;
}

export interface TitanAnalysis {
  stock: StockData;
  score: number;
  verdict: TitanVerdict;
  moatType: string;
  reasoning: string;
  banglaAdvice: string;
  riskGrade: number;
  redFlags: string[];
  intrinsicValue: number;
  fairValue: number;
  yield: number;
  allocation: string;
  bucket: string;
  debtRisk: "LOW" | "MEDIUM" | "HIGH" | "TOXIC";
  metrics: {
    pe: number;
    roe: number;
    debtToEquity: number;
  }
}

export interface PortfolioStrategy {
  healthScore: number;
  directive: string;
  stance: "Aggressive" | "Neutral" | "Defensive";
}