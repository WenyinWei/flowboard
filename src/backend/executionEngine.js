import { PythonShell } from 'python-shell';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExecutionEngine {
  constructor() {
    this.runningProcesses = new Map();
    this.nodeOutputs = new Map(); // Store outputs from executed nodes
  }

  /**
   * Execute a Python script with given parameters
   * @param {string} scriptPath - Path to the Python script
   * @param {object} params - Parameters to pass to the script
   * @param {string} nodeId - ID of the node being executed
   * @returns {Promise<object>} - Execution result
   */
  async executePythonScript(scriptPath, params, nodeId) {
    try {
      // Check if script file exists
      await fs.access(scriptPath);
      
      // Prepare options for PythonShell
      const options = {
        mode: 'text',
        pythonPath: process.env.PYTHON_PATH || 'python',
        pythonOptions: ['-u'], // Unbuffered output
        scriptPath: path.dirname(scriptPath),
        args: params ? [JSON.stringify(params)] : []
      };

      // Create a promise for the Python execution
      const executionPromise = new Promise((resolve, reject) => {
        const pyshell = new PythonShell(path.basename(scriptPath), options);
        
        let output = '';
        let errorOutput = '';
        
        // Collect output
        pyshell.stdout.on('data', (data) => {
          output += data;
        });
        
        // Collect errors
        pyshell.stderr.on('data', (data) => {
          errorOutput += data;
        });
        
        // Handle completion
        pyshell.end((err, code, signal) => {
          if (err) {
            reject(new Error(`Python script error: ${err.message}
${errorOutput}`));
          } else if (code !== 0) {
            reject(new Error(`Python script exited with code ${code}
${errorOutput}`));
          } else {
            resolve({
              nodeId,
              output,
              error: errorOutput
            });
          }
        });
      });

      // Store the running process
      this.runningProcesses.set(nodeId, executionPromise);
      
      // Wait for execution to complete
      const result = await executionPromise;
      
      // Store output for potential use by downstream nodes
      this.nodeOutputs.set(nodeId, result.output);
      
      // Remove from running processes
      this.runningProcesses.delete(nodeId);
      
      return result;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Python script not found: ${scriptPath}`);
      }
      throw new Error(`Failed to execute Python script: ${error.message}`);
    }
  }

  /**
   * Execute a Julia script with given parameters
   * @param {string} scriptPath - Path to the Julia script
   * @param {object} params - Parameters to pass to the script
   * @param {string} nodeId - ID of the node being executed
   * @returns {Promise<object>} - Execution result
   */
  async executeJuliaScript(scriptPath, params, nodeId) {
    try {
      // Check if script file exists
      await fs.access(scriptPath);
      
      // Prepare command and arguments
      const juliaPath = process.env.JULIA_PATH || 'julia';
      const args = params ? [scriptPath, JSON.stringify(params)] : [scriptPath];
      
      // Create a promise for the Julia execution
      const executionPromise = new Promise((resolve, reject) => {
        const juliaProcess = spawn(juliaPath, args);
        
        let output = '';
        let errorOutput = '';
        
        // Collect output
        juliaProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        // Collect errors
        juliaProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        // Handle completion
        juliaProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Julia script exited with code ${code}
${errorOutput}`));
          } else {
            resolve({
              nodeId,
              output,
              error: errorOutput
            });
          }
        });
        
        // Handle execution errors
        juliaProcess.on('error', (err) => {
          reject(new Error(`Failed to start Julia process: ${err.message}`));
        });
      });

      // Store the running process
      this.runningProcesses.set(nodeId, executionPromise);
      
      // Wait for execution to complete
      const result = await executionPromise;
      
      // Store output for potential use by downstream nodes
      this.nodeOutputs.set(nodeId, result.output);
      
      // Remove from running processes
      this.runningProcesses.delete(nodeId);
      
      return result;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Julia script not found: ${scriptPath}`);
      }
      throw new Error(`Failed to execute Julia script: ${error.message}`);
    }
  }

  /**
   * Execute a node with data flow support
   * @param {object} node - Node to execute
   * @param {object} workflow - Workflow containing the node
   * @param {object} inputData - Input data from connected nodes
   * @returns {Promise<object>} - Execution result
   */
  async executeNode(node, workflow, inputData = {}) {
    try {
      // Mark node as running
      this.runningProcesses.set(node.id, true);
      
      let result;
      
      // Prepare parameters with input data
      const params = {
        nodeId: node.id,
        inputData: inputData,
        ...node.parameters // Node-specific parameters
      };
      
      // Execute based on node type and language
      switch (node.language) {
        case 'python':
          result = await this.executePythonScript(node.scriptPath, params, node.id);
          break;
        case 'julia':
          result = await this.executeJuliaScript(node.scriptPath, params, node.id);
          break;
        default:
          throw new Error(`Unsupported language: ${node.language}`);
      }
      
      // Store output for potential use by downstream nodes
      this.nodeOutputs.set(node.id, result.output);
      
      // Remove from running processes
      this.runningProcesses.delete(node.id);
      
      return result;
    } catch (error) {
      // Remove from running processes
      this.runningProcesses.delete(node.id);
      throw error;
    }
  }

  /**
   * Get output from a previously executed node
   * @param {string} nodeId - ID of the node
   * @returns {string|undefined} - Output from the node
   */
  getNodeOutput(nodeId) {
    return this.nodeOutputs.get(nodeId);
  }

  /**
   * Cancel a running process
   * @param {string} nodeId - ID of the node to cancel
   */
  cancelExecution(nodeId) {
    const process = this.runningProcesses.get(nodeId);
    if (process) {
      // In a real implementation, we would need to properly terminate the process
      // This is a simplified version
      this.runningProcesses.delete(nodeId);
      console.log(`Cancelled execution for node ${nodeId}`);
    }
  }

  /**
   * Check if a process is running
   * @param {string} nodeId - ID of the node to check
   * @returns {boolean} - True if the process is running
   */
  isRunning(nodeId) {
    return this.runningProcesses.has(nodeId);
  }
}

export default ExecutionEngine;