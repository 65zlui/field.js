import { signal, effect } from './signal.js'

const directiveRegistry = new Map()

export function registerDirective(name, directive) {
  directiveRegistry.set(name, directive)
}

export function getDirective(name) {
  return directiveRegistry.get(name)
}

export function applyDirective(el, name, value, arg, modifiers = {}) {
  const directive = directiveRegistry.get(name)
  if (!directive) {
    console.warn(`Directive "${name}" not found`)
    return
  }

  const binding = {
    value,
    arg,
    modifiers
  }

  if (directive.mounted) {
    const cleanup = directive.mounted(el, binding)
    if (cleanup && directive.unmounted) {
      const originalUnmounted = directive.unmounted
      directive.unmounted = (el, binding) => {
        cleanup()
        originalUnmounted(el, binding)
      }
    }
  }
}

registerDirective('show', {
  mounted(el, binding) {
    const initialValue = binding.value
    el.style.display = initialValue ? '' : 'none'

    if (typeof binding.value === 'function' && binding.value.set) {
      return effect(() => {
        el.style.display = binding.value() ? '' : 'none'
      })
    }
  },
  updated(el, binding) {
    const value = typeof binding.value === 'function' && binding.value.set
      ? binding.value()
      : binding.value
    el.style.display = value ? '' : 'none'
  }
})

registerDirective('focus', {
  mounted(el) {
    el.focus()
  }
})

registerDirective('model', {
  mounted(el, binding) {
    const sig = binding.value

    el.value = sig()

    const handleInput = () => {
      sig.set(el.value)
    }

    el.addEventListener('input', handleInput)

    const cleanup = effect(() => {
      el.value = sig()
    })

    return () => {
      el.removeEventListener('input', handleInput)
      cleanup()
    }
  }
})

registerDirective('lazy', {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const src = binding.value
          if (src) {
            el.src = src
          }
          observer.unobserve(el)
        }
      })
    })

    observer.observe(el)

    return () => {
      observer.unobserve(el)
    }
  }
})

registerDirective('click-outside', {
  mounted(el, binding) {
    const handler = binding.value

    const listener = (event) => {
      if (!el.contains(event.target)) {
        handler(event)
      }
    }

    document.addEventListener('click', listener)

    return () => {
      document.removeEventListener('click', listener)
    }
  }
})

registerDirective('debounce', {
  mounted(el, binding) {
    const delay = binding.value || 300
    const eventType = binding.arg || 'input'

    let timeoutId = null

    const listener = (event) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        el.dispatchEvent(new CustomEvent('debounced-' + eventType, {
          detail: event.target.value
        }))
      }, delay)
    }

    el.addEventListener(eventType, listener)

    return () => {
      el.removeEventListener(eventType, listener)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }
})

registerDirective('throttle', {
  mounted(el, binding) {
    const limit = binding.value || 300
    const eventType = binding.arg || 'input'

    let lastRun = 0

    const listener = (event) => {
      const now = Date.now()

      if (now - lastRun >= limit) {
        el.dispatchEvent(new CustomEvent('throttled-' + eventType, {
          detail: event.target.value
        }))
        lastRun = now
      }
    }

    el.addEventListener(eventType, listener)

    return () => {
      el.removeEventListener(eventType, listener)
    }
  }
})

registerDirective('permission', {
  mounted(el, binding) {
    const hasPermission = binding.value

    if (!hasPermission) {
      el.remove()
    }
  },
  updated(el, binding) {
    const hasPermission = binding.value

    if (!hasPermission) {
      el.remove()
    }
  }
})
