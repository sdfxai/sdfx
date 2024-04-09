import { computed, reactive } from 'vue'

interface PromptStoreState {
  isOpen: boolean
  title: string
  placeholder: string
  value: string
  resolve: ((result: any) => void)
  buttons: {
    submit?: string | false
    cancel?: string | false
  }
}

const state = reactive<PromptStoreState>({
  isOpen: false,
  title: '',
  value: '',
  placeholder: '',
  resolve: (bool) => {},
  buttons: {
    submit: false,
    cancel: false,
  }
})

interface Options {
  title?: string | null
  value?: string | null
  placeholder?: string | null
  buttons?: {
    submit?: string | false
    cancel?: string | false
  }
}

export const usePrompt = () => {
  const prompt = (options: Options = {}) => {
    state.isOpen = true
    state.title = options.title || ''
    state.value = options.value || ''
    state.placeholder = options.placeholder || ''
    state.buttons = options.buttons || {}

    if (options.buttons?.submit) {
      state.buttons.submit = options.buttons.submit
    }

    if (options.buttons?.cancel) {
      state.buttons.cancel = options.buttons.cancel
    }

    return new Promise<string>((resolve) => {
      state.resolve = resolve
    })
  }

  const answer = (bool: boolean) => {
    if (state.resolve) state.resolve(bool ? state.value : null)
    close()
  }

  const close = () => {
    if (state.resolve) state.resolve(null)
    state.isOpen = false
  }

  return {
    state,
    answer,
    prompt,
    close
  }
}
