
import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, LocationDetails } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const locationListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Traditional Chinese name" },
      englishName: { type: Type.STRING, description: "English name" },
      latitude: { type: Type.NUMBER },
      longitude: { type: Type.NUMBER },
      shortDescription: { type: Type.STRING }
    },
    required: ["name", "englishName", "latitude", "longitude", "shortDescription"]
  }
};

const locationDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    fullDescription: { type: Type.STRING },
    historicalSignificance: { type: Type.STRING },
    verses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING, description: "e.g., 創世記 12:1" },
          text: { type: Type.STRING, description: "Strictly use the Recovery Version (恢復本) text." }
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

// Helper to generate TWGBR line link
// Example: https://line.twgbr.org/recoveryversion/bible/
// We simulate a search or direct link if possible, 
// though direct deep linking to verses on that specific mobile-optimized site is complex,
// we provide a link to the main reader.
const getTWGBRLink = (reference: string) => {
  return `https://line.twgbr.org/recoveryversion/bible/`;
};

export const fetchBibleLocations = async (query: string = ""): Promise<LocationData[]> => {
  try {
    const prompt = query 
      ? `Find biblical locations related to "${query}" based on the Recovery Version Bible. Provide coordinates.`
      : `List 10 major biblical locations (e.g., Jerusalem, Bethel, Shechem) from the Recovery Version context.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    console.error(error);
    return [];
  }
};

export const fetchLocationDetails = async (location: LocationData): Promise<LocationDetails> => {
  const prompt = `
    Provide details for "${location.name}" (${location.englishName}) strictly using the Recovery Version (聖經恢復本) of the Bible.
    Include historical context and key verses. 
    The verses MUST be the exact text from the Recovery Version.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: locationDetailsSchema,
    }
  });

  const details = parseJSONResponse(response.text);
  if (!details) throw new Error("Failed to load details");

  return {
    ...location,
    ...details,
    verses: details.verses.map((v: any) => ({
      ...v,
      url: getTWGBRLink(v.reference)
    }))
  };
};
