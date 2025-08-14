import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import Workflow from './models/workflow.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a shorthand for the query function
const { query } = db;

class WorkflowManager {
  constructor() {
    // Directory to store workflow files
    this.workflowDir = path.join(__dirname, '..', '..', 'workflows');
    this.init();
  }

  /**
   * Initialize the workflow manager
   */
  async init() {
    try {
      // Create workflows directory if it doesn't exist
      await fs.mkdir(this.workflowDir, { recursive: true });
      console.log('Workflow directory initialized');
    } catch (error) {
      console.error('Failed to initialize workflow directory:', error);
    }
  }

  /**
   * Save a workflow to file and database
   * @param {object} workflowData - Workflow data to save
   * @returns {Promise<string>} - Workflow ID
   */
  async saveWorkflow(workflowData) {
    try {
      // Create workflow instance
      const workflow = new Workflow(workflowData);

      // Validate workflow
      const validation = workflow.validate();
      if (!validation.isValid) {
        throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
      }

      // Save to file
      const filePath = path.join(this.workflowDir, `${workflow.id}.flowboard`);
      await fs.writeFile(filePath, JSON.stringify(workflow.toObject(), null, 2));

      // Save to database if available
      try {
        const queryText = `
          INSERT INTO workflows(id, name, data, created_at, updated_at)
          VALUES($1, $2, $3, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET name = $2, data = $3, updated_at = NOW()
        `;
        const values = [workflow.id, workflow.name, JSON.stringify(workflow.toObject())];
        await query(queryText, values);
        console.log(`Workflow ${workflow.id} saved to database`);
      } catch (dbError) {
        console.log(`Database not available, workflow saved to file only: ${workflow.id}`);
      }

      console.log(`Workflow ${workflow.id} saved successfully`);
      return workflow.id;
    } catch (error) {
      throw new Error(`Failed to save workflow: ${error.message}`);
    }
  }

  /**
   * Load a workflow from file or database
   * @param {string} workflowId - ID of the workflow to load
   * @returns {Promise<object>} - Workflow object
   */
  async loadWorkflow(workflowId) {
    try {
      // Try to load from file first
      const filePath = path.join(this.workflowDir, `${workflowId}.flowboard`);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const workflowData = JSON.parse(data);
        // Return as Workflow instance
        return Workflow.fromObject(workflowData);
      } catch (fileError) {
        // If file doesn't exist, try database
        console.log(`Workflow file not found, trying database: ${fileError.message}`);
        try {
          const result = await query('SELECT data FROM workflows WHERE id = $1', [workflowId]);
          
          if (result.rows.length > 0) {
            const workflowData = JSON.parse(result.rows[0].data);
            return Workflow.fromObject(workflowData);
          } else {
            throw new Error(`Workflow ${workflowId} not found`);
          }
        } catch (dbError) {
          throw new Error(`Workflow ${workflowId} not found in file or database`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to load workflow: ${error.message}`);
    }
  }

  /**
   * List all workflows
   * @returns {Promise<Array>} - List of workflows
   */
  async listWorkflows() {
    try {
      // Try to get from database first
      try {
        const result = await query('SELECT id, name, created_at, updated_at FROM workflows ORDER BY updated_at DESC');
        return result.rows;
      } catch (dbError) {
        console.log('Database not available, scanning file system for workflows');
        // Fallback to file system
        const files = await fs.readdir(this.workflowDir);
        const workflows = [];
        
        for (const file of files) {
          if (file.endsWith('.flowboard')) {
            try {
              const filePath = path.join(this.workflowDir, file);
              const data = await fs.readFile(filePath, 'utf8');
              const workflow = JSON.parse(data);
              workflows.push({
                id: workflow.id,
                name: workflow.name,
                created_at: workflow.createdAt || workflow.created_at || new Date().toISOString(),
                updated_at: workflow.updatedAt || workflow.updated_at || new Date().toISOString()
              });
            } catch (parseError) {
              console.error(`Error parsing workflow file ${file}:`, parseError);
            }
          }
        }
        
        // Sort by updated_at descending
        return workflows.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      }
    } catch (error) {
      console.error('Failed to list workflows:', error);
      return [];
    }
  }

  /**
   * Delete a workflow
   * @param {string} workflowId - ID of the workflow to delete
   */
  async deleteWorkflow(workflowId) {
    try {
      // Delete from file system
      const filePath = path.join(this.workflowDir, `${workflowId}.flowboard`);
      try {
        await fs.unlink(filePath);
        console.log(`Workflow file deleted: ${filePath}`);
      } catch (fileError) {
        console.log(`Workflow file not found: ${fileError.message}`);
      }

      // Delete from database if available
      try {
        await query('DELETE FROM workflows WHERE id = $1', [workflowId]);
        console.log(`Workflow deleted from database: ${workflowId}`);
      } catch (dbError) {
        console.log(`Database not available, workflow deleted from file system only: ${workflowId}`);
      }

      console.log(`Workflow ${workflowId} deleted successfully`);
    } catch (error) {
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }
  }
}

export default WorkflowManager;