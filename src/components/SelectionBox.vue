<template>
  <div 
    v-if="isVisible" 
    class="selection-box"
    :style="{
      left: minX + 'px',
      top: minY + 'px',
      width: Math.abs(endX - startX) + 'px',
      height: Math.abs(endY - startY) + 'px'
    }"
  ></div>
</template>

<script>
export default {
  name: 'SelectionBox',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    startX: {
      type: Number,
      default: 0
    },
    startY: {
      type: Number,
      default: 0
    },
    endX: {
      type: Number,
      default: 0
    },
    endY: {
      type: Number,
      default: 0
    }
  },
  computed: {
    minX() {
      return Math.min(this.startX, this.endX);
    },
    minY() {
      return Math.min(this.startY, this.endY);
    }
  }
};
</script>

<style scoped>
.selection-box {
  position: absolute;
  border: 1px dashed #42b983;
  background-color: rgba(66, 185, 131, 0.1);
  pointer-events: none;
  z-index: 1000;
}
</style>