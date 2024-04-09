<template>
  <div @click="focus()" class="miraculous-graph-search text-white flex items-center px-1 justify-center duration-500 shadow border border-zinc-100 dark:border-zinc-800/70 font-semibold bg-white dark:bg-zinc-950/80 m-3 rounded-full" :class="[{focused, query}]">
    <svg v-show="!focused" class="w-6 h-6 text-zinc-500 absolute duration-500" :class="[focused?'opacity-0':'opacity-100']" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
    </svg>
    <form @submit.prevent.stop>
      <input ref="searchRef"
        v-model="query"
        keypress:enter="blur()"
        @input="onSearchChange"
        @click="focus()"
        @focus="focus()"
        @blur="blur()"
        class="ease-out duration-500 text-zinc-600 dark:text-zinc-300 px-5 py-3 bg-transparent rounded-full outline-none focus:outline-none border-none focus:border-none"
        :class="[focused?'w-[100px]':'w-[0px]']"
      />
    </form>
    <div v-if="query && nbresults>0" class="px-3 flex items-center space-x-2">
      <button @click="prevOccurence()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path>
        </svg>
      </button>
      <span class="text-xs text-zinc-500">{{ Number(idx+1) + ' / ' + nbresults }}</span>
      <button @click="nextOccurence()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
        </svg>
      </button>
    </div>

    <!-- helper section -->
    <section v-if="focused && query" class="search-help min-w-[300px] p-6 rounded-2xl absolute left-0 bottom-16 text-xs text-zinc-500 bg-zinc-950/90">
      <section class="space-y-3">
        <div><span class="txt font-semibold text-zinc-300 rounded-md bg-zinc-700 px-1.5 py-1">Esc</span> to close</div>
        <div><span class="txt font-semibold text-zinc-300 rounded-md bg-zinc-700 px-1.5 py-1">Shift + Enter</span> to find next</div>
        <div><span class="txt font-semibold text-zinc-300 rounded-md bg-zinc-700 px-1.5 py-1">Shift + Arrows</span> to navigate</div>
      </section>

      <!-- node type and id -->
      <button v-if="nbresults>0 && nodelist[idx]" @click.stop.prevent="submitSearch()" class="mt-6 text-base text-left flex items-center space-x-2">
        <svg v-if="nodelist[idx].widgets || nodelist[idx].imgs" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"></path>
        </svg>        
        <span class="txt font-semibold text-teal-400 whitespace-nowrap">{{ nodelist[idx].type }}</span>
        <span class="txt font-semibold text-zinc-200">(#{{ nodelist[idx].id }})</span>
      </button>

      <!-- widget list and values -->
      <ul v-if="nbresults>0 && nodelist[idx]" class="mt-1">
        <li v-for="(widget, n) in nodelist[idx].widgets" :key="widget.name" class="flex items-center space-x-2">
          <button class="flex items-center justify-center w-6 text-zinc-700 hover:text-zinc-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path>
            </svg>
          </button>
          <div v-if="showWidgetIdx" class="w-5 text-zinc-500">#0{{ n }}</div>
          <div class="text-zinc-400 font-semibold">{{ widget.name }}</div>
          <div class="text-green-300 font-semibold max-w-xs truncate">{{ nodelist[idx].widgets_values[n] }}</div>
        </li>

        <li v-for="(img, n) in nodelist[idx].imgs" :key="n" class="flex items-center space-x-2">
          <img :src="img.src" class="w-24 h-24 object-contain bg-zinc-950"/>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'

const showWidgetIdx = false
const query = ref(null)
const searchRef = ref<any>(null)
const idx = ref<number>(0)
const nbresults = ref(0)
const nodelist = ref<any[]>([])
const focused = ref(false)

const focus = () => {
  searchRef.value.focus()
  focused.value = true
}

const blur = () => {
  if (!query.value) resetSearch()
}

const animateSearch = () => {
 const nodes = nodelist.value

  if (nodes && nodes[idx.value]) {
    const nodeId = (nodes[idx.value] as { id?: string }).id || null
    if (nodeId) {
      sdfx.animateToNodeId(nodeId, 0.40)
    }
  }
}

const nextOccurence = () => {
  idx.value++
  if (idx.value > (nbresults.value - 1)) {
    idx.value = 0
  }
  animateSearch()
}

const prevOccurence = () => {
  idx.value--
  if (idx.value<0) {
    idx.value = nbresults.value - 1
  }
  animateSearch()
}

const resetSearch = () => {
  focused.value = false
  idx.value = 0
  nbresults.value = 0
  query.value = null
}

const onSearchChange = () => {
  const nodes = Object.values(sdfx.graph._nodes).filter((node: any) => {
    const nam = String(node.type).toLowerCase()
    const q = String(query.value).toLowerCase()
    return nam.indexOf(q)>-1 || String(node.id) === String(q)
  })

  idx.value = 0
  nodelist.value = nodes
  nbresults.value = nodelist.value.length
}

const submitSearch = () => {
  animateSearch()
  resetSearch()
}

const handleKeydown = (e: any) => {
  if (e.target.tagName === 'TEXTAREA') return

  if (e.ctrlKey && e.key === 'f') {
    focus()
    e.preventDefault()
    return
  }

  if (!focused.value) return

  if (e.keyCode===27 || e.key==='Escape') {
    resetSearch()
  }

  if (!query.value) return

  if ((e.keyCode===13 || e.key==='Enter')) {
    if (e.shiftKey) {
      nextOccurence()
    } else {
      submitSearch()
    }
  }

  if (e.shiftKey && e.keyCode===37 ) {
    prevOccurence()
    //e.preventDefault()
    return
  }

  if (e.shiftKey && e.keyCode===39 ) {
    nextOccurence()
    //e.preventDefault()
    return
  }
}

onMounted(()=>{
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(()=>{
  document.removeEventListener('keydown', handleKeydown)
})
</script>
<style type="text/css">
  .miraculous-graph-search.focused.query {
    box-shadow: 0 0 30px 10px #0e7c8666;
    backdrop-filter: blur(3px);
  }

  /*
  .miraculous-graph-search.focused.query .txt {
    text-shadow: 1px 1px 1px black;
  }
  */
</style>