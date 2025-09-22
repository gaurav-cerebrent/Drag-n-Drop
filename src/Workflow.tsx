import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Settings
} from 'lucide-react';
import TopBar from './topbar';
import LeftSidebar from './leftsidebar';
import RightSidebar from './rightsidebar';

interface Node {
  id: string;
  label: string;
  position: { x: number; y: number };
  color: string;
  inputs: number;
  outputs: number;
  type: string;
  description?: string;
}

interface Connection {
  id: string;
  fromNodeId: string;
  fromPort: number;
  toNodeId: string;
  toPort: number;
}

interface Agent {
  id: string;
  label: string;
  color: string;
  inputs: number;
  outputs: number;
  category: string;
}

const WorkflowEditor: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'salesforce-agent',
      label: 'Salesforce Agent',
      position: { x: 300, y: 100 },
      color: '#6366f1',
      inputs: 0,
      outputs: 1,
      type: 'Data Source Agent',
      description: 'Collects data from salesforce'
    },
    {
      id: 'report-creator',
      label: 'Report Creator',
      position: { x: 300, y: 260 },
      color: '#6366f1',
      inputs: 1,
      outputs: 1,
      type: 'Processing Agent',
      description: 'Creates and formats the report'
    },
    {
      id: 'pdf-generator',
      label: 'PDF Generator',
      position: { x: 300, y: 420 },
      color: '#6366f1',
      inputs: 1,
      outputs: 1,
      type: 'Response Agent',
      description: 'Converts the report to PDF format'
    },
    {
      id: 'mailer',
      label: 'Mailer',
      position: { x: 300, y: 580 },
      color: '#6366f1',
      inputs: 1,
      outputs: 0,
      type: 'Notifier Agent',
      description: 'Mail the report to your gmail address'
    }
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'conn-1',
      fromNodeId: 'salesforce-agent',
      fromPort: 0,
      toNodeId: 'report-creator',
      toPort: 0
    },
    {
      id: 'conn-2',
      fromNodeId: 'report-creator',
      fromPort: 0,
      toNodeId: 'pdf-generator',
      toPort: 0
    },
    {
      id: 'conn-3',
      fromNodeId: 'pdf-generator',
      fromPort: 0,
      toNodeId: 'mailer',
      toPort: 0
    }
  ]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Zoom and pan states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  
  // Sidebar mode
  const [rightSidebarMode, setRightSidebarMode] = useState<'chat' | 'nodes'>('nodes');
  
  // Connection states
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{nodeId: string; port: number; type: string} | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{x: number; y: number} | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Top bar states
  const [workflowName, setWorkflowName] = useState('Stagnant High-Value Deals');
  const [saveStatus, setSaveStatus] = useState('Auto saved');

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const transformRef = useRef<HTMLDivElement>(null);

  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Check if an agent is already added to the canvas
  const isAgentAdded = (agentId: string) => {
    return nodes.some(node => node.id === agentId);
  };

  // Add agent to canvas
  const addAgentToCanvas = (agent: Agent) => {
    if (isAgentAdded(agent.id)) return;
    
    const newNode: Node = {
      id: agent.id,
      label: agent.label,
      position: {
        x: Math.random() * 300 + 200,
        y: Math.random() * 200 + 150
      },
      color: agent.color,
      inputs: agent.inputs,
      outputs: agent.outputs,
      type: 'Processing Agent',
      description: 'Custom agent functionality'
    };

    setNodes(prev => [...prev, newNode]);
  };

  // Delete node function
  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Edit node function
  const editNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const newLabel = prompt('Edit node name:', node.label);
      if (newLabel && newLabel.trim()) {
        setNodes(prev => prev.map(n => 
          n.id === nodeId ? { ...n, label: newLabel.trim() } : n
        ));
      }
    }
  };

  // Settings node function
  const openNodeSettings = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      alert(`Settings for ${node.label}\nType: ${node.type}\nInputs: ${node.inputs}\nOutputs: ${node.outputs}`);
    }
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

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenPos: {x: number; y: number}) => {
    if (!canvasRef.current) return screenPos;
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenPos.x - rect.left - panOffset.x) / zoomLevel,
      y: (screenPos.y - rect.top - panOffset.y) / zoomLevel
    };
  };

  // Get port position in canvas coordinates
  const getPortCanvasPosition = (nodeId: string, portIndex: number, type: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const nodeWidth = 240;
    const nodeHeight = 130;
    
    if (type === 'input') {
      return {
        x: node.position.x,
        y: node.position.y + nodeHeight / 2
      };
    } else {
      return {
        x: node.position.x + nodeWidth,
        y: node.position.y + nodeHeight / 2
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

    // Handle panning
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

    // Handle connection drawing
    if (isConnecting) {
      const canvasPos = screenToCanvas(canvasScreenPos);
      setTempConnectionEnd(canvasPos);
    }
  }, [isDraggingNode, selectedNodeId, dragOffset, isConnecting, isPanning, panStartPos, lastPanOffset, zoomLevel, nodes]);

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
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStartPos({ x: e.clientX, y: e.clientY });
      setLastPanOffset(panOffset);
    }
  }, [panOffset]);

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
  }, [nodes, isPanning]);

  const handlePortClick = useCallback((e: React.MouseEvent, nodeId: string, portIndex: number, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'output') {
      setConnectionStart({ nodeId, port: portIndex, type });
      setIsConnecting(true);
      const portPos = getPortCanvasPosition(nodeId, portIndex, type);
      if (portPos) {
        setTempConnectionEnd(portPos);
      }
    } else if (type === 'input' && connectionStart && connectionStart.type === 'output') {
      const duplicateConnection = connections.find(c => 
        c.fromNodeId === connectionStart.nodeId && 
        c.fromPort === connectionStart.port &&
        c.toNodeId === nodeId && 
        c.toPort === portIndex
      );
      
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

  const renderTempConnection = () => {
    if (!isConnecting || !connectionStart || !tempConnectionEnd) return null;
    
    const startPos = getPortCanvasPosition(connectionStart.nodeId, connectionStart.port, connectionStart.type);
    if (!startPos) return null;
    
    return (
      <g key="temp-connection">
        <path
          d={`M ${startPos.x} ${startPos.y} L ${tempConnectionEnd.x} ${tempConnectionEnd.y}`}
          stroke="#6366f1"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          opacity="0.8"
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 font-sans">
      <TopBar 
        workflowName={workflowName} 
        setWorkflowName={setWorkflowName} 
        saveStatus={saveStatus} 
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        <div className="flex-1 relative bg-white overflow-hidden">
          {/* Zoom Controls - Vertical Layout */}
          <div className="absolute top-4 right-4 z-30 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button onClick={zoomIn} className="px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-200" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="px-3 py-2 border-b border-gray-200 text-sm text-gray-600 bg-gray-50 text-center">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button onClick={zoomOut} className="px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-200" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={resetZoom} className="px-3 py-2 hover:bg-gray-50 transition-colors" title="Reset Zoom">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)`,
              backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
          >
            <div
              ref={transformRef}
              className="absolute inset-0"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: '0 0'
              }}
            >
              {/* SVG for connections */}
              <svg
                ref={svgRef}
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  width: `${100 / zoomLevel}%`,
                  height: `${100 / zoomLevel}%`
                }}
              >
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                  </marker>
                </defs>
                
                {connections.map((connection) => {
                  const fromPos = getPortCanvasPosition(connection.fromNodeId, connection.fromPort, 'output');
                  const toPos = getPortCanvasPosition(connection.toNodeId, connection.toPort, 'input');
                  
                  if (!fromPos || !toPos) return null;
                  
                  return (
                    <g key={connection.id}>
                      <path
                        d={`M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`}
                        stroke="#4b5563"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}

                {renderTempConnection()}
              </svg>

              {/* Nodes */}
              {nodes.map(node => (
                <div key={node.id} className="absolute group" style={{ left: node.position.x, top: node.position.y }}>
                  {/* Action Buttons - Above the node, top-right corner */}
                  <div className="absolute -top-6 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
                    <button 
                      className="p-0 bg-transparent hover:bg-gray-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        editNode(node.id);
                      }}
                      title="Edit"
                    >
                      <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      className="p-0 bg-transparent hover:bg-red-50 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-gray-500 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button 
                      className="p-0 bg-transparent hover:bg-gray-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNodeSettings(node.id);
                      }}
                      title="Settings"
                    >
                      <Settings className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>

                  {/* Main Node */}
                  <div
                    className={`bg-white rounded-lg border transition-all duration-200 select-none z-20 ${
                      selectedNodeId === node.id 
                        ? 'border-blue-400 shadow-lg' 
                        : 'border-gray-300 shadow-sm hover:shadow-md'
                    }`}
                    style={{
                      width: '240px',
                      height: '130px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  >
                    {/* Node Header */}
                    <div className="flex items-center gap-2 p-3 pb-2">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900 cursor-grab active:cursor-grabbing">
                        {node.label}
                      </span>
                    </div>
                    
                    {/* Node Content */}
                    <div className="px-3 pb-3">
                      <div className="text-xs text-gray-500 mb-1">
                        {node.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        Type: <span className="text-blue-600">{node.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Port */}
                  {node.inputs > 0 && (
                    <div
                      className="absolute w-3 h-3 bg-green-500 border-2 border-white rounded-full cursor-pointer hover:scale-110 transition-transform z-30 shadow-sm"
                      style={{
                        left: '-6px',
                        top: '61px'
                      }}
                      onClick={(e) => handlePortClick(e, node.id, 0, 'input')}
                    />
                  )}
                  
                  {/* Output Port */}
                  {node.outputs > 0 && (
                    <div
                      className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-pointer hover:scale-110 transition-transform z-30 shadow-sm"
                      style={{
                        left: '234px',
                        top: '61px'
                      }}
                      onClick={(e) => handlePortClick(e, node.id, 0, 'output')}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Connection Helper */}
          {isConnecting && connectionStart && (
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 text-sm shadow-lg z-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                Click on a green input port to complete the connection
              </div>
              <div className="text-xs text-gray-500 mt-1">Or click anywhere to cancel</div>
            </div>
          )}
        </div>

        <RightSidebar 
          addAgentToCanvas={addAgentToCanvas}
          isAgentAdded={isAgentAdded}
          mode={rightSidebarMode}
          onModeChange={setRightSidebarMode}
        />
      </div>
    </div>
  );
};

export default WorkflowEditor;