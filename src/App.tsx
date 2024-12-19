import React, { useState } from 'react';
import { Sprout, History, MessageCircle } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { HistoryPanel } from './components/HistoryPanel';
import { ChatPanel } from './components/ChatPanel';
import { analyzePlant } from './services/plantAnalyzer';
import { PlantAnalysis } from './types/plant';
import { usePlantStore } from './store/plantStore';
import clsx from 'clsx';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'chat'>('history');
  const { addAnalysis } = usePlantStore();

  const handleImageSelect = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsAnalyzing(true);
    
    try {
      const result = await analyzePlant(file);
      const analysisWithImage = { ...result, imageUrl };
      setAnalysis(analysisWithImage);
      addAnalysis(analysisWithImage);
    } catch (error) {
      console.error('Error analyzing plant:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectFromHistory = (plant: PlantAnalysis) => {
    setSelectedImage(plant.imageUrl || null);
    setAnalysis(plant);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Plant Toxicity Checker</h1>
          </div>
          <p className="text-gray-600">
            Upload a photo of any plant to check if it's toxic and get detailed safety information
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Plant Image</h2>
              <ImageUploader onImageSelect={handleImageSelect} />
              
              {selectedImage && (
                <div className="mt-4">
                  <img
                    src={selectedImage}
                    alt="Selected plant"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {isAnalyzing ? (
                <div className="mt-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Analyzing plant...</p>
                </div>
              ) : analysis ? (
                <div className="mt-8">
                  <AnalysisResult analysis={analysis} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('history')}
                  className={clsx(
                    'flex-1 px-4 py-3 flex items-center justify-center gap-2',
                    activeTab === 'history'
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={clsx(
                    'flex-1 px-4 py-3 flex items-center justify-center gap-2',
                    activeTab === 'chat'
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  disabled={!analysis}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </div>

            <div className="h-[600px] overflow-y-auto">
              {activeTab === 'history' ? (
                <HistoryPanel onSelectPlant={handleSelectFromHistory} />
              ) : analysis ? (
                <ChatPanel plant={analysis} />
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Analyze a plant to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;