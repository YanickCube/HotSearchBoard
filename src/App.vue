<script setup>
import HotSearchBoard from './components/HotSearchBoard.vue'
</script>

<template>
  <div class="app-container">
    <HotSearchBoard />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa, #e4e7ed, #f0f2f5);
  background-size: 400% 400%;
  animation: gradientBackground 15s ease infinite;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="none" width="100" height="100"/><rect fill="rgba(255,255,255,0.1)" width="50" height="50"/><rect fill="rgba(255,255,255,0.1)" x="50" y="50" width="50" height="50"/></svg>');
  opacity: 0.3;
  z-index: 0;
}

@keyframes gradientBackground {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
}
</style>
