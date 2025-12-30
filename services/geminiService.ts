
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X BATCH FORENSIC ENGINE v5.0
 * Implements strict GOD-MODE weighting:
 * - 50 Pts: Zero Debt
 * - 30 Pts: Monopoly/Moat
 * - 20 Pts: P/E < 10
 * Total 100. Score 80+ = GOD-MODE BUY.
 */
export async function analyzeStocksWithGemini(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `You are TITAN-X, the world's most advanced Quantitative Fund Manager.
  Persona: Brutal Critic, Fiduciary Guardian, First-Principles Thinker.
  Mission: Find Wealth Compounders, Destroy Capital Destroyers.
  
  Logic Checklist:
  1. Moat Audit: Analyze if business is a Monopoly/Oligopoly.
  2. Financial Forensic: Efficiency (ROE > 15%), Safety (Debt/Equity < 0.5), Value (P/E < 15).
  3. Ownership Integrity: Check Director % and Foreign Institutional trust.
  
  Constraint: Be a brutal critic. If a stock has debt or low governance, suggest DESTROY. Protect capital at all costs.`;

  const prompt = `
    AUDIT TARGET LIST:
    ${stocks.map(s => `
      Ticker: ${s.ticker} | LTP: ${s.ltp} | EPS: ${s.eps} | NAV: ${s.nav} | Debt: ${s.debt} | Director%: ${s.directorHolding}% | Div%: ${s.dividendPercent}%
    `).join('\n')}
    
    TASK:
    Analyze line-by-line. For each stock, provide:
    1. Moat Type (Monopoly, Oligopoly, or Commodity).
    2. isMonopoly (Boolean).
    3. Reasoning: A "First Principles" explanation for why this stock will survive/thrive for the next 10 years.
    4. Risk Grade (1-10).
    5. Bangla Advice: A direct, brutal verdict in Bengali.
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
            additionalFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["ticker", "moatType", "isMonopoly", "reasoning", "riskGrade", "banglaAdvice"]
        }
      }
    }
  });

  const aiResults = JSON.parse(response.text || "[]");
  
  return stocks.map((stock, index) => {
    const aiData = aiResults[index] || { moatType: "Unknown", isMonopoly: false, reasoning: "N/A", riskGrade: 5, banglaAdvice: "System Error." };
    
    // 1. Data Sanitization & Auto-Calculations
    const ltp = stock.ltp || 0;
    const eps = stock.eps || 0;
    const nav = stock.nav || 1;
    const debt = stock.debt || 0;
    const director = stock.directorHolding || 0;
    
    // Auto-calculate P/E if missing
    const pe = eps !== 0 ? ltp / eps : 999;
    
    // Auto-calculate ROE
    const roe = (eps / nav) * 100;
    
    // Auto-calculate Yield (Assume Face Value 10 as per DSE standards)
    const divYield = stock.dividendPercent ? (10 * (stock.dividendPercent / 100) * 100) / ltp : (stock.dividendYield || 0);
    
    const debtToEquity = debt / nav;

    // 2. THE TITAN GOD-MODE SCORING (STRICT WEIGHTING)
    let score = 0;
    let firewallPassed = true;
    const redFlags: string[] = [];

    // --- DETERMINISTIC FIREWALL (HARD OVERRIDES) ---
    if (director < 15) {
      firewallPassed = false;
      redFlags.push("CRITICAL OWNERSHIP FAILURE: Director holding is below 15%. This is a shell trap. Management has zero skin in the game.");
    }
    
    if (debtToEquity > 1.0) {
      firewallPassed = false;
      redFlags.push("TERMINAL DEBT: Debt exceeds Net Assets. This company belongs to the bank, not you.");
    }
    
    if (eps <= 0) {
      firewallPassed = false;
      redFlags.push("ZERO PROFITABILITY: Negative or zero EPS. Pure capital destruction.");
    }

    // --- WEIGHTED SCORING ENGINE ---
    // Rule: Debt = 0 (+50 Pts)
    if (debt === 0) score += 50;
    
    // Rule: Monopoly/Moat (+30 Pts)
    if (aiData.isMonopoly) score += 30;
    
    // Rule: P/E < 10 (+20 Pts)
    if (pe < 10) score += 20;

    // 3. VERDICT ENGINE
    let verdict = TitanVerdict.AVOID;
    if (!firewallPassed) {
      verdict = TitanVerdict.DESTROY;
      score = 0; // Destroyed assets carry zero value
    } else if (score >= 80) {
      verdict = TitanVerdict.GOD_MODE_BUY;
    } else if (score >= 50) {
      verdict = TitanVerdict.BUY;
    } else if (score >= 30) {
      verdict = TitanVerdict.HOLD;
    }

    if (aiData.additionalFlags) redFlags.push(...aiData.additionalFlags);

    return {
      stock: { ...stock, pe, roe, dividendYield: divYield, debtToEquity },
      score,
      riskGrade: aiData.riskGrade,
      verdict,
      valuationStatus: pe < 15 ? "Sosta" : pe > 25 ? "Dami" : "Fair",
      moatType: aiData.moatType,
      firstPrinciplesReasoning: aiData.reasoning,
      redFlags,
      banglaAdvice: aiData.banglaAdvice,
      lossPreventionFirewall: firewallPassed
    };
  });
}

/**
 * BATCH SCANNER: Extracts metrics from text/files
 */
export async function parseRawFiles(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
    const prompt = `
        TITAN FORENSIC DATA PARSER:
        Extract every Stock from this data.
        Fields: ticker, ltp (current price), eps, nav, debt, directorHolding (%), dividendPercent (%).
        If any metric like P/E or Yield is mentioned, focus on the raw EPS and Div% instead.
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
