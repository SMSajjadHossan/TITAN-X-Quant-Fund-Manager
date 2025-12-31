import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

function safeJsonParse(text: string | undefined, fallback: any = []) {
  if (!text) return fallback;
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    if (text.trim().startsWith("[") && !text.trim().endsWith("]")) {
      try { return JSON.parse(text.trim() + ']'); } catch { return fallback; }
    }
    return fallback;
  }
}

export async function analyzeStocks(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `You are TITAN-X v11.0, a Quant Fund Manager. 
Analyze assets for: 
1. Bucket (Value/Growth/Defensive/Speculative)
2. Moat Strength
3. Bengal Logic (কেন কিনবো?)
4. Specific Allocation Suggestion (e.g. 5%, 10%, 15% of total capital)
5. Yield estimation if dividend isn't clear.
Return STRICT JSON array.`;

  const prompt = `Analyze:
${stocks.map(s => `Ticker: ${s.ticker}, Price: ${s.ltp}, EPS: ${s.eps}, NAV: ${s.nav}, Debt: ${s.debt}, Sponsor: ${s.directorHolding}%`).join('\n')}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
              reasoning: { type: Type.STRING },
              riskGrade: { type: Type.NUMBER },
              banglaAdvice: { type: Type.STRING },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              bucket: { type: Type.STRING },
              allocation: { type: Type.STRING },
              estimatedYield: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const aiResults = safeJsonParse(response.text);

    return stocks.map((s) => {
      const aiMatch = aiResults.find((r: any) => r.ticker === s.ticker) || {
        moatType: "General",
        reasoning: "Calculating...",
        riskGrade: 5,
        banglaAdvice: "অপেক্ষা করুন।",
        redFlags: [],
        bucket: "Unknown",
        allocation: "0%",
        estimatedYield: 0
      };

      const pe = s.eps > 0 ? s.ltp / s.eps : 0;
      const roe = s.nav > 0 ? (s.eps / s.nav) * 100 : 0;
      const d2e = s.nav > 0 ? s.debt / (s.nav * 100) : 0;
      const intrinsicValue = (s.eps > 0 && s.nav > 0) ? Math.sqrt(22.5 * s.eps * s.nav) : 0;
      
      let debtRisk: "LOW" | "MEDIUM" | "HIGH" | "TOXIC" = "LOW";
      if (d2e > 1.2) debtRisk = "TOXIC";
      else if (d2e > 0.8) debtRisk = "HIGH";
      else if (d2e > 0.4) debtRisk = "MEDIUM";

      let score = 0;
      let firewallFailed = false;
      if (s.eps <= 0 || s.directorHolding < 20 || d2e > 1.5) firewallFailed = true;

      if (!firewallFailed) {
        score += (roe > 20 ? 40 : roe > 15 ? 30 : 15);
        score += (pe > 0 && pe < 12 ? 30 : pe < 18 ? 15 : 5);
        score += (s.directorHolding > 50 ? 20 : 10);
        score += (debtRisk === "LOW" ? 10 : 0);
      }

      let verdict = TitanVerdict.AVOID;
      if (firewallFailed) verdict = TitanVerdict.DESTROY;
      else if (score >= 80) verdict = TitanVerdict.GOD_MODE_BUY;
      else if (score >= 60) verdict = TitanVerdict.BUY;
      else if (score >= 40) verdict = TitanVerdict.HOLD;

      return {
        stock: s,
        score,
        verdict,
        moatType: aiMatch.moatType,
        reasoning: aiMatch.reasoning,
        banglaAdvice: aiMatch.banglaAdvice,
        riskGrade: aiMatch.riskGrade,
        redFlags: aiMatch.redFlags || [],
        intrinsicValue,
        fairValue: intrinsicValue > 0 ? intrinsicValue : s.ltp * 0.9,
        yield: s.dividend ? (s.dividend / s.ltp) * 100 : (aiMatch.estimatedYield || 0),
        allocation: aiMatch.allocation,
        bucket: aiMatch.bucket,
        debtRisk,
        metrics: { pe, roe, debtToEquity: d2e }
      };
    });
  } catch (err) {
    console.error(err);
    throw new Error("Analysis failed. Try fewer stocks.");
  }
}

export async function parseStockFile(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
  const prompt = `Convert raw data to JSON. Include: ticker, ltp, eps, nav, debt, directorHolding.`;
  const contents = isText ? { parts: [{ text: prompt }, { text: fileData }] } : { parts: [{ text: prompt }, { inlineData: { data: fileData.split(',')[1] || fileData, mimeType } }] };

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
            directorHolding: { type: Type.NUMBER }
          }
        }
      }
    }
  });
  return safeJsonParse(response.text);
}