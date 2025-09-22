import React from 'react';
import { ChevronLeft, Sparkles, Eye, Play, Menu } from 'lucide-react';

interface TopBarProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  saveStatus: string;
}

const TopBar: React.FC<TopBarProps> = ({ workflowName, setWorkflowName, saveStatus }) => {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        {/* Colorful Circular Logo */}
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
        
        <ChevronLeft className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="text-lg font-semibold text-gray-800 bg-transparent border-none outline-none"
        />
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
          {saveStatus}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">100%</div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors">
          <Sparkles className="w-4 h-4" />
          Create mode
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
          <Eye className="w-4 h-4" />
          Preview Output
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
          <Play className="w-4 h-4" />
          Execute Flow
        </button>
        <button className="p-1.5 text-gray-400 hover:text-gray-600">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;