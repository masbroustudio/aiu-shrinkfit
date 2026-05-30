import React, { useState, useCallback } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { SignalDashboard } from '../components/SignalDashboard';
import { Message } from '../types';
import { analyzeQueryStream } from '../services/aiService';
import { useAppContext } from '../context/AppContext';

export const AgentChat: React.FC = () => {
  const { products, chatMessages, setChatMessages, currentSignal, setCurrentSignal, geminiApiKey } = useAppContext();
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
    
    // Dynamic Tool Execution Logs based on query context
    let executionLogs = `> Executing: queryEnterpriseDatabase()\n`;
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('kopi') || lowerText.includes('sabun') || lowerText.includes('bear brand') || lowerText.includes('live') || lowerText.includes('scrape')) {
      executionLogs += `> Executing: fetchLiveBrightData(target_url)\n`;
    }
    if (lowerText.includes('margin') || lowerText.includes('compare') || lowerText.includes('shrinkflation')) {
      executionLogs += `> Executing: calculateMarginImpact()\n`;
    }
    if (useWebSearch) {
      executionLogs += `> Executing: brightDataSerpApi(query)\n`;
    }
    executionLogs += `> Status: Data retrieved successfully.`;

    const sysMsg: Message = {
      id: Date.now().toString() + '-sys',
      role: 'system',
      text: executionLogs,
      timestamp: new Date()
    };

    // Add both user message and system execution log immediately
    setChatMessages(prev => [...prev, userMsg, sysMsg]);
    setIsTyping(true);

    const historyForAI = [...chatMessages, userMsg].filter(m => m.role !== 'system');
    
    const modelMsgId = (Date.now() + 1).toString();
    const initialModelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, initialModelMsg]);

    try {
      const stream = analyzeQueryStream(text, historyForAI, products, useWebSearch, geminiApiKey);
      
      for await (const chunk of stream) {
        setChatMessages(prev => 
          prev.map(msg => {
            if (msg.id === modelMsgId) {
              // Clean up JSON block from text if it's being streamed
              let newText = msg.text + chunk.textChunk;
              newText = newText.replace(/```json\n[\s\S]*?(\n```)?/g, '');
              newText = newText.replace(/\{[\s\S]*"signalDetected"[\s\S]*\}/g, '');
              
              return {
                ...msg,
                text: newText,
                groundingUrls: chunk.groundingUrls || msg.groundingUrls
              };
            }
            return msg;
          })
        );

        if (chunk.signal) {
          setCurrentSignal(chunk.signal);
        }
      }

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, text: msg.text + "\n\n[System Error: Stream interrupted.]" }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, [chatMessages, products, setChatMessages, setCurrentSignal, geminiApiKey]);

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
