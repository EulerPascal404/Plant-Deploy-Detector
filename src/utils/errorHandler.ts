import { PlantAnalysis } from '../types/plant';
import { ERROR_MESSAGES } from '../config/openai';

export const handleError = (error: any): PlantAnalysis => {
  console.error('Error in plant analysis:', error);

  let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
  let precautions = [
    "Please try again with a clearer image",
    "Ensure you have a stable internet connection",
    "If the problem persists, try again later"
  ];

  if (error?.error?.type === 'invalid_request_error') {
    errorMessage = ERROR_MESSAGES.MODEL_ERROR;
  } else if (error?.error?.code === 'invalid_api_key') {
    errorMessage = ERROR_MESSAGES.TOKEN_ERROR;
    precautions = ["Please check your API key configuration"];
  } else if (error?.message) {
    errorMessage = error.message;
  }

  return {
    name: "Error Analyzing Plant",
    scientificName: "Analysis Error",
    toxicity: {
      toxic: true,
      level: "moderate",
      warning: errorMessage
    },
    description: "There was an error analyzing your plant image. This could be due to image quality, network issues, or service availability.",
    symptoms: ["Unable to determine symptoms"],
    precautions
  };
};