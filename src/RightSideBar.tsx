import React, { useState } from 'react';
import { 
  Plus, Search, Paperclip, Smile, MessageCircle, Layers3, Settings 
} from 'lucide-react';

interface Agent {
  id: string;
  label: string;
  color: string;
  inputs: number;
  outputs: number;
  category: string;
}

interface RightSidebarProps {
  addAgentToCanvas: (agent: Agent) => void;
  isAgentAdded: (agentId: string) => boolean;
  mode: 'chat' | 'nodes';
  onModeChange: (mode: 'chat' | 'nodes') => void;
}

interface CustomNodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agent: Agent) => void;
}

const CustomNodeForm: React.FC<CustomNodeFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [customNodeName, setCustomNodeName] = useState('');
  const [customNodeInputs, setCustomNodeInputs] = useState(1);
  const [customNodeOutputs, setCustomNodeOutputs] = useState(1);
  const [customNodeColor, setCustomNodeColor] = useState('#6366f1');

  const colorOptions = [
    '#6366f1', '#10b981', '#f97316', '#ec4899', '#8b5cf6', 
    '#ef4444', '#f59e0b', '#06b6d4', '#84cc16', '#6366f1'
  ];

  const handleSubmit = () => {
    if (customNodeName.trim()) {
      const customAgent: Agent = {
        id: `custom-${Date.now()}`,
        label: customNodeName,
        color: customNodeColor,
        inputs: customNodeInputs,
        outputs: customNodeOutputs,
        category: 'Custom'
      };
      onSubmit(customAgent);
      setCustomNodeName('');
      setCustomNodeInputs(1);
      setCustomNodeOutputs(1);
      setCustomNodeColor('#6366f1');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Custom Agent</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
            <input
              type="text"
              value={customNodeName}
              onChange={(e) => setCustomNodeName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter agent name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Input Ports</label>
              <input
                type="number"
                min="0"
                max="5"
                value={customNodeInputs}
                onChange={(e) => setCustomNodeInputs(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Ports</label>
              <input
                type="number"
                min="0"
                max="5"
                value={customNodeOutputs}
                onChange={(e) => setCustomNodeOutputs(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Node Color</label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="color"
                value={customNodeColor}
                onChange={(e) => setCustomNodeColor(e.target.value)}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{customNodeColor}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => setCustomNodeColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                    customNodeColor === color ? 'border-gray-400 ring-2 ring-purple-500' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!customNodeName.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  addAgentToCanvas, 
  isAgentAdded, 
  mode, 
  onModeChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [showCustomNodeForm, setShowCustomNodeForm] = useState(false);

  const availableAgents = [
    { 
      id: 'crm-watcher',
      label: 'CRM watcher agent', 
      color: '#6366f1', 
      inputs: 0, 
      outputs: 1,
      category: 'Most Used'
    },
    { 
      id: 'deal-evaluator',
      label: 'Deal evaluator agent', 
      color: '#6366f1', 
      inputs: 1, 
      outputs: 2,
      category: 'Most Used'
    },
    { 
      id: 'content-writer',
      label: 'Content writer agent', 
      color: '#6366f1', 
      inputs: 1, 
      outputs: 1,
      category: 'Most Used'
    },
    { 
      id: 'mailer-agent',
      label: 'Mailer agent', 
      color: '#6366f1', 
      inputs: 1, 
      outputs: 1,
      category: 'Most Used'
    },
    { 
      id: 'crm-logger',
      label: 'CRM logger agent', 
      color: '#6366f1', 
      inputs: 1, 
      outputs: 1,
      category: 'Most Used'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  const filteredAgents = availableAgents.filter(agent =>
    agent.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Nodes Mode Content
  const renderNodesMode = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Build Your Workflow</h2>
        <button 
          onClick={() => setShowCustomNodeForm(true)}
          className="w-full bg-black text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          • Add an AI agent
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search AI Agents"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Most Used Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4 uppercase tracking-wide">MOST USED</h3>
          <div className="space-y-3">
            {filteredAgents.slice(0, 5).map(agent => (
              <div key={agent.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-6 h-6 bg-black rounded flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{agent.label}</span>
                </div>
                {isAgentAdded(agent.id) ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium">Added</span>
                  </div>
                ) : (
                  <button
                    onClick={() => addAgentToCanvas(agent)}
                    className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-700 transition-colors"
                  >
                    Add to the workflow
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Others Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4 uppercase tracking-wide">OTHERS</h3>
          <div className="space-y-3">
            {filteredAgents.map(agent => (
              <div key={`other-${agent.id}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-6 h-6 bg-black rounded flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{agent.label}</span>
                </div>
                <button
                  onClick={() => addAgentToCanvas({...agent, id: `other-${agent.id}`})}
                  className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  Add to the workflow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-gray-200 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tell me what you want to do now?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="w-full pl-3 pr-20 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <button className="w-full bg-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-black rounded"></div>
            </div>
            Send me a notification
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add another datasource
          </button>
        </div>
      </div>
    </>
  );

  // Chat Mode Content
  const renderChatMode = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Build Your Workflow</h2>
        <button 
          onClick={() => setShowCustomNodeForm(true)}
          className="w-full bg-black text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          • Add an AI agent
        </button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {/* User Message */}
          <div className="text-sm text-gray-800">
            At the end of the flow I want to send a notification to my slack
          </div>

          {/* System Response */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              Sure, we can add that to the flow, but it seems like your slack is not integrated with Airkit. Do you want to integrate your slack?
            </p>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                Yes
              </button>
              <button className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                No
              </button>
            </div>
          </div>

          {/* Configuration Item */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Opening Slack configuration...</span>
          </div>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-gray-200 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tell me what you want to do now?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="w-full pl-3 pr-20 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <button className="w-full bg-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-black rounded"></div>
            </div>
            Send me a notification
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add another datasource
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <CustomNodeForm 
        isOpen={showCustomNodeForm}
        onClose={() => setShowCustomNodeForm(false)}
        onSubmit={addAgentToCanvas}
      />

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 m-3 rounded-lg p-1">
        <button
          onClick={() => onModeChange('nodes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'nodes' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers3 className="w-4 h-4" />
          Nodes
        </button>
        <button
          onClick={() => onModeChange('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'chat' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
      </div>

      {mode === 'nodes' ? renderNodesMode() : renderChatMode()}
    </div>
  );
};

export default RightSidebar;