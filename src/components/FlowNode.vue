<template>
  <div
    class="node"
    :class="[nodeClass, { 'node-selected': isSelected }]"
    :style="nodeStyle"
    @mousedown="onMouseDown"
  >
    <!-- Card Mode -->
    <div class="node-header" v-if="node.displayMode === 'card'">
      <div class="node-title">
        <i :class="nodeIcon"></i>
        <span>{{ nodeTitle }}</span>
      </div>
      <div class="node-actions">
        <button class="node-action-btn" @click.stop="toggleDisplayMode('node')">
          <i class="fas fa-compress"></i>
        </button>
        <button class="node-action-btn" @click.stop="executeNode" :disabled="isRunning">
          <i class="fas fa-play" v-if="!isRunning"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
        </button>
        <button class="node-action-btn" @click.stop="onDelete">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="node-content" v-if="node.displayMode === 'card'">
      <div class="node-ports">
        <div 
          class="input-port" 
          title="Input"
          @mousedown.stop="onPortMouseDown('input')"
        ></div>
        <div 
          class="output-port" 
          title="Output"
          @mousedown.stop="onPortMouseDown('output')"
        ></div>
      </div>
      <div class="node-details" v-if="node.type === 'data-process'">
        <div class="detail-item">
          <label>Script:</label>
          <span>{{ node.scriptPath }}</span>
        </div>
        <div class="detail-item">
          <label>Language:</label>
          <span>{{ node.language }}</span>
        </div>
      </div>
      <div class="node-details" v-else-if="node.type === 'visualization'">
        <div class="detail-item">
          <label>Chart Type:</label>
          <span>{{ node.chartType }}</span>
        </div>
      </div>
      <div class="node-details" v-else-if="node.type === 'math-operation'">
        <div class="detail-item">
          <label>Operation:</label>
          <span>{{ node.operation }}</span>
        </div>
      </div>
      
      <!-- Execution Status -->
      <div class="execution-status" @click.stop="showErrorMessage">
        <div v-if="node.executionStatus === 'idle'">
          <i class="fas fa-circle status-icon idle"></i>
        </div>
        <div v-else-if="node.executionStatus === 'running'">
          <i class="fas fa-spinner fa-spin status-icon running"></i>
          <span class="time-text">{{ formatExecutionTime(node.executionTime) }}</span>
        </div>
        <div v-else-if="node.executionStatus === 'success'">
          <i class="fas fa-check status-icon success"></i>
          <span class="time-text">{{ formatExecutionTime(node.executionTime) }}</span>
        </div>
        <div v-else-if="node.executionStatus === 'error'">
          <i class="fas fa-times status-icon error" title="Click to view error"></i>
          <span class="time-text">{{ formatExecutionTime(node.executionTime) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Node Mode -->
    <div class="node-symbol" v-else-if="node.displayMode === 'node'">
      <div class="symbol-content">
        <span v-if="node.symbol">{{ node.symbol }}</span>
        <i v-else :class="nodeIcon"></i>
      </div>
      <div class="node-ports-all">
        <!-- Top ports -->
        <div class="port-top-left" @mousedown.stop="onPortMouseDown('input')"></div>
        <div class="port-top-right" @mousedown.stop="onPortMouseDown('output')"></div>
        
        <!-- Side ports -->
        <div class="port-left" @mousedown.stop="onPortMouseDown('input')"></div>
        <div class="port-right" @mousedown.stop="onPortMouseDown('output')"></div>
        
        <!-- Bottom ports -->
        <div class="port-bottom-left" @mousedown.stop="onPortMouseDown('input')"></div>
        <div class="port-bottom-right" @mousedown.stop="onPortMouseDown('output')"></div>
      </div>
      <div class="node-symbol-actions">
        <button class="symbol-action-btn" @click.stop="toggleDisplayMode('card')">
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlowNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isRunning: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    nodeClass() {
      return `node-${this.node.type.replace(/-/g, '')}`;
    },
    nodeStyle() {
      if (this.node.displayMode === 'node') {
        return {
          left: this.node.x + 'px',
          top: this.node.y + 'px',
          width: '80px',
          height: '80px'
        };
      }
      return {
        left: this.node.x + 'px',
        top: this.node.y + 'px',
        width: (this.node.width || 200) + 'px',
        height: (this.node.height || 150) + 'px'
      };
    },
    nodeIcon() {
      const icons = {
        'data-input': 'fas fa-database',
        'data-process': 'fas fa-cogs',
        'data-output': 'fas fa-save',
        'visualization': 'fas fa-chart-bar',
        'math-operation': 'fas fa-calculator'
      };
      return icons[this.node.type] || 'fas fa-cube';
    },
    nodeTitle() {
      const titles = {
        'data-input': 'Data Input',
        'data-process': 'Data Process',
        'data-output': 'Data Output',
        'visualization': 'Visualization',
        'math-operation': 'Math Operation'
      };
      return titles[this.node.type] || this.node.type;
    }
  },
  methods: {
    onMouseDown(event) {
      console.log('FlowNode onMouseDown - Event:', event);
      console.log('FlowNode onMouseDown - Node:', this.node);
      console.log('FlowNode onMouseDown - Node ID:', this.node ? this.node.id : 'undefined');
      // 传递参数的正确顺序：event, node
      this.$emit('mousedown', event, this.node);
    },
    onPortMouseDown(portType) {
      this.$emit('port-mousedown', portType, this.node);
    },
    toggleDisplayMode(mode) {
      this.$emit('toggle-display-mode', this.node, mode);
    },
    executeNode() {
      this.$emit('execute', this.node);
    },
    onDelete() {
      this.$emit('delete', this.node.id);
    },
    formatExecutionTime(timeInSeconds) {
      if (timeInSeconds === null || timeInSeconds === undefined) {
        return '';
      }
      
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    },
    showErrorMessage() {
      if (this.node.executionStatus === 'error' && this.node.errorMessage) {
        alert(`Error: ${this.node.errorMessage}`);
      }
    }
  }
};
</script>

<style scoped>
.node {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  z-index: 10;
  border: 2px solid #e0e0e0;
}

.node.node-selected {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
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

/* Execution Status */
.execution-status {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 0.8rem;
}

.status-icon {
  font-size: 0.9rem;
}

.status-icon.idle {
  color: #6c757d;
}

.status-icon.running {
  color: #007bff;
}

.status-icon.success {
  color: #28a745;
}

.status-icon.error {
  color: #dc3545;
}

.time-text {
  color: #666;
}

/* Node Mode Styles */
.node-symbol {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border: 2px solid #e0e0e0;
  position: relative;
}

.node-symbol.node-selected {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.symbol-content {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
}

.node-ports-all {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.port-top-left, .port-top-right,
.port-left, .port-right,
.port-bottom-left, .port-bottom-right {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #35495e;
  cursor: pointer;
}

.port-top-left {
  top: -6px;
  left: 25%;
}

.port-top-right {
  top: -6px;
  right: 25%;
}

.port-left {
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
}

.port-right {
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
}

.port-bottom-left {
  bottom: -6px;
  left: 25%;
}

.port-bottom-right {
  bottom: -6px;
  right: 25%;
}

.node-symbol-actions {
  position: absolute;
  top: -30px;
  right: -30px;
}

.symbol-action-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #667eea;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
</style>