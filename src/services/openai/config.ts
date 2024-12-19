import { getEnvVar } from '../../config/env';

export const OPENAI_CONFIG = {
  apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  model: 'gpt-4o-mini',
  maxTokens: 500,
  temperature: 0.7,
  detail: 'high'
};

export const ERROR_CODES = {
  API_ERROR: 'API_ERROR',
  MODEL_ERROR: 'MODEL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NO_RESPONSE: 'NO_RESPONSE',
  PARSE_ERROR: 'PARSE_ERROR'
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.API_ERROR]: 'Error communicating with OpenAI API',
  [ERROR_CODES.MODEL_ERROR]: 'Error with AI model configuration',
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid response format from AI model',
  [ERROR_CODES.NO_RESPONSE]: 'No response received from AI model',
  [ERROR_CODES.PARSE_ERROR]: 'Failed to parse AI model response'
};

export const SYSTEM_PROMPT = `You are a plant identification and toxicity expert. Analyze the image and provide detailed information about:
1. Plant identification (common name and scientific name)
2. Toxicity level (none, mild, moderate, severe)
3. Description of the plant
4. Toxic parts (if any)
5. Symptoms of toxicity (if applicable)
6. Safety precautions

IMPORTANT: You must respond with ONLY a valid JSON object in the following format:
{
  "name": "Common Plant Name",
  "scientificName": "Scientific Name",
  "toxicity": {
    "toxic": boolean,
    "level": "none" | "mild" | "moderate" | "severe",
    "warning": "Clear warning message about toxicity"
  },
  "description": "Detailed plant description",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "precautions": ["Precaution 1", "Precaution 2"]
}`;