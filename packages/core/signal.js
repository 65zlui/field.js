let activeEffect = null
const effectStack = []
const subscriberMap = new WeakMap()

function getSubscribers(target, key) {
  let targetMap = subscriberMap.get(target)
  if (!targetMap) {
    targetMap = new Map()
    subscriberMap.set(target, targetMap)
  }
  let subs = targetMap.get(key)
  if (!subs) {
    subs = new Set()
    targetMap.set(key, subs)
  }
  return subs
}

function track(target, key) {
  if (!activeEffect) return
  const subs = getSubscribers(target, key)
  subs.add(activeEffect)
}

function trigger(target, key) {
  const targetMap = subscriberMap.get(target)
  if (!targetMap) return
  const subs = targetMap.get(key)
  if (!subs) return
  subs.forEach(sub => sub())
}

export function signal(initialValue) {
  const target = { value: initialValue }
  const proxy = new Proxy(target, {
    get(obj, key) {
      if (key === 'value') {
        track(obj, key)
        return obj.value
      }
      return Reflect.get(obj, key)
    },
    set(obj, key, value) {
      if (key === 'value') {
        obj.value = value
        trigger(obj, key)
        return true
      }
      return Reflect.set(obj, key, value)
    }
  })

  const signalFn = function() {
    return proxy.value
  }

  signalFn.set = function(value) {
    proxy.value = value
  }

  signalFn.update = function(fn) {
    proxy.value = fn(proxy.value)
  }

  return signalFn
}

export function computed(getter) {
  let cachedValue
  let dirty = true

  effect(() => {
    if (dirty) {
      cachedValue = getter()
      dirty = false
    }
  })

  return function() {
    dirty = true
    return cachedValue
  }
}

export function effect(fn) {
  const execute = () => {
    if (effectStack.includes(execute)) return

    const prevEffect = activeEffect
    activeEffect = execute
    effectStack.push(execute)

    try {
      const cleanup = fn()
      if (typeof cleanup === 'function') {
        const originalCleanup = execute._cleanup
        execute._cleanup = () => {
          cleanup()
          if (originalCleanup) originalCleanup()
        }
      }
    } finally {
      effectStack.pop()
      activeEffect = prevEffect
    }
  }

  execute()

  return () => {
    subscriberMap.forEach(targetMap => {
      targetMap.forEach(subs => subs.delete(execute))
    })
    if (execute._cleanup) execute._cleanup()
  }
}

export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      const value = Reflect.get(target, key)
      if (typeof value === 'object' && value !== null) {
        return reactive(value)
      }
      return value
    },
    set(target, key, value) {
      Reflect.set(target, key, value)
      trigger(target, key)
      return true
    }
  })
}

export function watch(source, callback) {
  let oldValue

  return effect(() => {
    const newValue = source()
    if (newValue !== oldValue) {
      callback(newValue, oldValue)
      oldValue = newValue
    }
  })
}

export function watchEffect(source, callback) {
  return watch(source, callback)
}

export function watchDebounced(source, callback, delay = 100) {
  let timeoutId = null
  let oldValue

  return effect(() => {
    const newValue = source()

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      if (newValue !== oldValue) {
        callback(newValue, oldValue)
        oldValue = newValue
      }
    }, delay)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  })
}

export function watchThrottled(source, callback, limit = 100) {
  let lastRun = 0
  let oldValue

  return effect(() => {
    const newValue = source()
    const now = Date.now()

    if (now - lastRun >= limit) {
      if (newValue !== oldValue) {
        callback(newValue, oldValue)
        oldValue = newValue
      }
      lastRun = now
    }
  })
}
