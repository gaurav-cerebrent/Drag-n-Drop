import React from 'react';
import { 
  Edit, FileText, Share2, Search, BarChart3, User, Settings 
} from 'lucide-react';

const LeftSidebar: React.FC = () => {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 min-h-screen">
      {/* Navigation Icons */}
      <div className="flex flex-col gap-1 mt-4">
        <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group">
          <Edit className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group">
          <FileText className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group">
          <Share2 className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group">
          <Search className="w-4 h-4" />
        </button>
      </div>
      
      {/* Bottom Icons */}
      <div className="mt-auto flex flex-col gap-1">
        <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group">
          <BarChart3 className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group">
          <Settings className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mt-2">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;