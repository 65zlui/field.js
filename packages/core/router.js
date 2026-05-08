import { signal, effect } from './signal.js'

export function createRouter(options) {
  const { routes, mode = 'hash', base = '' } = options
  const currentRoute = signal(null)
  const beforeGuards = []
  const afterHooks = []

  const getPath = () => {
    if (mode === 'hash') {
      return window.location.hash.slice(1) || '/'
    }
    return window.location.pathname.slice(base.length) || '/'
  }

  const matchRoute = (routes, path) => {
    for (const route of routes) {
      if (route.path === path) {
        return route
      }

      if (route.children) {
        const matched = matchRoute(route.children, path)
        if (matched) return matched
      }
    }
    return null
  }

  const navigate = async (path, replace = false) => {
    const route = matchRoute(routes, path)

    if (!route) {
      console.warn(`Route not found: ${path}`)
      return
    }

    if (route.redirect) {
      navigate(route.redirect, true)
      return
    }

    const from = currentRoute()

    if (route.beforeEnter) {
      const canEnter = await route.beforeEnter(route, from)
      if (!canEnter) return
    }

    for (const guard of beforeGuards) {
      let called = false
      await new Promise(resolve => {
        guard(route, from, () => {
          called = true
          resolve()
        })
        if (!called) {
          resolve()
        }
      })
    }

    currentRoute.set(route)

    if (mode === 'hash') {
      if (replace) {
        window.history.replaceState(null, '', `#${path}`)
      } else {
        window.history.pushState(null, '', `#${path}`)
      }
    } else {
      if (replace) {
        window.history.replaceState(null, '', base + path)
      } else {
        window.history.pushState(null, '', base + path)
      }
    }

    afterHooks.forEach(hook => hook(route, from))
  }

  const push = (path) => {
    navigate(path)
  }

  const replace = (path) => {
    navigate(path, true)
  }

  const go = (n) => {
    window.history.go(n)
  }

  const back = () => {
    window.history.back()
  }

  const forward = () => {
    window.history.forward()
  }

  const beforeEach = (guard) => {
    beforeGuards.push(guard)
  }

  const afterEach = (hook) => {
    afterHooks.push(hook)
  }

  const install = () => {
    window.addEventListener('popstate', () => {
      navigate(getPath(), true)
    })

    navigate(getPath(), true)
  }

  return {
    currentRoute,
    push,
    replace,
    go,
    back,
    forward,
    beforeEach,
    afterEach,
    install
  }
}

export function RouterView(router) {
  const container = document.createElement('div')
  container.className = 'router-view'

  effect(async () => {
    const route = router.currentRoute()
    if (!route) return

    container.innerHTML = ''

    try {
      const component = await route.component()
      container.appendChild(component)
    } catch (error) {
      console.error('Failed to load route component:', error)
      container.innerHTML = '<div>Failed to load page</div>'
    }
  })

  return container
}

export function RouterLink(props, router) {
  const link = document.createElement('a')
  link.href = props.to

  if (props.children) {
    props.children.forEach(child => {
      if (child instanceof Node) {
        link.appendChild(child)
      } else {
        link.appendChild(document.createTextNode(String(child)))
      }
    })
  }

  link.addEventListener('click', (e) => {
    e.preventDefault()
    router.push(props.to)
  })

  effect(() => {
    const route = router.currentRoute()
    if (route?.path === props.to) {
      link.classList.add('active')
    } else {
      link.classList.remove('active')
    }
  })

  return link
}
