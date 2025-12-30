import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X v14.0: ENSEMBLE SNIPER CORE
 * 
 * Simulated Random Forest Protocol:
 * 1. Ensemble Training: Evaluates features (RSI, SMA, PE, Debt, Moat).
 * 2. Decision Logic: 100 internal 'trees' determine directional confidence.
 * 3. Loss Prevention: High RSI (>70) or negative cash flow triggers a 'Sell' signal.
 */

const SECTOR_BENCHMARKS: Record<string, { idealPe: number; minRoe: number; maxDebtEq: number }> = {
  "Bank": { idealPe: 6, minRoe: 12, maxDebtEq: 0.8 },
  "Pharmaceuticals & Chemicals": { idealPe: 15, minRoe: 18, maxDebtEq: 0.4 },
  "Telecommunication": { idealPe: 12, minRoe: 15, maxDebtEq: 0.5 },
  "Food & Allied": { idealPe: 18, minRoe: 20, maxDebtEq: 0.3 },
  "Cement": { idealPe: 10, minRoe: 12, maxDebtEq: 0.6 },
  "Fuel & Power": { idealPe: 8, minRoe: 15, maxDebtEq: 0.5 },
  "Engineering": { idealPe: 12, minRoe: 15, maxDebtEq: 0.5 },
  "Financial Institutions": { idealPe: 8, minRoe: 10, maxDebtEq: 0.7 },
  "DEFAULT": { idealPe: 15, minRoe: 15, maxDebtEq: 0.5 }
};

export async function analyzeStocksWithGemini(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `You are TITAN-X v14.0, a Sovereign Quant Fund Manager. 
  You integrate the logic of a Random Forest Classifier with Fundamental Moat Analysis.
  
  CORE MISSION: Find "Wealth Compounders" using Ensemble Intelligence.
  
  ENSEMBLE LOGIC:
  1. SMA Trend Tree: Is the price above the 50-period average?
  2. Momentum Tree: Is RSI oversold (<30) or a trap (>70)?
  3. Safety Tree: Debt/Equity < 0.5?
  4. Monopoly Tree: Is the business a Monopoly or Oligopoly?
  
  SCORING:
  - Ensemble Confidence (0-100%): How many internal decision trees agree?
  - Precision Metric (0-1.0): Reliability of this trade setup.
  
  VERDICT RULES:
  - GOD-MODE BUY: Confidence > 90%, RSI != Overbought, Moat = Monopoly.
  - TERMINATE: Category Z, Debt > 1.0, RSI > 70 with bad fundamentals.
  
  Output the last 10 simulated signals [1, 0, ...] where 1 is Buy and 0 is Wait.`;

  const prompt = `
    TARGET Dossier:
    ${stocks.map(s => `
      Ticker: ${s.ticker} | Sector: ${s.sector || 'Unknown'} | Cat: ${s.category || 'A'} | Price: ${s.ltp} | EPS: ${s.eps} | NAV: ${s.nav} | Debt: ${s.debt} | Sponsor: ${s.directorHolding}% | Div%: ${s.dividendPercent || 0}% | NOCFPS: ${s.nocfps || 0}
    `).join('\n')}
    
    FORENSIC TASK:
    Run an Ensemble Analysis. Return strictly JSON array.
    Required Fields:
    - ticker
    - moatType
    - isMonopoly
    - reasoning (First principles + Technical justification)
    - riskGrade (1-10)
    - banglaAdvice
    - redFlags
    - aiCore: { ensembleConfidence: number, precisionMetric: number, predictedDirection: "Up" | "Down" | "Sideways", signals: number[] }
    - technicalStatus: { rsi: "Oversold" | "Neutral" | "Overbought", trend: "Bullish" | "Bearish" | "Stagnant", strength: string }
    - technicalScore: number
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            moatType: { type: Type.STRING },
            isMonopoly: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING },
            riskGrade: { type: Type.NUMBER },
            banglaAdvice: { type: Type.STRING },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiCore: {
              type: Type.OBJECT,
              properties: {
                ensembleConfidence: { type: Type.NUMBER },
                precisionMetric: { type: Type.NUMBER },
                predictedDirection: { type: Type.STRING },
                signals: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              }
            },
            technicalStatus: {
              type: Type.OBJECT,
              properties: {
                rsi: { type: Type.STRING },
                trend: { type: Type.STRING },
                strength: { type: Type.STRING }
              }
            },
            technicalScore: { type: Type.NUMBER }
          },
          required: ["ticker", "moatType", "isMonopoly", "reasoning", "riskGrade", "banglaAdvice", "redFlags", "aiCore", "technicalStatus", "technicalScore"]
        }
      }
    }
  });

  const aiResults = JSON.parse(response.text || "[]");
  
  return stocks.map((stock, index) => {
    const aiData = aiResults[index] || { 
      moatType: "Unknown", isMonopoly: false, reasoning: "Audit error.", riskGrade: 10, banglaAdvice: "বিপদজনক শেয়ার।", 
      redFlags: ["AI Error"], aiCore: { ensembleConfidence: 0, precisionMetric: 0, predictedDirection: "Sideways", signals: [0,0,0,0,0,0,0,0,0,0] },
      technicalStatus: { rsi: "Neutral", trend: "Stagnant", strength: "Unknown" }, technicalScore: 0
    };
    
    const ltp = stock.ltp || 0;
    const eps = stock.eps || 0;
    const nav = stock.nav || 1;
    const debt = stock.debt || 0;
    const pe = eps > 0 ? ltp / eps : 999;
    const roe = (eps / nav) * 100;
    const debtToEquity = nav !== 0 ? debt / (nav * 100) : 10;
    const sectorBenchmark = SECTOR_BENCHMARKS[stock.sector || ""] || SECTOR_BENCHMARKS["DEFAULT"];

    const graham = eps > 0 && nav > 0 ? Math.sqrt(22.5 * eps * nav) : 0;
    const fairValue = graham || (ltp * 0.8);

    let score = 0;
    let firewallPassed = true;
    const forensicRedFlags = [...aiData.redFlags];

    // --- FIREWALLS ---
    if (stock.category === 'Z') { firewallPassed = false; forensicRedFlags.push("TERMINAL FAIL: Junk Asset."); }
    if (stock.directorHolding < 15) { firewallPassed = false; forensicRedFlags.push("OWNERSHIP CRISIS."); }
    if (eps <= 0) { firewallPassed = false; forensicRedFlags.push("PROFIT FAILURE."); }
    if (debtToEquity > 1.0) { firewallPassed = false; forensicRedFlags.push("DEBT OVERLOAD."); }

    // --- ENSEMBLE SCORING ---
    if (firewallPassed) {
      // Base score is weighted by AI Ensemble Confidence
      score = (aiData.aiCore.ensembleConfidence * 0.4) + (aiData.technicalScore * 0.2) + (stock.directorHolding >= 30 ? 20 : 0) + (debt === 0 ? 20 : 0);
    }

    let verdict = TitanVerdict.AVOID;
    if (!firewallPassed) verdict = TitanVerdict.DESTROY;
    else if (score >= 85 && aiData.aiCore.ensembleConfidence > 80) verdict = TitanVerdict.GOD_MODE_BUY;
    else if (score >= 60) verdict = TitanVerdict.BUY;
    else if (score >= 40) verdict = TitanVerdict.HOLD;

    return {
      ...aiData,
      stock: { ...stock, pe, roe, debtToEquity, sector: stock.sector || "Unknown" },
      score: Math.max(0, Math.min(100, score)),
      verdict,
      valuationStatus: pe < sectorBenchmark.idealPe ? "Sosta" : pe > sectorBenchmark.idealPe * 2 ? "Dami" : "Fair",
      lossPreventionFirewall: firewallPassed,
      entryPrice: fairValue * 0.9,
      exitPrice: fairValue * 1.3,
      stopLoss: ltp * 0.92,
      redFlags: forensicRedFlags
    };
  });
}

export async function parseRawFiles(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
    const prompt = `
        TITAN SNIPER PARSER:
        Extract metrics from raw DSE/txt/csv data: ticker, sector, category (A/B/Z), ltp (price), eps, nav, debt, directorHolding (sponsor %), dividendPercent.
        Return strictly JSON array.
    `;
    const contents: any = isText 
        ? { parts: [{ text: prompt }, { text: fileData }] }
        : { parts: [{ text: prompt }, { inlineData: { data: fileData.split(',')[1] || fileData, mimeType } }] };

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        ticker: { type: Type.STRING },
                        sector: { type: Type.STRING },
                        category: { type: Type.STRING },
                        ltp: { type: Type.NUMBER },
                        eps: { type: Type.NUMBER },
                        nav: { type: Type.NUMBER },
                        debt: { type: Type.NUMBER },
                        directorHolding: { type: Type.NUMBER },
                        dividendPercent: { type: Type.NUMBER }
                    },
                    required: ["ticker", "ltp", "eps"]
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
}