import type { Rect } from './ruler'
import { fabric } from 'fabric'

const getGap = (zoom: number) => {
  const zooms = [0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 18]
  const gaps = [5000, 2500, 1000, 500, 250, 100, 50, 25, 10, 5, 2]

  let i = 0
  while (i < zooms.length && zooms[i] < zoom) {
    i++
  }

  return gaps[i - 1] || 5000
}

const mergeLines = (rect: Rect[], isHorizontal: boolean) => {
  const axis = isHorizontal ? 'left' : 'top'
  const length = isHorizontal ? 'width' : 'height'
  rect.sort((a, b) => a[axis] - b[axis])
  const mergedLines = []
  let currentLine = Object.assign({}, rect[0])
  for (const item of rect) {
    const line = Object.assign({}, item)
    if (currentLine[axis] + currentLine[length] >= line[axis]) {
      currentLine[length] =
        Math.max(currentLine[axis] + currentLine[length], line[axis] + line[length]) -
        currentLine[axis]
    } else {
      mergedLines.push(currentLine)
      currentLine = Object.assign({}, line)
    }
  }
  mergedLines.push(currentLine)
  return mergedLines
}

const drawLine = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number
    top: number
    width: number
    height: number
    stroke?: string | CanvasGradient | CanvasPattern
    lineWidth?: number
  }
) => {
  ctx.save()
  const { left, top, width, height, stroke, lineWidth } = options
  ctx.beginPath()
  stroke && (ctx.strokeStyle = stroke)
  ctx.lineWidth = lineWidth ?? 1
  ctx.moveTo(left, top)
  ctx.lineTo(left + width, top + height)
  ctx.stroke()
  ctx.restore()
}

const drawText = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number
    top: number
    text: string
    fill?: string | CanvasGradient | CanvasPattern
    align?: CanvasTextAlign
    angle?: number
    fontSize?: number
  }
) => {
  ctx.save()
  const { left, top, text, fill, align, angle, fontSize } = options
  fill && (ctx.fillStyle = fill)
  ctx.textAlign = align ?? 'left'
  ctx.textBaseline = 'top'
  ctx.font = `${fontSize ?? 10}px sans-serif`
  if (angle) {
    ctx.translate(left, top)
    ctx.rotate((Math.PI / 180) * angle)
    ctx.translate(-left, -top)
  }
  ctx.fillText(text, left, top)
  ctx.restore()
}

const drawRect = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number
    top: number
    width: number
    height: number
    fill?: string | CanvasGradient | CanvasPattern
    stroke?: string
    strokeWidth?: number
  }
) => {
  ctx.save()
  const { left, top, width, height, fill, stroke, strokeWidth } = options
  ctx.beginPath()
  fill && (ctx.fillStyle = fill)
  ctx.rect(left, top, width, height)
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth ?? 1
    ctx.stroke()
  }
  ctx.restore()
}

const drawMask = (
  ctx: CanvasRenderingContext2D,
  options: {
    isHorizontal: boolean
    left: number
    top: number
    width: number
    height: number
    backgroundColor: string
  }
) => {
  ctx.save()
  const { isHorizontal, left, top, width, height, backgroundColor } = options
  const gradient = isHorizontal
    ? ctx.createLinearGradient(left, height / 2, left + width, height / 2)
    : ctx.createLinearGradient(width / 2, top, width / 2, height + top)
  const transparentColor = new fabric.Color(backgroundColor)
  transparentColor.setAlpha(0)
  gradient.addColorStop(0, transparentColor.toRgba())
  gradient.addColorStop(0.33, backgroundColor)
  gradient.addColorStop(0.67, backgroundColor)
  gradient.addColorStop(1, transparentColor.toRgba())
  drawRect(ctx, {
    left,
    top,
    width,
    height,
    fill: gradient,
  })
  ctx.restore()
}

export {
  getGap,
  mergeLines,
  drawRect,
  drawText,
  drawLine,
  drawMask
}
