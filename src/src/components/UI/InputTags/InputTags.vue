<template>
  <div
    :id="id"
    ref="tagselector"
    class="tagselector"
    :class="{
      'is-open': isOpen && search && extendedOptions.length > 0,
      'is-disabled': disabled,
      'no-caret': !caret,
      'open-top': openDirection === 'top'
    }"
    @keydown.prevent.enter
  >
    <div v-if="label" class="flex justify-between mb-1">
      <label class="block text-sm font-medium leading-5 text-zinc-700 dark:text-zinc-500 noselect">{{
        label
      }}</label>
      <span
        v-if="!readonly && !required && showOptional"
        class="text-sm leading-5 text-zinc-500 dark:text-zinc-600"
        >{{ t("labels.optional") }}</span
      >
    </div>
    <div
      class="tag-selector relative min-h-[2.5rem] border border-zinc-300 dark:border-zinc-700 bg-white text-zinc-700 dark:text-zinc-200 dark:bg-zinc-800/40 cursor-pointer w-full outline-none flex items-center rounded-md shadow-sm"
      :tabindex="-1"
      @mousedown="handleInputMousedown"
      @focus="openDropdown"
      @blur="closeDropdown"
      @keyup.esc="handleEsc"
      @keyup.enter="selectPointer"
      @keydown.prevent.delete="handleBackspace"
      @keydown.prevent.up="openDirection === 'top' ? forwardPointer() : backwardPointer()"
      @keydown.prevent.down="
        openDirection === 'top' ? backwardPointer() : forwardPointer()
      "
    >
      <div class="tag-list">
        <span v-for="(option, i, key) in iv" :key="key">
          <slot
            name="tag"
            :option="option"
            :handleTagRemove="handleTagRemove"
            :disabled="disabled"
          >
            <div class="tagselector-tag">
              {{ option[labelBy] }}
              <i
                v-if="!disabled"
                @click.prevent
                @mousedown.prevent.stop="handleTagRemove(option, $event)"
              />
            </div>
          </slot>
        </span>

        <div
          v-if="!disabled"
          class="tag-input-wrapper"
          :style="{ width: tagsSearchWidth }"
        >
          <input
            ref="input"
            class="bg-white dark:bg-transparent"
            :modelValue="search"
            :value="search"
            @focus.stop="openDropdown"
            @blur.stop="closeDropdown"
            @keyup.stop.esc="handleEsc"
            @keyup.stop.enter="handleAddTag"
            @keyup.stop.space="handleAddTag"
            @keydown.stop.prevent.tab="handleAddTag"
            @keydown.delete="handleSearchBackspace"
            @keydown.stop.up="
              openDirection === 'top' ? forwardPointer() : backwardPointer()
            "
            @keydown.stop.down="
              openDirection === 'top' ? backwardPointer() : forwardPointer()
            "
            @input="handleSearchInput"
            :style="{ width: tagsSearchWidth }"
          />
        </div>
      </div>

      <!-- Placeholder -->
      <template v-if="placeholder && !hasSelected && !search">
        <slot name="placeholder">
          <div class="tagselector-placeholder">
            {{ placeholder }}
          </div>
        </slot>
      </template>

      <slot
        v-if="!hasSelected && caret && search && extendedOptions.length > 0"
        name="caret"
      >
        <span class="tagselector-caret"></span>
      </slot>

      <slot v-if="hasSelected && !disabled && canDeselect" name="clear" :clear="clear">
        <a class="tagselector-clear" @click.prevent="clear"></a>
      </slot>

      <transition name="tagselector-loading">
        <span v-if="showLoader && busy">
          <span class="tagselector-spinner"></span>
        </span>
      </transition>
    </div>

    <!-- Options -->
    <transition v-if="filteredOptions.length > 0" name="tagselector">
      <div
        v-show="isOpen && search && extendedOptions.length > 0"
        class="tagselectorOptions"
        :style="{ maxHeight: contentMaxHeight }"
      >
        <slot name="beforelist"></slot>

        <span
          v-for="(option, i, key) in extendedOptions"
          :key="key"
          :tabindex="-1"
          class="tagselector-option"
          :class="{
            'is-pointed': isPointed(option),
            'is-selected': isSelected(option),
            'is-disabled': isDisabled(option),
          }"
          @mousedown.prevent
          @mouseenter="setPointer(option)"
          @click.stop.prevent="handleOptionClick(option)"
        >
          <slot name="option" :option="option" :search="search">
            <span class="capitalize">{{ option[labelBy] }}</span>
          </slot>
        </span>

        <span v-show="noOptions">
          <slot name="nooptions">
            <!-- <div class="tagselector-no-options"></div> -->
          </slot>
        </span>

        <slot name="afterlist"></slot>
      </div>
    </transition>

    <!-- Hacky input element to show HTML5 required warning -->
    <input
      v-if="required"
      class="tagselector-fake-input"
      tabindex="-1"
      :value="textValue"
      required
    />

    <template v-if="nativeSupport">
      <template>
        <input
          v-for="(v, i) in plainValue"
          type="hidden"
          :name="`${name}[]`"
          :value="v"
          :key="i"
        />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch, nextTick, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

// @ts-ignore
import useOptions from './composables/useOptions'
// @ts-ignore
import usePointerAction from './composables/usePointerAction'

export default defineComponent({
  name: 'InputTags',

  emits: [
    'open',
    'close',
    'select',
    'deselect',
    'input',
    'search-change',
    'tag',
    'update:modelValue',
    'change',
    'modified',
    'clear'
  ],

  props: {
    value: { required: false },
    modelValue: { required: false },
    options: { type: [Array, Object, Function], required: false, default: () => [] },
    id: { type: String, required: false, default: 'tagselector' },
    name: { type: [String, Number], required: false, default: 'tagselector' },
    disabled: { type: Boolean, required: false, default: false },
    labelBy: { type: String, required: false, default: 'label' },
    trackBy: { type: String, required: false, default: 'label' },
    placeholder: { type: String, required: false, default: null },
    limit: { type: Number, required: false, default: -1 },
    maxHeight: { type: Number, required: false, default: 160 },
    hideSelected: { type: Boolean, required: false, default: true },
    allowCustomTags: { type: Boolean, required: false, default: true },
    slugifyTags: { type: Boolean, required: false, default: true },
    tagValidator: { type: Function, required: false, default: () => true },
    caret: { type: Boolean, required: false, default: true },
    showLoader: { type: Boolean, required: false, default: false },
    minChars: { type: Number, required: false, default: 0 },
    clearOnSelect: { type: Boolean, required: false, default: true },
    canDeselect: { type: Boolean, required: false, default: true },
    max: { type: Number, required: false, default: -1 },
    showOptions: { type: Boolean, required: false, default: true },
    addTagOn: { type: Array, required: false, default: () => ['enter', 'tab', 'space'] },
    label: { type: String, required: false, default: null },
    required: { type: Boolean, required: false, default: false },
    readonly: { type: Boolean, required: false, default: false },
    showOptional: { type: Boolean, required: false, default: true },
    openDirection: { type: String, required: false, default: 'bottom' },
    nativeSupport: { type: Boolean, required: false, default: false }
  },

  setup(props, context) {
    const { t } = useI18n()
    const input = ref<HTMLInputElement>()
    const search = ref<string>()
    const tagselector = ref<HTMLElement>()
    const pointer = ref<HTMLElement>()
    const isOpen = ref(false)
    const iv = ref<any[]>([])
    const ev = props.modelValue || props.value

    const tagsSearchWidth = computed(() => {
      return search.value ? `${search.value.length}ch` : '1ch'
    })

    const plainValue = computed(() => {
      return iv.value.map((v) => v.value)
    })

    const textValue = computed(() => {
      return iv.value.map((v) => v.value).join(',')
    })

    const contentMaxHeight = computed(() => {
      return `${props.maxHeight}px`
    })

    /* -- */

    const clearSearch = () => {
      if (search.value) {
        search.value = ''
      }
    }

    const focusSearch = () => {
      input.value?.focus()
    }

    const blurSearch = () => {
      input.value?.blur()
    }

    watch(search, (val) => {
      context.emit('search-change', val)
    })

    const focusInput = () => {
      ;(tagselector.value?.querySelector('.tag-selector') as HTMLElement)?.focus()
    }

    const blurInput = () => {
      ;(tagselector.value?.querySelector('.tag-selector') as HTMLElement)?.blur()
    }

    const update = (val: any[]) => {
      iv.value = val || []
      context.emit('change', val)
      context.emit('input', val)
      context.emit('update:modelValue', val)
      context.emit('modified')
    }

    const options = useOptions(props, context, {
      ev,
      iv,
      search,
      blurSearch,
      clearSearch,
      update,
      blurInput,
      pointer
    })

    const pointerAction = usePointerAction(props, context, {
      search,
      pointer,
      filteredOptions: options.filteredOptions,
      handleOptionClick: options.handleOptionClick
    })

    /* -- dropdown -- */

    const openDropdown = () => {
      if (props.disabled) return
      isOpen.value = true
      context.emit('open')
    }

    const closeDropdown = () => {
      isOpen.value = false
      clearSearch()
      context.emit('close')
    }

    const open = () => {
      focusSearch()
    }

    const close = () => {
      blurSearch()
    }

    const handleInputMousedown = (e: any) => {
      // if (isOpen.value && false) {
      //   // TODO: Remove or fix the condition (&& false always return false)
      //   (tagselector.value).querySelector('.tag-selector').dispatchEvent(new Event('blur'))
      //   tagselector.value.querySelector('.tag-selector').blur()
      //   e.preventDefault()
      // }
    }

    /* -- keyboard -- */

    const handleBackspace = (e: any) => {
      update([...iv.value].slice(0, -1))
    }

    const handleEsc = (e: any) => {
      if (search.value) {
        search.value = ''
      }
      closeDropdown()
      pointerAction.clearPointer()
      e.target.blur()
    }

    const handleSearchBackspace = (e: any) => {
      if (search.value && search.value !== '') {
        e.stopPropagation()
      }
    }

    const handleSearchInput = (e: any) => {
      search.value = e.target.value
    }

    const slugify = (str: string) => {
      str = str.replace(/^\s+|\s+$/g, '')
      str = str.toLowerCase().trim()

      // Remove accents, swap ñ for n, etc
      const from =
        'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;'
      const to =
        'AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------'
      for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
      }

      return str
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '')
        .replace(/^-+|-+$/g, '')
    }

    const addTag = () => {
      if (search.value && props.slugifyTags) {
        search.value = slugify(search.value)
      }

      nextTick(() => {
        pointerAction.selectPointer()
      })
    }

    const handleAddTag = (e: any) => {
      if (e.keyCode === 13 && (props.addTagOn.indexOf('enter') !== -1 || !props.allowCustomTags)) {
        addTag()
      } else if (
        e.keyCode === 9 &&
        (props.addTagOn.indexOf('tab') !== -1 || !props.allowCustomTags)
      ) {
        addTag()
      } else if (
        e.keyCode === 32 &&
        props.addTagOn.indexOf('space') !== -1 &&
        props.allowCustomTags
      ) {
        if (search.value) {
          search.value = search.value
            .replace(/^\s+|\s+$/g, '')
            .toLowerCase()
            .trim()
        }

        addTag()
      }
    }

    return {
      t,
      iv,
      ev,
      plainValue,
      textValue,
      search,
      input,
      tagsSearchWidth,
      clearSearch,
      focusSearch,
      blurSearch,
      tagselector,
      update,
      handleBackspace,
      handleEsc,
      handleSearchBackspace,
      handleSearchInput,
      handleAddTag,
      isOpen,
      contentMaxHeight,
      openDropdown,
      closeDropdown,
      open,
      close,
      handleInputMousedown,
      ...options,
      ...pointerAction
    }
  }
})
</script>

<style lang="scss">
.tagselector {
  position: relative;
  margin: 0 auto;
  font-size: 0;
  cursor: auto;
}

.tagselector > * {
  @apply text-sm;
}

.tagselector-caret {
  position: absolute;
  right: 12px;
  top: 50%;
  color: #999;
  border-style: solid;
  border-width: 5px 5px 0;
  border-color: #999 transparent transparent;
  content: '';
  transform: translateY(-50%);
  transition: 0.3s transform;
}

.is-disabled .tag-selector {
  @apply bg-zinc-100;
}

.is-open .tag-selector {
  @apply rounded-b-none;
}

.is-open .tagselector-caret {
  transform: translateY(-50%) rotate(180deg);
}

.tagselector-placeholder {
  @apply flex items-center px-3 absolute left-0 top-0 h-full bg-transparent text-zinc-600;
  pointer-events: none;
}

.is-open .tagselector-placeholder {
  @apply text-zinc-400;
}

.is-disabled .tagselector-placeholder {
  @apply text-zinc-500 cursor-default;
}

.tag-input-wrapper {
  flex-grow: 1;
}

.tag-input-wrapper input {
  outline: none;
  border: 0;
  margin: 0 0 5px 3px;
  flex-grow: 1;
  min-width: 100%;
}

.tagselector-clear {
  @apply rounded-r-md;
  position: absolute;
  right: 0;
  top: 50%;
  width: 38px;
  height: 38px;
  transform: translateY(-50%);

  &:before,
  &:after {
    position: absolute;
    top: 12px;
    left: 18px;
    content: ' ';
    height: 14px;
    width: 2px;
    background-color: #cbd5e0;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }

  &:hover {
    &:before,
    &:after {
      background-color: #718096;
    }
  }
}

.tag-list {
  @apply pl-2 pr-10 py-0 w-full h-full flex items-center justify-start;
  margin-top: 5px;
  flex-wrap: wrap;
}

.no-caret .tag-list {
  padding-right: 9px;
}

.tagselector-tag {
  @apply bg-teal-500 mr-1 mb-1 text-sm text-white font-semibold pl-3 pr-1 py-1 rounded-full;
  @apply flex items-center cursor-text;
  white-space: nowrap;
}

.tagselector-tag i {
  cursor: pointer;
}

.tagselector-tag i:before {
  @apply text-teal-300 ml-2 w-5 h-5 text-xl -mt-px rounded-full px-1 flex items-center justify-center;
  content: '\D7';
}

.tagselector-tag i:hover:before {
  @apply text-white bg-zinc-100/20;
}

.is-disabled .tagselector-tag {
  background: #a0aec0;
  padding: 1px 8px 1px 8px;
}

.tagselector-fake-input {
  background: transparent;
  width: 100%;
  height: 1px;
  border: 0;
  padding: 0;
  font-size: 0;
  margin-top: -1px;
  outline: none;

  &:active,
  &:focus {
    outline: none;
  }
}

.tagselectorOptions {
  @apply absolute left-0 right-0 flex flex-col border border-zinc-300 bg-white;
  margin-top: -1px;
  max-height: 160px;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  z-index: 100;
}

.open-top .tagselectorOptions {
  transform: translateY(-100%);
  top: 2px;
  flex-direction: column-reverse;
}

.tagselector-option {
  @apply text-zinc-600 flex items-center justify-between px-2;
  box-sizing: border-box;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
}

.tagselector-option.is-pointed {
  @apply bg-zinc-200;
}

.tagselector-option.is-disabled {
  @apply bg-zinc-200 text-zinc-400;
  cursor: not-allowed;
}

.tagselector-option.is-selected {
  @apply bg-teal-500 text-white;
}

.tagselector-option.is-selected.is-pointed {
  @apply bg-teal-500;
}

.tagselector-option.is-selected {
  @apply bg-transparent text-red-300;
}

.tagselector-option.is-selected.is-pointed {
  background: #f1f1f1;
}

.tagselector-no-options,
.tagselector-no-results {
  display: flex;
  padding: 10px 12px;
  color: #777;
}

.tagselector-spinner {
  position: absolute;
  right: 14px;
  top: 4px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  display: block;
  transform: translateY(50%);
}

.tagselector-spinner:before,
.tagselector-spinner:after {
  position: absolute;
  content: '';
  top: 50%;
  left: 50%;
  margin: -8px 0 0 -6px;
  width: 16px;
  height: 16px;
  border-radius: 100%;
  border-color: #38bec9 transparent transparent;
  border-style: solid;
  border-width: 2px;
  box-shadow: 0 0 0 1px transparent;
}

.is-disabled .tagselector-spinner {
  background: #f9f9f9;
}

.is-disabled .tagselector-spinner:before,
.is-disabled .tagselector-spinner:after {
  border-color: #999999 transparent transparent;
}

.tagselector-spinner:before {
  animation: spinning 1800ms cubic-bezier(0.41, 0.26, 0.2, 0.62);
  animation-iteration-count: infinite;
}
.tagselector-spinner:after {
  animation: spinning 1800ms cubic-bezier(0.51, 0.09, 0.21, 0.8);
  animation-iteration-count: infinite;
}

.tagselector-loading-enter-active,
.tagselector-loading-leave-active {
  transition: opacity 350ms ease-in-out;
  opacity: 1;
}
.tagselector-loading-enter-from,
.tagselector-loading-leave-from {
  opacity: 0;
}

@keyframes spinning {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(2turn);
  }
}
</style>
