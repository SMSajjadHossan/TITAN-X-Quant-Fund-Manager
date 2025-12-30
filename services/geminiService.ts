
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X BATCH FORENSIC ENGINE
 * Analyzes multiple stocks in one call to optimize quota and speed.
 * Strictly enforces Capital Preservation Firewall.
 */
export async function analyzeStocksWithGemini(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `You are TITAN-X, a brutal Quantitative Fiduciary. 
  Persona: Elon Musk + Warren Buffett + Swiss Private Banker.
  Instruction: 
  - Evaluate Monopoly/Oligopoly status (30 points weight).
  - Risk Grade: 1 (Safe) to 10 (Gambling).
  - Provide a "First Principles" survival explanation for 10 years.
  - Provide a brutal 1-line Bengali advice for each stock.
  - BE A BRUTAL CRITIC. If a stock has high debt or low governance, you must suggest DESTROY.
  - You must return an array of analysis objects matching the input order.`;

  const prompt = `
    AUDIT TARGET LIST:
    ${stocks.map(s => `
      Ticker: ${s.ticker} | Price: ${s.ltp} | EPS: ${s.eps} | NAV: ${s.nav} | Debt: ${s.debt} | Dir%: ${s.directorHolding}%
    `).join('\n')}
    
    TASK:
    For each stock, provide:
    1. Moat Type (Monopoly, Oligopoly, or Commodity).
    2. isMonopoly (Boolean).
    3. Reasoning (First-principles explaination why it will survive 10 years).
    4. Risk Grade (1-10, where 10 is pure gambling).
    5. Bangla Advice (A sharp, one-line verdict in Bengali).
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
  
  // MAP AI RESULTS BACK TO STOCK DATA + ENFORCE HARD FIREWALL
  return stocks.map((stock, index) => {
    const aiData = aiResults[index] || { moatType: "Unknown", isMonopoly: false, reasoning: "N/A", riskGrade: 5, banglaAdvice: "Data missing." };
    
    const ltp = stock.ltp || 0;
    const eps = stock.eps || 0;
    const nav = stock.nav || 1;
    const debt = stock.debt || 0;
    const director = stock.directorHolding || 0;
    
    const pe = eps !== 0 ? ltp / eps : 999;
    const roe = nav !== 0 ? (eps / nav) * 100 : 0;
    const debtToEquity = debt / (nav || 1); 
    const divYield = stock.dividendPercent ? (10 * (stock.dividendPercent / 100) * 100) / ltp : (stock.dividendYield || 0);

    let score = 0;
    let firewallPassed = true;
    const redFlags: string[] = [];

    // --- LOSS PREVENTION FIREWALL (STRICT DETERMINISTIC RULES) ---
    
    // RULE 1: DEBT LIMIT
    if (debtToEquity > 1.0) {
      firewallPassed = false;
      redFlags.push("TERMINAL DEBT: Debt-to-Equity > 1.0. This company is a walking corpse.");
    }
    
    // RULE 2: MINIMUM OWNERSHIP (DIRECTOR HOLDING < 15%)
    if (director < 15) {
      firewallPassed = false;
      redFlags.push("CRITICAL OWNERSHIP FAILURE: Director holding < 15%. This is a shell company trap. Management has zero confidence.");
    }
    
    // RULE 3: PROFITABILITY
    if (eps <= 0) {
      firewallPassed = false;
      redFlags.push("NEGATIVE EPS: Company is losing money every second. Capital destroyer.");
    }

    // Scoring Logic
    if (firewallPassed) {
      // 1. Efficiency
      if (roe > 15) score += 20;
      
      // 2. Safety (Debt)
      if (debt === 0) score += 30;
      else if (debtToEquity < 0.3) score += 15;
      
      // 3. Value
      if (pe < 10) score += 20;
      else if (pe < 15) score += 10;
      
      // 4. Moat
      if (aiData.isMonopoly) score += 30;
    }

    if (aiData.additionalFlags) redFlags.push(...aiData.additionalFlags);

    // FINAL VERDICT DETERMINATION
    let verdict = TitanVerdict.AVOID;
    if (!firewallPassed) {
      verdict = TitanVerdict.DESTROY;
      score = Math.min(score, 10); // Massive score penalty for safety breach
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
  });
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
        Note: If a value like 'Sponsor/Director' is shown as a percentage, extract only the number.
        Return JSON array.
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
