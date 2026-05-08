import { signal, effect } from './signal.js'

const storeRegistry = new Map()

export function createStore(options) {
  const initialState = options.state ? JSON.parse(JSON.stringify(options.state)) : {}
  const $state = signal(options.state || {})

  const state = new Proxy(options.state || {}, {
    get(target, key) {
      return $state()[key]
    },
    set(target, key, value) {
      $state.update(state => ({
        ...state,
        [key]: value
      }))
      return true
    }
  })

  const $patch = (partial) => {
    $state.update(state => ({
      ...state,
      ...partial
    }))
  }

  const $reset = () => {
    $state.set(JSON.parse(JSON.stringify(initialState)))
  }

  const $subscribe = (callback) => {
    return effect(() => {
      callback($state())
    })
  }

  const store = {
    state,
    $state,
    $patch,
    $reset,
    $subscribe
  }

  if (options.actions) {
    Object.keys(options.actions).forEach(key => {
      store[key] = (...args) => {
        return options.actions[key].call(store, ...args)
      }
    })
  }

  if (options.getters) {
    Object.keys(options.getters).forEach(key => {
      Object.defineProperty(store, key, {
        get() {
          return options.getters[key].call(store)
        }
      })
    })
  }

  return store
}

export function defineStore(id, options) {
  const useStore = () => {
    if (storeRegistry.has(id)) {
      return storeRegistry.get(id)
    }

    const store = createStore(options)
    storeRegistry.set(id, store)

    return store
  }

  return useStore
}

export function useStore(id) {
  return storeRegistry.get(id)
}

export function disposeStore(id) {
  storeRegistry.delete(id)
}

export function clearAllStores() {
  storeRegistry.clear()
}
