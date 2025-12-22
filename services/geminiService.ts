import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, LocationDetails } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Schema for listing locations
const locationListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the location in Traditional Chinese (e.g., 耶路撒冷)" },
      englishName: { type: Type.STRING, description: "The name of the location in English" },
      latitude: { type: Type.NUMBER, description: "The latitude coordinate" },
      longitude: { type: Type.NUMBER, description: "The longitude coordinate" },
      shortDescription: { type: Type.STRING, description: "A very brief summary (10-15 words) in Traditional Chinese" }
    },
    required: ["name", "englishName", "latitude", "longitude", "shortDescription"]
  }
};

// Schema for detailed location info
const locationDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    fullDescription: { type: Type.STRING, description: "A detailed description of the place in the context of the Bible, in Traditional Chinese." },
    historicalSignificance: { type: Type.STRING, description: "Historical geography and archaeological context in Traditional Chinese." },
    verses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING, description: "Book Chapter:Verse (e.g., 馬太福音 2:1)" },
          text: { type: Type.STRING, description: "The content of the verse in Traditional Chinese (Union Version or Recovery Version style)." }
        },
        required: ["reference", "text"]
      }
    },
    googleMapsUrl: { type: Type.STRING, description: "A direct Google Maps link for this location." }
  },
  required: ["fullDescription", "historicalSignificance", "verses", "googleMapsUrl"]
};

// Helper to safely parse JSON from Gemini response
const parseJSONResponse = (text: string | undefined) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    // If simple parse fails, try to strip markdown code blocks
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        console.error("Failed to parse inner JSON", e2);
        return null;
      }
    }
    console.error("Failed to parse JSON response", e);
    return null;
  }
};

export const fetchBibleLocations = async (query: string = ""): Promise<LocationData[]> => {
  try {
    let prompt = "";
    if (query) {
      prompt = `List biblical locations that match or are related to "${query}". Provide their coordinates and a short description in Traditional Chinese.`;
    } else {
      prompt = `List 10 most famous and significant locations mentioned in the New and Old Testaments of the Bible (e.g., Jerusalem, Bethlehem, Nazareth, Sea of Galilee, etc.). Provide their coordinates and a short description in Traditional Chinese.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: locationListSchema,
      }
    });

    const data = parseJSONResponse(response.text);
    if (data && Array.isArray(data)) {
      // Add unique IDs
      return data.map((item: any, index: number) => ({
        ...item,
        id: `${item.englishName.replace(/\s+/g, '-')}-${index}`
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

export const fetchLocationDetails = async (location: LocationData): Promise<LocationDetails> => {
  try {
    const prompt = `
      Provide detailed biblical information for "${location.name}" (${location.englishName}).
      Include a historical description, significance in the Bible, and key Bible verses where this place is mentioned.
      Ensure all text is in Traditional Chinese.
      The output must strictly follow the JSON schema.
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
    if (details) {
      return {
        ...location,
        ...details
      };
    }
    throw new Error("No data returned details");
  } catch (error) {
    console.error("Error fetching location details:", error);
    throw error;
  }
};