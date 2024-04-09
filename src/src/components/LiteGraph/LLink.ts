//this is the class in charge of storing link information
export class LLink {
  private _data: any
  private _pos: Float32Array

  constructor(
    public id?: string | number,
    public type?: string,
    public origin_id?: string | number,
    public origin_slot?: string | number,
    public target_id?: string | number,
    public target_slot?: string | number | boolean
  ) {
    this._data = null
    this._pos = new Float32Array(2) //center
  }

  configure(o: any) {
    if (o.constructor === Array) {
      this.id = o[0]
      this.origin_id = o[1]
      this.origin_slot = o[2]
      this.target_id = o[3]
      this.target_slot = o[4]
      this.type = o[5]
    } else {
      this.id = o.id
      this.type = o.type
      this.origin_id = o.origin_id
      this.origin_slot = o.origin_slot
      this.target_id = o.target_id
      this.target_slot = o.target_slot
    }
  }

  serialize() {
    return [
      this.id,
      this.origin_id,
      this.origin_slot,
      this.target_id,
      this.target_slot,
      this.type
    ]
  }
}
