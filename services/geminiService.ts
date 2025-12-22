
import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, LocationDetails } from "../types";

// Note: process.env.API_KEY is injected via Vite's define config
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const locationListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Traditional Chinese name of the biblical location" },
      englishName: { type: Type.STRING, description: "English name of the biblical location" },
      latitude: { type: Type.NUMBER },
      longitude: { type: Type.NUMBER },
      shortDescription: { type: Type.STRING, description: "One sentence summary of its significance in the Recovery Version." }
    },
    required: ["name", "englishName", "latitude", "longitude", "shortDescription"]
  }
};

const locationDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    fullDescription: { type: Type.STRING },
    historicalSignificance: { type: Type.STRING, description: "Spiritual significance based on the Recovery Version footnotes." },
    verses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING, description: "e.g., 創世記 12:1" },
          text: { type: Type.STRING, description: "Exact text from the Recovery Version Bible (聖經恢復本)." }
        },
        required: ["reference", "text"]
      }
    },
    googleMapsUrl: { type: Type.STRING }
  },
  required: ["fullDescription", "historicalSignificance", "verses", "googleMapsUrl"]
};

const parseJSONResponse = (text: string | undefined) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch (e2) { return null; }
    }
    return null;
  }
};

// Based on the user's request: https://line.twgbr.org/recoveryversion/bible/
const getTWGBRLink = () => {
  return `https://line.twgbr.org/recoveryversion/bible/`;
};

export const fetchBibleLocations = async (query: string = ""): Promise<LocationData[]> => {
  try {
    const prompt = query 
      ? `Search for biblical locations related to "${query}" in the context of the Recovery Version Bible. Provide geographical coordinates.`
      : `Provide a list of 10 major biblical cities or landmarks mentioned in the Old and New Testament Recovery Version.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: locationListSchema,
      }
    });

    const data = parseJSONResponse(response.text);
    return (data || []).map((item: any, index: number) => ({
      ...item,
      id: `${item.englishName.replace(/\s+/g, '-')}-${index}`
    }));
  } catch (error) {
    console.error("fetchBibleLocations error:", error);
    return [];
  }
};

export const fetchLocationDetails = async (location: LocationData): Promise<LocationDetails> => {
  const prompt = `
    Analyze the biblical location "${location.name}" (${location.englishName}).
    1. Use the Recovery Version (聖經恢復本) for all scripture references.
    2. Focus on the spiritual significance as emphasized in Witness Lee's ministry and Recovery Version footnotes.
    3. Provide 3-5 key verses with their full text strictly from the Recovery Version.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: locationDetailsSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  const details = parseJSONResponse(response.text);
  if (!details) throw new Error("Failed to parse location details");

  return {
    ...location,
    ...details,
    verses: details.verses.map((v: any) => ({
      ...v,
      url: getTWGBRLink()
    }))
  };
};
