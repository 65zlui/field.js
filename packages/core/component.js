import { effect } from './signal.js'

export function defineComponent(name, setup) {
  const component = (props = {}, ...children) => {
    return setup(props, children)
  }

  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        const props = {}
        for (const attr of this.attributes) {
          props[attr.name] = attr.value
        }

        const children = Array.from(this.childNodes)
        const element = setup(props, children)

        if (element instanceof DocumentFragment) {
          this.innerHTML = ''
          this.appendChild(element)
        } else if (element) {
          this.innerHTML = ''
          this.appendChild(element)
        }
      }
    }
  )

  return component
}

export function h(tag, props = {}, ...children) {
  if (typeof tag === 'function') {
    return tag(props, children.flat())
  }

  if (!props) props = {}

  const element = document.createElement(tag)

  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') {
      if (typeof value === 'function') {
        const update = () => { element.className = value() ?? '' }
        update()
        effect(update)
      } else {
        element.className = value
      }
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value)
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase()
      element.addEventListener(eventName, value)
    } else if (key === 'ref') {
      value.current = element
    } else if (typeof value === 'function') {
      const apply = () => {
        const result = value()
        if (key === 'value') {
          element.value = result ?? ''
        } else if (result !== null && result !== undefined) {
          element.setAttribute(key, result)
        } else {
          element.removeAttribute(key)
        }
      }
      apply()
      effect(apply)
    } else if (value !== null && value !== undefined) {
      element.setAttribute(key, value)
    }
  }

  const appendChild = (child) => {
    if (child === null || child === undefined) return

    if (child instanceof Node) {
      element.appendChild(child)
    } else if (Array.isArray(child)) {
      child.forEach(appendChild)
    } else if (typeof child === 'function') {
      const textNode = document.createTextNode(String(child()))
      element.appendChild(textNode)
      effect(() => {
        textNode.textContent = String(child())
      })
    } else {
      element.appendChild(document.createTextNode(String(child)))
    }
  }

  children.flat().forEach(appendChild)

  return element
}

export function render(component, container) {
  container.innerHTML = ''
  if (component instanceof Node) {
    container.appendChild(component)
  }
}

export function createRef() {
  return { current: null }
}

export function createApp(rootComponent, container) {
  const target = typeof container === 'string'
    ? document.querySelector(container)
    : container

  if (!target) {
    throw new Error('Container not found')
  }

  const element = rootComponent({}, [])
  render(element, target)
}

export function fragment(...children) {
  const frag = document.createDocumentFragment()
  children.flat().forEach(child => {
    if (child instanceof Node) {
      frag.appendChild(child)
    } else if (child !== null && child !== undefined) {
      frag.appendChild(document.createTextNode(String(child)))
    }
  })
  return frag
}

export function show(condition, children) {
  const frag = document.createDocumentFragment()

  if (typeof condition === 'function' && condition.set) {
    const placeholder = document.createComment('show')
    frag.appendChild(placeholder)

    let currentNodes = []

    effect(() => {
      currentNodes.forEach(node => node.remove())
      currentNodes = []

      if (condition()) {
        children.flat().forEach(child => {
          const node = child instanceof Node ? child : document.createTextNode(String(child))
          placeholder.parentNode?.insertBefore(node, placeholder)
          currentNodes.push(node)
        })
      }
    })
  } else if (condition) {
    children.flat().forEach(child => {
      if (child instanceof Node) {
        frag.appendChild(child)
      } else if (child !== null && child !== undefined) {
        frag.appendChild(document.createTextNode(String(child)))
      }
    })
  }

  return frag
}

export function each(list, render) {
  const frag = document.createDocumentFragment()

  if (typeof list === 'function') {
    const container = document.createDocumentFragment()
    frag.appendChild(container)

    let currentNodes = []

    const update = () => {
      currentNodes.forEach(node => node.remove())
      currentNodes = []

      list().forEach((item, index) => {
        const node = render(item, index)
        container.appendChild(node)
        currentNodes.push(node)
      })
    }

    effect(update)
  } else if (Array.isArray(list)) {
    list.forEach((item, index) => {
      frag.appendChild(render(item, index))
    })
  }

  return frag
}
