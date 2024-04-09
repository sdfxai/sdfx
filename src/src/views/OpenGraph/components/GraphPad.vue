<template>
  <TWPad
    v-model="padPosition"
    :resetOnRelease="true"
    @change="changeGraphPan"
  />
</template>

<script lang="ts" setup>
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { ref } from 'vue'
import TWPad from '@/components/UI/TWPad.vue'

const padPosition = ref([0, 0])

const releaseToPosition = (pos: number[]) => {
  /*
  sdfx.setGraphPosition({
    x: pos[0],
    y: pos[1]
  })
  */
}

const changeGraphPan = (p: number[], o: number[], isReleasing: boolean)=>{
  if (isReleasing) {
    releaseToPosition(o)
    return
  }

  const dx = o[0] - p[0]
  const dy = o[1] - p[1]

  let min_x = Infinity
  let min_y = Infinity
  let max_x = -Infinity
  let max_y = -Infinity

  const nodes = sdfx.graph._nodes

  // Calculate boundaries
  for (let i = 0; i < nodes.length; ++i) {
    let node = nodes[i]
    min_x = Math.min(node.pos[0] - 20, min_x)
    min_y = Math.min(node.pos[1] - 20, min_y)
    max_x = Math.max(node.pos[0] + node.size[0] + 20, max_x)
    max_y = Math.max(node.pos[1] + node.size[1] + 20, max_y)
  }
  const z = sdfx.canvas.ds.getScale()

  /*
  const gw = sdfx.canvas.canvas.width / window.devicePixelRatio
  const gh = sdfx.canvas.canvas.height / window.devicePixelRatio
  */
  const gw = (max_x - min_x)
  const gh = (max_y - min_y)

  const px = gw * (dx / (10*z))
  const py = gh * (dy / (10*z))

  const c = sdfx.canvas.ds.getCoords()

  sdfx.setGraphPosition({
    x: c[0] + px,
    y: c[1] - py
  })
}
</script>
