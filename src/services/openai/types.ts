export interface ImageAnalysisRequest {
  imageBase64: string;
}

export interface FollowUpQuestionRequest {
  plantAnalysis: PlantAnalysis;
  question: string;
}

export interface ImageAnalysisResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FollowUpResponse {
  success: boolean;
  data?: {
    content: string;
  };
  error?: string;
}

export interface OpenAIError {
  code: string;
  message: string;
  details?: unknown;
}