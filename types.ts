
export enum TitanVerdict {
  GOD_MODE_BUY = "GOD-MODE BUY",
  BUY = "BUY",
  HOLD = "HOLD",
  AVOID = "AVOID",
  DESTROY = "DESTROY"
}

export interface StockData {
  ticker: string;
  name?: string;
  ltp: number; // Last Traded Price
  eps: number;
  prevEps?: number; // For Growth Check
  nav: number; // Net Asset Value
  debt: number;
  equity?: number;
  dividendYield?: number; // %
  faceValue?: number; // Default 10
  dividendPercent?: number; // e.g. 50%
  sector?: string;
  directorHolding: number; // %
  foreignHolding?: number; // %
  roe?: number;
  pe?: number;
  debtToEquity?: number;
  isMonopoly?: boolean;
}

export interface TitanAnalysis {
  stock: StockData;
  score: number;
  riskGrade: number; // 1 (Safe) to 10 (Gambling)
  verdict: TitanVerdict;
  valuationStatus: "Sosta" | "Dami" | "Fair";
  moatType: string;
  firstPrinciplesReasoning: string;
  redFlags: string[];
  banglaAdvice: string;
}
