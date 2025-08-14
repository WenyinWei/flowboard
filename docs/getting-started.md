# Getting Started with Flowboard

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- PostgreSQL database
- Python (for Python script execution)
- Julia (optional, for Julia script execution)

## Installation

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
   Copy the example environment file and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file to match your database configuration:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=flowboard
   DB_USER=your_username
   DB_PASSWORD=your_password
   PYTHON_PATH=python
   JULIA_PATH=julia  # Optional
   ```

4. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE flowboard;
   ```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run serve
```

This command will:
1. Start the Vue frontend development server on port 8080
2. Start the backend API server on port 3000

Open your browser and navigate to `http://localhost:8080` to access the application.

### Production Mode

To build and run the application in production mode:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the application:
   ```bash
   npm start
   ```

This will start both the backend server and the Electron desktop application.

## Interactive Tutorial

When you first launch Flowboard, you'll be greeted with an interactive tutorial that walks you through the main features of the application. The tutorial includes:

1. **Getting Started**: Overview of the Flowboard interface
2. **Node Types**: Explanation of different node types
3. **Connecting Nodes**: How to create connections between nodes
4. **Executing Workflows**: How to run individual nodes or entire workflows
5. **Built-in Templates**: Introduction to the built-in templates

You can skip the tutorial at any time or disable it permanently using the checkbox.

## Creating Your First Workflow

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

## Using Built-in Templates

Flowboard comes with several built-in templates to help you get started quickly:

1. **Data Analysis Template**: A workflow for basic data analysis tasks
2. **Financial Analysis Template**: A workflow for financial data analysis and visualization
3. **Scientific Computing Template**: A workflow for scientific computing with Julia

To use a template:
1. Click the "Templates" button in the toolbar
2. Select a template from the dropdown menu
3. The template will be loaded into the workspace
4. Customize the template to fit your needs

You can also access templates through the "Templates" tab in the left sidebar.

## Example Workflows

### Simple Data Processing
1. Add a Data Input node
2. Add a Data Process node with a Python script
3. Connect the nodes
4. Execute the workflow

### Data Visualization
1. Create a data processing workflow
2. Add a Visualization node
3. Connect the data source to the visualization node
4. Configure the visualization settings
5. Execute and view the chart

## Customizing Flowboard

### Adding Custom Scripts
Place your custom Python or Julia scripts in the `scripts/` directory or any subdirectory.

### Creating Custom Visualizations
Extend the visualization capabilities by:
1. Adding new chart types to the Visualization node configuration
2. Modifying the `VisualizationNode.vue` component
3. Using additional charting libraries

### Domain-Specific Customization
Create domain-specific templates by:
1. Defining custom node types
2. Creating pre-configured workflows
3. Adding domain-specific visualization components

## Keyboard Shortcuts

- **Ctrl+N**: Add new node
- **Ctrl+S**: Save workflow
- **Ctrl+O**: Load workflow
- **Ctrl+R**: Run workflow
- **Delete**: Delete selected node

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure the `flowboard` database exists

2. **Script Execution Failed**:
   - Verify Python/Julia is installed and accessible
   - Check script paths are correct
   - Ensure scripts have proper permissions

3. **Node.js Version Issues**:
   - Ensure Node.js version is 14 or higher
   - Update Node.js if needed

### Getting Help

- Check the documentation in the `docs/` directory
- Open an issue on GitHub
- Contact the development team