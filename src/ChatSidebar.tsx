import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatSidebar = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'At end of the flow I want to send a notification to my slack.',
      isUser: true,
      timestamp: new Date()
    },
    {
      id: '2',
      text: 'Sure, we can add that to the flow. But it seems like your slack is not integrated with Avirat. Do you want to integrate your Slack?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputMessage.trim(),
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    'Send me a notification',
    'Add another data source',
    'Create a condition',
    'Add email trigger'
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Build Your Workflow</h2>
        
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mb-4 transition-colors">
          <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs">+</span>
          </div>
          Add an AI Agent
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            {message.isUser ? (
              <div className="bg-blue-100 p-3 rounded-lg max-w-xs">
                <p className="text-gray-800 text-sm">
                  {message.text}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 max-w-xs">
                <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✱</span>
                </div>
                <div className="text-gray-700 text-sm leading-relaxed">
                  <p>{message.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tell me what you want to do now?"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pl-10 border-2 border-gray-900 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:border-gray-700 text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 bg-gray-800 rounded flex items-center justify-center">
                <span className="text-white text-xs">💬</span>
              </div>
            </div>
            <button
              onClick={sendMessage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Send
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(action)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-full transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;