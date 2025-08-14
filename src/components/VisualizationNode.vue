<template>
  <div class="visualization-node">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

// Register all chart components
Chart.register(...registerables);

export default {
  name: 'VisualizationNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    data: {
      type: [Array, Object],
      default: () => []
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.renderChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  methods: {
    renderChart() {
      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }

      // Get chart container
      const ctx = this.$refs.chartContainer.getContext('2d');

      // Default chart configuration
      const config = {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };

      // Apply node-specific configuration if available
      if (this.node.visualizationConfig) {
        Object.assign(config, this.node.visualizationConfig);
      }

      // Use provided data or default data
      if (this.data && this.data.labels && this.data.datasets) {
        config.data = this.data;
      } else if (Array.isArray(this.data)) {
        // Convert array data to chart format
        config.data = {
          labels: this.data.map((_, index) => index),
          datasets: [{
            label: 'Data',
            data: this.data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };
      }

      // Create chart
      this.chart = new Chart(ctx, config);
    },
    
    updateChart() {
      if (this.chart) {
        // Update chart data
        if (this.data && this.data.labels && this.data.datasets) {
          this.chart.data = this.data;
        } else if (Array.isArray(this.data)) {
          this.chart.data = {
            labels: this.data.map((_, index) => index),
            datasets: [{
              label: 'Data',
              data: this.data,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          };
        }
        
        // Update the chart
        this.chart.update();
      } else {
        // Render chart if it doesn't exist
        this.renderChart();
      }
    }
  }
};
</script>

<style scoped>
.visualization-node {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>