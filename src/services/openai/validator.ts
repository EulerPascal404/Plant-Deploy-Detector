import { PlantAnalysis } from '../../types/plant';
import { OpenAIServiceError } from './error';
import { ERROR_CODES } from './config';
import { logger } from '../../utils/logger';

const VALID_TOXICITY_LEVELS = ['none', 'mild', 'moderate', 'severe'] as const;

export const validatePlantAnalysis = (data: unknown): PlantAnalysis => {
  logger.debug('Validating plant analysis data', data);

  if (!data || typeof data !== 'object') {
    logger.error('Invalid data structure', data);
    throw new OpenAIServiceError(ERROR_CODES.VALIDATION_ERROR, 'Invalid data structure');
  }

  const analysis = data as Record<string, unknown>;

  // Required string fields
  const requiredStrings = ['name', 'scientificName', 'description'];
  for (const field of requiredStrings) {
    if (typeof analysis[field] !== 'string' || !analysis[field]) {
      logger.error(`Missing or invalid ${field}`, analysis[field]);
      throw new OpenAIServiceError(ERROR_CODES.VALIDATION_ERROR, `Missing or invalid ${field}`);
    }
  }

  // Validate toxicity object
  if (!analysis.toxicity || typeof analysis.toxicity !== 'object') {
    logger.error('Invalid toxicity object', analysis.toxicity);
    throw new OpenAIServiceError(ERROR_CODES.VALIDATION_ERROR, 'Invalid toxicity object');
  }

  const toxicity = analysis.toxicity as Record<string, unknown>;

  if (typeof toxicity.toxic !== 'boolean') {
    logger.error('Invalid toxicity.toxic value', toxicity.toxic);
    throw new OpenAIServiceError(ERROR_CODES.VALIDATION_ERROR, 'Invalid toxicity.toxic value');
  }

  if (!VALID_TOXICITY_LEVELS.includes(toxicity.level as any)) {
    logger.error('Invalid toxicity.level value', toxicity.level);
    throw new OpenAIServiceError(ERROR_CODES.VALIDATION_ERROR, 'Invalid toxicity.level value');
  }

  if (typeof toxicity.warning !== 'string' || !toxicity.warning) {
    logger.error('Invalid toxicity.warning value', toxicity.warning);
    throw new OpenAIServiceError(ERROR_CODES.VALIDATION_ERROR, 'Invalid toxicity.warning value');
  }

  // Validate arrays
  const validateStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item): item is string => typeof item === 'string' && item.length > 0);
  };

  const symptoms = validateStringArray(analysis.symptoms);
  const precautions = validateStringArray(analysis.precautions);

  logger.debug('Validation successful');

  return {
    name: analysis.name as string,
    scientificName: analysis.scientificName as string,
    toxicity: {
      toxic: toxicity.toxic as boolean,
      level: toxicity.level as typeof VALID_TOXICITY_LEVELS[number],
      warning: toxicity.warning as string
    },
    description: analysis.description as string,
    symptoms,
    precautions
  };
};