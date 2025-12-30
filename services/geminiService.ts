
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function analyzeStockWithGemini(stock: StockData): Promise<TitanAnalysis> {
  // 1. Data Sanitization & Auto-Calculation
  const ltp = stock.ltp || 0;
  const eps = stock.eps || 0;
  const nav = stock.nav || 1;
  const debt = stock.debt || 0;
  
  const pe = stock.pe || (eps !== 0 ? ltp / eps : 999);
  const roe = stock.roe || (nav !== 0 ? (eps / nav) * 100 : 0);
  
  // Calculate Yield: (Face Value * Dividend %) / LTP
  const faceValue = stock.faceValue || 10;
  const divYield = stock.dividendYield || (stock.dividendPercent ? (faceValue * (stock.dividendPercent / 100) * 100) / ltp : 0);

  // 2. Strict Weighting Protocol
  let score = 0;
  
  // Weight 1: Debt (50 Points)
  if (debt === 0) score += 50;
  else if (debt < (nav * 0.1)) score += 30; // Very low debt
  else if (debt < (nav * 0.5)) score += 10;
  
  // Weight 2: P/E < 10 (20 Points)
  if (pe < 10) score += 20;
  else if (pe < 15) score += 10;

  // Use Gemini for the "The Moat Audit" (Weight 3: Monopoly = 30 Points)
  const systemInstruction = `You are TITAN, the world's most advanced Quantitative Fund Manager. 
  You combine Warren Buffett's margin of safety, Charlie Munger's mental models, and Elon Musk's first-principles thinking.
  Your mission: Find "Wealth Compounders" and eliminate "Capital Destroyers".
  Be a brutal critic. If a stock has debt, low governance, or high P/E, destroy it. Protect the capital at all costs.
  Avoid optimism. Use First Principles Thinking.`;

  const prompt = `
    Analyze this stock for TITAN-X protocol:
    Ticker: ${stock.ticker}
    LTP: ${ltp} | EPS: ${eps} | NAV: ${nav} | Debt: ${debt}
    P/E: ${pe.toFixed(2)} | ROE: ${roe.toFixed(2)}% | Div Yield: ${divYield.toFixed(2)}%
    Director Holding: ${stock.directorHolding}%
    Sector: ${stock.sector || 'Unknown'}

    Protocol Requirements:
    1. Moat Audit: Is this a Monopoly/Oligopoly?
    2. Ownership Integrity: Is Director % > 30%?
    3. Financial Forensic: Flag as CRITICAL if Debt/Equity > 1.0.
    4. 10-Year Survival: Give a "First Principles" explanation.
    5. Emotional Filter: Give one line of brutal Bengali advice (Bangla).
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
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskGrade: { type: Type.NUMBER, description: "1-10 scale" },
          banglaAdvice: { type: Type.STRING }
        },
        required: ["moatType", "isMonopoly", "reasoning", "redFlags", "riskGrade", "banglaAdvice"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  // Final Score refinement
  if (data.isMonopoly) score += 30;
  
  // Verdict Logic
  let finalVerdict = TitanVerdict.AVOID;
  if (score >= 80) finalVerdict = TitanVerdict.GOD_MODE_BUY;
  else if (score >= 60 && divYield >= 7 && stock.directorHolding >= 30) finalVerdict = TitanVerdict.BUY;
  else if (score >= 40) finalVerdict = TitanVerdict.HOLD;
  else if (debt > nav) finalVerdict = TitanVerdict.DESTROY;

  return {
    stock: { ...stock, pe, roe, dividendYield: divYield },
    score,
    riskGrade: data.riskGrade,
    verdict: finalVerdict,
    valuationStatus: pe < 15 ? "Sosta" : pe > 25 ? "Dami" : "Fair",
    moatType: data.moatType,
    firstPrinciplesReasoning: data.reasoning,
    redFlags: data.redFlags,
    banglaAdvice: data.banglaAdvice
  };
}

export async function parseRawData(raw: string): Promise<StockData[]> {
    const prompt = `
        Parse this raw data (DSE/Stock reports) into JSON StockData array.
        Extract: ticker, ltp (price), eps, nav, debt, directorHolding (%), sector.
        If any value like P/E is missing, ignore it for now as the sanitizer will handle it.
        Handle multi-line text blocks.
        
        Raw Content:
        ${raw.slice(0, 5000)}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
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
                        dividendPercent: { type: Type.NUMBER },
                        sector: { type: Type.STRING }
                    },
                    required: ["ticker", "ltp", "eps", "nav", "debt"]
                }
            }
        }
    });

    return JSON.parse(response.text || "[]");
}
