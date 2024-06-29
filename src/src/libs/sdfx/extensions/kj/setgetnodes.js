import { sdfx as app } from '@/libs/sdfx/sdfx.js'
import { LiteGraph } from '@/components/LiteGraph/LiteGraph'
import { LiteTheme } from '@/components/LiteGraph/LiteTheme'

//based on diffus3's SetGet: https://github.com/diffus3/ComfyUI-extensions

function setColorAndBgColor(type) {
  const colorMap = {
    MODEL: LiteTheme.node_colors.blue,
    LATENT: LiteTheme.node_colors.purple,
    VAE: LiteTheme.node_colors.red,
    CONDITIONING: LiteTheme.node_colors.brown,
    IMAGE: LiteTheme.node_colors.pale_blue,
    CLIP: LiteTheme.node_colors.yellow,
    FLOAT: LiteTheme.node_colors.green,
    MASK: LiteTheme.node_colors.cyan,
    INT: { color: '#1b4669', bgcolor: '#29699c' }
  }

  const colors = colorMap[type]
  if (colors) {
    this.color = colors.color
    this.bgcolor = colors.bgcolor
  } else {
    // Handle the default case if needed
  }
}

app.registerExtension({
  name: 'SetNode',
  registerCustomNodes() {
    class SetNode {
      defaultVisibility = true
      serialize_widgets = true
      constructor() {
        if (!this.properties) {
          this.properties = {
            previousName: '',
          }
        }
        this.properties.showOutputText = SetNode.defaultVisibility

        const node = this

        this.addWidget(
          'text',
          'Constant',
          '',
          (s, t, u, v, x) => {
            node.validateName()
            if (this.widgets[0].value !== '') {
              this.title = 'Set_' + this.widgets[0].value
            }
            this.update()
            this.properties.previousName = this.widgets[0].value
          },
          {},
        )

        this.addInput('*', '*')
        this.addOutput('*', '*')

        this.onConnectionsChange = function (
          slotType, //1 = input, 2 = output
          slot,
          isChangeConnect,
          link_info,
          output,
        ) {
          //On Disconnect
          if (slotType == 1 && !isChangeConnect) {
            if (this.inputs[slot].name === '') {
              this.inputs[slot].type = '*'
              this.inputs[slot].name = '*'
              this.title = 'Set'
            }
          }
          if (slotType == 2 && !isChangeConnect) {
            this.outputs[slot].type = '*'
            this.outputs[slot].name = '*'
          }
          //On Connect
          if (link_info && app.graph && slotType == 1 && isChangeConnect) {
            const fromNode = app.graph._nodes.find(
              (otherNode) => otherNode.id == link_info.origin_id,
            )

            if (
              fromNode &&
              fromNode.outputs &&
              fromNode.outputs[link_info.origin_slot]
            ) {
              const type = fromNode.outputs[link_info.origin_slot].type

              if (this.title === 'Set') {
                this.title = 'Set_' + type
              }
              if (this.widgets[0].value === '*') {
                this.widgets[0].value = type
              }

              this.validateName()
              this.inputs[0].type = type
              this.inputs[0].name = type

              //if (app.ui.settings.getSettingValue('KJNodes.nodeAutoColor')) {
                setColorAndBgColor.call(this, type)
              //}
            } else {
              console.warn("Error: Set node input undefined. Most likely you're missing custom nodes")
            }
          }
          if (link_info && app.graph && slotType == 2 && isChangeConnect) {
            const fromNode = app.graph._nodes.find(
              (otherNode) => otherNode.id == link_info.origin_id,
            )

            if (
              fromNode &&
              fromNode.inputs &&
              fromNode.inputs[link_info.origin_slot]
            ) {
              const type = fromNode.inputs[link_info.origin_slot].type

              this.outputs[0].type = type
              this.outputs[0].name = type
            } else {
              alert(
                "Error: Get Set node output undefined. Most likely you're missing custom nodes",
              )
            }
          }

          //Update either way
          this.update()
        }

        this.validateName = function () {
          let widgetValue = node.widgets[0].value

          if (widgetValue !== '') {
            let tries = 0
            const existingValues = new Set()

            app.graph._nodes.forEach((otherNode) => {
              if (otherNode !== this && otherNode.type === 'SetNode') {
                existingValues.add(otherNode.widgets[0].value)
              }
            })

            while (existingValues.has(widgetValue)) {
              widgetValue = node.widgets[0].value + '_' + tries
              tries++
            }

            node.widgets[0].value = widgetValue
            this.update()
          }
        }

        this.clone = function () {
          const cloned = SetNode.prototype.clone.apply(this)
          cloned.inputs[0].name = '*'
          cloned.inputs[0].type = '*'
          cloned.value = ''
          cloned.properties.previousName = ''
          cloned.size = cloned.computeSize()
          return cloned
        }

        this.onAdded = function () {
          this.validateName()
        }

        this.update = function () {
          if (!app.graph) {
            return
          }

          const getters = this.findGetters(app.graph)
          getters.forEach((getter) => {
            getter.setType(this.inputs[0].type)
          })

          if (this.widgets[0].value) {
            const gettersWithPreviousName = this.findGetters(app.graph, true)
            gettersWithPreviousName.forEach((getter) => {
              getter.setName(this.widgets[0].value)
            })
          }

          const allGetters = app.graph._nodes.filter(
            (otherNode) => otherNode.type === 'GetNode',
          )
          allGetters.forEach((otherNode) => {
            if (otherNode.setComboValues) {
              otherNode.setComboValues()
            }
          })
        }

        this.findGetters = function (graph, checkForPreviousName) {
          const name = checkForPreviousName
            ? this.properties.previousName
            : this.widgets[0].value
          return app.graph._nodes.filter(
            (otherNode) =>
              otherNode.type === 'GetNode' &&
              otherNode.widgets[0].value === name &&
              name !== '',
          )
        }

        // This node is purely frontend and does not impact the resulting prompt so should not be serialized
        this.isVirtualNode = true
      }

      onRemoved() {
        const allGetters = app.graph._nodes.filter(
          (otherNode) => otherNode.type == 'GetNode',
        )
        allGetters.forEach((otherNode) => {
          if (otherNode.setComboValues) {
            otherNode.setComboValues([this])
          }
        })
      }
    }

    LiteGraph.registerNodeType(
      'SetNode',
      Object.assign(SetNode, {
        title: 'Set',
      }),
    )

    SetNode.category = 'KJNodes'
  },
})

app.registerExtension({
  name: 'GetNode',
  registerCustomNodes() {
    class GetNode {
      defaultVisibility = true
      serialize_widgets = true

      constructor() {
        if (!this.properties) {
          this.properties = {}
        }
        this.properties.showOutputText = GetNode.defaultVisibility

        const node = this
        this.addWidget(
          'combo',
          'Constant',
          '',
          (e) => {
            this.onRename()
          },
          {
            values: () => {
              const setterNodes = app.graph._nodes.filter(
                (otherNode) => otherNode.type == 'SetNode',
              )
              return setterNodes
                .map((otherNode) => otherNode.widgets[0].value)
                .sort()
            },
          },
        )

        this.addOutput('*', '*')
        this.onConnectionsChange = function (
          slotType, //0 = output, 1 = input
          slot, //self-explanatory
          isChangeConnect,
          link_info,
          output,
        ) {
          this.validateLinks()
        }

        this.setName = function (name) {
          node.widgets[0].value = name
          node.onRename()
          node.serialize()
        }

        this.onRename = function () {
          const setter = this.findSetter()
          if (setter) {
            let linkType = setter.inputs[0].type

            this.setType(linkType)
            this.title = 'Get_' + setter.widgets[0].value

            //if (app.ui.settings.getSettingValue('KJNodes.nodeAutoColor')) {
              setColorAndBgColor.call(this, linkType)
            //}
          } else {
            this.setType('*')
          }
        }

        this.clone = function () {
          const cloned = GetNode.prototype.clone.apply(this)
          cloned.size = cloned.computeSize()
          return cloned
        }

        this.validateLinks = function () {
          if (this.outputs[0].type !== '*' && this.outputs[0].links) {
            this.outputs[0].links
              .filter((linkId) => {
                const link = app.graph.links[linkId]
                return (
                  link &&
                  link.type !== this.outputs[0].type &&
                  link.type !== '*'
                )
              })
              .forEach((linkId) => {
                app.graph.removeLink(linkId)
              })
          }
        }

        this.setType = function (type) {
          this.outputs[0].name = type
          this.outputs[0].type = type
          this.validateLinks()
        }

        this.findSetter = function () {
          const name = this.widgets[0].value
          return app.graph._nodes.find(
            (otherNode) =>
              otherNode.type === 'SetNode' &&
              otherNode.widgets[0].value === name &&
              name !== '',
          )
        }

        // This node is purely frontend and does not impact the resulting prompt so should not be serialized
        this.isVirtualNode = true
      }

      getInputLink(slot) {
        const setter = this.findSetter()

        if (setter) {
          const slotInfo = setter.inputs[slot]
          const link = app.graph.links[slotInfo.link]
          return link
        } else {
          const errorMessage =
            'No SetNode found for ' +
            this.widgets[0].value +
            '(' +
            this.type +
            ')'
          console.log(errorMessage)
          throw new Error(errorMessage)
        }
      }
      onAdded(graph) {}
    }

    LiteGraph.registerNodeType(
      'GetNode',
      Object.assign(GetNode, {
        title: 'Get',
      }),
    )

    GetNode.category = 'KJNodes'
  },
})
