export interface PlantAnalysis {
  id?: string;
  name: string;
  scientificName: string;
  toxicity: {
    toxic: boolean;
    level: 'none' | 'mild' | 'moderate' | 'severe';
    warning: string;
  };
  description: string;
  symptoms?: string[];
  precautions?: string[];
  imageUrl?: string;
  timestamp?: number;
  followUpQuestions?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}