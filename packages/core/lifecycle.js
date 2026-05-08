import { effect } from './signal.js'

let currentInstance = null

export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}

export function createComponentContext(props = {}) {
  return {
    onMountHooks: [],
    onUnmountHooks: [],
    onUpdateHooks: [],
    props
  }
}

export function executeLifecycle(instance, phase) {
  const hooks = {
    mount: instance.onMountHooks,
    unmount: instance.onUnmountHooks,
    update: instance.onUpdateHooks
  }[phase]

  hooks.forEach(hook => {
    try {
      hook()
    } catch (error) {
      console.error(`Error in ${phase} hook:`, error)
    }
  })
}

export function onMounted(hook) {
  if (currentInstance) {
    currentInstance.onMountHooks.push(hook)
  } else {
    queueMicrotask(() => {
      hook()
    })
  }
}

export function onUnmounted(hook) {
  if (currentInstance) {
    currentInstance.onUnmountHooks.push(hook)
  }
}

export function onUpdated(hook) {
  if (currentInstance) {
    currentInstance.onUpdateHooks.push(hook)
  }
}

export function onBeforeMount(hook) {
  if (currentInstance) {
    currentInstance.onMountHooks.unshift(hook)
  }
}

export function onBeforeUnmount(hook) {
  if (currentInstance) {
    currentInstance.onUnmountHooks.unshift(hook)
  }
}

export function onBeforeUpdate(hook) {
  if (currentInstance) {
    currentInstance.onUpdateHooks.unshift(hook)
  }
}

export function nextTick(callback) {
  queueMicrotask(callback)
}
