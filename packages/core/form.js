import { signal, effect } from './signal.js'

export function createField(options = {}) {
  const value = signal(options.defaultValue)
  const error = signal(null)
  const touched = signal(false)
  const dirty = signal(false)
  const disabled = signal(false)

  let fieldElement

  const validate = async () => {
    const currentValue = value()
    const validators = options.validators || []

    if (options.required && (currentValue === undefined || currentValue === null || currentValue === '')) {
      error.set(`${options.label || '此字段'}为必填项`)
      return false
    }

    for (const validator of validators) {
      const result = await validator(currentValue)
      if (result !== true) {
        error.set(typeof result === 'string' ? result : '验证失败')
        return false
      }
    }

    error.set(null)
    return true
  }

  const reset = () => {
    value.set(options.defaultValue)
    error.set(null)
    touched.set(false)
    dirty.set(false)
  }

  const focus = () => {
    fieldElement?.focus()
  }

  const blur = () => {
    touched.set(true)
  }

  return {
    value,
    error,
    touched,
    dirty,
    disabled,
    validate,
    reset,
    focus,
    blur,
    get element() {
      return fieldElement
    },
    set element(el) {
      fieldElement = el
    }
  }
}

export function createForm(options) {
  const fields = {}
  const valid = signal(true)
  const submitting = signal(false)
  const errors = signal({})

  const register = (name, field) => {
    fields[name] = field
  }

  const unregister = (name) => {
    delete fields[name]
  }

  const getValue = (name) => {
    return fields[name]?.value()
  }

  const setValue = (name, value) => {
    fields[name]?.value.set(value)
  }

  const getValues = () => {
    const values = {}
    Object.keys(fields).forEach(name => {
      values[name] = fields[name].value()
    })
    return values
  }

  const setValues = (values) => {
    Object.keys(values).forEach(name => {
      if (fields[name]) {
        fields[name].value.set(values[name])
      }
    })
  }

  const validate = async () => {
    const results = await Promise.all(
      Object.keys(fields).map(name => fields[name].validate())
    )

    const isValid = results.every(r => r)
    valid.set(isValid)

    const errorMap = {}
    Object.keys(fields).forEach(name => {
      const err = fields[name].error()
      if (err) {
        errorMap[name] = err
      }
    })
    errors.set(errorMap)

    return isValid
  }

  const reset = () => {
    Object.keys(fields).forEach(name => fields[name].reset())
    valid.set(true)
    errors.set({})
  }

  const submit = async () => {
    submitting.set(true)

    try {
      const isValid = await validate()
      if (!isValid) return

      if (options.onValidate) {
        const customErrors = await options.onValidate(getValues())
        if (Object.keys(customErrors).length > 0) {
          errors.set(customErrors)
          valid.set(false)
          return
        }
      }

      await options.onSubmit(getValues())
    } finally {
      submitting.set(false)
    }
  }

  const handleSubmit = (event) => {
    event?.preventDefault()
    submit()
  }

  return {
    fields,
    valid,
    submitting,
    errors,
    register,
    unregister,
    getValue,
    setValue,
    getValues,
    setValues,
    validate,
    reset,
    submit,
    handleSubmit
  }
}

export const validators = {
  required: (message = '此字段为必填项') => {
    return (value) => {
      if (value === undefined || value === null || value === '') {
        return message
      }
      return true
    }
  },

  email: (message = '请输入有效的邮箱地址') => {
    return (value) => {
      if (!value) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? true : message
    }
  },

  minLength: (min, message) => {
    return (value) => {
      if (!value) return true
      return value.length >= min ? true : message || `长度不能少于${min}个字符`
    }
  },

  maxLength: (max, message) => {
    return (value) => {
      if (!value) return true
      return value.length <= max ? true : message || `长度不能超过${max}个字符`
    }
  },

  pattern: (regex, message = '格式不正确') => {
    return (value) => {
      if (!value) return true
      return regex.test(value) ? true : message
    }
  },

  range: (min, max, message) => {
    return (value) => {
      if (value === undefined || value === null || value === '') return true
      const num = Number(value)
      return num >= min && num <= max ? true : message || `值必须在${min}到${max}之间`
    }
  },

  custom: (validator) => {
    return validator
  }
}
