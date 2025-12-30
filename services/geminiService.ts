
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X BATCH FORENSIC ENGINE v8.0 - DOMINATOR MODE
 * 
 * Logic Weightage:
 * - 50 Pts: Zero Debt (Safety)
 * - 30 Pts: Monopoly/Oligopoly Moat (Business Quality)
 * - 20 Pts: P/E < 10 (Valuation)
 * 
 * Firewall Protocol:
 * - Category 'Z' -> Auto-Destroy
 * - Sponsor < 15% -> Auto-Destroy
 * - Debt/Equity > 1.0 -> Auto-Destroy
 * - EPS <= 0 -> Auto-Destroy
 */
export async function analyzeStocksWithGemini(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `You are TITAN, the Grand Strategist and Empire Architect. 
  You use Elon Musk's First Principles, Warren Buffett's Margin of Safety, and Sun Tzu's Strategic Victory.
  
  Persona: Brutal Critic. If a stock is trash, destroy it. Protect the capital at all costs.
  
  Checklist:
  - P/E < 15 is 'Sosta', P/E > 25 is 'Dami'.
  - Sponsor Holding MUST be > 30% for 'God Mode'.
  - Category Z is an instant terminal failure.
  - No Emotion. Protect the user's life savings for their USA journey.`;

  const prompt = `
    AUDIT TARGET LIST:
    ${stocks.map(s => `
      Ticker: ${s.ticker} | Category: ${s.category || 'A'} | LTP: ${s.ltp} | EPS: ${s.eps} | NAV: ${s.nav} | Debt: ${s.debt} | Sponsor%: ${s.directorHolding}% | Div%: ${s.dividendPercent}% | NOCFPS: ${s.nocfps || 'N/A'}
    `).join('\n')}
    
    TASK:
    Analyze line-by-line using First Principles. 
    1. moatType: Monopoly, Oligopoly, or Commodity.
    2. isMonopoly: Boolean.
    3. reasoning: A "First Principles" explanation for why this survives 10 years.
    4. riskGrade: 1-10 (1 is Swiss Bank, 10 is Gambling).
    5. banglaAdvice: A brutal one-line command in Bengali.
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
    const aiData = aiResults[index] || { moatType: "Unknown", isMonopoly: false, reasoning: "Audit compromised.", riskGrade: 10, banglaAdvice: "বিপদজনক শেয়ার।" };
    
    // Auto-Sanitization
    const ltp = stock.ltp || 0;
    const eps = stock.eps || 0;
    const nav = stock.nav || 1;
    const debt = stock.debt || 0;
    const sponsor = stock.directorHolding || 0;
    const category = stock.category?.toUpperCase() || 'A';
    
    const pe = eps > 0 ? ltp / eps : 999;
    const roe = (eps / nav) * 100;
    const divYield = stock.dividendPercent ? (10 * (stock.dividendPercent / 100) * 100) / ltp : (stock.dividendYield || 0);
    const debtToEquity = debt / nav;

    // TITAN FIREWALLS (TERMINAL OVERRIDES)
    let score = 0;
    let firewallPassed = true;
    const redFlags: string[] = [];

    if (category === 'Z') {
      firewallPassed = false;
      redFlags.push("TERMINAL ERROR: Z Category Asset. This is a scam trap.");
    }
    if (sponsor < 15) {
      firewallPassed = false;
      redFlags.push("OWNERSHIP FAILURE: Sponsor < 15%. Public dump detected.");
    }
    if (debtToEquity > 1.0) {
      firewallPassed = false;
      redFlags.push("DEBT OVERLOAD: Company belongs to the lenders. Bankruptcy risk.");
    }
    if (eps <= 0) {
      firewallPassed = false;
      redFlags.push("ZERO PROFIT: Capital destroyer. No income generation.");
    }
    if (stock.nocfps && stock.nocfps <= 0 && eps > 0) {
      redFlags.push("FRAUD RISK: Positive EPS but negative Cash Flow (NOCFPS).");
    }

    // SCORING ENGINE (50-30-20 WEIGHTING)
    if (firewallPassed) {
      // 50 Points: Debt
      if (debt === 0) score += 50;
      else if (debtToEquity < 0.2) score += 20;

      // 30 Points: Moat
      if (aiData.isMonopoly) score += 30;

      // 20 Points: Value
      if (pe < 10) score += 20;
      else if (pe < 15) score += 10;
    }

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
 * DEEP DATA EXTRACTION (Gemini Flash)
 */
export async function parseRawFiles(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
    const prompt = `
        TITAN FORENSIC SCANNER:
        Extract metrics from this stock data: ticker, category (A/B/Z), ltp, eps, nav, debt, directorHolding (sponsor %), foreignHolding (%), dividendPercent (%), nocfps.
        - Return strictly a JSON array.
        - Clean all numbers (remove commas/symbols).
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
                        nocfps: { type: Type.NUMBER }
                    },
                    required: ["ticker", "ltp", "eps"]
                }
            }
        }
    });

    return JSON.parse(response.text || "[]");
}
