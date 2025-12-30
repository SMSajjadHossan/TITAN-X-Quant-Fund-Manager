
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function analyzeStockWithGemini(stock: StockData): Promise<TitanAnalysis> {
  // Quantitative logic (Local)
  let pe = stock.pe || (stock.eps !== 0 ? stock.ltp / stock.eps : 0);
  let roe = stock.roe || (stock.nav !== 0 ? (stock.eps / stock.nav) * 100 : 0);
  let dte = stock.debtToEquity || (stock.equity && stock.equity !== 0 ? stock.debt / stock.equity : 0.5); // Default if missing
  
  let score = 0;
  if (dte === 0) score += 50;
  else if (dte < 0.5) score += 20;
  
  if (pe < 10) score += 20;
  else if (pe < 15) score += 10;
  
  // We'll use Gemini to refine the score and provide reasoning
  const prompt = `
    Analyze this stock data for TITAN-X Quantitative Fund.
    Ticker: ${stock.ticker}
    Sector: ${stock.sector || 'Unknown'}
    LTP: ${stock.ltp}
    EPS: ${stock.eps}
    NAV: ${stock.nav}
    Debt: ${stock.debt}
    Director Holding: ${stock.directorHolding}%
    
    Local Metrics:
    P/E: ${pe.toFixed(2)}
    ROE: ${roe.toFixed(2)}%
    Debt/Equity (Est): ${dte.toFixed(2)}
    
    Task:
    1. Determine the Moat (Monopoly/Oligopoly/Commodity).
    2. Provide a "First Principles" explanation for why this stock will survive the next 10 years.
    3. Identify Red Flags (Debt, low governance, etc.).
    4. Provide a brutal critique. Be a first-principles thinker.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          moatType: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          isMonopoly: { type: Type.BOOLEAN },
          riskGrade: { type: Type.NUMBER },
          suggestedVerdict: { type: Type.STRING }
        },
        required: ["moatType", "reasoning", "redFlags", "isMonopoly", "riskGrade", "suggestedVerdict"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  // Refine local score with AI insights
  if (data.isMonopoly) score += 30;
  
  let finalVerdict = TitanVerdict.AVOID;
  if (score >= 80) finalVerdict = TitanVerdict.GOD_MODE_BUY;
  else if (score >= 60) finalVerdict = TitanVerdict.BUY;
  else if (score >= 40) finalVerdict = TitanVerdict.HOLD;
  else finalVerdict = TitanVerdict.DESTROY;

  return {
    stock: { ...stock, pe, roe, debtToEquity: dte },
    score,
    riskGrade: data.riskGrade || 5,
    verdict: finalVerdict,
    valuationStatus: pe < 15 ? "Sosta" : pe > 25 ? "Dami" : "Fair",
    moatType: data.moatType,
    firstPrinciplesReasoning: data.reasoning,
    redFlags: data.redFlags
  };
}

export async function parseRawData(raw: string): Promise<StockData[]> {
    const prompt = `
        Parse the following raw stock data into a clean JSON array of StockData.
        Data format might be unstructured. Try to find:
        - Trading Code/Ticker
        - LTP (Price)
        - EPS (Earnings Per Share)
        - NAV (Net Asset Value)
        - Debt
        - Director/Sponsor %
        
        Raw Data:
        ${raw.slice(0, 4000)} // Truncate to avoid token limits
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
                        sector: { type: Type.STRING }
                    },
                    required: ["ticker", "ltp", "eps", "nav", "debt"]
                }
            }
        }
    });

    return JSON.parse(response.text || "[]");
}
