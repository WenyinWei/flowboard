/**
 * 外部编辑器集成模块
 */

class ExternalEditorManager {
  /**
   * 支持的编辑器列表
   */
  static SUPPORTED_EDITORS = {
    'vscode': {
      name: 'Visual Studio Code',
      command: 'code',
      args: ['{filePath}']
    },
    'sublime': {
      name: 'Sublime Text',
      command: 'subl',
      args: ['{filePath}']
    },
    'atom': {
      name: 'Atom',
      command: 'atom',
      args: ['{filePath}']
    },
    'notepad++': {
      name: 'Notepad++',
      command: 'notepad++',
      args: ['{filePath}']
    },
    'system': {
      name: 'System Default',
      command: null,
      args: null
    }
  };
  
  /**
   * 获取用户首选编辑器
   */
  static getUserPreferredEditor() {
    // 从localStorage或应用设置中获取用户首选编辑器
    const preferredEditor = localStorage.getItem('preferredEditor') || 'system';
    return preferredEditor;
  }
  
  /**
   * 设置用户首选编辑器
   */
  static setUserPreferredEditor(editorKey) {
    if (this.SUPPORTED_EDITORS[editorKey]) {
      localStorage.setItem('preferredEditor', editorKey);
      return true;
    }
    return false;
  }
  
  /**
   * 获取所有支持的编辑器列表
   */
  static getSupportedEditors() {
    return this.SUPPORTED_EDITORS;
  }
  
  /**
   * 在外部编辑器中打开代码
   */
  static async openCodeInEditor(code, nodeType, nodeId) {
    try {
      // 创建临时文件
      const tempFileName = `flowboard_${nodeType}_${nodeId}_${Date.now()}.py`;
      const tempFilePath = await this.createTempFile(code, tempFileName);
      
      // 获取用户首选编辑器
      const editorKey = this.getUserPreferredEditor();
      const editor = this.SUPPORTED_EDITORS[editorKey];
      
      if (editorKey === 'system' || !editor.command) {
        // 使用系统默认编辑器
        await this.openWithSystemDefault(tempFilePath);
      } else {
        // 使用指定编辑器
        await this.openWithSpecificEditor(editor, tempFilePath);
      }
      
      return tempFilePath;
    } catch (error) {
      throw new Error(`Failed to open code in external editor: ${error.message}`);
    }
  }
  
  /**
   * 创建临时文件
   */
  static async createTempFile(content, fileName) {
    // 在Electron环境中，这里会调用Node.js API创建临时文件
    // 暂时返回模拟路径，实际实现需要Electron IPC
    const tempDir = process.env.TEMP || '/tmp';
    return `${tempDir}/${fileName}`;
  }
  
  /**
   * 使用系统默认编辑器打开文件
   */
  static async openWithSystemDefault(filePath) {
    // 在Electron环境中，这里会调用Node.js API
    // 暂时抛出未实现错误，实际实现需要Electron IPC
    throw new Error('System default editor opening not implemented in web environment');
  }
  
  /**
   * 使用指定编辑器打开文件
   */
  static async openWithSpecificEditor(editor, filePath) {
    // 在Electron环境中，这里会调用Node.js API
    // 暂时抛出未实现错误，实际实现需要Electron IPC
    throw new Error(`Editor ${editor.name} opening not implemented in web environment`);
  }
  
  /**
   * 监听文件变化（用于检测代码编辑完成）
   */
  static async watchFileForChanges(filePath, callback) {
    // 在Electron环境中，这里会使用Node.js fs.watch
    // 暂时使用轮询模拟，实际实现需要Electron IPC
    const interval = setInterval(async () => {
      try {
        const content = await this.readFile(filePath);
        callback(content);
      } catch (error) {
        console.error('Error watching file:', error);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }
  
  /**
   * 读取文件内容
   */
  static async readFile(filePath) {
    // 在Electron环境中，这里会调用Node.js API
    // 暂时返回空内容，实际实现需要Electron IPC
    return '';
  }
}

export default ExternalEditorManager;