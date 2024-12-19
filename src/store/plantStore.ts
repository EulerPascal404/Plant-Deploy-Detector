import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlantAnalysis, ChatMessage } from '../types/plant';

interface PlantStore {
  history: PlantAnalysis[];
  addAnalysis: (analysis: PlantAnalysis) => void;
  addFollowUpQuestion: (plantId: string, message: ChatMessage) => void;
  clearHistory: () => void;
}

export const usePlantStore = create<PlantStore>()(
  persist(
    (set) => ({
      history: [],
      addAnalysis: (analysis) =>
        set((state) => ({
          history: [
            { ...analysis, id: crypto.randomUUID(), timestamp: Date.now() },
            ...state.history,
          ].slice(0, 10), // Keep last 10 analyses
        })),
      addFollowUpQuestion: (plantId, message) =>
        set((state) => ({
          history: state.history.map((plant) =>
            plant.id === plantId
              ? {
                  ...plant,
                  followUpQuestions: [...(plant.followUpQuestions || []), message],
                }
              : plant
          ),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'plant-analysis-storage',
    }
  )
);