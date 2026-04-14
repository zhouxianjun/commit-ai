<template>
  <div class="h-screen bg-background text-foreground font-sans antialiased">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts"></script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

body {
  font-size: var(--vscode-font-size, 13px);
  background-color: var(--background);
  color: var(--foreground);
}
</style>
