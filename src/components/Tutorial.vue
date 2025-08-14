<template>
  <div class="tutorial-overlay" v-if="showTutorial">
    <div class="tutorial-modal">
      <div class="tutorial-header">
        <h2>Welcome to Flowboard</h2>
        <el-button @click="closeTutorial" type="text" class="close-btn">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="tutorial-content">
        <el-carousel height="400px" indicator-position="outside">
          <el-carousel-item>
            <div class="slide-content">
              <h3>Getting Started</h3>
              <p>Flowboard is a visual workflow editor that allows you to create data processing pipelines by connecting nodes.</p>
              <div class="slide-image">
                <img src="../assets/tutorial-1.png" alt="Flowboard Interface" />
              </div>
              <p>Drag nodes from the palette on the left to the canvas to create your workflow.</p>
            </div>
          </el-carousel-item>
          
          <el-carousel-item>
            <div class="slide-content">
              <h3>Node Types</h3>
              <p>Flowboard supports several node types:</p>
              <ul>
                <li><strong>Data Input</strong>: Import data from various sources</li>
                <li><strong>Data Process</strong>: Process data with Python or Julia scripts</li>
                <li><strong>Data Output</strong>: Export data to various destinations</li>
                <li><strong>Visualization</strong>: Create charts and visualizations</li>
              </ul>
              <div class="slide-image">
                <img src="../assets/tutorial-2.png" alt="Node Types" />
              </div>
            </div>
          </el-carousel-item>
          
          <el-carousel-item>
            <div class="slide-content">
              <h3>Connecting Nodes</h3>
              <p>Connect nodes by dragging from the output port of one node to the input port of another.</p>
              <div class="slide-image">
                <img src="../assets/tutorial-3.png" alt="Connecting Nodes" />
              </div>
              <p>Connections define the data flow between nodes in your workflow.</p>
            </div>
          </el-carousel-item>
          
          <el-carousel-item>
            <div class="slide-content">
              <h3>Executing Workflows</h3>
              <p>Execute individual nodes or run the entire workflow:</p>
              <ul>
                <li>Click the "Execute" button on a node to run it individually</li>
                <li>Click "Run Workflow" in the toolbar to execute all nodes</li>
              </ul>
              <div class="slide-image">
                <img src="../assets/tutorial-4.png" alt="Executing Workflows" />
              </div>
            </div>
          </el-carousel-item>
          
          <el-carousel-item>
            <div class="slide-content">
              <h3>Built-in Templates</h3>
              <p>Get started quickly with built-in templates:</p>
              <ul>
                <li>Data Analysis Template</li>
                <li>Financial Analysis Template</li>
                <li>Scientific Computing Template</li>
              </ul>
              <p>Access templates through the "Templates" button in the toolbar or the Templates tab.</p>
              <div class="slide-image">
                <img src="../assets/tutorial-5.png" alt="Templates" />
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      
      <div class="tutorial-footer">
        <el-checkbox v-model="dontShowAgain">Don't show again</el-checkbox>
        <div class="tutorial-buttons">
          <el-button @click="closeTutorial">Skip Tutorial</el-button>
          <el-button type="primary" @click="finishTutorial">Start Using Flowboard</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Close } from '@element-plus/icons-vue';

export default {
  name: 'Tutorial',
  components: {
    Close
  },
  data() {
    return {
      showTutorial: true,
      dontShowAgain: false
    };
  },
  methods: {
    closeTutorial() {
      this.showTutorial = false;
      if (this.dontShowAgain) {
        localStorage.setItem('flowboard-tutorial-completed', 'true');
      }
    },
    finishTutorial() {
      this.showTutorial = false;
      localStorage.setItem('flowboard-tutorial-completed', 'true');
    }
  },
  mounted() {
    // Check if tutorial has been completed before
    const tutorialCompleted = localStorage.getItem('flowboard-tutorial-completed');
    if (tutorialCompleted) {
      this.showTutorial = false;
    }
  }
};
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.tutorial-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 800px;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.tutorial-header h2 {
  margin: 0;
  color: #42b983;
}

.close-btn {
  font-size: 24px;
}

.tutorial-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.slide-content {
  text-align: center;
}

.slide-content h3 {
  color: #42b983;
  margin-bottom: 16px;
}

.slide-content p {
  margin-bottom: 16px;
  line-height: 1.6;
}

.slide-content ul {
  text-align: left;
  margin: 16px 0;
  padding-left: 20px;
}

.slide-content li {
  margin-bottom: 8px;
}

.slide-image {
  margin: 20px 0;
}

.slide-image img {
  max-width: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tutorial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #eee;
}

.tutorial-buttons {
  display: flex;
  gap: 10px;
}
</style>