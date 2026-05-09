# Field.js

[English](#english) | [中文](#中文)

---

# English

## Introduction

Field.js is a **form-first, lightweight reactive web UI runtime ** with atomic-level reactivity. Built for developers who want **zero dependencies**, **built-in form validation**.

### Features

| Feature | Description |
|---------|-------------|
| **Atomic Reactivity** | Signal-based, fine-grained updates |
| **Built-in Form** | Complete validation system, no plugins needed |
| **Zero Glue** | State management + Router + Directives all built-in |
| **~8KB** | Ultra lightweight, loads in ~50ms |
| **Pure ES6+** | No TypeScript required, runs directly in browser |
| **MVVM Ready** | Built-in Store for ViewModel pattern |

### Comparison

| Feature | Field.js | Vue 3 | React | Angular |
|---------|---------|-------|-------|---------|
| Size | **~8KB** | ~40KB | ~40KB | ~200KB |
| Form Built-in | **✓** | ✗ | ✗ | ✗ |
| State Built-in | **✓** | ✗ | ✗ | ✗ |
| Learning Curve | **Low** | Medium | Medium | High |
| Dependencies | **0** | 5-10 | 10-20 | 10+ |

## Quick Start

### Installation

```bash
# Option 1: npm
npm install @field.js/core

# Option 2: CDN
<script type="module">
  import { signal, h, render } from 'https://unpkg.com/field.js/core/index.js'
</script>

# Option 3: Direct download
# Copy packages/core/*.js to your project
```

### First Application

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import { signal, h, render, createApp } from 'field.js'
    
    // Create reactive state
    const count = signal(0)
    
    // Create component
    function Counter() {
      return h('div', null,
        h('h1', null, () => `Count: ${count()}`),
        h('button', {
          onClick: () => count.update(n => n + 1)
        }, '+'),
        h('button', {
          onClick: () => count.set(0)
        }, 'Reset')
      )
    }
    
    // Mount app
    createApp(Counter, '#app')
  </script>
</body>
</html>
```

## Core Concepts

### 1. Signal (Reactivity)

Signals are the core of Field.js reactivity system.

```javascript
// Create signal
const name = signal('World')

// Read value
console.log(name()) // 'World'

// Update value
name.set('Field.js')
name.update(n => n.toUpperCase()) // 'ROCK.JS'

// Computed value
const greeting = computed(() => `Hello, ${name()}!`)
console.log(greeting()) // 'Hello, Field.js!'

// Watch changes
watch(name, (newValue, oldValue) => {
  console.log(`Changed from ${oldValue} to ${newValue}`)
})

// Side effects
effect(() => {
  document.title = `Count: ${count()}`
})
```

### 2. State Management (Store)

```javascript
// Define store
const useUserStore = defineStore('user', {
  state: {
    name: '',
    age: 0,
    isLoggedIn: false
  },
  actions: {
    login(name) {
      this.state.name = name
      this.state.isLoggedIn = true
    },
    logout() {
      this.state.isLoggedIn = false
    }
  },
  getters: {
    greeting() {
      return `Hello, ${this.state.name}!`
    }
  }
})

// Use store
const userStore = useUserStore()
userStore.login('John')
console.log(userStore.greeting) // 'Hello, John!'
```

### 3. Form Validation

```javascript
// Create form
const form = createForm({
  onSubmit: async (values) => {
    console.log('Form submitted:', values)
  }
})

// Create fields
const emailField = createField({
  label: 'Email',
  required: true,
  validators: [
    validators.email('Please enter a valid email'),
    validators.minLength(5)
  ]
})

const passwordField = createField({
  label: 'Password',
  required: true,
  validators: [
    validators.minLength(8, 'Password must be at least 8 characters')
  ]
})

// Register fields
form.register('email', emailField)
form.register('password', passwordField)

// Manual validation
await form.validate()

// Reset form
form.reset()
```

### 4. Built-in Validators

```javascript
validators.required(message)
validators.email(message)
validators.minLength(min, message)
validators.maxLength(max, message)
validators.pattern(regex, message)
validators.range(min, max, message)
validators.custom((value) => boolean | string)
```

### 5. Component System

```javascript
import { h, show, each, fragment } from 'field.js'

// Conditional rendering
show(isVisible, [
  h('div', null, 'Visible content')
])

// List rendering
each(items, (item, index) => 
  h('li', { key: item.id }, item.name)
)

// Fragment
fragment(
  h('div', null, 'First'),
  h('div', null, 'Second')
)

// Custom component
function MyComponent(props) {
  return h('div', { className: props.className },
    h('h1', null, props.title)
  )
}
```

### 6. Router

```javascript
const router = createRouter({
  routes: [
    {
      path: '/',
      component: () => h('div', null, 'Home')
    },
    {
      path: '/about',
      component: () => h('div', null, 'About')
    }
  ],
  mode: 'hash' // or 'history'
})

// Install router
router.install()

// Navigate
router.push('/about')

// RouterView
const view = RouterView(router)
document.body.appendChild(view)

// RouterLink
const link = RouterLink({ to: '/about', children: ['About'] }, router)
```

### 7. Lifecycle Hooks

```javascript
import { onMounted, onUnmounted, onUpdated, nextTick } from 'field.js'

onMounted(() => {
  console.log('Component mounted')
})

onUnmounted(() => {
  console.log('Component unmounted')
  // Cleanup subscriptions, timers, etc.
})

onUpdated(() => {
  console.log('Component updated')
})

nextTick(() => {
  // DOM is updated
})
```

### 8. Directives

```javascript
import { registerDirective, getDirective } from 'field.js'

// Built-in directives
// v-model, v-show, v-focus, v-lazy, v-click-outside

// Register custom directive
registerDirective('my-directive', {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value
  }
})
```

## API Reference

### signal.js

| API | Description |
|-----|-------------|
| `signal(initialValue)` | Create reactive signal |
| `computed(fn)` | Create computed value |
| `effect(fn)` | Run side effect |
| `reactive(obj)` | Make object reactive |
| `watch(source, callback)` | Watch signal changes |

### form.js

| API | Description |
|-----|-------------|
| `createField(options)` | Create form field |
| `createForm(options)` | Create form |
| `validators.*` | Built-in validators |

### component.js

| API | Description |
|-----|-------------|
| `h(tag, props, ...children)` | Create element |
| `render(component, container)` | Render to DOM |
| `createApp(root, container)` | Create app |
| `show(condition, children)` | Conditional render |
| `each(list, render)` | List render |
| `fragment(...children)` | Fragment |

### store.js

| API | Description |
|-----|-------------|
| `createStore(options)` | Create store |
| `defineStore(id, options)` | Define reusable store |
| `useStore(id)` | Get store by ID |

### router.js

| API | Description |
|-----|-------------|
| `createRouter(options)` | Create router |
| `RouterView(router)` | Router view component |
| `RouterLink(props, router)` | Router link component |

### lifecycle.js

| API | Description |
|-----|-------------|
| `onMounted(fn)` | Mount hook |
| `onUnmounted(fn)` | Unmount hook |
| `onUpdated(fn)` | Update hook |
| `onBeforeMount(fn)` | Before mount hook |
| `onBeforeUnmount(fn)` | Before unmount hook |
| `onBeforeUpdate(fn)` | Before update hook |
| `nextTick(fn)` | Next tick |

### store.js

| API | Description |
|-----|-------------|
| `createStore(options)` | Create store |
| `defineStore(id, options)` | Define reusable store |
| `useStore(id)` | Get store by ID |
| `disposeStore(id)` | Remove store from registry |
| `clearAllStores()` | Clear all stores |

## Examples

### Counter with Store

```javascript
const useCounterStore = defineStore('counter', {
  state: { count: 0 },
  actions: {
    increment() { this.state.count++ },
    decrement() { this.state.count-- },
    reset() { this.state.count = 0 }
  },
  getters: {
    doubled() { return this.state.count * 2 }
  }
})

function Counter() {
  const counter = useCounterStore()
  
  return h('div', null,
    h('h1', null, () => `Count: ${counter.state.count}`),
    h('p', null, () => `Doubled: ${counter.doubled}`),
    h('button', { onClick: () => counter.increment() }, '+'),
    h('button', { onClick: () => counter.reset() }, 'Reset')
  )
}
```

### Todo App

```javascript
const useTodoStore = defineStore('todos', {
  state: { items: [], filter: 'all' },
  actions: {
    add(text) {
      this.state.items.push({ id: Date.now(), text, done: false })
    },
    toggle(id) {
      const item = this.state.items.find(i => i.id === id)
      if (item) item.done = !item.done
    }
  },
  getters: {
    filtered() {
      const { items, filter } = this.state
      if (filter === 'active') return items.filter(i => !i.done)
      if (filter === 'completed') return items.filter(i => i.done)
      return items
    }
  }
})

function TodoApp() {
  const todo = useTodoStore()
  const newTodo = signal('')
  
  return h('div', null,
    h('input', {
      value: newTodo,
      onInput: (e) => newTodo.set(e.target.value)
    }),
    h('button', {
      onClick: () => {
        if (newTodo()) {
          todo.add(newTodo())
          newTodo.set('')
        }
      }
    }, 'Add'),
    each(() => todo.filtered, (item) =>
      h('div', null,
        h('input', {
          type: 'checkbox',
          checked: item.done,
          onChange: () => todo.toggle(item.id)
        }),
        h('span', null, item.text)
      )
    )
  )
}
```

### Form with Validation

```javascript
function LoginForm() {
  const form = createForm({
    onSubmit: async (values) => {
      console.log('Login:', values)
    }
  })
  
  const emailField = createField({
    label: 'Email',
    required: true,
    validators: [validators.email()]
  })
  
  const passwordField = createField({
    label: 'Password',
    required: true,
    validators: [validators.minLength(6)]
  })
  
  form.register('email', emailField)
  form.register('password', passwordField)
  
  return h('form', { onSubmit: form.handleSubmit },
    h('input', {
      type: 'email',
      value: emailField.value,
      onInput: (e) => emailField.value.set(e.target.value)
    }),
    show(emailField.error, [h('span', null, emailField.error)]),
    h('input', {
      type: 'password',
      value: passwordField.value,
      onInput: (e) => passwordField.value.set(e.target.value)
    }),
    show(passwordField.error, [h('span', null, passwordField.error)]),
    h('button', { type: 'submit' }, 'Login')
  )
}
```

## Implementation Notes

This project was developed with assistance from AI tools for ideation, implementation, and documentation.  
The overall architecture design and final decisions were guided by the author.

## License

MIT

---

# 中文

## 简介

Field.js 是一个 **表单优先、轻量、可以用于教学的小型前端运行时**，采用原子级响应式设计。为追求 **零依赖**、**内置表单验证**、**开箱即用的web架构** 的开发者而生。

### 核心特性

| 特性 | 描述 |
|------|------|
| **原子级响应式** | Signal 驱动，细粒度更新 |
| **内置表单** | 完整验证系统，无需插件 |
| **零胶水** | 状态管理 + 路由 + 指令全部内置 |
| **~8KB** | 超轻量，~50ms 加载 |
| **纯 ES6+** | 无需 TypeScript，可直接在浏览器运行 |
| **MVVM 就绪** | 内置 Store 支持 ViewModel 模式 |

### 框架对比

| 特性 | Field.js | Vue 3 | React | Angular |
|------|---------|-------|-------|---------|
| 体积 | **~8KB** | ~40KB | ~40KB | ~200KB |
| 表单内置 | **✓** | ✗ | ✗ | ✗ |
| 状态内置 | **✓** | ✗ | ✗ | ✗ |
| 学习曲线 | **低** | 中 | 中 | 高 |
| 依赖数量 | **0** | 5-10个 | 10-20个 | 10+个 |

## 快速开始

### 安装

```bash
# 方式1: npm
npm install @field.js/core

# 方式2: CDN
<script type="module">
  import { signal, h, render } from 'https://unpkg.com/field.js/core/index.js'
</script>

# 方式3: 直接下载
# 将 packages/core/*.js 复制到你的项目
```

### 第一个应用

```html
<!DOCTYPE html>
<html>
<head>
  <title>我的应用</title>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import { signal, h, render, createApp } from 'field.js'
    
    // 创建响应式状态
    const count = signal(0)
    
    // 创建组件
    function Counter() {
      return h('div', null,
        h('h1', null, () => `计数: ${count()}`),
        h('button', {
          onClick: () => count.update(n => n + 1)
        }, '+'),
        h('button', {
          onClick: () => count.set(0)
        }, '重置')
      )
    }
    
    // 挂载应用
    createApp(Counter, '#app')
  </script>
</body>
</html>
```

## 核心概念

### 1. Signal（响应式）

Signal 是 Field.js 响应式系统的核心。

```javascript
// 创建信号
const name = signal('World')

// 读取值
console.log(name()) // 'World'

// 更新值
name.set('Field.js')
name.update(n => n.toUpperCase()) // 'ROCK.JS'

// 计算值
const greeting = computed(() => `你好, ${name()}!`)
console.log(greeting()) // '你好, Field.js!'

// 监听变化
watch(name, (newValue, oldValue) => {
  console.log(`从 ${oldValue} 变为 ${newValue}`)
})

// 副作用
effect(() => {
  document.title = `计数: ${count()}`
})
```

### 2. 状态管理（Store）

```javascript
// 定义 Store
const useUserStore = defineStore('user', {
  state: {
    name: '',
    age: 0,
    isLoggedIn: false
  },
  actions: {
    login(name) {
      this.state.name = name
      this.state.isLoggedIn = true
    },
    logout() {
      this.state.isLoggedIn = false
    }
  },
  getters: {
    greeting() {
      return `你好, ${this.state.name}!`
    }
  }
})

// 使用 Store
const userStore = useUserStore()
userStore.login('张三')
console.log(userStore.greeting) // '你好, 张三!'
```

### 3. 表单验证

```javascript
// 创建表单
const form = createForm({
  onSubmit: async (values) => {
    console.log('表单提交:', values)
  }
})

// 创建字段
const emailField = createField({
  label: '邮箱',
  required: true,
  validators: [
    validators.email('请输入有效的邮箱'),
    validators.minLength(5)
  ]
})

const passwordField = createField({
  label: '密码',
  required: true,
  validators: [
    validators.minLength(8, '密码至少8个字符')
  ]
})

// 注册字段
form.register('email', emailField)
form.register('password', passwordField)

// 手动验证
await form.validate()

// 重置表单
form.reset()
```

### 4. 内置验证器

```javascript
validators.required(message)      // 必填
validators.email(message)         // 邮箱格式
validators.minLength(min, message)  // 最小长度
validators.maxLength(max, message)  // 最大长度
validators.pattern(regex, message) // 正则匹配
validators.range(min, max, message) // 数值范围
validators.custom(fn)             // 自定义验证
```

### 5. 组件系统

```javascript
import { h, show, each, fragment } from 'field.js'

// 条件渲染
show(isVisible, [
  h('div', null, '可见内容')
])

// 列表渲染
each(items, (item, index) => 
  h('li', { key: item.id }, item.name)
)

// 片段
fragment(
  h('div', null, '第一个'),
  h('div', null, '第二个')
)

// 自定义组件
function MyComponent(props) {
  return h('div', { className: props.className },
    h('h1', null, props.title)
  )
}
```

### 6. 路由

```javascript
const router = createRouter({
  routes: [
    {
      path: '/',
      component: () => h('div', null, '首页')
    },
    {
      path: '/about',
      component: () => h('div', null, '关于')
    }
  ],
  mode: 'hash' // 或 'history'
})

// 安装路由
router.install()

// 导航
router.push('/about')

// 路由视图
const view = RouterView(router)
document.body.appendChild(view)

// 路由链接
const link = RouterLink({ to: '/about', children: ['关于'] }, router)
```

### 7. 生命周期钩子

```javascript
import { onMounted, onUnmounted, onUpdated, nextTick } from 'field.js'

onMounted(() => {
  console.log('组件已挂载')
})

onUnmounted(() => {
  console.log('组件已卸载')
  // 清理订阅、定时器等
})

onUpdated(() => {
  console.log('组件已更新')
})

nextTick(() => {
  // DOM 已更新
})
```

### 8. 指令

```javascript
import { registerDirective, getDirective } from 'field.js'

// 内置指令
// v-model, v-show, v-focus, v-lazy, v-click-outside

// 注册自定义指令
registerDirective('my-directive', {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value
  }
})
```

## API 参考

### signal.js

| API | 描述 |
|-----|------|
| `signal(initialValue)` | 创建响应式信号 |
| `computed(fn)` | 创建计算值 |
| `effect(fn)` | 执行副作用 |
| `reactive(obj)` | 使对象响应式 |
| `watch(source, callback)` | 监听信号变化 |

### form.js

| API | 描述 |
|-----|------|
| `createField(options)` | 创建表单字段 |
| `createForm(options)` | 创建表单 |
| `validators.*` | 内置验证器 |

### component.js

| API | 描述 |
|-----|------|
| `h(tag, props, ...children)` | 创建元素 |
| `render(component, container)` | 渲染到 DOM |
| `createApp(root, container)` | 创建应用 |
| `show(condition, children)` | 条件渲染 |
| `each(list, render)` | 列表渲染 |
| `fragment(...children)` | 片段 |

### store.js

| API | 描述 |
|-----|------|
| `createStore(options)` | 创建 Store |
| `defineStore(id, options)` | 定义可复用 Store |
| `useStore(id)` | 通过 ID 获取 Store |

### router.js

| API | 描述 |
|-----|------|
| `createRouter(options)` | 创建路由 |
| `RouterView(router)` | 路由视图组件 |
| `RouterLink(props, router)` | 路由链接组件 |

### lifecycle.js

| API | 描述 |
|-----|------|
| `onMounted(fn)` | 挂载钩子 |
| `onUnmounted(fn)` | 卸载钩子 |
| `onUpdated(fn)` | 更新钩子 |
| `onBeforeMount(fn)` | 挂载前钩子 |
| `onBeforeUnmount(fn)` | 卸载前钩子 |
| `onBeforeUpdate(fn)` | 更新前钩子 |
| `nextTick(fn)` | 下一个 tick |

### store.js

| API | 描述 |
|-----|------|
| `createStore(options)` | 创建 Store |
| `defineStore(id, options)` | 定义可复用 Store |
| `useStore(id)` | 通过 ID 获取 Store |
| `disposeStore(id)` | 从注册表中移除 Store |
| `clearAllStores()` | 清除所有 Store |

## 示例

### 计数器 + Store

```javascript
const useCounterStore = defineStore('counter', {
  state: { count: 0 },
  actions: {
    increment() { this.state.count++ },
    decrement() { this.state.count-- },
    reset() { this.state.count = 0 }
  },
  getters: {
    doubled() { return this.state.count * 2 }
  }
})

function Counter() {
  const counter = useCounterStore()
  
  return h('div', null,
    h('h1', null, () => `计数: ${counter.state.count}`),
    h('p', null, () => `双倍: ${counter.doubled}`),
    h('button', { onClick: () => counter.increment() }, '+'),
    h('button', { onClick: () => counter.reset() }, '重置')
  )
}
```

### 待办事项

```javascript
const useTodoStore = defineStore('todos', {
  state: { items: [], filter: 'all' },
  actions: {
    add(text) {
      this.state.items.push({ id: Date.now(), text, done: false })
    },
    toggle(id) {
      const item = this.state.items.find(i => i.id === id)
      if (item) item.done = !item.done
    }
  },
  getters: {
    filtered() {
      const { items, filter } = this.state
      if (filter === 'active') return items.filter(i => !i.done)
      if (filter === 'completed') return items.filter(i => i.done)
      return items
    }
  }
})

function TodoApp() {
  const todo = useTodoStore()
  const newTodo = signal('')
  
  return h('div', null,
    h('input', {
      value: newTodo,
      onInput: (e) => newTodo.set(e.target.value)
    }),
    h('button', {
      onClick: () => {
        if (newTodo()) {
          todo.add(newTodo())
          newTodo.set('')
        }
      }
    }, '添加'),
    each(() => todo.filtered, (item) =>
      h('div', null,
        h('input', {
          type: 'checkbox',
          checked: item.done,
          onChange: () => todo.toggle(item.id)
        }),
        h('span', null, item.text)
      )
    )
  )
}
```

### 表单验证

```javascript
function LoginForm() {
  const form = createForm({
    onSubmit: async (values) => {
      console.log('登录:', values)
    }
  })
  
  const emailField = createField({
    label: '邮箱',
    required: true,
    validators: [validators.email()]
  })
  
  const passwordField = createField({
    label: '密码',
    required: true,
    validators: [validators.minLength(6)]
  })
  
  form.register('email', emailField)
  form.register('password', passwordField)
  
  return h('form', { onSubmit: form.handleSubmit },
    h('input', {
      type: 'email',
      value: emailField.value,
      onInput: (e) => emailField.value.set(e.target.value)
    }),
    show(emailField.error, [h('span', null, emailField.error)]),
    h('input', {
      type: 'password',
      value: passwordField.value,
      onInput: (e) => passwordField.value.set(e.target.value)
    }),
    show(passwordField.error, [h('span', null, passwordField.error)]),
    h('button', { type: 'submit' }, '登录')
  )
}
```

## 项目结构

```
field.js/
├── packages/
│   └── core/
│       ├── signal.js       # 响应式系统
│       ├── form.js         # 表单系统
│       ├── component.js    # 组件系统
│       ├── store.js        # 状态管理
│       ├── router.js       # 路由系统
│       ├── lifecycle.js     # 生命周期
│       ├── directives.js    # 指令系统
│       └── index.js        # 入口文件
├── examples/
│   ├── basic/             # 完整示例
│   └── simple/            # 简单示例
└── demo.html              # 演示页面
```
## 实现说明

本项目在开发过程中使用了 AI 工具辅助进行方案设计、代码实现与文档编写。  
整体架构设计与最终决策由作者主导完成。

## 许可证

MIT
