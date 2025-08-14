/**
 * Workflow model definition
 */

class Workflow {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Untitled Workflow';
    this.version = data.version || '1.0.0';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.nodes = data.nodes || [];
    this.connections = data.connections || [];
    this.metadata = data.metadata || {};
  }

  /**
   * Add a node to the workflow
   * @param {object} node - Node to add
   */
  addNode(node) {
    this.nodes.push(node);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Remove a node from the workflow
   * @param {string} nodeId - ID of node to remove
   */
  removeNode(nodeId) {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    // Also remove connections to/from this node
    this.connections = this.connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    );
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Add a connection between nodes
   * @param {object} connection - Connection to add
   */
  addConnection(connection) {
    this.connections.push(connection);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Remove a connection
   * @param {string} connectionId - ID of connection to remove
   */
  removeConnection(connectionId) {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Update node properties
   * @param {string} nodeId - ID of node to update
   * @param {object} properties - Properties to update
   */
  updateNode(nodeId, properties) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, properties);
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Validate the workflow
   * @returns {object} Validation result
   */
  validate() {
    const errors = [];
    
    // Check for duplicate node IDs
    const nodeIds = this.nodes.map(node => node.id);
    const duplicateIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate node IDs found: ${duplicateIds.join(', ')}`);
    }
    
    // Check for invalid connections
    for (const conn of this.connections) {
      const sourceExists = this.nodes.some(node => node.id === conn.source);
      const targetExists = this.nodes.some(node => node.id === conn.target);
      
      if (!sourceExists) {
        errors.push(`Connection ${conn.id} references non-existent source node ${conn.source}`);
      }
      
      if (!targetExists) {
        errors.push(`Connection ${conn.id} references non-existent target node ${conn.target}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for serialization
   * @returns {object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      nodes: this.nodes,
      connections: this.connections,
      metadata: this.metadata
    };
  }

  /**
   * Create a Workflow instance from a plain object
   * @param {object} data - Plain object data
   * @returns {Workflow} Workflow instance
   */
  static fromObject(data) {
    return new Workflow(data);
  }
}

export default Workflow;