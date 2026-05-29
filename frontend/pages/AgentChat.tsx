import React, { useState, useCallback } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { SignalDashboard } from '../components/SignalDashboard';
import { Message } from '../types';
import { analyzeQuery } from '../services/aiService';
import { useAppContext } from '../context/AppContext';

export const AgentChat: React.FC = () => {
  const { products, chatMessages, setChatMessages, currentSignal, setCurrentSignal } = useAppContext();
  const [isTyping, setIsTyping] = useState(false);

  const handleClearChat = useCallback(() => {
    setChatMessages([]);
    setCurrentSignal(null);
  }, [setChatMessages, setCurrentSignal]);

  const handleSendMessage = useCallback(async (text: string, useWebSearch: boolean) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    
    const sysMsg: Message = {
      id: Date.now().toString() + '-sys',
      role: 'system',
      text: `> Executing: queryEnterpriseDatabase()\n> Executing: fetchLiveBrightData()\n${useWebSearch ? '> Executing: googleSearchGrounding()\n' : ''}> Status: Data retrieved successfully.`,
      timestamp: new Date()
    };

    // Add both user message and system execution log immediately
    setChatMessages(prev => [...prev, userMsg, sysMsg]);
    setIsTyping(true);

    // Filter out system messages so the AI only sees the conversation history
    // We use the current state + the new user message for the API call
    const historyForAI = [...chatMessages, userMsg].filter(m => m.role !== 'system');
    
    try {
      const { text: responseText, signal, groundingUrls } = await analyzeQuery(text, historyForAI, products, useWebSearch);
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        groundingUrls: groundingUrls
      };

      setChatMessages(prev => [...prev, modelMsg]);
      
      if (signal) {
        setCurrentSignal(signal);
      }

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "System Error: Unable to process intelligence query. Please check Vertex AI connection.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [chatMessages, products, setChatMessages, setCurrentSignal]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="w-full lg:w-3/5 h-full flex flex-col border-r border-slate-800">
        <ChatInterface 
          messages={chatMessages} 
          isTyping={isTyping} 
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
        />
      </div>
      <div className="hidden lg:block lg:w-2/5 h-full">
        <SignalDashboard signal={currentSignal} />
      </div>
    </div>
  );
};
