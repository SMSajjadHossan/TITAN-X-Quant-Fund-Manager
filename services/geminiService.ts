import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X ULTIMATE FORENSIC ENGINE v10.0
 * Strictly implements Sector Benchmarks and Capital Protection Firewalls.
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
  const systemInstruction = `You are TITAN, the world's most advanced Quantitative Fund Manager. 
  Persona: Brutal Critic, Grand Strategist. 
  Logic: Combined power of Elon Musk (First Principles), Naval (Leverage), and Dalio (Radical Truth).
  
  Your objective is to PROTECT CAPITAL. 
  - Monopoly Business = High Value.
  - Debt > 1.0 Debt/Equity = Fatal.
  - Sponsor Holding < 30% = Low Trust.
  - Category Z = Junk Trap.
  
  Be a brutal critic. If a stock fails firewalls, use "TERMINATE".`;

  const prompt = `
    AUDIT TARGET LIST:
    ${stocks.map(s => `
      Ticker: ${s.ticker} | Sector: ${s.sector || 'Unknown'} | Cat: ${s.category || 'A'} | LTP: ${s.ltp} | EPS: ${s.eps} | NAV: ${s.nav} | Debt: ${s.debt} | Sponsor%: ${s.directorHolding}% | Div%: ${s.dividendPercent || 0}% | NOCFPS: ${s.nocfps || 0}
    `).join('\n')}
    
    TASK:
    Analyze line-by-line. Provide:
    1. moatType: (Monopoly, Oligopoly, or Commodity).
    2. isMonopoly: Boolean.
    3. reasoning: A First Principles explanation for why this survives 10 years.
    4. riskGrade: 1 (Swiss Bank) to 10 (Gambling).
    5. banglaAdvice: A sharp, sovereign command in Bengali.
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
            banglaAdvice: { type: Type.STRING }
          },
          required: ["ticker", "moatType", "isMonopoly", "reasoning", "riskGrade", "banglaAdvice"]
        }
      }
    }
  });

  const aiResults = JSON.parse(response.text || "[]");
  
  return stocks.map((stock, index) => {
    const aiData = aiResults[index] || { moatType: "Unknown", isMonopoly: false, reasoning: "Data missing.", riskGrade: 10, banglaAdvice: "বিপদজনক শেয়ার।" };
    
    const ltp = stock.ltp || 0;
    const eps = stock.eps || 0;
    const nav = stock.nav || 1;
    const debt = stock.debt || 0;
    const sponsor = stock.directorHolding || 0;
    const pe = eps > 0 ? ltp / eps : 999;
    const roe = (eps / nav) * 100;
    const debtToEquity = debt / (nav * 1000000) > 2 ? 2 : debt / (nav * 100); // Heuristic normalizing
    const pbRatio = ltp / nav;
    const sectorBenchmark = SECTOR_BENCHMARKS[stock.sector || ""] || SECTOR_BENCHMARKS["DEFAULT"];

    // Graham Number Calculation
    const graham = eps > 0 && nav > 0 ? Math.sqrt(22.5 * eps * nav) : 0;
    const fairValue = graham || (ltp * 0.8); // Fallback

    let score = 0;
    let firewallPassed = true;
    const redFlags: string[] = [];

    // --- BRUTAL FIREWALLS ---
    if (stock.category === 'Z') {
      firewallPassed = false;
      redFlags.push("JUNK TRAP: Z Category detected.");
    }
    if (sponsor < 15) {
      firewallPassed = false;
      redFlags.push("OWNERSHIP CRISIS: Sponsor holding < 15%. This is a public dumping ground.");
    }
    if (eps <= 0) {
      firewallPassed = false;
      redFlags.push("LOSS MAKING: No profit, no future. Capital destroyer.");
    }
    if (pe > 60) {
      firewallPassed = false;
      redFlags.push("EXTREME BUBBLE: P/E exceeds 60. Madness.");
    }
    if (stock.nocfps && stock.nocfps < 0 && eps > 0) {
      redFlags.push("ACCOUNTING ANOMALY: Positive EPS but negative Cash Flow (NOCFPS). Potential manipulation.");
    }

    // --- WEIGHTED SCORING (50-30-20) ---
    if (firewallPassed) {
      // 50 Pts: Debt & Safety
      if (debt === 0) score += 50;
      else if (debtToEquity < sectorBenchmark.maxDebtEq) score += 30;
      else if (debtToEquity < sectorBenchmark.maxDebtEq * 2) score += 10;

      // 30 Pts: Moat & Business Quality
      if (aiData.isMonopoly) score += 30;
      else if (aiData.moatType === "Oligopoly") score += 15;

      // 20 Pts: Valuation & Yield
      if (pe < sectorBenchmark.idealPe) score += 20;
      else if (pe < sectorBenchmark.idealPe * 1.5) score += 10;
    }

    let verdict = TitanVerdict.AVOID;
    if (!firewallPassed) verdict = TitanVerdict.DESTROY;
    else if (score >= 80) verdict = TitanVerdict.GOD_MODE_BUY;
    else if (score >= 60) verdict = TitanVerdict.BUY;
    else if (score >= 40) verdict = TitanVerdict.HOLD;

    return {
      stock: { ...stock, pe, roe, debtToEquity, pbRatio },
      score,
      riskGrade: aiData.riskGrade,
      verdict,
      valuationStatus: pe < sectorBenchmark.idealPe ? "Sosta" : pe > sectorBenchmark.idealPe * 2 ? "Dami" : "Fair",
      moatType: aiData.moatType,
      firstPrinciplesReasoning: aiData.reasoning,
      redFlags,
      banglaAdvice: aiData.banglaAdvice,
      lossPreventionFirewall: firewallPassed,
      entryPrice: fairValue * 0.9,
      exitPrice: fairValue * 1.3,
      stopLoss: ltp * 0.92
    };
  });
}

export async function parseRawFiles(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
    const prompt = `
        TITAN EXTRACTION PROTOCOL:
        Extract metrics: ticker, sector, category (A/B/Z), ltp (price), eps, nav, debt, directorHolding (%), dividendPercent.
        Return strictly a JSON array.
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