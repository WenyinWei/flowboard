import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import db from './db.js';
import WorkflowManager from './workflowManager.js';
import ExecutionEngine from './executionEngine.js';
import { initializeDatabase } from './dbInit.js';

// Create a shorthand for the query function
const { query } = db;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
initializeDatabase();

// Create Express app
const app = express();
let server; // Declare server variable

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Initialize managers
const workflowManager = new WorkflowManager();
const executionEngine = new ExecutionEngine();

// API Routes

// Get all workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const workflows = await workflowManager.listWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Get a specific workflow
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const workflow = await workflowManager.loadWorkflow(req.params.id);
    res.json(workflow.toObject());
  } catch (error) {
    console.error('Error loading workflow:', error);
    res.status(404).json({ error: 'Workflow not found' });
  }
});

// Save a workflow
app.post('/api/workflows', async (req, res) => {
  try {
    const workflowId = await workflowManager.saveWorkflow(req.body);
    res.json({ id: workflowId });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ error: 'Failed to save workflow' });
  }
});

// Delete a workflow
app.delete('/api/workflows/:id', async (req, res) => {
  try {
    await workflowManager.deleteWorkflow(req.params.id);
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// Get all templates
app.get('/api/templates', async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '..', '..', 'templates');
    const files = await fs.readdir(templatesDir);
    const templates = [];
    
    for (const file of files) {
      if (file.endsWith('.flowboard')) {
        try {
          const filePath = path.join(templatesDir, file);
          const data = await fs.readFile(filePath, 'utf8');
          const template = JSON.parse(data);
          templates.push({
            id: template.id,
            name: template.name,
            description: template.metadata?.description || '',
            tags: template.metadata?.tags || []
          });
        } catch (parseError) {
          console.error(`Error parsing template file ${file}:`, parseError);
        }
      }
    }
    
    res.json(templates);
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// Get a specific template
app.get('/api/templates/:id', async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '..', '..', 'templates');
    const filePath = path.join(templatesDir, `${req.params.id}.flowboard`);
    const data = await fs.readFile(filePath, 'utf8');
    const template = JSON.parse(data);
    res.json(template);
  } catch (error) {
    console.error('Error loading template:', error);
    res.status(404).json({ error: 'Template not found' });
  }
});

// Execute a node
app.post('/api/execute', async (req, res) => {
  try {
    const { scriptPath, params, nodeId, language } = req.body;
    
    // Resolve script path relative to the project root
    const fullPath = path.resolve(__dirname, '..', '..', scriptPath);
    
    let result;
    if (language === 'python') {
      result = await executionEngine.executePythonScript(fullPath, params, nodeId);
    } else if (language === 'julia') {
      result = await executionEngine.executeJuliaScript(fullPath, params, nodeId);
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error executing script:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute a node with data flow
app.post('/api/executeNode', async (req, res) => {
  try {
    const { node, params } = req.body;
    
    // Prepare execution parameters
    const executionParams = {
      nodeId: node.id,
      ...params
    };
    
    console.log(`Executing node ${node.id} with params:`, executionParams);
    
    // Determine script path based on node type and operation
    let scriptPath;
    if (node.type === 'data-input' || node.type === 'data-process') {
      // Use our data processor script
      scriptPath = path.join(__dirname, '..', '..', 'scripts', 'data_processor.py');
    } else if (node.type === 'visualization') {
      // Use our data processor script for visualization as well
      scriptPath = path.join(__dirname, '..', '..', 'scripts', 'data_processor.py');
    } else {
      // Default to the data processor script
      scriptPath = path.join(__dirname, '..', '..', 'scripts', 'data_processor.py');
    }
    
    // Execute the script
    const result = await executionEngine.executePythonScript(scriptPath, executionParams, node.id);
    
    // Parse the output if it's JSON
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(result.output);
    } catch (parseError) {
      // If parsing fails, return the raw output
      parsedOutput = {
        rawOutput: result.output,
        error: result.error
      };
    }
    
    res.json(parsedOutput);
  } catch (error) {
    console.error('Error executing node:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel execution
app.post('/api/cancel/:nodeId', (req, res) => {
  try {
    executionEngine.cancelExecution(req.params.nodeId);
    res.json({ message: 'Execution cancelled' });
  } catch (error) {
    console.error('Error cancelling execution:', error);
    res.status(500).json({ error: 'Failed to cancel execution' });
  }
});

// Get node output
app.get('/api/nodeOutput/:nodeId', (req, res) => {
  try {
    const output = executionEngine.getNodeOutput(req.params.nodeId);
    if (output) {
      res.json({ output });
    } else {
      res.status(404).json({ error: 'Node output not found' });
    }
  } catch (error) {
    console.error('Error getting node output:', error);
    res.status(500).json({ error: 'Failed to get node output' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await query('SELECT NOW()');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: error.message });
  }
});

// Function to start server on available port
function startServer(port) {
  server = http.createServer(app); // Create server instance
  
  server.listen(port, () => {
    console.log(`Flowboard backend server running on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', error);
    }
  });
  
  return server;
}

// Start server
const PORT = process.env.PORT || 3000;
const serverInstance = startServer(PORT);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  serverInstance.close(() => {
    console.log('Process terminated');
  });
});

export { app, serverInstance as server };