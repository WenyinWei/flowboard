# Flowboard

A flexible, cross-platform dashboard for creating and managing data processing workflows with support for Python, Julia, and more.

## Features

- Visual workflow editor with drag-and-drop interface
- Support for multiple programming languages (Python, Julia)
- PostgreSQL database integration for workflow persistence
- Extensible node-based architecture
- Real-time execution and monitoring
- Advanced data visualization with Chart.js
- Element Plus UI components for enhanced user experience
- Complex workflow file format with validation
- Data flow between nodes
- Domain-specific customization options
- Built-in templates for quick start
- Interactive tutorial for new users
- Right-click context menu for adding nodes
- Resizable and repositionable nodes
- Multiple display modes for nodes (code, concise, visual)
- Cached node sizes and positions

## Enhanced Node Types

- **Data Input**: Nodes for importing data from various sources
- **Data Process**: Nodes for processing data with Python or Julia scripts
- **Data Output**: Nodes for exporting data to various destinations
- **Visualization**: Nodes for creating charts and visualizations

## Built-in Templates

Flowboard comes with several built-in templates to help you get started quickly:

1. **Data Analysis Template**: A workflow for basic data analysis tasks
2. **Financial Analysis Template**: A workflow for financial data analysis and visualization
3. **Scientific Computing Template**: A workflow for scientific computing with Julia

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Python (for Python script execution)
- Julia (optional, for Julia script execution)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/WenyinWei/flowboard.git
   cd flowboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

4. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE flowboard;
   ```

### Development

To run the application in development mode:

```bash
npm run serve
```

This will start both the Vue frontend development server and the backend API server.

### Production

To build the application for production:

```bash
npm run build
```

To start the application in production mode:

```bash
npm start
```

## Architecture

Flowboard consists of three main components:

1. **Frontend**: Vue.js application with Element Plus UI components providing the visual workflow editor
2. **Backend**: Node.js/Express server handling API requests, script execution, and data flow management
3. **Database**: PostgreSQL for workflow persistence

### Workflow Model

Workflows are stored in a custom `.flowboard` file format that includes:
- Workflow metadata (ID, name, version, timestamps)
- Nodes with properties and configurations
- Connections between nodes
- Validation rules

### Execution Engine

The execution engine supports:
- Python script execution via python-shell
- Julia script execution via child processes
- Data flow between connected nodes
- Execution monitoring and cancellation

## User Guide

### Getting Started

When you first launch Flowboard, you'll see an interactive tutorial that walks you through the main features. You can skip the tutorial at any time or disable it permanently.

### Creating Workflows

1. **Add Nodes**: 
   - Drag nodes from the "Node Palette" on the left side
   - Right-click on the canvas and select "Add Node Here"
   - Available node types: Data Input, Data Process, Data Output, Visualization

2. **Configure Nodes**:
   - Click on a node to select it
   - Use the "Inspector" panel on the right to configure node properties
   - For Data Process nodes, set the script path and language

3. **Connect Nodes**:
   - Drag from the output port of one node to the input port of another
   - Connections define the data flow between nodes

4. **Customize Node Display**:
   - Click the view icon in the node header to switch between display modes:
     - Code View: Shows full node details and controls
     - Concise View: Shows only basic node information
     - Visual View: Shows a visual representation of the node

5. **Resize and Reposition Nodes**:
   - Drag nodes to reposition them
   - Use the resize handles (small circles) at the corners to resize nodes
   - Node sizes and positions are automatically cached

6. **Execute Nodes**:
   - Click the "Execute" button on individual nodes
   - Or use the "Run Workflow" button in the toolbar to execute all nodes

7. **Visualize Data**:
   - Add a Visualization node to your workflow
   - Configure the chart type and data source in the Inspector
   - Use the Visualization tab to preview the chart

8. **Save Your Workflow**:
   - Click the "Save" button in the toolbar
   - Workflows are saved to both the file system and database

### Using Templates

Flowboard includes built-in templates to help you get started quickly:

1. Click the "Templates" button in the toolbar
2. Select a template from the dropdown menu, or
3. Browse templates in the "Templates" tab in the left sidebar
4. The template will be loaded into the workspace
5. Customize the template to fit your needs

### Keyboard Shortcuts

- **Ctrl+N**: Add new node
- **Ctrl+S**: Save workflow
- **Ctrl+O**: Load workflow
- **Ctrl+R**: Run workflow
- **Delete**: Delete selected node

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.