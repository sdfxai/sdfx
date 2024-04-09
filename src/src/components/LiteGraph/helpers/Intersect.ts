export const distance = (a: number[], b: number[]) => {
  return Math.sqrt(
    (b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])
  )
}

export const isInsideRectangle = (x: number, y: number, left: number, top: number, w: number, h: number) => {
  return (left < x && left + w > x && top < y && top + h > y) ? true : false
}

export const growBounding = (bounding: number[], x: number, y: number) => {
  if (x < bounding[0]) {
    bounding[0] = x
  } else if (x > bounding[2]) {
    bounding[2] = x
  }

  if (y < bounding[1]) {
    bounding[1] = y
  } else if (y > bounding[3]) {
    bounding[3] = y
  }
}

export const isInsideBounding = (p: number[], bb: number[][]) => {
  if (
    p[0] < bb[0][0] ||
    p[1] < bb[0][1] ||
    p[0] > bb[1][0] ||
    p[1] > bb[1][1]
  ) {
    return false
  }
  return true
}

export const overlapBounding = (a: number[] | Float32Array, b: number[] | Float32Array) => {
  var A_end_x = a[0] + a[2]
  var A_end_y = a[1] + a[3]
  var B_end_x = b[0] + b[2]
  var B_end_y = b[1] + b[3]

  if (
    a[0] > B_end_x ||
    a[1] > B_end_y ||
    A_end_x < b[0] ||
    A_end_y < b[1]
  ) {
    return false
  }
  return true
}

