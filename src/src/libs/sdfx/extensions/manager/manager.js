import { api } from '@/apis'
import { sdfx as app } from '@/libs/sdfx/sdfx.js'
import { LiteGraph } from '@/components/LiteGraph/'

let nicknames = []

async function fetchNicknames() {
  const mappings = await api.getCustomNodeMapping()
  if (mappings && mappings.error) {
    console.warn('Failed to fetch custom node mappings')
    return []
  }

  let result = {}

  for (let i in mappings) {
    let item = mappings[i]
    var nickname
    if (item[1].title) {
      nickname = item[1].title
    } else {
      nickname = item[1].title_aux
    }

    for (let j in item[0]) {
      result[item[0][j]] = nickname
    }
  }

  return result
}

const getNodeNickname = (node, nodeName) => {
  let text = '' // `#${node.id}`

  if (nicknames[nodeName.trim()]) {
    let nick = nicknames[nodeName.trim()]
    text += ' ' + (nick.length>25 ? nick.substring(0, 23) + '..' : nick)
  }

  return text
}

async function main() {
  const displayNodeName = true
  nicknames = await fetchNicknames()

  app.registerExtension({
    name: 'SDFX.Manager',

    async setup() {
      /* dummy */
    },

    async beforeRegisterNodeDef(nodeType, nodeData) {
      const onDrawForeground = nodeType.prototype.onDrawForeground
      nodeType.prototype.onDrawForeground = function (ctx) {
        const r = onDrawForeground?.apply?.(this, arguments)

        if (!this.flags.collapsed && displayNodeName && nodeType.title_mode !== LiteGraph.NO_TITLE) {
          const node = this
          const text = getNodeNickname(node, nodeData.name)

          const selectedNode = app.canvas?.selected_nodes ? Object.values(app.canvas.selected_nodes)[0] : null

          if (text != '') {
            let fgColor = selectedNode && selectedNode.id === this.id ? '#bef8fd' : '#52525bdd'
            let bgColor = selectedNode && selectedNode.id === this.id ? '#00586030' : '#09090b60'
            let visible = true

            ctx.save()
            ctx.font = '11px sans-serif'
            const sz = ctx.measureText(text)
            ctx.fillStyle = bgColor
            ctx.beginPath()
            ctx.roundRect(
              this.size[0] - sz.width - 11,
              -LiteGraph.NODE_TITLE_HEIGHT - 26,
              sz.width + 12,
              20,
              4
            )
            ctx.fill()

            ctx.fillStyle = fgColor
            ctx.fillText(text, this.size[0] - sz.width - 6, -LiteGraph.NODE_TITLE_HEIGHT - 12)
            ctx.restore()
          }
        }

        return r
      }
    }
  })
}
main()