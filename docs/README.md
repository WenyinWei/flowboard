# Flowboard Documentation

## Project Structure

```
flowboard/
├── src/                    # Frontend source code
│   ├── components/         # Vue components
│   ├── App.vue             # Main application component
│   └── main.js             # Application entry point
├── src/backend/            # Backend source code
│   ├── models/             # Data models
│   ├── server.js           # Main server file
│   ├── workflowManager.js  # Workflow management
│   ├── executionEngine.js  # Script execution engine
│   ├── db.js               # Database connection
│   └── dbInit.js           # Database initialization
├── scripts/                # Example scripts
├── public/                 # Static assets
├── workflows/              # Saved workflows (generated)
├── package.json            # Project dependencies
└── README.md              # This file
```

## Workflow File Format

Flowboard uses a custom `.flowboard` file format based on JSON:

```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "version": "1.0.0",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "nodes": [
    {
      "id": 1,
      "type": "data-input",
      "x": 100,
      "y": 100,
      "parameters": {}
    }
  ],
  "connections": [
    {
      "id": 1,
      "source": 1,
      "target": 2
    }
  ],
  "metadata": {}
}
```

## Node Types

### Data Input Node
- Purpose: Import data from various sources
- Properties:
  - `source`: Data source (file path, API endpoint, etc.)
  - `format`: Data format (CSV, JSON, etc.)

### Data Process Node
- Purpose: Process data using scripts
- Properties:
  - `scriptPath`: Path to the script file
  - `language`: Script language (python, julia)
  - `parameters`: Additional parameters for the script

### Data Output Node
- Purpose: Export data to various destinations
- Properties:
  - `destination`: Output destination
  - `format`: Output format

### Visualization Node
- Purpose: Create data visualizations
- Properties:
  - `chartType`: Type of chart (line, bar, pie, etc.)
  - `dataSource`: Source of data for visualization

## API Endpoints

### Workflow Management
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get a specific workflow
- `POST /api/workflows` - Save a workflow
- `DELETE /api/workflows/:id` - Delete a workflow

### Execution
- `POST /api/execute` - Execute a script directly
- `POST /api/executeNode` - Execute a node with data flow
- `POST /api/cancel/:nodeId` - Cancel execution of a node
- `GET /api/nodeOutput/:nodeId` - Get output from a node

### Health Check
- `GET /api/health` - Check server health

## Development

### Frontend Development
The frontend is built with Vue 3 and Element Plus components. Key files:
- `src/App.vue` - Main application component
- `src/components/VisualizationNode.vue` - Visualization component

### Backend Development
The backend is built with Node.js and Express. Key files:
- `src/backend/server.js` - Main server file
- `src/backend/models/workflow.js` - Workflow data model
- `src/backend/workflowManager.js` - Workflow management
- `src/backend/executionEngine.js` - Script execution engine

### Database
Flowboard uses PostgreSQL for workflow persistence. The database schema includes:
- `workflows` table with columns: id, name, data, created_at, updated_at

## Extending Flowboard

### Adding New Node Types
1. Add the node type to the node palette in `src/App.vue`
2. Add CSS styling for the new node type
3. Implement any node-specific logic in the execution engine

### Adding New Visualization Types
1. Extend the visualization configuration options in `src/App.vue`
2. Update the `VisualizationNode.vue` component to support new chart types

### Adding New Script Languages
1. Add support in the execution engine (`src/backend/executionEngine.js`)
2. Update the node configuration UI in `src/App.vue`