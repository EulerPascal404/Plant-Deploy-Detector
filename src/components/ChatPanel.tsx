import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { PlantAnalysis, ChatMessage } from '../types/plant';
import { usePlantStore } from '../store/plantStore';
import { analyzeFollowUpQuestion } from '../services/openai/client';
import { logger } from '../utils/logger';

interface ChatPanelProps {
  plant: PlantAnalysis;
}

export function ChatPanel({ plant }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addFollowUpQuestion = usePlantStore((state) => state.addFollowUpQuestion);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [plant.followUpQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !plant.id) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    };

    setIsLoading(true);
    addFollowUpQuestion(plant.id, userMessage);
    setMessage('');

    try {
      logger.debug('Sending follow-up question', { question: userMessage.content });
      const response = await analyzeFollowUpQuestion({
        plantAnalysis: plant,
        question: userMessage.content,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to process question');
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data.content,
        timestamp: Date.now(),
      };

      addFollowUpQuestion(plant.id, assistantMessage);
      logger.debug('Follow-up response added', { response: assistantMessage.content });
    } catch (error) {
      logger.error('Error processing follow-up question:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again.',
        timestamp: Date.now(),
      };

      addFollowUpQuestion(plant.id, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-gray-100 p-3 rounded-lg text-sm">
          <p>Ask questions about {plant.name} and its safety considerations.</p>
          <p className="text-gray-500 mt-1">Examples:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Is this plant safe around pets?</li>
            <li>What are the symptoms of poisoning?</li>
            <li>How should I handle this plant safely?</li>
          </ul>
        </div>
        
        {plant.followUpQuestions?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}