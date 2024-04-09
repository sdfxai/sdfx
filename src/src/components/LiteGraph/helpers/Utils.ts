export function extendClass(target: any, origin: any) {
  for (var i in origin) {
    //copy class properties
    if (target.hasOwnProperty(i)) {
      continue
    }
    target[i] = origin[i]
  }

  if (origin.prototype) {
    //copy prototype properties
    for (var i in origin.prototype) {
      //only enumerable
      if (!origin.prototype.hasOwnProperty(i)) {
        continue
      }

      if (target.prototype.hasOwnProperty(i)) {
        //avoid overwriting existing ones
        continue
      }

      //copy getters
      if (origin.prototype.__lookupGetter__(i)) {
        target.prototype.__defineGetter__(
          i,
          origin.prototype.__lookupGetter__(i)
        )
      } else {
        target.prototype[i] = origin.prototype[i]
      }

      //and setters
      if (origin.prototype.__lookupSetter__(i)) {
        target.prototype.__defineSetter__(
          i,
          origin.prototype.__lookupSetter__(i)
        )
      }
    }
  }
}

export const clamp = (v: number, a: number, b: number) => {
  return a > v ? a : b < v ? b : v
}

export const getTime = () => {
  //timer that works everywhere
  if (typeof performance !== 'undefined') {
    return performance.now()
  } else if (typeof Date !== 'undefined' && Date.now) {
    return Date.now()
  } else if (typeof process !== 'undefined') {
    var t = process.hrtime()
    return t[0] * 0.001 + t[1] * 1e-6
  } else {
    return new Date().getTime()
  }
}

export const compareObjects = (a: any, b: any) => {
  for (var i in a) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export const colorToString = (c: number[]) => {
  return (
    'rgba(' +
    Math.round(c[0] * 255).toFixed() + ',' +
    Math.round(c[1] * 255).toFixed() + ',' +
    Math.round(c[2] * 255).toFixed() + ',' +
    (c.length == 4 ? c[3].toFixed(2) : '1.0') +
    ')'
  )
}

/**
 * Convert a hex value to its decimal value - the inputted hex must be in the
 * format of a hex triplet - the kind we use for HTML colours. The function
 * will return an array with three values.
 */
export const hex2num = (hex: string) => {
  if (hex.charAt(0) == '#') {
    hex = hex.slice(1)
  } //Remove the '#' char - if there is one.
  hex = hex.toUpperCase()
  const hex_alphabets = '0123456789ABCDEF'
  let value = new Array(3)
  let k = 0
  let int1, int2
  for (let i = 0; i < 6; i += 2) {
    int1 = hex_alphabets.indexOf(hex.charAt(i))
    int2 = hex_alphabets.indexOf(hex.charAt(i + 1))
    value[k] = int1 * 16 + int2
    k++
  }
  return value
}

/**
 * Give a array with three values as the argument 
 * and the function will return the corresponding hex triplet.
 */
export const num2hex = (triplet: number[]) => {
  const hex_alphabets = '0123456789ABCDEF'
  let hex = '#'
  let int1, int2
  for (let i = 0; i < 3; i++) {
    int1 = triplet[i] / 16
    int2 = triplet[i] % 16

    hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2)
  }
  return hex
}