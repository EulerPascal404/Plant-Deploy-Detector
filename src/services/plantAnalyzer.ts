import { PlantAnalysis } from '../types/plant';
import { fileToBase64 } from '../utils/imageUtils';
import { analyzeImage } from './openai/client';
import { logger } from '../utils/logger';

export const analyzePlant = async (imageFile: File): Promise<PlantAnalysis> => {
  try {
    logger.debug('Starting plant analysis', { fileName: imageFile.name });
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      throw new Error('Invalid image format. Please use JPG, PNG, or WebP.');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      throw new Error('Image size too large. Maximum size is 10MB.');
    }

    // Convert image to base64
    const imageBase64 = await fileToBase64(imageFile);
    logger.debug('Image converted to base64');

    // Analyze with OpenAI
    const result = await analyzeImage({ imageBase64 });
    logger.debug('Analysis completed', { success: result.success });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze plant');
    }

    return {
      ...result.data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
  } catch (error) {
    logger.error('Error analyzing plant:', error);
    
    return {
      id: crypto.randomUUID(),
      name: 'Error Analyzing Plant',
      scientificName: 'Analysis Error',
      toxicity: {
        toxic: true,
        level: 'moderate',
        warning: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      description: 'There was an error analyzing your plant image. This could be due to image quality, network issues, or service availability.',
      symptoms: ['Unable to determine symptoms'],
      precautions: [
        'Please try again with a clearer image',
        'Ensure you have a stable internet connection',
        'If the problem persists, try again later'
      ],
      timestamp: Date.now()
    };
  }
};