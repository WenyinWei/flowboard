/**
 * Flowboard文件格式管理器
 * .flow文件格式设计（类似.ipynb）：
 * {
 *   "version": "1.0",
 *   "metadata": {
 *     "name": "Workflow Name",
 *     "description": "Workflow Description",
 *     "created": "2023-01-01T00:00:00Z",
 *     "modified": "2023-01-01T00:00:00Z"
 *   },
 *   "nodes": [
 *     {
 *       "id": 1,
 *       "type": "data-input",
 *       "x": 100,
 *       "y": 100,
 *       "width": 200,
 *       "height": 150,
 *       "parameters": {},
 *       "code": "print('Hello World')" // 内嵌代码
 *     }
 *   ],
 *   "connections": [
 *     {
 *       "id": 1,
 *       "source": 1,
 *       "target": 2
 *     }
 *   ]
 * }
 */

class FlowFileManager {
  static VERSION = "1.0";
  
  /**
   * 创建新的.flow文件对象
   */
  static createNewFlow(name = "Untitled Workflow") {
    return {
      version: this.VERSION,
      metadata: {
        name: name,
        description: "",
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      nodes: [],
      connections: []
    };
  }
  
  /**
   * 将工作流数据转换为.flow格式
   */
  static serializeWorkflow(nodes, connections, metadata = {}) {
    const flowData = this.createNewFlow(metadata.name);
    
    // 更新元数据
    flowData.metadata = {
      ...flowData.metadata,
      ...metadata,
      modified: new Date().toISOString()
    };
    
    // 序列化节点
    flowData.nodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      parameters: node.parameters || {},
      // 内嵌代码（如果存在）
      ...(node.code && { code: node.code }),
      // 其他特定节点属性
      ...(node.scriptPath && { scriptPath: node.scriptPath }),
      ...(node.language && { language: node.language }),
      ...(node.chartType && { chartType: node.chartType }),
      ...(node.operation && { operation: node.operation })
    }));
    
    // 序列化连接
    flowData.connections = connections.map(conn => ({
      id: conn.id,
      source: conn.source,
      target: conn.target
    }));
    
    return flowData;
  }
  
  /**
   * 从.flow格式解析工作流数据
   */
  static deserializeWorkflow(flowData) {
    if (!flowData || flowData.version !== this.VERSION) {
      throw new Error("Unsupported .flow file version");
    }
    
    const nodes = flowData.nodes.map(nodeData => ({
      id: nodeData.id,
      type: nodeData.type,
      x: nodeData.x,
      y: nodeData.y,
      width: nodeData.width || 200,
      height: nodeData.height || 150,
      parameters: nodeData.parameters || {},
      // 内嵌代码（如果存在）
      ...(nodeData.code && { code: nodeData.code }),
      // 其他特定节点属性
      ...(nodeData.scriptPath && { scriptPath: nodeData.scriptPath }),
      ...(nodeData.language && { language: nodeData.language }),
      ...(nodeData.chartType && { chartType: nodeData.chartType }),
      ...(nodeData.operation && { operation: nodeData.operation })
    }));
    
    const connections = flowData.connections.map(connData => ({
      id: connData.id,
      source: connData.source,
      target: connData.target
    }));
    
    return {
      nodes,
      connections,
      metadata: flowData.metadata
    };
  }
  
  /**
   * 保存.flow文件
   */
  static async saveFlowFile(flowData, filePath) {
    try {
      const jsonData = JSON.stringify(flowData, null, 2);
      // 在Electron环境中，这里会调用Node.js API保存文件
      // 暂时返回数据，实际实现需要Electron IPC
      return jsonData;
    } catch (error) {
      throw new Error(`Failed to save .flow file: ${error.message}`);
    }
  }
  
  /**
   * 加载.flow文件
   */
  static async loadFlowFile(filePath) {
    try {
      // 在Electron环境中，这里会调用Node.js API读取文件
      // 暂时返回示例数据，实际实现需要Electron IPC
      const fileContent = "{}"; // 这里应该是从文件读取的内容
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to load .flow file: ${error.message}`);
    }
  }
}

export default FlowFileManager;