import { LiteTheme } from './LiteTheme'
import { overlapBounding } from './helpers/Intersect'


export class LGroup {
  font_size = 24
  color = LiteTheme.node_colors.pale_blue ? LiteTheme.node_colors.pale_blue.groupcolor : '#AAA'
  private _bounding = new Float32Array([10, 10, 140, 80])
  private _pos = this._bounding.subarray(0, 2)
  private _size = this._bounding.subarray(2, 4)
  private _nodes = [] as any[]
  graph: any = null
  
  set pos(v: number[] | Float32Array) {
    if (!v || v.length < 2) {
      return
    }
    this._pos[0] = v[0]
    this._pos[1] = v[1]
  }

  get pos(): number[] | Float32Array {
    return this._pos
  }

  set size(v: number[] | Float32Array) {
    if (!v || v.length < 2) {
      return
    }
    this._size[0] = Math.max(140, v[0])
    this._size[1] = Math.max(80, v[1])
  }

  get size(): number[] | Float32Array {
    return this._size
  }

  constructor(public title: string = 'Group') {}

  configure(o: any) {
    this.title = o.title
    this._bounding.set(o.bounding)
    this.color = o.color
    this.font_size = o.font_size
  }

  serialize() {
    var b = this._bounding
    return {
      title: this.title,
      bounding: [Math.round(b[0]), Math.round(b[1]), Math.round(b[2]), Math.round(b[3])],
      color: this.color,
      font_size: this.font_size,
    }
  }

  move(deltax: number, deltay: number, ignore_nodes: boolean) {
    this._pos[0] += deltax
    this._pos[1] += deltay
    if (ignore_nodes) {
      return
    }
    for (var i = 0; i < this._nodes.length; ++i) {
      var node: any = this._nodes[i]
      node.pos[0] += deltax
      node.pos[1] += deltay
    }
  }

  recomputeInsideNodes() {
    this._nodes.length = 0
    var nodes = this.graph._nodes
    var node_bounding = new Float32Array(4)
  
    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i]
      node.getBounding(node_bounding)
      if (!overlapBounding(this._bounding, node_bounding)) {
        continue
      } //out of the visible area
      this._nodes.push(node)
    }
  }
}