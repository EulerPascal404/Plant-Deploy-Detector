import React from 'react';
import { AlertTriangle, Check, Info } from 'lucide-react';
import { PlantAnalysis } from '../types/plant';

interface AnalysisResultProps {
  analysis: PlantAnalysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const getToxicityColor = (level: string) => {
    switch (level) {
      case 'severe': return 'text-red-600';
      case 'moderate': return 'text-orange-600';
      case 'mild': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{analysis.name}</h2>
          <p className="text-sm text-gray-500 italic">{analysis.scientificName}</p>
        </div>
        {analysis.toxicity.toxic ? (
          <AlertTriangle className="h-6 w-6 text-red-500" />
        ) : (
          <Check className="h-6 w-6 text-green-500" />
        )}
      </div>

      <div className={`mt-4 p-4 rounded-md ${analysis.toxicity.toxic ? 'bg-red-50' : 'bg-green-50'}`}>
        <p className={`font-semibold ${getToxicityColor(analysis.toxicity.level)}`}>
          Toxicity Level: {analysis.toxicity.level.charAt(0).toUpperCase() + analysis.toxicity.level.slice(1)}
        </p>
        <p className="mt-2 text-gray-700">{analysis.toxicity.warning}</p>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Description
        </h3>
        <p className="mt-2 text-gray-700">{analysis.description}</p>
      </div>

      {analysis.symptoms && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900">Symptoms</h3>
          <ul className="mt-2 list-disc list-inside text-gray-700">
            {analysis.symptoms.map((symptom, index) => (
              <li key={index}>{symptom}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.precautions && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900">Safety Precautions</h3>
          <ul className="mt-2 list-disc list-inside text-gray-700">
            {analysis.precautions.map((precaution, index) => (
              <li key={index}>{precaution}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}