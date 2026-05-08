export { signal, computed, effect, reactive, watch, watchEffect, watchDebounced, watchThrottled } from './signal.js'
export { createField, createForm, validators } from './form.js'
export { defineComponent, h, render, createRef, createApp, fragment, show, each } from './component.js'
export { createStore, defineStore, useStore, disposeStore, clearAllStores } from './store.js'
export { createRouter, RouterView, RouterLink } from './router.js'
export {
  onMounted,
  onUnmounted,
  onUpdated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  nextTick,
  createComponentContext,
  executeLifecycle,
  setCurrentInstance,
  getCurrentInstance
} from './lifecycle.js'
export {
  registerDirective,
  getDirective,
  applyDirective
} from './directives.js'

export const version = '1.0.0'
