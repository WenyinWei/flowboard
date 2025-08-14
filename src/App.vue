<template>
  <div id="app">
    <div class="app-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="logo">
          <h2>Flowboard</h2>
          <p>Visual Data Workflows</p>
        </div>
        
        <nav class="navigation">
          <ul>
            <li :class="{ active: activeTab === 'nodes' }" @click="activeTab = 'nodes'">
              <i class="fas fa-th-large"></i>
              <span>Nodes</span>
            </li>
            <li :class="{ active: activeTab === 'workflows' }" @click="activeTab = 'workflows'">
              <i class="fas fa-project-diagram"></i>
              <span>Workflows</span>
            </li>
            <li :class="{ active: activeTab === 'templates' }" @click="activeTab = 'templates'">
              <i class="fas fa-clone"></i>
              <span>Templates</span>
            </li>
            <li :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
              <i class="fas fa-cog"></i>
              <span>Settings</span>
            </li>
          </ul>
        </nav>
        
        <div class="sidebar-content">
          <!-- Nodes Tab -->
          <div v-show="activeTab === 'nodes'" class="tab-content">
            <h3>Node Library</h3>
            <div class="node-categories">
              <div class="category">
                <h4>Basic Nodes</h4>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'data-input')">
                  <i class="fas fa-database node-icon"></i>
                  <span>Data Input</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'data-process')">
                  <i class="fas fa-cogs node-icon"></i>
                  <span>Data Process</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'data-output')">
                  <i class="fas fa-save node-icon"></i>
                  <span>Data Output</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'visualization')">
                  <i class="fas fa-chart-bar node-icon"></i>
                  <span>Visualization</span>
                </div>
              </div>
              
              <div class="category">
                <h4>Math Operations</h4>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'math-operation')">
                  <i class="fas fa-calculator node-icon"></i>
                  <span>Sum</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'math-operation')">
                  <i class="fas fa-wave-square node-icon"></i>
                  <span>Fourier Transform</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'math-operation')">
                  <i class="fas fa-th node-icon"></i>
                  <span>Matrix Operation</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'math-operation')">
                  <i class="fas fa-chart-line node-icon"></i>
                  <span>Statistical Analysis</span>
                </div>
              </div>
              
              <div class="category">
                <h4>Standard Operations</h4>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'math-operation')">
                  <i class="fas fa-sigma node-icon"></i>
                  <span>Sum (Σ)</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'math-operation')">
                  <i class="fas fa-x-ray node-icon"></i>
                  <span>Mean (x̄)</span>
                </div>
                <div class="node-item" draggable="true" @dragstart="dragNodeStart($event, 'math-operation')">
                  <i class="fas fa-chart-bar node-icon"></i>
                  <span>Standard Deviation (σ)</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Workflows Tab -->
          <div v-show="activeTab === 'workflows'" class="tab-content">
            <h3>Workflows</h3>
            <div class="workflow-list">
              <div 
                v-for="workflow in workflows" 
                :key="workflow.id" 
                class="workflow-item"
                @click="loadWorkflow(workflow.id)"
              >
                <i class="fas fa-file-alt"></i>
                <div class="workflow-info">
                  <h4>{{ workflow.name }}</h4>
                  <p>{{ workflow.updatedAt }}</p>
                </div>
              </div>
              <div v-if="workflows.length === 0" class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No workflows yet</p>
                <button @click="createNewWorkflow">Create New</button>
              </div>
            </div>
          </div>
          
          <!-- Templates Tab -->
          <div v-show="activeTab === 'templates'" class="tab-content">
            <h3>Templates</h3>
            <div class="template-list">
              <div 
                v-for="template in templates" 
                :key="template.id" 
                class="template-item"
                @click="loadTemplate(template.id)"
              >
                <i class="fas fa-clone"></i>
                <div class="template-info">
                  <h4>{{ template.name }}</h4>
                  <p>{{ template.description }}</p>
                </div>
              </div>
              <div v-if="templates.length === 0" class="empty-state">
                <i class="fas fa-clone"></i>
                <p>No templates available</p>
              </div>
            </div>
          </div>
          
          <!-- Settings Tab -->
          <div v-show="activeTab === 'settings'" class="tab-content">
            <h3>Settings</h3>
            <div class="settings-content">
              <div class="setting-group">
                <h4>Appearance</h4>
                <div class="setting-item">
                  <label>Theme</label>
                  <select v-model="theme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
              
              <div class="setting-group">
                <h4>Execution</h4>
                <div class="setting-item">
                  <label>Auto-run on connect</label>
                  <input type="checkbox" v-model="autoRun">
                </div>
              </div>
              
              <div class="setting-group">
                <h4>External Editor</h4>
                <div class="setting-item">
                  <label>Preferred Editor</label>
                  <select v-model="preferredEditor">
                    <option value="system">System Default</option>
                    <option value="vscode">Visual Studio Code</option>
                    <option value="sublime">Sublime Text</option>
                    <option value="atom">Atom</option>
                    <option value="notepad++">Notepad++</option>
                  </select>
                </div>
              </div>
              
              <div class="actions">
                <button class="btn-primary" @click="saveSettings">Save Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="main-content">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-group">
            <button class="btn-icon" @click="addNode" title="Add Node">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn-icon" @click="saveWorkflow" title="Save Workflow">
              <i class="fas fa-save"></i>
            </button>
            <button class="btn-icon" @click="loadWorkflowList" title="Load Workflow">
              <i class="fas fa-folder-open"></i>
            </button>
            <button class="btn-icon" @click="clearWorkflow" title="Clear Workflow">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          
          <div class="toolbar-group">
            <button class="btn-primary" @click="runWorkflow">
              <i class="fas fa-play"></i>
              <span>Run Workflow</span>
            </button>
          </div>
          
          <div class="toolbar-group">
            <button class="btn-secondary" @click="showTemplates = true">
              <i class="fas fa-clone"></i>
              <span>Templates</span>
            </button>
          </div>
        </div>
        
        <!-- Canvas Area -->
        <div class="canvas-area">
          <div 
            class="flow-canvas" 
            @drop="dropNode" 
            @dragover="allowDrop"
            @contextmenu.prevent="showCanvasContextMenu"
            @mousedown="startCanvasSelection"
            ref="flowCanvas"
          >
            <!-- Selection Box -->
            <SelectionBox 
              :is-visible="isSelecting"
              :start-x="selectionStartX"
              :start-y="selectionStartY"
              :end-x="selectionEndX"
              :end-y="selectionEndY"
            />
            
            <!-- Connections -->
            <svg class="connections-layer" width="100%" height="100%">
              <path 
                v-for="connection in connections" 
                :key="connection.id"
                :d="getConnectionPath(connection)"
                class="connection-line" 
              />
              <!-- Temporary connection being created -->
              <path 
                v-if="connectionState.tempPath"
                :d="connectionState.tempPath"
                class="connection-line-temp" 
              />
            </svg>
            
            <!-- Temporary Node -->
            <div
              v-if="tempNode && tempNode.displayMode === 'node'"
              class="node node-symbol"
              :style="{ left: tempNode.x + 'px', top: tempNode.y + 'px' }"
            >
              <div class="symbol-content">
                <i class="fas fa-plus"></i>
              </div>
            </div>
            <div
              v-else-if="tempNode"
              class="node"
              :style="{ left: tempNode.x + 'px', top: tempNode.y + 'px', width: tempNode.width + 'px', height: tempNode.height + 'px' }"
            >
              <div class="node-header">
                <div class="node-title">
                  <i class="fas fa-plus"></i>
                  <span>New Node</span>
                </div>
              </div>
              <div class="node-content">
                <div class="node-ports">
                  <div class="input-port" title="Input"></div>
                  <div class="output-port" title="Output"></div>
                </div>
              </div>
            </div>
            
            <!-- Nodes -->
            <FlowNode
              v-for="node in nodes"
              :key="node.id"
              :node="node"
              :is-selected="selectedNodeIds.includes(node.id)"
              :is-running="isNodeRunning(node.id)"
              @mousedown="startDrag"
              @port-mousedown="startConnection"
              @toggle-display-mode="toggleDisplayMode"
              @execute="executeNode"
              @delete="deleteNode"
            />
            
            <!-- Temporary Node -->
            <div
              v-if="tempNode && tempNode.displayMode === 'node'"
              class="node node-symbol"
              :style="{ left: tempNode.x + 'px', top: tempNode.y + 'px' }"
            >
              <div class="symbol-content">
                <i class="fas fa-plus"></i>
              </div>
            </div>
            <div
              v-else-if="tempNode"
              class="node"
              :style="{ left: tempNode.x + 'px', top: tempNode.y + 'px', width: tempNode.width + 'px', height: tempNode.height + 'px' }"
            >
              <div class="node-header">
                <div class="node-title">
                  <i class="fas fa-plus"></i>
                  <span>New Node</span>
                </div>
              </div>
              <div class="node-content">
                <div class="node-ports">
                  <div class="input-port" title="Input"></div>
                  <div class="output-port" title="Output"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Properties Panel -->
      <div class="properties-panel">
        <div class="panel-header">
          <h3>Properties</h3>
          <button class="close-btn" @click="selectedNode = null">×</button>
        </div>
        
        <div class="panel-content" v-if="selectedNode">
          <div class="property-group">
            <h4>{{ getNodeTitle(selectedNode.type) }} Properties</h4>
            
            <div class="form-group">
              <label>Node ID</label>
              <input type="text" v-model="selectedNode.id" disabled>
            </div>
            
            <div class="form-group">
              <label>Position</label>
              <div class="position-inputs">
                <input type="number" v-model="selectedNode.x" placeholder="X">
                <input type="number" v-model="selectedNode.y" placeholder="Y">
              </div>
            </div>
            
            <div v-if="selectedNode.type === 'data-process'">
              <div class="form-group">
                <label>Script Path</label>
                <input type="text" v-model="selectedNode.scriptPath">
              </div>
              <div class="form-group">
                <label>Language</label>
                <select v-model="selectedNode.language">
                  <option value="python">Python</option>
                  <option value="julia">Julia</option>
                </select>
              </div>
              <div class="form-group">
                <button class="btn-secondary" @click="openCodeEditor(selectedNode)">
                  <i class="fas fa-edit"></i>
                  <span>Edit Code</span>
                </button>
              </div>
            </div>
            
            <div v-if="selectedNode.type === 'visualization'">
              <div class="form-group">
                <label>Chart Type</label>
                <select v-model="selectedNode.chartType">
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
            </div>
            
            <div v-if="selectedNode.type === 'math-operation'">
              <div class="form-group">
                <label>Operation</label>
                <select v-model="selectedNode.operation">
                  <option value="sum">Sum</option>
                  <option value="fourier">Fourier Transform</option>
                  <option value="matrix_multiply">Matrix Multiply</option>
                  <option value="statistical_analysis">Statistical Analysis</option>
                </select>
              </div>
            </div>
            
            <div class="actions">
              <button class="btn-primary" @click="updateNode">Update</button>
            </div>
          </div>
        </div>
        
        <div class="panel-content" v-else>
          <div class="empty-state">
            <i class="fas fa-info-circle"></i>
            <p>Select a node to view properties</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Canvas Context Menu -->
    <div 
      class="context-menu" 
      v-show="showCanvasMenu" 
      :style="{ top: canvasMenuTop + 'px', left: canvasMenuLeft + 'px' }"
      ref="canvasContextMenu"
    >
      <div class="context-menu-item" @click="addNodeAtCanvasPosition">
        <i class="fas fa-plus"></i>
        <span>Add Node Here</span>
      </div>
      <div class="context-menu-item" @click="clearWorkflow">
        <i class="fas fa-trash"></i>
        <span>Clear Workflow</span>
      </div>
    </div>
    
    <!-- Templates Modal -->
    <div class="modal" v-show="showTemplates" @click.self="showTemplates = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Select a Template</h3>
          <button class="close-btn" @click="showTemplates = false">×</button>
        </div>
        <div class="modal-body">
          <div class="template-grid">
            <div 
              v-for="template in templates" 
              :key="template.id" 
              class="template-card"
              @click="loadSelectedTemplate(template.id)"
            >
              <i class="fas fa-clone template-icon"></i>
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import SelectionBox from './components/SelectionBox.vue';
import FlowNode from './components/FlowNode.vue';
import FlowFileManager from './utils/fileManager.js';
import ExternalEditorManager from './utils/externalEditor.js';
import SelectionManager from './utils/selectionManager.js';

export default {
  name: 'App',
  components: {
    SelectionBox,
    FlowNode
  },
  data() {
    return {
      activeTab: 'nodes',
      nodes: [
        { 
          id: 1, 
          type: 'data-input', 
          x: 100, 
          y: 100,
          width: 200,
          height: 150,
          displayMode: 'card', // card, node, visual
          executionStatus: 'idle', // idle, running, success, error
          executionTime: null, // 运行时间
          errorMessage: null, // 错误信息
          parameters: {}
        },
        { 
          id: 2, 
          type: 'data-process', 
          x: 400, 
          y: 150,
          width: 200,
          height: 150,
          displayMode: 'card', // card, node, visual
          executionStatus: 'idle', // idle, running, success, error
          executionTime: null, // 运行时间
          errorMessage: null, // 错误信息
          scriptPath: 'templates/scripts/data_cleaning.py',
          language: 'python',
          parameters: {}
        }
      ],
      connections: [
        { id: 1, source: 1, target: 2 }
      ],
      workflows: [],
      templates: [],
      selectedNode: null,
      selectedNodeIds: [], // 多选支持
      dragNode: null,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      runningNodes: new Set(),
      showCanvasMenu: false,
      canvasMenuTop: 0,
      canvasMenuLeft: 0,
      showTemplates: false,
      theme: 'light',
      autoRun: false,
      preferredEditor: 'system', // 首选编辑器
      // Connection state
      connectionState: {
        isCreating: false,
        sourceNode: null,
        sourcePort: null,
        tempPath: null
      },
      // Temporary node for connection
      tempNode: null,
      // Selection box state
      isSelecting: false,
      selectionStartX: 0,
      selectionStartY: 0,
      selectionEndX: 0,
      selectionEndY: 0
    }
  },
  methods: {
    // Node operations
    addNode() {
      const newNode = {
        id: this.nodes.length + 1,
        type: 'data-process',
        x: 200,
        y: 200,
        width: 200,
        height: 150,
        scriptPath: './scripts/test.py',
        language: 'python',
        parameters: {}
      };
      this.nodes.push(newNode);
    },
    
    deleteNode(nodeId) {
      this.nodes = this.nodes.filter(node => node.id !== nodeId);
      this.connections = this.connections.filter(conn => 
        conn.source !== nodeId && conn.target !== nodeId
      );
      if (this.selectedNode && this.selectedNode.id === nodeId) {
        this.selectedNode = null;
      }
      // 从多选列表中移除
      this.selectedNodeIds = this.selectedNodeIds.filter(id => id !== nodeId);
    },
    
    // 删除所有选中的节点
    deleteSelectedNodes() {
      // 删除所有选中的节点
      this.selectedNodeIds.forEach(nodeId => {
        this.deleteNode(nodeId);
      });
      
      // 清空选中列表
      this.selectedNodeIds = [];
      this.selectedNode = null;
    },
    
    updateNode() {
      // Update node properties
      console.log('Node updated:', this.selectedNode);
    },
    
    // Connection methods
    startConnection(portType, node) {
      this.connectionState.isCreating = true;
      this.connectionState.sourceNode = node;
      this.connectionState.sourcePort = portType;
      
      // Prevent text selection during connection creation
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      // Initialize with a small path to show the start point
      const canvasRect = this.$refs.flowCanvas.getBoundingClientRect();
      
      // Calculate source point (in canvas coordinates)
      let sourceX, sourceY;
      if (portType === 'output') {
        sourceX = node.x + node.width;
        sourceY = node.y + node.height / 2;
      } else {
        sourceX = node.x;
        sourceY = node.y + node.height / 2;
      }
      
      // Create initial path
      this.connectionState.tempPath = `M ${sourceX} ${sourceY} L ${sourceX} ${sourceY}`;
      
      // Add mousemove listener to track cursor
      document.addEventListener('mousemove', this.trackConnection);
      document.addEventListener('mouseup', this.endConnection);
    },
    
    trackConnection(event) {
      if (!this.connectionState.isCreating) return;
      
      const sourceNode = this.connectionState.sourceNode;
      if (!sourceNode) return;
      
      // Get canvas position
      const canvasRect = this.$refs.flowCanvas.getBoundingClientRect();
      
      // Calculate source point (in canvas coordinates)
      let sourceX, sourceY;
      if (this.connectionState.sourcePort === 'output') {
        if (sourceNode.displayMode === 'node') {
          // 节点模式下，从右侧中心连接
          sourceX = sourceNode.x + 40;
          sourceY = sourceNode.y + 40;
        } else {
          // 卡片模式下，从右侧中心连接
          sourceX = sourceNode.x + sourceNode.width;
          sourceY = sourceNode.y + sourceNode.height / 2;
        }
      } else {
        if (sourceNode.displayMode === 'node') {
          // 节点模式下，从左侧中心连接
          sourceX = sourceNode.x + 40;
          sourceY = sourceNode.y + 40;
        } else {
          // 卡片模式下，从左侧中心连接
          sourceX = sourceNode.x;
          sourceY = sourceNode.y + sourceNode.height / 2;
        }
      }
      
      // Get current mouse position relative to canvas
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      
      // Check for magnetic snapping to nearby ports
      let targetX = mouseX;
      let targetY = mouseY;
      let snappedToPort = false;
      let targetNode = null;
      let targetPort = null;
      
      // Search for nearby input/output ports
      for (const node of this.nodes) {
        // Skip the source node
        if (node.id === sourceNode.id) continue;
        
        // Calculate input port position based on display mode
        let inputX, inputY;
        if (node.displayMode === 'node') {
          // 节点模式下，连接到左侧中心
          inputX = node.x + 40;
          inputY = node.y + 40;
        } else {
          // 卡片模式下，连接到左侧中心
          inputX = node.x;
          inputY = node.y + node.height / 2;
        }
        
        // Calculate output port position based on display mode
        let outputX, outputY;
        if (node.displayMode === 'node') {
          // 节点模式下，连接到右侧中心
          outputX = node.x + 40;
          outputY = node.y + 40;
        } else {
          // 卡片模式下，连接到右侧中心
          outputX = node.x + node.width;
          outputY = node.y + node.height / 2;
        }
        
        // Check if mouse is near input port (when dragging from output)
        const distanceToInput = Math.sqrt(Math.pow(mouseX - inputX, 2) + Math.pow(mouseY - inputY, 2));
        if (distanceToInput < 20 && this.connectionState.sourcePort === 'output') {
          targetX = inputX;
          targetY = inputY;
          snappedToPort = true;
          targetNode = node;
          targetPort = 'input';
          break;
        }
        
        // Check if mouse is near output port (when dragging from input)
        const distanceToOutput = Math.sqrt(Math.pow(mouseX - outputX, 2) + Math.pow(mouseY - outputY, 2));
        if (distanceToOutput < 20 && this.connectionState.sourcePort === 'input') {
          targetX = outputX;
          targetY = outputY;
          snappedToPort = true;
          targetNode = node;
          targetPort = 'output';
          break;
        }
      }
      
      // If not snapped to a port, check if we should show a temp node
      if (!snappedToPort) {
        // Check distance to all existing nodes
        let nearExistingNode = false;
        for (const node of this.nodes) {
          // Skip the source node
          if (node.id === sourceNode.id) continue;
          
          // Calculate distance to node center
          const nodeCenterX = node.displayMode === 'node' ? node.x + 40 : node.x + node.width / 2;
          const nodeCenterY = node.displayMode === 'node' ? node.y + 40 : node.y + node.height / 2;
          const distanceToNode = Math.sqrt(Math.pow(mouseX - nodeCenterX, 2) + Math.pow(mouseY - nodeCenterY, 2));
          
          if (distanceToNode < 50) {
            nearExistingNode = true;
            break;
          }
        }
        
        // If not near existing node, show temp node
        if (!nearExistingNode) {
          this.tempNode = {
            x: mouseX - 40,  // 居中放置圆形节点
            y: mouseY - 40,  // 居中放置圆形节点
            width: 80,
            height: 80,
            displayMode: 'node'
          };
        } else {
          this.tempNode = null;
        }
      } else {
        // If snapped to port, hide temp node
        this.tempNode = null;
      }
      
      // Create curved path using Bezier curve
      const controlX1 = sourceX + (targetX - sourceX) * 0.5;
      const controlY1 = sourceY;
      const controlX2 = sourceX + (targetX - sourceX) * 0.5;
      const controlY2 = targetY;
      
      this.connectionState.tempPath = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`;
    },
    
    endConnection(event) {
      if (!this.connectionState.isCreating) return;
      
      // Remove listeners immediately to prevent duplicate calls
      document.removeEventListener('mousemove', this.trackConnection);
      document.removeEventListener('mouseup', this.endConnection);
      
      // Restore text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      
      // Store state locally to prevent race conditions
      const sourceNode = this.connectionState.sourceNode;
      const sourcePort = this.connectionState.sourcePort;
      
      // Get canvas position
      const canvasRect = this.$refs.flowCanvas.getBoundingClientRect();
      
      // Find target node and port
      let targetNode = null;
      let targetPort = null;
      
      // Get current mouse position relative to canvas
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      
      // Search for nearby input/output ports
      for (const node of this.nodes) {
        // Skip the source node
        if (node.id === sourceNode.id) continue;
        
        // Calculate input port position based on display mode
        let inputX, inputY;
        if (node.displayMode === 'node') {
          // 节点模式下，连接到左侧中心
          inputX = node.x;
          inputY = node.y + 40;
        } else {
          // 卡片模式下，连接到左侧中心
          inputX = node.x;
          inputY = node.y + node.height / 2;
        }
        
        // Calculate output port position based on display mode
        let outputX, outputY;
        if (node.displayMode === 'node') {
          // 节点模式下，连接到右侧中心
          outputX = node.x + 80;
          outputY = node.y + 40;
        } else {
          // 卡片模式下，连接到右侧中心
          outputX = node.x + node.width;
          outputY = node.y + node.height / 2;
        }
        
        // Check if mouse is near input port (when dragging from output)
        const distanceToInput = Math.sqrt(Math.pow(mouseX - inputX, 2) + Math.pow(mouseY - inputY, 2));
        if (distanceToInput < 20 && sourcePort === 'output') {
          targetNode = node;
          targetPort = 'input';
          break;
        }
        
        // Check if mouse is near output port (when dragging from input)
        const distanceToOutput = Math.sqrt(Math.pow(mouseX - outputX, 2) + Math.pow(mouseY - outputY, 2));
        if (distanceToOutput < 20 && sourcePort === 'input') {
          targetNode = node;
          targetPort = 'output';
          break;
        }
      }
      
      // Create connection if we have a valid target
      if (targetNode && targetPort) {
        // Prevent connecting input to input or output to output
        if (sourcePort !== targetPort) {
          // Determine source and target for the new connection
          let newSourceId, newTargetId;
          if (sourcePort === 'output') {
            newSourceId = sourceNode.id;
            newTargetId = targetNode.id;
          } else {
            newSourceId = targetNode.id;
            newTargetId = sourceNode.id;
          }
          
          // Check if connection already exists
          const connectionExists = this.connections.some(conn => 
            conn.source === newSourceId && conn.target === newTargetId
          );
          
          // Create new connection if it doesn't exist
          if (!connectionExists) {
            // For input ports, remove any existing connections to that input
            // (an input can only have one source)
            if (targetPort === 'input') {
              // We're connecting to an input, so remove any existing connections to that input
              this.connections = this.connections.filter(conn => {
                if (conn.target === newTargetId) {
                  return false; // Remove this connection
                }
                return true; // Keep this connection
              });
            }
            
            // Create new connection
            const newConnection = {
              id: Date.now(),
              source: newSourceId,
              target: newTargetId
            };
            this.connections.push(newConnection);
            
            // Auto-run if enabled
            if (this.autoRun) {
              this.runWorkflow();
            }
          }
        }
      } 
      // If no target node and we have a temp node, create a new node
      else if (this.tempNode) {
        // Create a new node at the temp node position
        const newNodeType = sourcePort === 'output' ? 'data-process' : 'data-input';
        const newNode = {
          id: this.nodes.length + 1,
          type: newNodeType,
          x: this.tempNode.x,
          y: this.tempNode.y,
          width: 200,
          height: 150,
          displayMode: 'card', // 默认为卡片模式
          parameters: {}
        };
        
        // Add default properties based on node type
        if (newNodeType === 'data-process') {
          newNode.scriptPath = './scripts/test.py';
          newNode.language = 'python';
        } else if (newNodeType === 'visualization') {
          newNode.chartType = 'line';
        } else if (newNodeType === 'math-operation') {
          newNode.operation = 'sum';
          newNode.symbol = 'Σ';
          newNode.scriptPath = './scripts/math_operations.py';
          newNode.language = 'python';
        }
        
        this.nodes.push(newNode);
        
        // Create connection to the new node
        let newSourceId, newTargetId;
        if (sourcePort === 'output') {
          newSourceId = sourceNode.id;
          newTargetId = newNode.id;
        } else {
          newSourceId = newNode.id;
          newTargetId = sourceNode.id;
        }
        
        // For input ports, remove any existing connections to that input
        if (sourcePort === 'input' && targetPort !== 'output') {
          // We're connecting from a new node's output to the source input
          this.connections = this.connections.filter(conn => {
            if (conn.target === newTargetId) {
              return false; // Remove this connection
            }
            return true; // Keep this connection
          });
        }
        
        const newConnection = {
          id: Date.now(),
          source: newSourceId,
          target: newTargetId
        };
        this.connections.push(newConnection);
      }
      
      // Reset connection state and temp node
      this.connectionState.isCreating = false;
      this.connectionState.sourceNode = null;
      this.connectionState.sourcePort = null;
      this.connectionState.tempPath = null;
      this.tempNode = null;
    },
    
    // Drag and drop
    dragNodeStart(event, nodeType) {
      event.dataTransfer.setData('nodeType', nodeType);
    },
    
    allowDrop(event) {
      event.preventDefault();
    },
    
    dropNode(event) {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('nodeType');
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newNode = {
        id: this.nodes.length + 1,
        type: nodeType,
        x: x,
        y: y,
        width: 200,
        height: 150,
        displayMode: 'card', // 默认为卡片模式
        executionStatus: 'idle', // idle, running, success, error
        executionTime: null, // 运行时间
        errorMessage: null, // 错误信息
        parameters: {}
      };
      
      // 根据拖拽的元素文本设置具体操作
      const draggedElement = document.elementFromPoint(event.clientX, event.clientY);
      if (draggedElement && draggedElement.closest('.node-item')) {
        const nodeItem = draggedElement.closest('.node-item');
        const text = nodeItem.querySelector('span')?.textContent || '';
        if (text.includes('Sum (Σ)')) {
          newNode.operation = 'sum';
          newNode.symbol = 'Σ';
        } else if (text.includes('Mean (x̄)')) {
          newNode.operation = 'mean';
          newNode.symbol = 'x̄';
        } else if (text.includes('Standard Deviation (σ)')) {
          newNode.operation = 'std';
          newNode.symbol = 'σ';
        }
      }
      
      if (nodeType === 'data-process') {
        newNode.scriptPath = './scripts/test.py';
        newNode.language = 'python';
      } else if (nodeType === 'visualization') {
        newNode.chartType = 'line';
      } else if (nodeType === 'math-operation') {
        // 如果没有通过文本识别设置操作，默认设置
        if (!newNode.operation) {
          newNode.operation = 'sum';
          newNode.symbol = 'Σ';
        }
        newNode.scriptPath = './scripts/math_operations.py';
        newNode.language = 'python';
      }
      
      this.nodes.push(newNode);
    },
    
    // Node dragging - 简化版本
    startDrag(event, node) {
      console.log('Start drag for node:', node.id);
      
      // 阻止事件冒泡
      event.stopPropagation();
      event.preventDefault();
      
      // 设置选中状态
      if (!this.selectedNodeIds.includes(node.id)) {
        this.selectedNode = node;
        this.selectedNodeIds = [node.id];
      }
      
      // 设置拖拽状态
      this.isDragging = true;
      this.dragNode = node;
      
      // 计算鼠标相对于节点的位置偏移
      const rect = event.currentTarget.getBoundingClientRect();
      this.dragOffsetX = event.clientX - rect.left;
      this.dragOffsetY = event.clientY - rect.top;
      
      console.log('Drag offset:', this.dragOffsetX, this.dragOffsetY);
      
      // 改变光标
      if (this.$refs.flowCanvas) {
        this.$refs.flowCanvas.style.cursor = 'move';
      }
    },
    
    // 在mounted中处理全局鼠标移动和释放
    
    onDrag(event) {
      console.log('onDrag called');
      console.log('isDragging:', this.isDragging);
      console.log('dragNode:', this.dragNode);
      
      if (!this.isDragging || !this.dragNode) {
        console.log('Drag conditions not met');
        return;
      }
      
      const deltaX = event.clientX - this.dragNode.initialX;
      const deltaY = event.clientY - this.dragNode.initialY;
      
      console.log('Delta X:', deltaX, 'Delta Y:', deltaY);
      
      // 更新所有选中节点的位置
      this.selectedNodeIds.forEach(nodeId => {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
          // 保存原始位置用于计算
          if (node.originalX === undefined) {
            node.originalX = node.x;
            node.originalY = node.y;
          }
          
          // 更新位置
          node.x = node.originalX + deltaX;
          node.y = node.originalY + deltaY;
          console.log('Updated node position:', nodeId, 'to', node.x, ',', node.y);
        }
      });
      
      // 更新拖拽节点的初始位置
      this.dragNode.initialX = event.clientX;
      this.dragNode.initialY = event.clientY;
    },
    
    // Canvas selection methods
    startCanvasSelection(event) {
      // 只有在点击空白区域时才开始选择，并且没有在拖拽节点
      if (this.isDragging) return;
      
      const clickedNode = SelectionManager.getNodeAtPoint(this.nodes, event.offsetX, event.offsetY);
      if (clickedNode) return;
      
      // 取消之前的节点选择
      this.selectedNode = null;
      this.selectedNodeIds = [];
      
      this.isSelecting = true;
      this.selectionStartX = event.offsetX;
      this.selectionStartY = event.offsetY;
      this.selectionEndX = event.offsetX;
      this.selectionEndY = event.offsetY;
      
      // Prevent text selection during selection
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      document.addEventListener('mousemove', this.updateCanvasSelection);
      document.addEventListener('mouseup', this.endCanvasSelection);
    },
    
    // Canvas selection methods
    startCanvasSelection(event) {
      // 只有在点击空白区域时才开始选择，并且没有在拖拽节点
      if (this.isDragging) return;
      
      const clickedNode = SelectionManager.getNodeAtPoint(this.nodes, event.offsetX, event.offsetY);
      if (clickedNode) return;
      
      // 取消之前的节点选择
      this.selectedNode = null;
      this.selectedNodeIds = [];
      
      this.isSelecting = true;
      this.selectionStartX = event.offsetX;
      this.selectionStartY = event.offsetY;
      this.selectionEndX = event.offsetX;
      this.selectionEndY = event.offsetY;
      
      // Prevent text selection during selection
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      // 改变鼠标光标
      this.$refs.flowCanvas.style.cursor = 'crosshair';
      
      document.addEventListener('mousemove', this.updateCanvasSelection);
      document.addEventListener('mouseup', this.endCanvasSelection);
    },
    
    updateCanvasSelection(event) {
      if (!this.isSelecting) return;
      
      const canvasRect = this.$refs.flowCanvas.getBoundingClientRect();
      this.selectionEndX = event.clientX - canvasRect.left;
      this.selectionEndY = event.clientY - canvasRect.top;
    },
    
    endCanvasSelection(event) {
      if (!this.isSelecting) return;
      
      // Remove listeners
      document.removeEventListener('mousemove', this.updateCanvasSelection);
      document.removeEventListener('mouseup', this.endCanvasSelection);
      
      // Restore text selection and cursor
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      this.$refs.flowCanvas.style.cursor = '';
      
      // Get selected nodes
      const selectionBox = {
        startX: this.selectionStartX,
        startY: this.selectionStartY,
        endX: this.selectionEndX,
        endY: this.selectionEndY
      };
      
      this.selectedNodeIds = SelectionManager.getNodesInSelectionBox(this.nodes, selectionBox);
      
      // Reset selection state
      this.isSelecting = false;
      this.selectionStartX = 0;
      this.selectionStartY = 0;
      this.selectionEndX = 0;
      this.selectionEndY = 0;
    },
    
    // External editor methods
    async openCodeEditor(node) {
      if (node.type !== 'data-process') return;
      
      try {
        // 获取节点代码（如果不存在则创建默认代码）
        const code = node.code || this.getDefaultCodeForNode(node);
        
        // 在外部编辑器中打开代码
        const tempFilePath = await ExternalEditorManager.openCodeInEditor(
          code, 
          node.type, 
          node.id
        );
        
        console.log(`Code opened in external editor: ${tempFilePath}`);
        this.$message.success('Code opened in external editor');
      } catch (error) {
        console.error('Failed to open code in external editor:', error);
        this.$message.error('Failed to open code in external editor');
      }
    },
    
    getDefaultCodeForNode(node) {
      // 根据节点类型返回默认代码
      switch (node.language) {
        case 'python':
          return `# Python script for Flowboard
# Node ID: ${node.id}
# Type: ${node.type}

def process_data(input_data):
    """Process the input data and return the result"""
    # Your code here
    return input_data

# Example usage:
# result = process_data(your_input_data)
`;
        case 'julia':
          return `# Julia script for Flowboard
# Node ID: ${node.id}
# Type: ${node.type}

function process_data(input_data)
    # Your code here
    return input_data
end

# Example usage:
# result = process_data(your_input_data)
`;
        default:
          return `# Script for Flowboard
# Node ID: ${node.id}
# Type: ${node.type}

# Your code here
`;
      }
    },
    
    // UI helpers
    getNodeClass(nodeType) {
      return `node-${nodeType.replace(/-/g, '')}`;
    },
    
    getNodeIcon(nodeType) {
      const icons = {
        'data-input': 'fas fa-database',
        'data-process': 'fas fa-cogs',
        'data-output': 'fas fa-save',
        'visualization': 'fas fa-chart-bar',
        'math-operation': 'fas fa-calculator'
      };
      return icons[nodeType] || 'fas fa-cube';
    },
    
    getNodeTitle(nodeType) {
      const titles = {
        'data-input': 'Data Input',
        'data-process': 'Data Process',
        'data-output': 'Data Output',
        'visualization': 'Visualization',
        'math-operation': 'Math Operation'
      };
      return titles[nodeType] || nodeType;
    },
    
    getConnectionPath(connection) {
      const sourceNode = this.nodes.find(n => n.id === connection.source);
      const targetNode = this.nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return '';
      
      let sourceX, sourceY, targetX, targetY;
      
      // 根据节点显示模式计算连接点
      if (sourceNode.displayMode === 'node') {
        // 节点模式下，从右侧中心连接
        sourceX = sourceNode.x + 40;
        sourceY = sourceNode.y + 40;
      } else {
        // 卡片模式下，从右侧中心连接
        sourceX = sourceNode.x + sourceNode.width;
        sourceY = sourceNode.y + sourceNode.height / 2;
      }
      
      if (targetNode.displayMode === 'node') {
        // 节点模式下，从左侧中心连接
        targetX = targetNode.x + 40;
        targetY = targetNode.y + 40;
      } else {
        // 卡片模式下，从左侧中心连接
        targetX = targetNode.x;
        targetY = targetNode.y + targetNode.height / 2;
      }
      
      // Curved path with better control points
      const controlX1 = sourceX + Math.abs(targetX - sourceX) * 0.5;
      const controlY1 = sourceY;
      const controlX2 = targetX - Math.abs(targetX - sourceX) * 0.5;
      const controlY2 = targetY;
      
      return `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`;
    },
    
    // Display mode methods
    toggleDisplayMode(node, mode) {
      // 切换节点显示模式
      node.displayMode = mode;
    },
    
    // Workflow operations
    async saveWorkflow() {
      try {
        // 使用新的文件管理器序列化工作流
        const flowData = FlowFileManager.serializeWorkflow(
          this.nodes,
          this.connections,
          {
            name: 'Sample Workflow',
            description: 'A sample workflow created in Flowboard'
          }
        );
        
        // 保存到文件（实际实现需要Electron IPC）
        const fileContent = await FlowFileManager.saveFlowFile(flowData);
        console.log('Workflow saved:', fileContent);
        
        this.$message.success('Workflow saved successfully!');
        this.loadWorkflowList();
      } catch (error) {
        console.error('Error saving workflow:', error);
        this.$message.error('Failed to save workflow');
      }
    },
    
    async loadWorkflowList() {
      try {
        const response = await axios.get('/api/workflows');
        this.workflows = response.data;
      } catch (error) {
        console.error('Error loading workflows:', error);
        this.$message.error('Failed to load workflows');
      }
    },
    
    async loadWorkflow(workflowId) {
      try {
        const response = await axios.get(`/api/workflows/${workflowId}`);
        const workflow = response.data;
        this.nodes = workflow.nodes;
        this.connections = workflow.connections;
        console.log('Workflow loaded:', workflow);
        this.$message.success('Workflow loaded successfully!');
      } catch (error) {
        console.error('Error loading workflow:', error);
        this.$message.error('Failed to load workflow');
      }
    },
    
    async loadTemplateList() {
      try {
        const response = await axios.get('/api/templates');
        this.templates = response.data;
      } catch (error) {
        console.error('Error loading templates:', error);
        this.$message.error('Failed to load templates');
      }
    },
    
    async loadTemplate(templateId) {
      try {
        const response = await axios.get(`/api/templates/${templateId}`);
        const template = response.data;
        this.nodes = template.nodes;
        this.connections = template.connections;
        console.log('Template loaded:', template);
        this.$message.success('Template loaded successfully!');
        this.showTemplates = false;
      } catch (error) {
        console.error('Error loading template:', error);
        this.$message.error('Failed to load template');
      }
    },
    
    loadSelectedTemplate(templateId) {
      this.loadTemplate(templateId);
    },
    
    createNewWorkflow() {
      this.nodes = [];
      this.connections = [];
      this.selectedNode = null;
    },
    
    clearWorkflow() {
      this.nodes = [];
      this.connections = [];
      this.selectedNode = null;
      this.showCanvasMenu = false;
    },
    
    // Execution
    async executeNode(node) {
      try {
        // 设置节点为运行状态
        node.executionStatus = 'running';
        node.executionTime = 0;
        node.errorMessage = null;
        
        // 开始计时
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          node.executionTime = elapsed;
        }, 1000);
        
        this.runningNodes.add(node.id);
        
        // Prepare execution parameters based on node type
        let executionParams = {
          nodeId: node.id
        };
        
        if (node.type === 'data-input') {
          // For data input nodes, generate sample data
          executionParams.operation = 'generate_data';
          executionParams.size = 100;
          executionParams.seed = 42;
        } else if (node.type === 'data-process') {
          // For data process nodes, determine operation
          if (node.scriptPath && node.scriptPath.includes('math_operations')) {
            executionParams.operation = 'mean'; // Default operation
          } else {
            executionParams.operation = 'generate_data';
          }
        } else if (node.type === 'visualization') {
          // For visualization nodes
          executionParams.operation = 'visualize';
          executionParams.vizType = node.chartType || 'line';
          executionParams.outputDir = './outputs';
          executionParams.filenamePattern = `viz_${node.id}`;
          executionParams.counter = 1;
          executionParams.vizParams = {
            title: 'Flowboard Visualization',
            xlabel: 'X Axis',
            ylabel: 'Y Axis',
            font_size: 12
          };
        }
        
        // Execute the node
        const response = await axios.post('/api/executeNode', {
          node: node,
          params: executionParams
        });
        
        // 停止计时
        clearInterval(interval);
        const totalTime = (Date.now() - startTime) / 1000;
        node.executionTime = totalTime;
        
        console.log(`Node ${node.id} executed successfully:`, response.data);
        this.$message.success(`Node ${node.id} executed successfully`);
        this.runningNodes.delete(node.id);
        
        // 设置节点为成功状态
        node.executionStatus = 'success';
        
        // Handle the response
        if (response.data.result) {
          console.log('Node result:', response.data.result);
        }
        if (response.data.output_path) {
          this.$message.info(`Visualization saved to: ${response.data.output_path}`);
        }
      } catch (error) {
        console.error(`Error executing node ${node.id}:`, error);
        this.runningNodes.delete(node.id);
        this.$message.error(`Failed to execute node ${node.id}: ${error.message}`);
        
        // 设置节点为错误状态
        node.executionStatus = 'error';
        node.errorMessage = error.message;
      }
    },
    
    async runWorkflow() {
      // Execute all nodes in sequence
      for (const node of this.nodes) {
        await this.executeNode(node);
      }
      this.$message.success('Workflow executed successfully!');
    },
    
    isNodeRunning(nodeId) {
      return this.runningNodes.has(nodeId);
    },
    
    // Context menu
    showCanvasContextMenu(event) {
      this.showCanvasMenu = true;
      this.canvasMenuTop = event.clientY;
      this.canvasMenuLeft = event.clientX;
      
      const closeMenu = (e) => {
        if (!this.$refs.canvasContextMenu || !this.$refs.canvasContextMenu.contains(e.target)) {
          this.showCanvasMenu = false;
          document.removeEventListener('click', closeMenu);
        }
      };
      
      document.addEventListener('click', closeMenu);
    },
    
    addNodeAtCanvasPosition() {
      this.showCanvasMenu = false;
      this.addNode();
    },
    
    // Settings
    saveSettings() {
      // 保存首选编辑器设置
      ExternalEditorManager.setUserPreferredEditor(this.preferredEditor);
      console.log('Settings saved');
      this.$message.success('Settings saved successfully!');
    }
  },
  
  mounted() {
    console.log('App mounted');
    
    // 全局鼠标移动处理 - 使用requestAnimationFrame优化性能
    let isProcessing = false;
    document.addEventListener('mousemove', (event) => {
      // 使用requestAnimationFrame避免延迟
      if (!isProcessing) {
        isProcessing = true;
        requestAnimationFrame(() => {
          // 处理节点拖拽
          if (this.isDragging && this.dragNode) {
            // 获取画布位置
            const canvasRect = this.$refs.flowCanvas.getBoundingClientRect();
            
            // 计算节点新位置（鼠标位置减去偏移量）
            const newX = event.clientX - canvasRect.left - this.dragOffsetX;
            const newY = event.clientY - canvasRect.top - this.dragOffsetY;
            
            // 更新所有选中节点的位置
            this.selectedNodeIds.forEach(nodeId => {
              const node = this.nodes.find(n => n.id === nodeId);
              if (node) {
                node.x = newX;
                node.y = newY;
              }
            });
          }
          
          // 处理连接线拖拽
          if (this.connectionState.isCreating) {
            this.trackConnection(event);
          }
          
          // 处理选择框
          if (this.isSelecting) {
            this.updateCanvasSelection(event);
          }
          
          isProcessing = false;
        });
      }
    });
    
    // 全局鼠标释放处理
    document.addEventListener('mouseup', (event) => {
      // 结束节点拖拽
      if (this.isDragging) {
        this.isDragging = false;
        this.dragNode = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // 恢复光标
        if (this.$refs.flowCanvas) {
          this.$refs.flowCanvas.style.cursor = '';
        }
      }
      
      // 结束连接线创建
      if (this.connectionState.isCreating) {
        this.endConnection(event);
      }
      
      // 结束选择框
      if (this.isSelecting) {
        this.endCanvasSelection(event);
      }
    });
    
    // 键盘事件处理
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' && this.selectedNodeIds.length > 0) {
        this.deleteSelectedNodes();
      }
    });
    
    // 加载初始数据
    this.loadWorkflowList();
    this.loadTemplateList();
  },
    
    // 全局鼠标释放处理
    document.addEventListener('mouseup', (event) => {
      console.log('Mouse up event');
      
      // 结束节点拖拽
      if (this.isDragging) {
        console.log('Ending drag');
        this.isDragging = false;
        this.dragNode = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // 恢复光标
        if (this.$refs.flowCanvas) {
          this.$refs.flowCanvas.style.cursor = '';
        }
      }
      
      // 结束连接线创建
      if (this.connectionState.isCreating) {
        this.endConnection(event);
      }
      
      // 结束选择框
      if (this.isSelecting) {
        this.endCanvasSelection(event);
      }
    });
    
    // 键盘事件处理
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' && this.selectedNodeIds.length > 0) {
        this.deleteSelectedNodes();
      }
    });
    
    // 加载初始数据
    this.loadWorkflowList();
    this.loadTemplateList();
  },
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
}

/* Layout */
.app-layout {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  z-index: 100;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo h2 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.logo p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.navigation {
  padding: 20px 0;
}

.navigation ul {
  list-style: none;
}

.navigation li {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.navigation li:hover {
  background: rgba(255,255,255,0.1);
}

.navigation li.active {
  background: rgba(255,255,255,0.2);
  border-left: 3px solid white;
}

.navigation li i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-content h3 {
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.category {
  margin-bottom: 20px;
}

.category h4 {
  margin-bottom: 10px;
  font-size: 1rem;
  opacity: 0.9;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: grab;
  transition: all 0.3s ease;
}

.node-item:hover {
  background: rgba(255,255,255,0.2);
  transform: translateX(5px);
}

.node-item .node-icon {
  margin-right: 10px;
  font-size: 1rem;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 10;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f2f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f2f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

/* Canvas Area */
.canvas-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.flow-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: 
    radial-gradient(#e0e0e0 1px, transparent 1px),
    radial-gradient(#e0e0e0 1px, transparent 1px);
  background-position: 0 0, 10px 10px;
  background-size: 20px 20px;
  overflow: auto;
  user-select: none; /* 禁用文本选择 */
  -webkit-user-select: none; /* Safari兼容 */
  -moz-user-select: none; /* Firefox兼容 */
  -ms-user-select: none; /* IE兼容 */
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.connection-line {
  stroke: #667eea;
  stroke-width: 2;
  fill: none;
}

.connection-line-temp {
  stroke: #764ba2;
  stroke-width: 2;
  stroke-dasharray: 5,5;
  fill: none;
}

.connection-line-conflict {
  stroke: #ff6b6b;
  stroke-width: 2;
  stroke-dasharray: 3,3;
  fill: none;
}

/* Nodes */
.node-templatetemp {
  border: 2px dashed #667eea;
  opacity: 0.7;
}

.node-templatetemp {
  border: 2px dashed #667eea;
  opacity: 0.7;
}

.node:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.node-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.node-actions {
  display: flex;
  gap: 5px;
}

.node-action-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.node-action-btn:hover {
  background: rgba(255,255,255,0.3);
}

.node-content {
  padding: 15px;
}

.node-ports {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.input-port, .output-port {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
}

.input-port:hover, .output-port:hover {
  transform: scale(1.2);
  background: #764ba2;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.detail-item label {
  font-weight: 600;
  color: #666;
}

/* Properties Panel */
.properties-panel {
  width: 300px;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.position-inputs {
  display: flex;
  gap: 10px;
}

.position-inputs input {
  width: 50%;
}

.actions {
  margin-top: 20px;
}

/* Lists */
.workflow-list, .template-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.workflow-item, .template-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.workflow-item:hover, .template-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.workflow-item i, .template-item i {
  font-size: 1.5rem;
  margin-right: 15px;
  color: #667eea;
}

.workflow-info h4, .template-info h4 {
  margin-bottom: 5px;
  font-size: 1rem;
}

.workflow-info p, .template-info p {
  font-size: 0.8rem;
  color: #666;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 20px;
}

.empty-state button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-state button:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 1000;
  min-width: 200px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 10px;
}

.context-menu-item:hover {
  background: #f0f2f5;
}

/* Modals */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  font-size: 1.5rem;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.template-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  background: #e9ecef;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.template-icon {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #667eea;
}

.template-card h4 {
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.template-card p {
  font-size: 0.9rem;
  color: #666;
}

/* Settings */
.setting-group {
  margin-bottom: 25px;
}

.setting-group h4 {
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #333;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.setting-item label {
  font-weight: 600;
  color: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .sidebar-content {
    display: none;
  }
  
  .properties-panel {
    width: 250px;
  }
}
</style>