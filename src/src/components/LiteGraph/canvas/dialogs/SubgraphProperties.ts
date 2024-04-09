import { createPanel } from "./Panel"

export function showSubgraphPropertiesDialog(canvas: any, node: any) {
  console.log('showing subgraph properties dialog')

  const old_panel = canvas.parentNode.querySelector('.subgraph_dialog')
  if (old_panel) old_panel.close()

  const panel = createPanel('Subgraph Inputs', { closable: true, width: 500 })
  panel.node = node
  panel.classList.add('subgraph_dialog')

  function inner_refresh() {
    panel.clear()

    //show currents
    node?.inputs?.forEach((input: any, i: number) => {
      if (!input.not_subgraph_input) {
        const html = "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>"
        const elem = panel.addHTML(html, 'subgraph_property')
        elem.dataset['name'] = input.name
        elem.dataset['slot'] = i
        elem.querySelector('.name').innerText = input.name
        elem.querySelector('.type').innerText = input.type
        elem.querySelector('button').addEventListener('click', function (this: any, e: any) {
          node.removeInput(Number(this.parentNode.dataset['slot']))
          inner_refresh()
        })
      }
    })
  }

  //add extra
  const html = " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>"
  const elem = panel.addHTML(html, 'subgraph_property extra', true)
  elem.querySelector('button').addEventListener('click', function (this: any, e: any) {
    const elem2 = this.parentNode
    const name = elem2.querySelector('.name').value
    const type = elem2.querySelector('.type').value
    if (!name || node.findInputSlot(name) != -1) return
    node.addInput(name, type)
    elem2.querySelector('.name').value = ''
    elem2.querySelector('.type').value = ''
    inner_refresh()
  })

  inner_refresh()
  canvas.parentNode.appendChild(panel)
  return panel
}

export function showSubgraphPropertiesDialogRight(canvas: any, node: any) {
  // old_panel if old_panel is exist close it
  const old_panel = canvas.parentNode.querySelector('.subgraph_dialog')
  if (old_panel) old_panel.close()
  // new panel
  const panel = createPanel('Subgraph Outputs', { closable: true, width: 500 })
  panel.node = node
  panel.classList.add('subgraph_dialog')

  function inner_refresh() {
    panel.clear()
    //show currents
    node?.outputs?.forEach((output: any, i: number) => {
      if (!output.not_subgraph_output) {
        const html = "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>"
        const elem = panel.addHTML(html, 'subgraph_property')
        elem.dataset['name'] = output.name
        elem.dataset['slot'] = i
        elem.querySelector('.name').innerText = output.name
        elem.querySelector('.type').innerText = output.type
        elem.querySelector('button').addEventListener('click', function (this: any, e: any) {
          node.removeOutput(Number(this.parentNode.dataset['slot']))
          inner_refresh()
        })
      }
    })
  }

  //add extra
  const html = " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>"
  const elem = panel.addHTML(html, 'subgraph_property extra', true)
  elem.querySelector('.name').addEventListener('keydown', function (this: any, e: any) {
    if (e.keyCode == 13) {
      addOutput.apply(this)
    }
  })
  elem.querySelector('button').addEventListener('click', function (this: any, e: any) {
    addOutput.apply(this)
  })
  function addOutput(this: any) {
    const elem = this.parentNode
    const name = elem.querySelector('.name').value
    const type = elem.querySelector('.type').value
    if (!name || node.findOutputSlot(name) != -1) return
    node.addOutput(name, type)
    elem.querySelector('.name').value = ''
    elem.querySelector('.type').value = ''
    inner_refresh()
  }

  inner_refresh()
  canvas.parentNode.appendChild(panel)
  return panel
}
