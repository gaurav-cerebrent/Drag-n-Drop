import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Plus, Workflow, Zap, Globe, Settings, X, Sparkles } from 'lucide-react';

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
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  
  // Custom node popup states
  const [showCustomNodePopup, setShowCustomNodePopup] = useState(false);
  const [customNodeLabel, setCustomNodeLabel] = useState<string>('');
  const [customInputs, setCustomInputs] = useState<number>(1);
  const [customOutputs, setCustomOutputs] = useState<number>(1);
  const [customColor, setCustomColor] = useState<string>('#8b5cf6');
  
  // Connection states
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{nodeId: string, port: number, type: 'input' | 'output'} | null>(null);
  const [tempConnection, setTempConnection] = useState<Position | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  // Get port position relative to canvas
  const getPortPosition = (nodeId: string, portIndex: number, type: 'input' | 'output'): Position | null => {
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

    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setMousePosition(currentPos);

    // Handle node dragging
    if (isDraggingNode && selectedNodeId) {
      const newPosition = {
        x: Math.max(0, currentPos.x - dragOffset.x),
        y: Math.max(0, currentPos.y - dragOffset.y)
      };
      
      setNodes(prev => prev.map(node => 
        node.id === selectedNodeId ? { ...node, position: newPosition } : node
      ));
    }

    // Handle connection drawing
    if (isConnecting) {
      setTempConnection(currentPos);
    }
  }, [isDraggingNode, selectedNodeId, dragOffset, isConnecting]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingNode(false);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnection(null);
    }
    setSelectedNodeId(null);
  }, [isConnecting]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    setSelectedNodeId(nodeId);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offset = {
      x: (e.clientX - rect.left) - node.position.x,
      y: (e.clientY - rect.top) - node.position.y
    };
    
    setDragOffset(offset);
    setIsDraggingNode(true);
    
    e.preventDefault();
    e.stopPropagation();
  }, [nodes]);

  const handlePortClick = useCallback((e: React.MouseEvent, nodeId: string, portIndex: number, type: 'input' | 'output') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'output') {
      // Start new connection from output
      setConnectionStart({ nodeId, port: portIndex, type });
      setIsConnecting(true);
      const portPos = getPortPosition(nodeId, portIndex, type);
      if (portPos) {
        setTempConnection(portPos);
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
      setTempConnection(null);
    }
  }, [connectionStart, connections, getPortPosition]);

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
      const dropPosition = {
        x: e.clientX - rect.left - 110,
        y: e.clientY - rect.top - 70
      };

      createNode(template, dropPosition);
    } catch (error) {
      console.error('Drop error:', error);
    }
  }, []);

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

  return (
    <div className="flex h-screen w-screen bg-slate-900 font-sans">
      {/* Custom Node Popup */}
      {showCustomNodePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 w-96 max-w-90vw shadow-2xl border border-slate-600">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Create Custom Node
              </h3>
              <button
                onClick={() => setShowCustomNodePopup(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Node Name
                </label>
                <input
                  type="text"
                  placeholder="Enter node name..."
                  value={customNodeLabel}
                  onChange={(e) => setCustomNodeLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Input Ports
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={customInputs}
                    onChange={(e) => setCustomInputs(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Output Ports
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={customOutputs}
                    onChange={(e) => setCustomOutputs(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Node Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setCustomColor(color.value)}
                      className={`h-10 rounded-lg transition-all duration-200 ${
                        customColor === color.value ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
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
                className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomNode}
                disabled={!customNodeLabel.trim()}
                className="flex-1 py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
                style={{
                  backgroundColor: customNodeLabel.trim() ? customColor : '#64748b'
                }}
              >
                Create Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Sidebar */}
      <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            Workflow Builder
          </h1>
          <p className="text-slate-400 text-sm mt-2">Drag & drop to create powerful workflows</p>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
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
                className="group p-4 bg-slate-700 hover:bg-slate-600 rounded-xl cursor-move transition-all duration-200 hover:scale-105 border border-slate-600 hover:border-slate-500"
                style={{
                  background: `linear-gradient(135deg, ${template.color}15 0%, transparent 100%)`,
                  borderLeftColor: template.color,
                  borderLeftWidth: '4px'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{template.label}</div>
                    <div className="text-slate-400 text-xs mt-1">{template.description}</div>
                    <div className="text-slate-500 text-xs mt-2 flex items-center gap-3">
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

        <div className="p-6 border-t border-slate-700">
          <button
            onClick={() => {
              setNodes([]);
              setConnections([]);
              setSelectedNodeId(null);
            }}
            className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden">
        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgb(71 85 105) 1px, transparent 0),
              linear-gradient(0deg, transparent 24%, rgb(30 41 59 / 0.3) 25%, rgb(30 41 59 / 0.3) 26%, transparent 27%, transparent 74%, rgb(30 41 59 / 0.3) 75%, rgb(30 41 59 / 0.3) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgb(30 41 59 / 0.3) 25%, rgb(30 41 59 / 0.3) 26%, transparent 27%, transparent 74%, rgb(30 41 59 / 0.3) 75%, rgb(30 41 59 / 0.3) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '25px 25px, 25px 25px, 25px 25px'
          }}
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleCanvasClick}
        >
          {/* SVG for connections */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            <defs>
              <marker id="arrowhead" markerWidth="12" markerHeight="8" 
              refX="10" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" fill="#10b981" />
              </marker>
              <marker id="arrowhead-glow" markerWidth="14" markerHeight="10" 
              refX="11" refY="5" orient="auto">
                <polygon points="0 0, 14 5, 0 10" fill="#34d399" opacity="0.6" />
              </marker>
              <filter id="connection-glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            
            {/* Render connections */}
            {connections.map((connection, index) => {
              const fromPos = getPortPosition(connection.fromNodeId, connection.fromPort, 'output');
              const toPos = getPortPosition(connection.toNodeId, connection.toPort, 'input');
              
              if (!fromPos || !toPos) return null;
              
              const midX = fromPos.x + (toPos.x - fromPos.x) * 0.6;
              
              return (
                <g key={connection.id}>
                  {/* Glow effect background */}
                  <path
                    d={`M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y} ${midX} ${toPos.y} ${toPos.x} ${toPos.y}`}
                    stroke="url(#connectionGradient)"
                    strokeWidth="6"
                    fill="none"
                    opacity="0.3"
                    filter="url(#connection-glow)"
                  />
                  {/* Main connection line */}
                  <path
                    d={`M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y} ${midX} ${toPos.y} ${toPos.x} ${toPos.y}`}
                    stroke="url(#connectionGradient)"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="drop-shadow-lg hover:stroke-opacity-80 transition-all duration-200"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))'
                    }}
                  />
                  {/* Animated flow effect */}
                  <circle
                    r="4"
                    fill="#34d399"
                    opacity="0.8"
                  >
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={`M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y} ${midX} ${toPos.y} ${toPos.x} ${toPos.y}`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.3;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Connection delete button */}
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
            
            {/* Temporary connection while dragging */}
            {isConnecting && connectionStart && tempConnection && (
              (() => {
                const startPos = getPortPosition(connectionStart.nodeId, connectionStart.port, connectionStart.type);
                if (!startPos) return null;
                
                const midX = startPos.x + (tempConnection.x - startPos.x) * 0.6;
                
                return (
                  <g key="temp-connection">
                    {/* Glow background */}
                    <path
                      d={`M ${startPos.x} ${startPos.y} C ${midX} ${startPos.y} ${midX} ${tempConnection.y} ${tempConnection.x} ${tempConnection.y}`}
                      stroke="url(#tempGradient)"
                      strokeWidth="5"
                      fill="none"
                      opacity="0.4"
                      filter="url(#connection-glow)"
                    />
                    {/* Main temp line */}
                    <path
                      d={`M ${startPos.x} ${startPos.y} C ${midX} ${startPos.y} ${midX} ${tempConnection.y} ${tempConnection.x} ${tempConnection.y}`}
                      stroke="url(#tempGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="8,4"
                      className="animate-pulse"
                    />
                    <circle
                      cx={tempConnection.x}
                      cy={tempConnection.y}
                      r="6"
                      fill="#8b5cf6"
                      stroke="#ec4899"
                      strokeWidth="2"
                      className="animate-pulse"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' }}
                    />
                  </g>
                );
              })()
            )}
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
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: `2px solid ${selectedNodeId === node.id ? '#3b82f6' : '#475569'}`
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
            >
              {/* Header */}
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
              
              {/* Body with ports */}
              <div className="p-4 h-28 flex justify-between items-center relative">
                {/* Input ports */}
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

                {/* Node info */}
                <div className="flex-1 text-center text-xs text-slate-400 px-4">
                  <div className="text-slate-300 font-medium mb-1">ID: {node.id.slice(-6)}</div>
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

                {/* Output ports */}
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

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-slate-400 max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Workflow className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Create Your First Workflow!</h3>
                <p className="text-slate-500 mb-6">Drag templates from the sidebar to get started</p>
                <div className="text-sm text-slate-600 space-y-2">
                  <div>• Drag nodes by their headers to reposition</div>
                  <div>• Click any port → then click opposite port type</div>
                  <div>• Green (input) ↔ Blue (output) connections</div>
                  <div>• Click red circles on connections to delete them</div>
                  <div>• Multiple nodes can connect to the same input</div>
                </div>
              </div>
            </div>
          )}

          {/* Connection Instructions */}
          {isConnecting && connectionStart && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm shadow-lg z-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                Click on a green input port to complete the connection
              </div>
              <div className="text-xs text-slate-400 mt-1">Or click anywhere to cancel</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditor;