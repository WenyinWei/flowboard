/**
 * 节点选择管理器
 */

class SelectionManager {
  /**
   * 检查节点是否在选择框内
   * @param {Object} node - 节点对象 {x, y, width, height}
   * @param {Object} selectionBox - 选择框 {startX, startY, endX, endY}
   * @returns {boolean} 是否在选择框内
   */
  static isNodeInSelectionBox(node, selectionBox) {
    const { startX, startY, endX, endY } = selectionBox;
    const nodeLeft = node.x;
    const nodeRight = node.x + node.width;
    const nodeTop = node.y;
    const nodeBottom = node.y + node.height;
    
    const selectionLeft = Math.min(startX, endX);
    const selectionRight = Math.max(startX, endX);
    const selectionTop = Math.min(startY, endY);
    const selectionBottom = Math.max(startY, endY);
    
    // 检查节点是否与选择框相交
    const intersectLeft = Math.max(nodeLeft, selectionLeft);
    const intersectTop = Math.max(nodeTop, selectionTop);
    const intersectRight = Math.min(nodeRight, selectionRight);
    const intersectBottom = Math.min(nodeBottom, selectionBottom);
    
    if (intersectLeft < intersectRight && intersectTop < intersectBottom) {
      // 计算相交面积
      const intersectionArea = (intersectRight - intersectLeft) * (intersectBottom - intersectTop);
      const nodeArea = node.width * node.height;
      
      // 如果相交面积占节点面积的一半以上，则选择该节点
      return intersectionArea >= nodeArea * 0.5;
    }
    
    return false;
  }
  
  /**
   * 获取选择框内的所有节点
   * @param {Array} nodes - 节点数组
   * @param {Object} selectionBox - 选择框 {startX, startY, endX, endY}
   * @returns {Array} 选中的节点ID数组
   */
  static getNodesInSelectionBox(nodes, selectionBox) {
    return nodes
      .filter(node => this.isNodeInSelectionBox(node, selectionBox))
      .map(node => node.id);
  }
  
  /**
   * 检查点是否在节点内
   * @param {Object} node - 节点对象 {x, y, width, height}
   * @param {number} x - 点的x坐标
   * @param {number} y - 点的y坐标
   * @returns {boolean} 点是否在节点内
   */
  static isPointInNode(node, x, y) {
    return (
      x >= node.x &&
      x <= node.x + node.width &&
      y >= node.y &&
      y <= node.y + node.height
    );
  }
  
  /**
   * 获取点击位置的节点
   * @param {Array} nodes - 节点数组
   * @param {number} x - 点击位置的x坐标
   * @param {number} y - 点击位置的y坐标
   * @returns {Object|null} 节点对象或null
   */
  static getNodeAtPoint(nodes, x, y) {
    // 从后往前遍历，确保选中的是最上层的节点
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (this.isPointInNode(nodes[i], x, y)) {
        return nodes[i];
      }
    }
    return null;
  }
}

export default SelectionManager;