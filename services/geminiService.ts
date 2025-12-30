
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * TITAN-X BRAIN: Analyzes stock using strict 50-30-20 rule.
 */
export async function analyzeStockWithGemini(stock: StockData): Promise<TitanAnalysis> {
  const ltp = stock.ltp || 0;
  const eps = stock.eps || 0;
  const nav = stock.nav || 1;
  const debt = stock.debt || 0;
  
  // Data Sanitization: Auto-fill missing metrics
  const pe = stock.pe || (eps !== 0 ? ltp / eps : 999);
  const roe = stock.roe || (nav !== 0 ? (eps / nav) * 100 : 0);
  const faceValue = stock.faceValue || 10;
  const divYield = stock.dividendYield || (stock.dividendPercent ? (faceValue * (stock.dividendPercent / 100) * 100) / ltp : 0);

  // STRICT WEIGHTING PROTOCOL (100 Points Total)
  let score = 0;
  
  // 1. Debt Neutralization (50 Points)
  if (debt === 0) score += 50;
  else if (debt < (nav * 0.1)) score += 30;
  else if (debt < (nav * 0.5)) score += 10;

  // 2. Valuation Efficiency (20 Points)
  if (pe < 10) score += 20;
  else if (pe < 15) score += 10;

  const systemInstruction = `You are TITAN, the world's most advanced Quantitative Fund Manager. 
  Persona: Brutal, First-Principles Thinker, Fiduciary Guardian.
  Protocol: 
  - Analyze Monopoly/Oligopoly status (Weight 30 pts).
  - Ownership Integrity (Director > 30% is target).
  - Risk Grade: 1 (Safe) to 10 (Gambling).
  - Critically evaluate DSE (Dhaka Stock Exchange) companies. 
  - Be an aggressive critic. If debt is high (>1.0 Debt/Equity), flag as CRITICAL and suggest AVOID/DESTROY.`;

  const prompt = `
    FORENSIC AUDIT REQUEST:
    Ticker: ${stock.ticker}
    LTP: ${ltp} | EPS: ${eps} | NAV: ${nav} | Debt: ${debt}
    P/E: ${pe.toFixed(2)} | ROE: ${roe.toFixed(2)}% | Div Yield: ${divYield.toFixed(2)}%
    Director Holding: ${stock.directorHolding}%
    Sector: ${stock.sector || 'Unknown'}

    REQUIRED OUTPUT:
    1. Moat Type: (Monopoly/Oligopoly/Commodity).
    2. isMonopoly: Boolean.
    3. Reasoning: First-principles survivor explanation (10-year view).
    4. Red Flags: Specific vulnerabilities.
    5. Bangla Advice: One brutal, direct line in Bengali.
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
          riskGrade: { type: Type.NUMBER },
          banglaAdvice: { type: Type.STRING }
        },
        required: ["moatType", "isMonopoly", "reasoning", "redFlags", "riskGrade", "banglaAdvice"]
      }
    }
  });

  const aiData = JSON.parse(response.text || "{}");
  
  // 3. Monopoly/Moat Weighting (30 Points)
  if (aiData.isMonopoly) score += 30;
  
  let finalVerdict = TitanVerdict.AVOID;
  if (score >= 80 && divYield >= 7 && (stock.directorHolding || 0) >= 30) {
    finalVerdict = TitanVerdict.GOD_MODE_BUY;
  } else if (score >= 60) {
    finalVerdict = TitanVerdict.BUY;
  } else if (score >= 40) {
    finalVerdict = TitanVerdict.HOLD;
  } else {
    finalVerdict = TitanVerdict.DESTROY;
  }

  if (debt > nav || (stock.directorHolding && stock.directorHolding < 15)) {
    finalVerdict = TitanVerdict.DESTROY;
  }

  return {
    stock: { ...stock, pe, roe, dividendYield: divYield },
    score,
    riskGrade: aiData.riskGrade || 5,
    verdict: finalVerdict,
    valuationStatus: pe < 15 ? "Sosta" : pe > 25 ? "Dami" : "Fair",
    moatType: aiData.moatType,
    firstPrinciplesReasoning: aiData.reasoning,
    redFlags: aiData.redFlags,
    banglaAdvice: aiData.banglaAdvice
  };
}

/**
 * MULTIMODAL & TEXT EXTRACTOR
 * Processes raw text for CSV/TXT or base64 for PDF/Images.
 */
export async function parseRawFiles(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
    const prompt = `
        LINE-BY-LINE FORENSIC DATA EXTRACTION:
        Analyze the provided ${isText ? 'text data' : 'document/image'} carefully. 
        Identify and extract ALL stock entries. 
        Focus on: Ticker (Trading Code), LTP (Price), EPS, NAV, Total Debt, Director/Sponsor Holding (%), and Dividend %.
        Look for DSE-style data formats.
        Return a clean JSON array.
    `;

    const contents: any = isText 
        ? { parts: [{ text: prompt }, { text: fileData }] }
        : { parts: [{ text: prompt }, { inlineData: { data: fileData.includes(',') ? fileData.split(',')[1] : fileData, mimeType } }] };

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
                        dividendPercent: { type: Type.NUMBER },
                        sector: { type: Type.STRING }
                    },
                    required: ["ticker", "ltp", "eps"]
                }
            }
        }
    });

    const parsed = JSON.parse(response.text || "[]");
    return parsed.map((s: any) => ({
        ...s,
        ltp: s.ltp || 0,
        eps: s.eps || 0,
        nav: s.nav || 0,
        debt: s.debt || 0,
        directorHolding: s.directorHolding || 0
    }));
}
