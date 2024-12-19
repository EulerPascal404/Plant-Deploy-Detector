import { openaiClient } from './client';
import { ImageAnalysisRequest, ImageAnalysisResponse } from './types';
import { OPENAI_CONFIG, ERROR_MESSAGES } from '../../config/openai';

export async function analyzeImage<T>(
  request: ImageAnalysisRequest
): Promise<ImageAnalysisResponse<T>> {
  try {
    // Validate image URL
    if (!request.imageUrl) {
      return { data: null, error: ERROR_MESSAGES.INVALID_IMAGE };
    }

    const response = await openaiClient.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        ...(request.systemPrompt ? [{
          role: "system",
          content: request.systemPrompt
        }] : []),
        {
          role: "user",
          content: [
            {
              type: "text",
              text: request.prompt
            },
            {
              type: "image_url",
              image_url: {
                url: request.imageUrl,
                detail: OPENAI_CONFIG.detail
              }
            }
          ]
        }
      ],
      max_tokens: OPENAI_CONFIG.maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { data: null, error: ERROR_MESSAGES.NO_RESPONSE };
    }

    try {
      const parsedData = JSON.parse(content) as T;
      return { data: parsedData };
    } catch (error) {
      console.error('Parse error:', error);
      return { data: null, error: ERROR_MESSAGES.PARSE_ERROR };
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Handle specific API errors
    if (error?.error?.type === 'invalid_request_error') {
      return { data: null, error: ERROR_MESSAGES.MODEL_ERROR };
    }
    if (error?.error?.code === 'invalid_api_key') {
      return { data: null, error: ERROR_MESSAGES.TOKEN_ERROR };
    }
    
    return {
      data: null,
      error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR
    };
  }
}