import { GoogleGenAI, Type } from "@google/genai";
import type { Mode, Identification } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const normalSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the identified object." },
    description: { type: Type.STRING, description: "A brief, interesting description of the object." },
    cool_facts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Two bullet-point style cool facts about the object."
    },
    technicalities: { type: Type.STRING, description: "A short technical detail or specification about the object." },
    wikipedia_url: { type: Type.STRING, description: "The full URL to the object's English Wikipedia page." },
    boundingBox: {
        type: Type.OBJECT,
        description: "Bounding box coordinates as percentages (0.0 to 1.0).",
        properties: {
            x_min: { type: Type.NUMBER },
            y_min: { type: Type.NUMBER },
            x_max: { type: Type.NUMBER },
            y_max: { type: Type.NUMBER }
        }
    }
  },
  required: ["name", "description", "cool_facts", "technicalities", "wikipedia_url", "boundingBox"]
};

const healthSchema = {
    type: Type.OBJECT,
    properties: {
      issue: { type: Type.STRING, description: "Name of the potential health issue (e.g., 'Leaf Rust', 'Minor Skin Rash')." },
      description: { type: Type.STRING, description: "A simple description of the observed issue." },
      simple_cures: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of simple, common cures or management tips. This is not medical advice."
      },
      natural_remedies: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of natural remedies or preventative measures. This is not medical advice."
      },
      boundingBox: {
        type: Type.OBJECT,
        description: "Bounding box coordinates as percentages (0.0 to 1.0).",
        properties: {
            x_min: { type: Type.NUMBER },
            y_min: { type: Type.NUMBER },
            x_max: { type: Type.NUMBER },
            y_max: { type: Type.NUMBER }
        }
    }
    },
    required: ["issue", "description", "simple_cures", "natural_remedies", "boundingBox"]
};

function fileToGenerativePart(base64Data: string) {
    const match = base64Data.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error('Invalid base64 string');
    }
    const [_, mimeType, data] = match;
    return {
      inlineData: {
        data,
        mimeType,
      },
    };
}

export const analyzeImage = async (base64Image: string, mode: Mode): Promise<Identification[]> => {
  const imagePart = fileToGenerativePart(base64Image);
  let prompt: string;
  let schema: object;
  let systemInstruction: string;

  if (mode === 'Normal') {
    prompt = "Identify all significant objects in this image. For each, provide its name, a description, cool facts, technical details, a Wikipedia link, and its bounding box.";
    schema = { type: Type.ARRAY, items: normalSchema };
    systemInstruction = "You are an expert encyclopedia. For the given image, identify all significant objects and return details about them in the specified JSON format.";
  } else { // Health mode
    prompt = "Analyze this image for any significant health-related concerns (like a plant disease or a common skin issue). For each, describe the issue, suggest simple wellness tips, cures, and natural remedies. This is not medical advice. Provide a bounding box for each area of concern.";
    schema = { type: Type.ARRAY, items: healthSchema };
    systemInstruction = "You are a helpful wellness and botany assistant. Identify potential health issues in the image and provide general, non-medical advice in the specified JSON format. Always include a disclaimer that this is not a substitute for professional medical or botanical advice.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Ensure the output is always an array
    if (Array.isArray(parsedJson)) {
        return parsedJson as Identification[];
    } else if (typeof parsedJson === 'object' && parsedJson !== null) {
        return [parsedJson as Identification];
    }
    return [];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from AI.");
  }
};