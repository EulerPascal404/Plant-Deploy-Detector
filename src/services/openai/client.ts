import OpenAI from 'openai';
import { OPENAI_CONFIG, SYSTEM_PROMPT } from './config';
import { 
  ImageAnalysisRequest, 
  ImageAnalysisResponse, 
  FollowUpQuestionRequest,
  FollowUpResponse
} from './types';
import { PlantAnalysis } from '../../types/plant';
import { logger } from '../../utils/logger';
import { validatePlantAnalysis } from './validator';
import { createOpenAIError } from './error';

const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true
});

export const analyzeImage = async (
  request: ImageAnalysisRequest
): Promise<ImageAnalysisResponse<PlantAnalysis>> => {
  try {
    logger.debug('Starting OpenAI analysis', { model: OPENAI_CONFIG.model });

    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this plant image and provide toxicity information in JSON format.'
            },
            {
              type: 'image_url',
              image_url: {
                url: request.imageBase64.startsWith('data:') 
                  ? request.imageBase64 
                  : `data:image/jpeg;base64,${request.imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: OPENAI_CONFIG.temperature
    });

    logger.debug('OpenAI response received', response);
    const content = response.choices[0]?.message?.content;

    if (!content) {
      logger.error('No content in OpenAI response');
      return { success: false, error: 'No response from OpenAI' };
    }

    try {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      const parsedData = JSON.parse(jsonStr);
      logger.debug('Parsed response:', parsedData);
      
      const validatedData = validatePlantAnalysis(parsedData);
      return { success: true, data: validatedData };
    } catch (parseError) {
      logger.error('Failed to parse OpenAI response:', parseError);
      return { success: false, error: 'Failed to parse AI response' };
    }
  } catch (error) {
    logger.error('OpenAI API error:', error);
    const openAIError = createOpenAIError(error);
    return { 
      success: false, 
      error: openAIError.message
    };
  }
};

export const analyzeFollowUpQuestion = async (
  request: FollowUpQuestionRequest
): Promise<FollowUpResponse> => {
  try {
    logger.debug('Processing follow-up question', { question: request.question });

    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `You are a plant expert. Previous analysis of the plant:
Name: ${request.plantAnalysis.name}
Scientific Name: ${request.plantAnalysis.scientificName}
Toxicity Level: ${request.plantAnalysis.toxicity.level}
Description: ${request.plantAnalysis.description}

Provide a clear, detailed answer focusing on plant safety and accurate information.`
        },
        {
          role: 'user',
          content: request.question
        }
      ],
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: 0.7
    });

    logger.debug('Follow-up response received', response);
    const content = response.choices[0]?.message?.content;

    if (!content) {
      logger.error('No content in follow-up response');
      return { success: false, error: 'No response received' };
    }

    return {
      success: true,
      data: { content }
    };
  } catch (error) {
    logger.error('Error processing follow-up question:', error);
    const openAIError = createOpenAIError(error);
    return {
      success: false,
      error: openAIError.message
    };
  }
};