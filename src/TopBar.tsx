import React from 'react';
import { ArrowLeft, Undo2, Redo2, Maximize2, Eye, Play, MoreHorizontal } from 'lucide-react';

interface TopBarProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  saveStatus: string;
}

const TopBar: React.FC<TopBarProps> = ({ workflowName, setWorkflowName, saveStatus }) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold text-gray-800 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
          />
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{saveStatus}</span>
        </div>
      </div>

      {/* Center Section - Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
            Create Mode
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
            Workflows
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Undo2 className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Redo2 className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Maximize2 className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
          Preview Output
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Play className="w-4 h-4" />
          Execute Flow
        </button>
        
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;