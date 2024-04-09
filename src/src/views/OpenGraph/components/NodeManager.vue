<template>
  <div class="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-950 flex items-center justify-between">
    <div class="flex-1 px-3 py-2 flex items-center space-x-3">
      <TWSearch v-model="query" class="w-64" />

      <div class="flex items-center space-x-8">
        <label class="ms-2 text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center space-x-2">
          <input type="radio" v-model="filterRadio" value="all" name="filter-radio" class="w-5 h-5 text-blue-600 bg-zinc-100 border-zinc-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600">
          <span>All</span>
        </label>

        <label class="ms-2 text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center space-x-2">
          <input type="radio" v-model="filterRadio" value="missing" name="filter-radio" class="w-5 h-5 text-blue-600 bg-zinc-100 border-zinc-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600">
          <span>Missing nodes</span>
        </label>

        <label class="ms-2 text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center space-x-2">
          <input type="radio" v-model="filterRadio" value="installed" name="filter-radio" class="w-5 h-5 text-blue-600 bg-zinc-100 border-zinc-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600">
          <span>Installed</span>
        </label>
      </div>
    </div>

    <div v-if="selectedCustomNode" class="border-l dark:border-zinc-950 px-3 py-2 w-2/5 flex items-center justify-between">
      <h2 class="text-2xl truncate font-bold">
        {{ selectedCustomNode?.title }}
      </h2>
      <div v-if="!loading" class="space-x-3 whitespace-nowrap">
        <button v-if="selectedCustomNode.isInstalled" class="tw-button transparent pink" @click="uninstallCustomNode(selectedCustomNode)">Uninstall</button>
        <button v-if="selectedCustomNode.isInstalled && selectedCustomNode.isDisabled" class="tw-button" @click="enableCustomNode(selectedCustomNode)">Enable</button>
        <button v-if="selectedCustomNode.isInstalled && !selectedCustomNode.isDisabled" class="tw-button pink" @click="disableCustomNode(selectedCustomNode)">Disable</button>
        <button v-if="!selectedCustomNode.isInstalled" class="tw-button" @click="installCustomNode(selectedCustomNode)">Install</button>
      </div>
      <SpinLoader v-if="loading" class="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
    </div>
  </div>

  <section class="NodeManager flex flex-1 overflow-hidden">
    <ul class="p-3 flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 text-zinc-800 dark:text-zinc-100 text-lg font-semibold scrollable overflow-x-hidden overflow-y-auto">
      <li
        v-for="(node, idx) in filteredCustomNodeList"
        :key="idx"
        @click="selectCustomNode(node)"
        class="border border-zinc-200 dark:border-zinc-800 px-3 py-2 h-20 rounded-md flex items-center justify-between"
        :class="[
          selectedCustomNode?.id===node.id 
            ? 'bg-teal-600 text-white' 
            : (node.isInstalled ? 'bg-green-700 dark:bg-green-600/60 text-green-200 dark:text-green-200 cursor-pointer' : 'bg-zinc-200 dark:bg-zinc-800 cursor-pointer')
        ]"
      >
        <span class="whitespace-wrap text-sm">{{ node.title }}</span>
        <span>
          <svg v-if="node.isInstalled" class="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </span>
      </li>
    </ul>

    <aside v-if="selectedCustomNode" class="w-2/5 bg-zinc-50 dark:bg-zinc-900 h-full scrollable overflow-y-auto">
      <div class="px-6 py-2 divide-y divide-zinc-200 dark:divide-zinc-800">
        <dt class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Title</dd>
          <dd class="text-zinc-800 dark:text-zinc-200">{{ selectedCustomNode?.title }}</dd>
        </dt>
        <dt class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Author</dd>
          <dd class="text-zinc-800 dark:text-zinc-200">{{ selectedCustomNode?.author }}</dd>
        </dt>
        <dt v-if="selectedCustomNode?.reference" class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">URL</dd>
          <dd class="text-zinc-800 dark:text-zinc-200"><a :href="selectedCustomNode?.reference" target="_blank" class="tw-underlink">
            {{ selectedCustomNode?.reference }}</a>
          </dd>
        </dt>
        <dt class="py-2">
          <dd class="text-zinc-600 font-semibold">Description</dd>
          <dd class="text-zinc-800 dark:text-zinc-200 mt-1 text-lg">{{ selectedCustomNode?.description }}</dd>
        </dt>
      </div>
    </aside>
  </section>
</template>

<script lang="ts" setup>
import { api } from '@/apis'
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'
import { LiteGraph } from '@/components/LiteGraph/'
import SpinLoader from '@/components/UI/SpinLoader.vue'
import TWSearch from '@/components/UI/TWSearch.vue'
/* @ts-ignore */
import { sdfx } from '@/libs/sdfx/sdfx.js'

const { confirm } = useConfirm()
const selectedCustomNode = ref<any | null>(null)
const customNodelist = ref<any[]>([])
const filterRadio = ref<string>('all')
const query = ref<string | undefined>()
const loading = ref<boolean>(false)
const nodeMappings = ref({})

const filteredCustomNodeList = computed(() => {
  const list = customNodelist.value
  const q = query.value ? (query.value).toLocaleLowerCase() : null
  let results = list.filter(n => q ? (n.title).toLocaleLowerCase().indexOf(q)>-1 : true)
  if (filterRadio.value === 'missing') {
    results = filterMissingNodes(results)
  }

  if (filterRadio.value === 'installed') {
    results = results.filter(n => n.isInstalled)
  }

  return results
})

const filterMissingNodes = (data: any) => {
  const mappings: any = nodeMappings.value

  // build regex->url map
  const regex_to_url = []
  for (let i in data) {
    if (data[i]['nodename_pattern']) {
      let item = {
        regex: new RegExp(data[i].nodename_pattern),
        url: data[i].files[0],
      }
      regex_to_url.push(item)
    }
  }

  // build name->url map
  const name_to_url: any = {}
  for (const url in mappings) {
    const names = mappings[url]
    for (const name in names[0]) {
      name_to_url[names[0][name]] = url
    }
  }

  const registered_nodes = new Set()
  for (let i in LiteGraph.registered_node_types) {
    registered_nodes.add(LiteGraph.registered_node_types[i].type)
  }

  const missing_nodes = new Set()
  const nodes = sdfx.graph.serialize().nodes
  for (let i in nodes) {
    const node_type = nodes[i].type
    if (!registered_nodes.has(node_type)) {
      const url = name_to_url[node_type.trim()]
      if (url) {
        missing_nodes.add(url)
      } else {
        for (let j in regex_to_url) {
          if (regex_to_url[j].regex.test(node_type)) {
            missing_nodes.add(regex_to_url[j].url)
          }
        }
      }
    }
  }

  /*
  const unresolved_nodes = await api.getUnresolvedNodesInComponent()
  if (unresolved_nodes) {
    for (let i in unresolved_nodes) {
      let node_type = unresolved_nodes[i]
      const url = name_to_url[node_type]
      if (url) missing_nodes.add(url)
    }
  }
  */

  return data.filter(
    (node: any) => node.files.some((file: any) => missing_nodes.has(file))
  )
}

const loadCustomNodes = async () => {
  nodeMappings.value = await api.getCustomNodeMapping()

  const nodes = await api.getCustomNodes()
  if (nodes && nodes.length>0) {
    let id = 0
    customNodelist.value = nodes.map((n: any) => {
      id++
      return {
        id,
        ...n,
        isInstalled: (n.installed==='True' || n.installed==='Disabled') ? true : false,
        isDisabled: n.installed==='Disabled' ? true : false
      }
    })
  }

  if (selectedCustomNode.value) {
    const node = customNodelist.value.find(n => n.id === selectedCustomNode.value.id)
    if (node) {
      selectCustomNode(node)
    }
  }
}

const selectCustomNode = (node: any) => {
  if (loading.value) return
  selectedCustomNode.value = node
}

const installCustomNode = async (node: any) => {
  if (loading.value) return

  const answer = await confirm({
    message: "Install custom node?",
    buttons: {
      yes: 'Install',
      no: 'Cancel'
    }
  })

  if (answer) {
    loading.value = true
    const nodes = await api.installCustomNode(node)
    loading.value = false
    loadCustomNodes()
  }
}

const uninstallCustomNode = async (node: any) => {
  if (loading.value) return

  const answer = await confirm({
    message: "Uninstall custom node?",
    buttons: {
      delete: 'Uninstall',
      no: 'Cancel'
    }
  })

  if (answer) {
    loading.value = true
    const nodes = await api.uninstallCustomNode(node)
    loading.value = false
    loadCustomNodes()
  }
}

const disableCustomNode = async (node: any) => {
  if (loading.value) return

  const answer = await confirm({
    message: "Disable custom node?",
    buttons: {
      delete: 'Disable',
      no: 'Cancel'
    }
  })

  if (answer) {
    loading.value = true
    const nodes = await api.toggleCustomNode(node)
    loading.value = false
    loadCustomNodes()
  }
}

const enableCustomNode = async (node: any) => {
  if (loading.value) return

  const answer = await confirm({
    message: "Enable custom node?",
    buttons: {
      yes: 'Enable',
      no: 'Cancel'
    }
  })

  if (answer) {
    loading.value = true
    const nodes = await api.toggleCustomNode(node)
    loading.value = false
    loadCustomNodes()
  }
}

onMounted(() => {
  loadCustomNodes()
})
</script>
