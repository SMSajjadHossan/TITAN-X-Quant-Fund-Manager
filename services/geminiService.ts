
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X BATCH FORENSIC ENGINE v7.0
 * Strictly implements the "TITAN Master Checklist":
 * - 50 Pts: Zero Debt (Safety First)
 * - 30 Pts: Monopoly/Moat (Survival)
 * - 20 Pts: P/E < 10 (Value)
 * 
 * Firewall Protocol:
 * - Sponsor < 15%: DESTROY
 * - Category 'Z': DESTROY
 * - EPS <= 0: DESTROY
 * - Debt/Equity > 1.0: DESTROY
 */
export async function analyzeStocksWithGemini(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `You are TITAN-X, the world's most advanced Quantitative Fund Manager.
  Persona: Brutal Critic, Fiduciary Guardian (protecting 30 Lakh BDT life savings), First-Principles Thinker.
  
  Guidelines for Decision:
  - P/E < 15 is 'Sosta', P/E > 25 is 'Dami'.
  - Sponsor Holding MUST be > 30% for trust.
  - Foreign/Institute holding is a sign of 'Institutional Trust'.
  - ROE > 15% is efficient.
  - Category Z (Junk) must be DESTROYED immediately.
  
  Bengali Context: You are speaking to someone going to the USA, needing 'Buy and Forget' stocks.
  Target 'Hira' (Gems) like BATBC, Jamuna Oil, GP.`;

  const prompt = `
    AUDIT TARGET LIST:
    ${stocks.map(s => `
      Ticker: ${s.ticker} | Category: ${s.category || 'A'} | LTP: ${s.ltp} | EPS: ${s.eps} | NAV: ${s.nav} | Debt: ${s.debt} | Sponsor%: ${s.directorHolding}% | Foreign%: ${s.foreignHolding || 0}% | Div%: ${s.dividendPercent}% | NOCFPS: ${s.nocfps || 'N/A'}
    `).join('\n')}
    
    TASK:
    Analyze line-by-line. For each stock, provide:
    1. Moat Type (Monopoly, Oligopoly, or Commodity).
    2. isMonopoly (Boolean).
    3. Reasoning: Why this stock survives for 10 years (First Principles).
    4. Risk Grade (1-10, where 10 is Gambling).
    5. Bangla Advice: Brutal 1-line verdict based on the checklist.
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
    const aiData = aiResults[index] || { moatType: "Unknown", isMonopoly: false, reasoning: "N/A", riskGrade: 5, banglaAdvice: "Audit Error." };
    
    // 1. Data Sanitization & Auto-Calculations
    const ltp = stock.ltp || 0;
    const eps = stock.eps || 0;
    const nav = stock.nav || 1;
    const debt = stock.debt || 0;
    const sponsor = stock.directorHolding || 0;
    const category = stock.category?.toUpperCase() || 'A';
    
    const pe = eps > 0 ? ltp / eps : 999;
    const roe = (eps / nav) * 100;
    // BD Dividend Calc: (FaceValue 10 * Div%) / LTP
    const divYield = stock.dividendPercent ? (10 * (stock.dividendPercent / 100) * 100) / ltp : (stock.dividendYield || 0);
    const debtToEquity = debt / nav;

    // 2. THE TITAN GOD-MODE FIREWALL (DETERMINISTIC)
    let score = 0;
    let firewallPassed = true;
    const redFlags: string[] = [];

    if (category === 'Z') {
      firewallPassed = false;
      redFlags.push("JUNK STATUS: Z Category detected. Never touch gambling assets.");
    }
    
    if (sponsor < 15) {
      firewallPassed = false;
      redFlags.push("TERMINAL OWNERSHIP: Sponsor < 15%. This is a public dumping ground.");
    }

    if (debtToEquity > 1.0) {
      firewallPassed = false;
      redFlags.push("DEBT TRAP: Liabilities exceed Net Asset value. Lethal risk.");
    }

    if (eps <= 0) {
      firewallPassed = false;
      redFlags.push("CASH BURNER: Negative or zero EPS. This company destroys capital.");
    }

    // 3. TITAN SCORING ENGINE (50-30-20 WEIGHTING)
    if (firewallPassed) {
      // 50 Points: Zero Debt
      if (debt === 0) score += 50;
      else if (debtToEquity < 0.3) score += 20;

      // 30 Points: Monopoly
      if (aiData.isMonopoly) score += 30;

      // 20 Points: P/E < 10
      if (pe < 10) score += 20;
      else if (pe < 15) score += 10;
    }

    // 4. VERDICT
    let verdict = TitanVerdict.AVOID;
    if (!firewallPassed) {
      verdict = TitanVerdict.DESTROY;
      score = 0;
    } else if (score >= 80) {
      verdict = TitanVerdict.GOD_MODE_BUY;
    } else if (score >= 50) {
      verdict = TitanVerdict.BUY;
    } else if (score >= 30) {
      verdict = TitanVerdict.HOLD;
    }

    if (aiData.additionalFlags) redFlags.push(...aiData.additionalFlags);

    return {
      stock: { ...stock, pe, roe, dividendYield: divYield, debtToEquity, category },
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
 * FULL SUITE DATA EXTRACTOR
 */
export async function parseRawFiles(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
    const prompt = `
        TITAN FORENSIC DATA PARSER:
        Extract every Stock from the data. 
        Fields: ticker, category (A/B/Z/N), ltp, eps, nav, debt, directorHolding (sponsor %), foreignHolding (%), dividendPercent (%), nocfps, marketCap, freeFloat, reserveSurplus.
        
        Rules:
        1. Auto-fill defaults (e.g. Nav 10) if missing.
        2. Clean numeric strings (remove commas, %).
        3. Return JSON array.
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
                        category: { type: Type.STRING },
                        ltp: { type: Type.NUMBER },
                        eps: { type: Type.NUMBER },
                        nav: { type: Type.NUMBER },
                        debt: { type: Type.NUMBER },
                        directorHolding: { type: Type.NUMBER },
                        foreignHolding: { type: Type.NUMBER },
                        dividendPercent: { type: Type.NUMBER },
                        nocfps: { type: Type.NUMBER },
                        marketCap: { type: Type.NUMBER },
                        freeFloat: { type: Type.NUMBER },
                        reserveSurplus: { type: Type.NUMBER }
                    },
                    required: ["ticker", "ltp", "eps"]
                }
            }
        }
    });

    return JSON.parse(response.text || "[]");
}
