import OpenAI from 'openai';
import { PlantAnalysis } from '../types/plant';
import { OPENAI_API_KEY, SYSTEM_PROMPT, ERROR_MESSAGES } from '../config/openai';

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyzeImageWithOpenAI = async (base64Image: string): Promise<PlantAnalysis> => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please identify this plant and provide toxicity information."
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(ERROR_MESSAGES.NO_RESPONSE);
    }

    try {
      return JSON.parse(content) as PlantAnalysis;
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error(ERROR_MESSAGES.PARSE_ERROR);
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};