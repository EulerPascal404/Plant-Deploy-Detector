import React from 'react';
import { format } from 'date-fns';
import { Trash2, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePlantStore } from '../store/plantStore';
import { PlantAnalysis } from '../types/plant';

interface HistoryPanelProps {
  onSelectPlant: (plant: PlantAnalysis) => void;
}

export function HistoryPanel({ onSelectPlant }: HistoryPanelProps) {
  const { history, clearHistory } = usePlantStore();

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No previous analyses yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-lg font-semibold">History</h3>
        <button
          onClick={clearHistory}
          className="text-red-500 hover:text-red-600 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>
      <div className="space-y-2">
        {history.map((plant) => (
          <button
            key={plant.id}
            onClick={() => onSelectPlant(plant)}
            className="w-full p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {plant.toxicity.toxic ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <div className="text-left">
                  <p className="font-medium">{plant.name}</p>
                  <p className="text-sm text-gray-500">{plant.scientificName}</p>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {format(plant.timestamp || Date.now(), 'MMM d, HH:mm')}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}