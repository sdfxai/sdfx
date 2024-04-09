import { LiteGraph } from "../../LiteGraph"
import { closePanels, createPanel } from "./Panel"

export function showShowGraphOptionsPanel(graphcanvas: any, refOpts: any, obEv: any, refMenu: any, refMenu2: any) {
  if (graphcanvas.constructor && graphcanvas.constructor.name == 'HTMLDivElement') {
    // assume coming from the menu event click
    if (!obEv || !obEv.event || !obEv.event.target || !obEv.event.target.lgraphcanvas) {
      console.warn('Canvas not found') // need a ref to canvas obj
      /*console.debug(event);
      console.debug(event.target);*/
      return
    }
    graphcanvas = obEv.event.target.lgraphcanvas
  }

  closePanels()
  const ref_window = graphcanvas.getCanvasWindow()
  const panel = createPanel('Options', {
    closable: true,
    window: ref_window,
    onOpen: function () {
      graphcanvas.OPTIONPANEL_IS_OPEN = true
    },
    onClose: function () {
      graphcanvas.OPTIONPANEL_IS_OPEN = false
      graphcanvas.options_panel = null
    },
  })
  graphcanvas.options_panel = panel
  panel.id = 'option-panel'
  panel.classList.add('settings')

  function inner_refresh() {
    panel.content.innerHTML = '' //clear

    var fUpdate = function (name: any, value: any, options: any) {
      switch (name) {
        /*case "Render mode":
          // Case "".. 
          if (options.values && options.key){
            var kV = Object.values(options.values).indexOf(value);
            if (kV>=0 && options.values[kV]){
              console.debug("update graph options: "+options.key+": "+kV);
              graphcanvas[options.key] = kV;
              //console.debug(graphcanvas);
              break;
            }
          }
          console.warn("unexpected options");
          console.debug(options);
          break;*/
        default:
          //console.debug("want to update graph options: "+name+": "+value);
          if (options && options.key) {
            name = options.key
          }
          if (options.values) {
            value = Object.values(options.values).indexOf(value)
          }
          //console.debug("update graph option: "+name+": "+value);
          graphcanvas[name] = value
          break
      }
    }

    // panel.addWidget( "string", "Graph name", "", {}, fUpdate); // implement

    var aProps = LiteGraph.availableCanvasOptions
    aProps.sort()
    for (var pI in aProps) {
      var pX = aProps[pI]
      panel.addWidget('boolean', pX, graphcanvas[pX], { key: pX, on: 'True', off: 'False' }, fUpdate)
    }

    var aLinks = [graphcanvas.links_render_mode]
    panel.addWidget('combo', 'Render mode', LiteGraph.LINK_RENDER_MODES[graphcanvas.links_render_mode], { key: 'links_render_mode', values: LiteGraph.LINK_RENDER_MODES }, fUpdate)

    panel.addSeparator()

    panel.footer.innerHTML = '' // clear
  }
  inner_refresh()

  graphcanvas.canvas.parentNode.appendChild(panel)
}
