<template>
  <ControllerBox class="BoxSeed" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <Box :title="label" :isScrollable="false">
      <template #right>
        <span class="uppercase text-xs text-zinc-500">
          {{ scope.values[1] }}
        </span>
      </template>
      <div class="p-4">
        <!-- seed -->
        <section class="flex relative items-center space-x-2">
          <TWInputNumber
            v-model="scope.values[0]"
            :min="scope.options[0]?.min"
            :max="scope.options[0]?.max"
            :precision="0"
            :readonly="scope.values[1]!=='fixed'"
            @change="seedChange(scope, $event)"
            @blur="seedChange(scope, $event)"
            class="flex-1"
          />
          <button @click="toggleLockSeed(scope)">
            <LockOpenIcon v-if="scope.values[1]==='fixed'" class="w-5 h-5 text-teal-500"/>

            <svg v-if="scope.values[1]==='increment'" class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5"></path>
            </svg>

            <svg v-if="scope.values[1]==='decrement'" class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"></path>
            </svg>

            <LockClosedIcon v-if="scope.values[1]==='randomize'" class="w-5 h-5 text-zinc-500"/>
          </button>
        </section>
      </div>
    </Box>
  </ControllerBox>
</template>
<script lang="ts" setup>
import Box from '@/components/UI/Box.vue'
import ControllerBox from '@/components/controls/ControllerBox.vue'
import TWInputNumber from '@/components/UI/TWInputNumber.vue'
import { LockOpenIcon, LockClosedIcon  } from '@heroicons/vue/24/solid'
import { PropType } from 'vue'

const emit = defineEmits(['change'])

let mode = 0

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: true },
  label: { type: String, required: false, default: null },
  options: { type: Array as PropType<any[]>, required: true },
  target: { type: Object as PropType<any>, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})

const seedChange = (scope: any, value: any)=>{
  if (typeof value === 'undefined' || value===null) return
  if (typeof value !== 'number') return

  if (scope.values[1]) {
    scope.change({
      values: [value, scope.values[1]]
    })
  }
}

const toggleLockSeed = (scope: any) => {
  mode++
  if (mode>4) mode = 1
  if (mode===1) scope.change({ values: [scope.values[0], 'fixed'] })
  if (mode===2) scope.change({ values: [scope.values[0], 'increment'] })
  if (mode===3) scope.change({ values: [scope.values[0], 'decrement'] })
  if (mode===4) scope.change({ values: [scope.values[0], 'randomize'] })
}
</script>
