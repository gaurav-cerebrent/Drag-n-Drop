import React, { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';

interface NodesProps {
  addAgentToCanvas: (agent: any) => void;
  isAgentAdded: (agentId: string) => boolean;
}

const NodesSidebar: React.FC<NodesProps> = ({ addAgentToCanvas, isAgentAdded }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const availableAgents = [
    { 
      id: 'crm-watcher',
      label: 'CRM watcher agent', 
      color: '#3b82f6', 
      inputs: 0, 
      outputs: 1,
      icon: '👁️',
      description: 'Watch CRM for changes',
      category: 'Most Used'
    },
    { 
      id: 'deal-evaluator',
      label: 'Deal Evaluator agent', 
      color: '#10b981', 
      inputs: 1, 
      outputs: 2,
      icon: '🎯',
      description: 'Evaluate deal quality',
      category: 'Most Used'
    },
    { 
      id: 'content-writer',
      label: 'Content writer agent', 
      color: '#f97316', 
      inputs: 1, 
      outputs: 1,
      icon: '✍️',
      description: 'Generate content',
      category: 'Most Used'
    },
    { 
      id: 'mailer-agent',
      label: 'Mailer agent', 
      color: '#ec4899', 
      inputs: 1, 
      outputs: 1,
      icon: '📧',
      description: 'Send emails',
      category: 'Most Used'
    },
    { 
      id: 'crm-logger',
      label: 'CRM logger agent', 
      color: '#8b5cf6', 
      inputs: 1, 
      outputs: 1,
      icon: '📝',
      description: 'Log to CRM system',
      category: 'Most Used'
    },
    { 
      id: 'salesforce-agent',
      label: 'Salesforce Agent', 
      color: '#0ea5e9', 
      inputs: 1, 
      outputs: 1,
      icon: '☁️',
      description: 'Connect to Salesforce',
      category: 'Others'
    },
    { 
      id: 'report-creator',
      label: 'Report Creator', 
      color: '#7c3aed', 
      inputs: 1, 
      outputs: 1,
      icon: '📊',
      description: 'Generate reports',
      category: 'Others'
    },
    { 
      id: 'pdf-generator',
      label: 'PDF Generator', 
      color: '#dc2626', 
      inputs: 1, 
      outputs: 1,
      icon: '📄',
      description: 'Create PDF documents',
      category: 'Others'
    }
  ];

  // Filter agents based on search query
  const filteredAgents = availableAgents.filter(agent =>
    agent.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Build Your Workflow</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search All Agents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Most Used Section */}
        <div className="p-6">
          <h3 className="text-gray-700 font-semibold mb-4 text-sm">Most Used</h3>
          <div className="space-y-2">
            {filteredAgents
              .filter(agent => agent.category === 'Most Used')
              .map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{agent.icon}</div>
                    <div>
                      <div className="text-gray-800 text-sm font-medium">{agent.label}</div>
                      <div className="text-gray-500 text-xs">{agent.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isAgentAdded(agent.id) ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        <span>Added</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addAgentToCanvas(agent)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add to workflow
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Others Section */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-gray-700 font-semibold mb-4 text-sm">Others</h3>
          <div className="space-y-2">
            {filteredAgents
              .filter(agent => agent.category === 'Others')
              .map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{agent.icon}</div>
                    <div>
                      <div className="text-gray-800 text-sm font-medium">{agent.label}</div>
                      <div className="text-gray-500 text-xs">{agent.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isAgentAdded(agent.id) ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        <span>Added</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addAgentToCanvas(agent)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add to workflow
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* No Results */}
        {filteredAgents.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-gray-500 text-sm">No agents found matching "{searchQuery}"</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodesSidebar;