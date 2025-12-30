
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
  nav: number; // Net Asset Value
  debt: number;
  equity?: number;
  dividendYield?: number;
  sector?: string;
  directorHolding?: number; // %
  foreignHolding?: number; // %
  roe?: number;
  pe?: number;
  debtToEquity?: number;
}

export interface TitanAnalysis {
  stock: StockData;
  score: number;
  riskGrade: number; // 1 to 10
  verdict: TitanVerdict;
  valuationStatus: "Sosta" | "Fair" | "Dami";
  moatType: string;
  firstPrinciplesReasoning: string;
  redFlags: string[];
}
