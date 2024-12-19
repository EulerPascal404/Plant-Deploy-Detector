import { OpenAIError } from './types';
import { ERROR_CODES, ERROR_MESSAGES } from './config';

export class OpenAIServiceError extends Error {
  code: keyof typeof ERROR_CODES;
  details?: unknown;

  constructor(code: keyof typeof ERROR_CODES, details?: unknown) {
    super(ERROR_MESSAGES[code]);
    this.code = code;
    this.details = details;
    this.name = 'OpenAIServiceError';
  }
}

export const createOpenAIError = (error: unknown): OpenAIError => {
  if (error instanceof OpenAIServiceError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }

  // Handle OpenAI API specific errors
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = (error as any).error;
    if (apiError?.type === 'invalid_request_error') {
      return {
        code: ERROR_CODES.MODEL_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.MODEL_ERROR],
        details: apiError
      };
    }
  }

  // Default error
  return {
    code: ERROR_CODES.API_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.API_ERROR],
    details: error
  };
};