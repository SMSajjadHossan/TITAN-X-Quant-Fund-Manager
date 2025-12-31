import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Robust JSON parser that handles markdown artifacts and potential truncation.
 */
function safeJsonParse(text: string | undefined, fallback: any = []) {
  if (!text) return fallback;
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("Parsing Error. Retrying with basic array closure...", e);
    const trimmed = text.trim();
    if (trimmed.startsWith("[") && !trimmed.endsWith("]")) {
      try {
        return JSON.parse(trimmed + ']');
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

export async function analyzeStocks(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `You are TITAN-X v11.0, the world's most advanced Quantitative Fund Manager. 
Your goal is to identify "God-Mode" compounders and avoid "Capital Destroyers".
For each stock, provide:
1. "bucket": (Growth, Value, Dividend, Speculative, or Blue-chip)
2. "banglaAdvice": Deep logical reason in Bangla (কেন কিনবো? - Keno?)
3. "allocation": Recommended % of total capital (e.g., 2%, 5%, 10%)
4. "estimatedYield": Annual yield % based on sector and historical patterns if dividend is missing.
5. "moatType": (Brand, Switching Cost, Network Effect, Cost Advantage, or None)
6. "redFlags": Array of specific risks.

Return a STRICT JSON array of objects.`;

  const prompt = `Analyze these ${stocks.length} assets:
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
            },
            required: ["ticker", "banglaAdvice", "allocation", "bucket"]
          }
        }
      }
    });

    const aiResults = safeJsonParse(response.text);

    return stocks.map((s) => {
      const aiMatch = aiResults.find((r: any) => r.ticker === s.ticker) || {
        moatType: "Unknown",
        reasoning: "Data synthesis in progress.",
        riskGrade: 5,
        banglaAdvice: "ফান্ডামেন্টাল তথ্য যাচাই করুন।",
        redFlags: [],
        bucket: "Unknown",
        allocation: "0%",
        estimatedYield: 0
      };

      // Quantitative Engine Calculations
      const pe = s.eps > 0 ? s.ltp / s.eps : 0;
      const roe = s.nav > 0 ? (s.eps / s.nav) * 100 : 0;
      const d2e = s.nav > 0 ? s.debt / (s.nav * 100) : 0;
      
      // Graham Number for Fair Value
      const grahamValue = (s.eps > 0 && s.nav > 0) ? Math.sqrt(22.5 * s.eps * s.nav) : 0;

      let debtRisk: "LOW" | "MEDIUM" | "HIGH" | "TOXIC" = "LOW";
      if (d2e > 1.2) debtRisk = "TOXIC";
      else if (d2e > 0.7) debtRisk = "HIGH";
      else if (d2e > 0.3) debtRisk = "MEDIUM";

      let score = 0;
      let firewallFailed = false;

      // Titan Firewall Rules
      if (s.eps <= 0) firewallFailed = true;
      if (s.directorHolding < 25) firewallFailed = true;
      if (d2e > 1.5) firewallFailed = true;

      if (!firewallFailed) {
        score += (roe > 15 ? 40 : roe > 10 ? 20 : 0);
        score += (pe > 0 && pe < 15 ? 30 : pe < 22 ? 15 : 0);
        score += (s.directorHolding > 40 ? 20 : 10);
        score += (debtRisk === "LOW" ? 10 : 0);
      }

      let verdict = TitanVerdict.AVOID;
      if (firewallFailed) verdict = TitanVerdict.DESTROY;
      else if (score >= 75) verdict = TitanVerdict.GOD_MODE_BUY;
      else if (score >= 55) verdict = TitanVerdict.BUY;
      else if (score >= 35) verdict = TitanVerdict.HOLD;

      return {
        stock: s,
        score,
        verdict,
        moatType: aiMatch.moatType,
        reasoning: aiMatch.reasoning,
        banglaAdvice: aiMatch.banglaAdvice,
        riskGrade: aiMatch.riskGrade,
        redFlags: aiMatch.redFlags || [],
        intrinsicValue: grahamValue,
        fairValue: grahamValue > 0 ? grahamValue : s.ltp * 0.9,
        yield: s.dividend ? (s.dividend / s.ltp) * 100 : (aiMatch.estimatedYield || 0),
        allocation: aiMatch.allocation,
        bucket: aiMatch.bucket,
        debtRisk,
        metrics: { pe, roe, debtToEquity: d2e }
      };
    });
  } catch (err) {
    console.error(err);
    throw new Error("Titan Brain Overload: Analysis failed due to invalid data structure.");
  }
}

export async function parseStockFile(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
  const prompt = `Convert raw data to JSON list of stocks. Extract: ticker, ltp, eps, nav, debt, directorHolding. Return only JSON.`;
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
          },
          required: ["ticker", "ltp", "eps"]
        }
      }
    }
  });

  return safeJsonParse(response.text);
}