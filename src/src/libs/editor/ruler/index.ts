import type { Canvas } from 'fabric/fabric-impl'
import { fabric } from 'fabric'
import CanvasRuler, { RulerOptions } from './ruler'

function initRuler(canvas: Canvas, options?: RulerOptions) {
  const ruler = new CanvasRuler({
    canvas,
    ...options,
  })

  let workspace: fabric.Object | undefined = undefined

  const getWorkspace = () => {
    workspace = canvas.getObjects().find((item: any) => item.id === 'workspace')
  }

  const isRectOut = (object: fabric.Object, target: fabric.GuideLine): boolean => {
    const { top, height, left, width } = object

    if (top === undefined || height === undefined || left === undefined || width === undefined) {
      return false
    }

    const targetRect = target.getBoundingRect(true, true)
    const {
      top: targetTop,
      height: targetHeight,
      left: targetLeft,
      width: targetWidth,
    } = targetRect

    if (
      target.isHorizontal() &&
      (top > targetTop + 1 || top + height < targetTop + targetHeight - 1)
    ) {
      return true
    } else if (
      !target.isHorizontal() &&
      (left > targetLeft + 1 || left + width < targetLeft + targetWidth - 1)
    ) {
      return true
    }

    return false
  }

  canvas.on('guideline:moving', (e) => {
    if (!workspace) {
      getWorkspace()
      return
    }
    const { target } = e
    if (isRectOut(workspace, target)) {
      target.moveCursor = 'not-allowed'
    }
  })

  canvas.on('guideline:mouseup', (e) => {
    if (!workspace) {
      getWorkspace()
      return
    }
    const { target } = e
    if (isRectOut(workspace, target)) {
      canvas.remove(target)
      canvas.setCursor(canvas.defaultCursor ?? '')
    }
  })
  return ruler
}

export default initRuler
