import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskScore: { type: Type.NUMBER },
    scamStatus: { type: Type.STRING, enum: ["Yes", "Possibly", "No"] },
    riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    messageType: { type: Type.STRING },
    confidence: { type: Type.STRING },
    confidenceReason: { type: Type.STRING },
    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
    explanation: { type: Type.STRING },
    recommendedAction: { type: Type.STRING }
  },
  required: ["riskScore", "scamStatus", "riskLevel", "messageType", "confidence", "redFlags", "explanation", "recommendedAction"]
};

export const geminiService = {
  /**
   * General text-based risk analysis for messages, emails, or texts.
   */
  analyzeText: async (text: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Perform a deep security audit on this message: "${text}". Detect if this is a scam targeting students.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini AnalyzeText Error:", error);
      throw error;
    }
  },

  /**
   * Analyze an image (screenshot) for scams.
   */
  analyzeImage: async (base64: string) => {
    try {
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "Detailed forensic fraud analysis of this screenshot. Identify phishing, social engineering, and recruitment scams." },
            { inlineData: { data: base64Data, mimeType: "image/png" } }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini AnalyzeImage Error:", error);
      throw error;
    }
  },

  /**
   * Technical & Behavioral URL analysis.
   */
  analyzeURL: async (url: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `TECHNICAL AUDIT: Analyze the following URL for phishing, brand impersonation, and technical manipulation: "${url}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              findings: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    passed: { type: Type.BOOLEAN },
                    message: { type: Type.STRING }
                  },
                  required: ["label", "passed", "message"]
                } 
              }
            },
            required: ["riskScore", "riskLevel", "findings"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini AnalyzeURL Error:", error);
      throw error;
    }
  },

  /**
   * Deep audit of a recruiter profile/identity.
   */
  analyzeRecruiter: async (nameOrBio: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `IDENTITY AUDIT: Evaluate the legitimacy of this recruiter or company profile. Look for professional credibility markers or fraud signals: "${nameOrBio}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              level: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              flags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING },
              checks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ["pass", "fail", "warn"] },
                    detail: { type: Type.STRING }
                  },
                  required: ["label", "status", "detail"]
                }
              }
            },
            required: ["score", "level", "flags", "recommendation", "checks"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini AnalyzeRecruiter Error:", error);
      throw error;
    }
  }
};
