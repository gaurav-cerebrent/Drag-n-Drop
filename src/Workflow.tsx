import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Plus, Workflow, Settings, X, Sparkles, MessageCircle, Layers3, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import TopBar from './TopBar';
import ChatSidebar from './ChatSidebar';
import NodesSidebar from './NodesSidebar';

interface Position {
  x: number;
  y: number;
}

interface NodeData {
  id: string;
  label: string;
  position: Position;
  color: string;
  inputs: number;
  outputs: number;
}

interface Connection {
  id: string;
  fromNodeId: string;
  fromPort: number;
  toNodeId: string;
  toPort: number;
}

const WorkflowEditor = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Zoom and pan states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState<Position>({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Sidebar toggle state
  const [rightSidebarMode, setRightSidebarMode] = useState<'chat' | 'nodes'>('chat');
  
  // Custom node popup states
  const [showCustomNodePopup, setShowCustomNodePopup] = useState(false);
  const [customNodeLabel, setCustomNodeLabel] = useState<string>('');
  const [customInputs, setCustomInputs] = useState<number>(1);
  const [customOutputs, setCustomOutputs] = useState<number>(1);
  const [customColor, setCustomColor] = useState<string>('#8b5cf6');
  
  // Connection states
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{nodeId: string; port: number; type: 'input' | 'output'} | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<Position | null>(null);
  
  // Top bar states
  const [workflowName, setWorkflowName] = useState<string>('Stagnant High-Value Deals');
  const [saveStatus, setSaveStatus] = useState<string>('Auto Saved');

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const transformRef = useRef<HTMLDivElement>(null);

  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const templates = [
    { 
      label: 'Webhook Trigger', 
      color: '#10b981', 
      inputs: 0, 
      outputs: 1,
      icon: '🔗',
      description: 'Trigger from external events'
    },
    { 
      label: 'Schedule Trigger', 
      color: '#22c55e', 
      inputs: 0, 
      outputs: 1,
      icon: '⏰',
      description: 'Run on schedule'
    },
    { 
      label: 'HTTP Request', 
      color: '#3b82f6', 
      inputs: 1, 
      outputs: 2,
      icon: '🌐',
      description: 'Make API calls'
    },
    { 
      label: 'Data Transform', 
      color: '#f97316', 
      inputs: 1, 
      outputs: 1,
      icon: '⚡',
      description: 'Process and modify data'
    },
    { 
      label: 'Condition', 
      color: '#ef4444', 
      inputs: 1, 
      outputs: 2,
      icon: '🔀',
      description: 'Branch workflow logic'
    },
    { 
      label: 'Email Sender', 
      color: '#ec4899', 
      inputs: 1, 
      outputs: 1,
      icon: '📧',
      description: 'Send email notifications'
    }
  ];

  const colorOptions = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Cyan', value: '#06b6d4' },
  ];

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
    }
  ];

  // Check if an agent is already added to the canvas
  const isAgentAdded = (agentId: string) => {
    return nodes.some(node => node.label === availableAgents.find(a => a.id === agentId)?.label);
  };

  // Add agent to canvas
  const addAgentToCanvas = (agent: any) => {
    const newNode: NodeData = {
      id: generateId(),
      label: agent.label,
      position: {
        x: Math.random() * 300 + 200,
        y: Math.random() * 200 + 150
      },
      color: agent.color,
      inputs: agent.inputs,
      outputs: agent.outputs
    };

    setNodes(prev => [...prev, newNode]);
  };

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.25));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setLastPanOffset({ x: 0, y: 0 });
  };

  // Convert screen coordinates to canvas coordinates (accounting for zoom and pan)
  const screenToCanvas = (screenPos: Position): Position => {
    if (!canvasRef.current) return screenPos;
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenPos.x - rect.left - panOffset.x) / zoomLevel,
      y: (screenPos.y - rect.top - panOffset.y) / zoomLevel
    };
  };

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = (canvasPos: Position): Position => {
    return {
      x: canvasPos.x * zoomLevel + panOffset.x,
      y: canvasPos.y * zoomLevel + panOffset.y
    };
  };

  // Get port position in CANVAS coordinates (not screen coordinates)
  const getPortCanvasPosition = (nodeId: string, portIndex: number, type: 'input' | 'output'): Position | null => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const portSpacing = 25;
    const nodeWidth = 220;
    const headerHeight = 50;
    const bodyHeight = 90;
    
    if (type === 'input') {
      const totalInputs = node.inputs;
      if (totalInputs === 0) return null;
      const startY = headerHeight + bodyHeight / 2 - ((totalInputs - 1) * portSpacing) / 2;
      return {
        x: node.position.x,
        y: node.position.y + startY + portIndex * portSpacing
      };
    } else {
      const totalOutputs = node.outputs;
      if (totalOutputs === 0) return null;
      const startY = headerHeight + bodyHeight / 2 - ((totalOutputs - 1) * portSpacing) / 2;
      return {
        x: node.position.x + nodeWidth,
        y: node.position.y + startY + portIndex * portSpacing
      };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    const currentScreenPos = { x: e.clientX, y: e.clientY };
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasScreenPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Handle panning - Fixed to work properly with zoom
    if (isPanning) {
      const deltaX = currentScreenPos.x - panStartPos.x;
      const deltaY = currentScreenPos.y - panStartPos.y;
      
      setPanOffset({
        x: lastPanOffset.x + deltaX,
        y: lastPanOffset.y + deltaY
      });
      
      return;
    }

    // Handle node dragging
    if (isDraggingNode && selectedNodeId) {
      const canvasPos = screenToCanvas(canvasScreenPos);
      const newPosition = {
        x: Math.max(0, canvasPos.x - dragOffset.x),
        y: Math.max(0, canvasPos.y - dragOffset.y)
      };
      
      setNodes(prev => prev.map(node => 
        node.id === selectedNodeId ? { ...node, position: newPosition } : node
      ));
    }

    // Handle connection drawing - Fixed coordinate system
    if (isConnecting) {
      const canvasPos = screenToCanvas(canvasScreenPos);
      setTempConnectionEnd(canvasPos);
    }
  }, [isDraggingNode, selectedNodeId, dragOffset, isConnecting, isPanning, panStartPos, lastPanOffset, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setLastPanOffset(panOffset);
    }
    setIsDraggingNode(false);
    setIsPanning(false);
  }, [isPanning, panOffset]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnectionEnd(null);
    }
    setSelectedNodeId(null);
  }, [isConnecting]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Left click
      e.preventDefault();
      setIsPanning(true);
      setPanStartPos({ x: e.clientX, y: e.clientY });
      setLastPanOffset(panOffset);
    }
  }, [panOffset]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoomLevel(prev => Math.max(0.25, Math.min(3, prev * delta)));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0 || isPanning) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    setSelectedNodeId(nodeId);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasPos = screenToCanvas({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    const offset = {
      x: canvasPos.x - node.position.x,
      y: canvasPos.y - node.position.y
    };
    
    setDragOffset(offset);
    setIsDraggingNode(true);
    
    e.preventDefault();
    e.stopPropagation();
  }, [nodes, isPanning, zoomLevel]);

  const handlePortClick = useCallback((e: React.MouseEvent, nodeId: string, portIndex: number, type: 'input' | 'output') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'output') {
      // Start new connection from output
      setConnectionStart({ nodeId, port: portIndex, type });
      setIsConnecting(true);
      // Initialize with the port position in screen coordinates
      if (!canvasRef.current) return;
      const portPos = getPortCanvasPosition(nodeId, portIndex, type);
      if (portPos) {
        const rect = canvasRef.current.getBoundingClientRect();
        const screenPos = canvasToScreen(portPos);
        setTempConnectionEnd({
          x: screenPos.x - rect.left,
          y: screenPos.y - rect.top
        });
      }
    } else if (type === 'input' && connectionStart && connectionStart.type === 'output') {
      // Complete connection to input - allow multiple connections to same input
      const duplicateConnection = connections.find(c => 
        c.fromNodeId === connectionStart.nodeId && 
        c.fromPort === connectionStart.port &&
        c.toNodeId === nodeId && 
        c.toPort === portIndex
      );
      
      // Only prevent self-connections and exact duplicates
      if (!duplicateConnection && connectionStart.nodeId !== nodeId) {
        const newConnection: Connection = {
          id: generateId(),
          fromNodeId: connectionStart.nodeId,
          fromPort: connectionStart.port,
          toNodeId: nodeId,
          toPort: portIndex
        };
        setConnections(prev => [...prev, newConnection]);
      }
      
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnectionEnd(null);
    }
  }, [connectionStart, connections, nodes]);

  const createNode = (template: any, position?: Position) => {
    const centerPosition = position || {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    };

    const newNode: NodeData = {
      id: generateId(),
      label: template.label,
      position: centerPosition,
      color: template.color,
      inputs: template.inputs || 1,
      outputs: template.outputs || 1
    };

    setNodes(prev => [...prev, newNode]);
  };

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const templateData = e.dataTransfer.getData('application/json');
    if (!templateData || !canvasRef.current) return;

    try {
      const template = JSON.parse(templateData);
      const rect = canvasRef.current.getBoundingClientRect();
      const screenDropPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      const canvasDropPos = screenToCanvas(screenDropPos);
      const dropPosition = {
        x: canvasDropPos.x - 110,
        y: canvasDropPos.y - 70
      };

      createNode(template, dropPosition);
    } catch (error) {
      console.error('Drop error:', error);
    }
  }, [zoomLevel]);

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleCreateCustomNode = () => {
    if (customNodeLabel.trim()) {
      createNode({
        label: customNodeLabel.trim(),
        color: customColor,
        inputs: customInputs,
        outputs: customOutputs
      });
      
      // Reset form
      setCustomNodeLabel('');
      setCustomInputs(1);
      setCustomOutputs(1);
      setCustomColor('#8b5cf6');
      setShowCustomNodePopup(false);
    }
  };

  // Render temporary connection - Fixed to work with proper coordinates
  const renderTempConnection = () => {
    if (!isConnecting || !connectionStart || !tempConnectionEnd) return null;
    
    const startPos = getPortCanvasPosition(connectionStart.nodeId, connectionStart.port, connectionStart.type);
    if (!startPos) return null;
    
    const midX = startPos.x + (tempConnectionEnd.x - startPos.x) * 0.6;
    const pathD = `M ${startPos.x} ${startPos.y} C ${midX} ${startPos.y} ${midX} ${tempConnectionEnd.y} ${tempConnectionEnd.x} ${tempConnectionEnd.y}`;
    
    return (
      <g key="temp-connection">
        {/* Glow effect */}
        <path
          d={pathD}
          stroke="#8b5cf6"
          strokeWidth="8"
          fill="none"
          opacity="0.3"
          filter="url(#connection-glow)"
        />
        {/* Main dotted line */}
        <path
          d={pathD}
          stroke="#8b5cf6"
          strokeWidth="4"
          fill="none"
          strokeDasharray="12,8"
          opacity="0.8"
          className="animate-pulse"
        />
        {/* Animated flow dots */}
        <circle r="4" fill="#ec4899" opacity="0.9">
          <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* End point indicator */}
        <circle
          cx={tempConnectionEnd.x}
          cy={tempConnectionEnd.y}
          r="8"
          fill="#8b5cf6"
          stroke="#ec4899"
          strokeWidth="3"
          className="animate-pulse"
          style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' }}
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 font-sans">
      {/* Top Navigation Bar */}
      <TopBar 
        workflowName={workflowName} 
        setWorkflowName={setWorkflowName} 
        saveStatus={saveStatus} 
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Custom Node Popup */}
        {showCustomNodePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-96 max-w-90vw shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-800 text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Create Custom Node
                </h3>
                <button
                  onClick={() => setShowCustomNodePopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Node Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter node name..."
                    value={customNodeLabel}
                    onChange={(e) => setCustomNodeLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Input Ports
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={customInputs}
                      onChange={(e) => setCustomInputs(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Output Ports
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={customOutputs}
                      onChange={(e) => setCustomOutputs(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Node Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setCustomColor(color.value)}
                        className={`h-10 rounded-lg transition-all duration-200 ${
                          customColor === color.value ? 'ring-2 ring-gray-400 scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                      >
                        <span className="text-xs text-white font-medium">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCustomNodePopup(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomNode}
                  disabled={!customNodeLabel.trim()}
                  className="flex-1 py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
                  style={{
                    backgroundColor: customNodeLabel.trim() ? customColor : '#9ca3af'
                  }}
                >
                  Create Node
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              Workflow Builder
            </h1>
            <p className="text-gray-500 text-sm mt-2">Drag & drop to create powerful workflows</p>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Node Templates
            </h2>
            
            <div className="space-y-3">
              {templates.map((template, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(template));
                  }}
                  className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-move transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-gray-300"
                  style={{
                    background: `linear-gradient(135deg, ${template.color}15 0%, transparent 100%)`,
                    borderLeftColor: template.color,
                    borderLeftWidth: '4px'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1">
                      <div className="text-gray-800 font-medium text-sm">{template.label}</div>
                      <div className="text-gray-600 text-xs mt-1">{template.description}</div>
                      <div className="text-gray-500 text-xs mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          In: {template.inputs}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Out: {template.outputs}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowCustomNodePopup(true)}
              className="w-full mt-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus size={16} />
              Create Custom Node
            </button>
          </div>

          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setNodes([]);
                setConnections([]);
                setSelectedNodeId(null);
              }}
              className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-30 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button
              onClick={zoomIn}
              className="px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-2 hover:bg-gray-50 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Level Indicator */}
          <div className="absolute top-4 left-20 z-30 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* Toggle Buttons */}
          <div className="absolute top-4 right-4 z-30 flex bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setRightSidebarMode('chat')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                rightSidebarMode === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setRightSidebarMode('nodes')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                rightSidebarMode === 'nodes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Layers3 className="w-4 h-4" />
              Nodes
            </button>
          </div>

          {/* Canvas Area */}
          <div
            ref={canvasRef}
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgb(156 163 175) 1px, transparent 0),
                linear-gradient(0deg, transparent 24%, rgb(229 231 235 / 0.5) 25%, rgb(229 231 235 / 0.5) 26%, transparent 27%, transparent 74%, rgb(229 231 235 / 0.5) 75%, rgb(229 231 235 / 0.5) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgb(229 231 235 / 0.5) 25%, rgb(229 231 235 / 0.5) 26%, transparent 27%, transparent 74%, rgb(229 231 235 / 0.5) 75%, rgb(229 231 235 / 0.5) 76%, transparent 77%, transparent)
              `,
              backgroundSize: `${25 * zoomLevel}px ${25 * zoomLevel}px, ${25 * zoomLevel}px ${25 * zoomLevel}px, ${25 * zoomLevel}px ${25 * zoomLevel}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }}
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
          >
            {/* Transform Container */}
            <div
              ref={transformRef}
              className="absolute inset-0"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: '0 0'
              }}
            >
              {/* SVG for connections - positioned within transform container */}
              <svg
                ref={svgRef}
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  width: `${100 / zoomLevel}%`,
                  height: `${100 / zoomLevel}%`
                }}
              >
                <defs>
                  <marker id="arrowhead" markerWidth="12" markerHeight="8" 
                  refX="10" refY="4" orient="auto">
                    <polygon points="0 0, 12 4, 0 8" fill="#10b981" />
                  </marker>
                  <filter id="connection-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                
                {/* Render connections using canvas coordinates */}
                {connections.map((connection) => {
                  const fromPos = getPortCanvasPosition(connection.fromNodeId, connection.fromPort, 'output');
                  const toPos = getPortCanvasPosition(connection.toNodeId, connection.toPort, 'input');
                  
                  if (!fromPos || !toPos) return null;
                  
                  const midX = fromPos.x + (toPos.x - fromPos.x) * 0.6;
                  const pathD = `M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y} ${midX} ${toPos.y} ${toPos.x} ${toPos.y}`;
                  
                  return (
                    <g key={connection.id}>
                      {/* Background glow path */}
                      <path
                        d={pathD}
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="none"
                        opacity="0.2"
                        filter="url(#connection-glow)"
                      />
                      {/* Main connection path */}
                      <path
                        d={pathD}
                        stroke="#10b981"
                        strokeWidth="4"
                        fill="none"
                        opacity="0.8"
                        className="transition-all duration-200 hover:opacity-100"
                      />
                      {/* Animated flow indicator */}
                      <circle
                        r="3"
                        fill="#34d399"
                        opacity="0.9"
                      >
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path={pathD}
                        />
                        <animate
                          attributeName="opacity"
                          values="0.9;0.4;0.9"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Delete button */}
                      <g style={{ pointerEvents: 'all' }}>
                        <circle
                          cx={midX}
                          cy={(fromPos.y + toPos.y) / 2}
                          r="12"
                          fill="#dc2626"
                          stroke="#fff"
                          strokeWidth="2"
                          className="cursor-pointer hover:fill-red-500 transition-all duration-200 hover:scale-110"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConnections(prev => prev.filter(c => c.id !== connection.id));
                          }}
                        />
                        <text
                          x={midX}
                          y={(fromPos.y + toPos.y) / 2}
                          textAnchor="middle"
                          dy="0.35em"
                          fontSize="14"
                          fill="white"
                          className="font-bold select-none cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConnections(prev => prev.filter(c => c.id !== connection.id));
                          }}
                        >
                          ×
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Render temporary connection within the same coordinate system */}
                {renderTempConnection()}
              </svg>

              {/* Nodes */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`absolute w-55 h-35 rounded-xl shadow-2xl transition-all duration-200 select-none z-20 ${
                    selectedNodeId === node.id 
                      ? 'ring-2 ring-blue-400 scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: '220px',
                    height: '140px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    border: `2px solid ${selectedNodeId === node.id ? '#3b82f6' : '#d1d5db'}`,
                    boxShadow: selectedNodeId === node.id ? '0 10px 25px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                >
                  <div
                    className="p-4 rounded-t-lg text-white font-bold text-sm cursor-grab active:cursor-grabbing flex items-center justify-between h-12"
                    style={{
                      background: `linear-gradient(135deg, ${node.color} 0%, ${node.color}dd 100%)`
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  >
                    <span className="truncate flex-1">{node.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="p-4 h-28 flex justify-between items-center relative">
                    <div className="flex flex-col justify-center h-full">
                      {Array.from({ length: node.inputs }, (_, i) => (
                        <div
                          key={`input-${i}`}
                          className="w-4 h-4 bg-green-500 border-2 border-green-600 rounded-full cursor-pointer hover:scale-125 transition-transform absolute z-30 shadow-lg"
                          style={{
                            left: '-10px',
                            top: `${50 + (i - (node.inputs - 1) / 2) * 25}px`
                          }}
                          onClick={(e) => handlePortClick(e, node.id, i, 'input')}
                        />
                      ))}
                    </div>

                    <div className="flex-1 text-center text-xs text-gray-500 px-4">
                      <div className="text-gray-700 font-medium mb-1">ID: {node.id.slice(-6)}</div>
                      <div className="flex justify-center items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {node.inputs}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {node.outputs}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center h-full">
                      {Array.from({ length: node.outputs }, (_, i) => (
                        <div
                          key={`output-${i}`}
                          className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded-full cursor-pointer hover:scale-125 transition-transform absolute z-30 shadow-lg"
                          style={{
                            right: '-10px',
                            top: `${50 + (i - (node.outputs - 1) / 2) * 25}px`
                          }}
                          onClick={(e) => handlePortClick(e, node.id, i, 'output')}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-600 max-w-md">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Workflow className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Create Your First Workflow!</h3>
                  <p className="text-gray-600 mb-6">Drag templates from the sidebar or use the chat to build your workflow</p>
                  <div className="text-sm text-gray-500 space-y-2">
                    <div>• Drag nodes by their headers to reposition</div>
                    <div>• Click any port → then click opposite port type</div>
                    <div>• Green (input) ↔ Blue (output) connections</div>
                    <div>• Click red circles on connections to delete them</div>
                    <div>• Multiple nodes can connect to the same input</div>
                    <div>• Use Ctrl+Scroll or zoom controls to zoom</div>
                    <div>• Middle-click or Ctrl+Click to pan around</div>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Instructions */}
            {isConnecting && connectionStart && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 text-sm shadow-lg z-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  Click on a green input port to complete the connection
                </div>
                <div className="text-xs text-gray-500 mt-1">Or click anywhere to cancel</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Conditional Rendering */}
        {rightSidebarMode === 'chat' ? (
          <ChatSidebar />
        ) : (
          <NodesSidebar 
            addAgentToCanvas={addAgentToCanvas}
            isAgentAdded={isAgentAdded}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowEditor;