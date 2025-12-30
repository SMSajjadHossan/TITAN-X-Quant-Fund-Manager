
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X FORENSIC ENGINE: Strict First-Principles Analysis
 */
export async function analyzeStockWithGemini(stock: StockData): Promise<TitanAnalysis> {
  const ltp = stock.ltp || 0;
  const eps = stock.eps || 0;
  const nav = stock.nav || 1;
  const debt = stock.debt || 0;
  const director = stock.directorHolding || 0;
  
  // 1. Data Sanitization & Auto-Calculation
  const pe = eps !== 0 ? ltp / eps : 999;
  const roe = nav !== 0 ? (eps / nav) * 100 : 0;
  const debtToEquity = debt / (nav || 1); 
  const divYield = stock.dividendPercent ? (10 * (stock.dividendPercent / 100) * 100) / ltp : (stock.dividendYield || 0);

  // 2. TITAN WEIGHTING PROTOCOL (100 Points Total)
  let score = 0;
  let firewallPassed = true;
  const redFlags: string[] = [];

  // LOSS PREVENTION FIREWALL (NON-NEGOTIABLE)
  if (debtToEquity > 1.0) {
    firewallPassed = false;
    redFlags.push("CRITICAL DEBT: Liability exceeds Assets. Terminal risk.");
  }
  if (director < 15) {
    firewallPassed = false;
    redFlags.push("OWNERSHIP FRAUD: Management has no skin in the game.");
  }
  if (eps <= 0) {
    firewallPassed = false;
    redFlags.push("NEGATIVE EPS: Company is burning capital, not compounding it.");
  }

  // Scoring Logic if Firewall is standing
  if (debt === 0) score += 50;
  else if (debtToEquity < 0.3) score += 30;
  else if (debtToEquity < 0.5) score += 10;

  if (pe < 10) score += 20;
  else if (pe < 15) score += 10;

  const systemInstruction = `You are TITAN-X, a brutal Quantitative Fiduciary. 
  Persona: Elon Musk + Warren Buffett + Swiss Private Banker.
  Instruction: 
  - If a stock has debt or low governance, destroy it.
  - Evaluate Monopoly/Oligopoly status (30 points weight).
  - Risk Grade: 1 (Safe) to 10 (Gambling).
  - Provide a "First Principles" survival explanation for 10 years.
  - Provide a brutal 1-line Bengali advice.`;

  const prompt = `
    AUDIT TARGET: ${stock.ticker}
    METRICS:
    Price: ${ltp} | EPS: ${eps} | NAV: ${nav} | Debt: ${debt} | Dir%: ${director}%
    P/E: ${pe.toFixed(2)} | ROE: ${roe.toFixed(2)}% | Yield: ${divYield.toFixed(2)}%
    
    TASK:
    1. Confirm Moat (Monopoly/Oligopoly/Commodity).
    2. isMonopoly: Boolean.
    3. Reasoning: First-principles explanation.
    4. Bangla Advice: Direct, brutal, and analytical.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          moatType: { type: Type.STRING },
          isMonopoly: { type: Type.BOOLEAN },
          reasoning: { type: Type.STRING },
          riskGrade: { type: Type.NUMBER },
          banglaAdvice: { type: Type.STRING },
          additionalFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["moatType", "isMonopoly", "reasoning", "riskGrade", "banglaAdvice"]
      }
    }
  });

  const aiData = JSON.parse(response.text || "{}");
  if (aiData.isMonopoly) score += 30;
  if (aiData.additionalFlags) redFlags.push(...aiData.additionalFlags);

  // FINAL VERDICT
  let verdict = TitanVerdict.AVOID;
  if (!firewallPassed) {
    verdict = TitanVerdict.DESTROY;
    score = Math.min(score, 20); // Slash score for safety failure
  } else if (score >= 80 && divYield >= 7 && director >= 30) {
    verdict = TitanVerdict.GOD_MODE_BUY;
  } else if (score >= 60) {
    verdict = TitanVerdict.BUY;
  } else if (score >= 40) {
    verdict = TitanVerdict.HOLD;
  }

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
}

/**
 * DEEP SCANNER: Multimodal extraction from any file format
 */
export async function parseRawFiles(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
    const prompt = `
        TITAN FORENSIC SCAN: 
        Extract every Stock entry from this ${isText ? 'text data' : 'document'}.
        Required Fields: ticker, ltp (price), eps, nav, debt, directorHolding (%), dividendPercent (%).
        Ignore header noise. Focus on line-by-line accuracy.
        If a value is missing, return 0. 
        Format as JSON array.
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
