import {
  isNode,
  isSvg,
  getImagesFromSelector,
  createOverlay,
  cloneTarget,
  createCustomEvent,
} from './utils'

const mediumZoom = (selector, options = {}) => {
  /**
   * Ensure the compatibility with IE11 if no Promise polyfill are used.
   */
  const Promise =
    window.Promise ||
    function Promise(fn) {
      function noop() {}
      fn(noop, noop)
    }

  let zoom = {}
  let images = []
  let eventListeners = []
  let isAnimating = false
  let scrollTop = 0
  let params = options
  let currentTarget = null
  let resizeTimeout

  const active = {
    original: null,
    zoomed: null,
    zoomedHd: null,
    template: null,
  }

  const _handleClick = event => {
    const { target } = event

    if (target === overlay) {
      close()
      return
    }

    if (images.indexOf(target) === -1) {
      return
    }

    toggle({ target })
  }

  const _handleScroll = () => {
    if (isAnimating || !active.original) {
      return
    }

    const currentScroll =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0

    if (Math.abs(scrollTop - currentScroll) > params.scrollOffset) {
      setTimeout(close, 150)
    }
  }

  const _handleResize = () => {
    if (isAnimating || !active.original) {
      return
    }
    refresh()
  }

  const _handleKeyUp = event => {
    const key = event.key || event.keyCode

    // Close if escape key is pressed
    if (key === 'Escape' || key === 'Esc' || key === 27) {
      close()
    }
  }

  const update = (options = {}) => {
    const newOptions = options

    if (options.background) {
      overlay.style.background = options.background
    }

    if (options.container && options.container instanceof Object) {
      newOptions.container = {
        ...params.container,
        ...options.container,
      }
    }

    if (options.template) {
      const template = isNode(options.template)
        ? options.template
        : document.querySelector(options.template)

      newOptions.template = template
    }

    params = { ...params, ...newOptions }

    images.forEach(image => {
      image.dispatchEvent(
        createCustomEvent('medium-zoom:update', {
          detail: { zoom },
        })
      )
    })

    return zoom
  }

  const clone = (options = {}) => mediumZoom({ ...params, ...options })

  const attach = (...selectors) => {
    const newImages = selectors.reduce(
      (imagesAccumulator, currentSelector) => [
        ...imagesAccumulator,
        ...getImagesFromSelector(currentSelector),
      ],
      []
    )

    newImages
      .filter(newImage => images.indexOf(newImage) === -1)
      .forEach(newImage => {
        images.push(newImage)
        newImage.classList.add('medium-zoom-image')
      })

    eventListeners.forEach(({ type, listener, options }) => {
      newImages.forEach(image => {
        image.addEventListener(type, listener, options)
      })
    })

    return zoom
  }

  const detach = (...selectors) => {
    if (active.zoomed) {
      close()
    }

    const imagesToDetach =
      selectors.length > 0
        ? selectors.reduce(
            (imagesAccumulator, currentSelector) => [
              ...imagesAccumulator,
              ...getImagesFromSelector(currentSelector),
            ],
            []
          )
        : images

    imagesToDetach.forEach(image => {
      image.classList.remove('medium-zoom-image')
      image.dispatchEvent(
        createCustomEvent('medium-zoom:detach', {
          detail: { zoom },
        })
      )
    })

    images = images.filter(image => imagesToDetach.indexOf(image) === -1)

    return zoom
  }

  const on = (type, listener, options = {}) => {
    images.forEach(image => {
      image.addEventListener(`medium-zoom:${type}`, listener, options)
    })

    eventListeners.push({ type: `medium-zoom:${type}`, listener, options })

    return zoom
  }

  const off = (type, listener, options = {}) => {
    images.forEach(image => {
      image.removeEventListener(`medium-zoom:${type}`, listener, options)
    })

    eventListeners = eventListeners.filter(
      eventListener =>
        !(
          eventListener.type === `medium-zoom:${type}` &&
          eventListener.listener.toString() === listener.toString()
        )
    )

    return zoom
  }

  const refresh = () => {
    const target = currentTarget
    let viewportWidth
    let viewportHeight

    let container = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    }

    if (params.container) {
      if (params.container instanceof Object) {
        // The container is given as an object with properties like width, height, left, top
        container = {
          ...container,
          ...params.container,
        }

        // We need to adjust custom options like container.right or container.bottom
        viewportWidth =
          container.width -
          container.left -
          container.right -
          params.margin * 2

        viewportHeight =
          container.height -
          container.top -
          container.bottom -
          params.margin * 2
      } else {
        // The container is given as an element
        const zoomContainer = isNode(params.container)
          ? params.container
          : document.querySelector(params.container)

        const {
          width,
          height,
          left,
          top,
        } = zoomContainer.getBoundingClientRect()

        container = {
          ...container,
          width,
          height,
          left,
          top,
        }
      }
    }

    active.zoomed.classList.add('disable-animation')

    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      active.zoomed.classList.remove('disable-animation')
    }, 150)

    viewportWidth = viewportWidth || container.width - params.margin * 2
    viewportHeight = viewportHeight || container.height - params.margin * 2

    const imgTarget = active.original

    const naturalWidth = isSvg(imgTarget) ? viewportWidth : imgTarget.naturalWidth || viewportWidth
    const naturalHeight = isSvg(imgTarget) ? viewportHeight : imgTarget.naturalHeight || viewportHeight

    let { top, left, width, height } = imgTarget.getBoundingClientRect()
    active.zoomed.style.left = left + 'px'
    active.zoomed.style.top = top + 'px'
    active.zoomed.style.width = width + 'px'
    active.zoomed.style.height = height + 'px'

    let scale = 1
    const arViewport = viewportWidth / viewportHeight
    const arImage = naturalWidth / naturalHeight

    if (arViewport < arImage) {
      scale = (viewportWidth / width)
    } else {
      scale = (viewportHeight / height)
    }

    const translateX = (-left + (viewportWidth - width) / 2 + params.margin + container.left) / scale
    const translateY = (-top + (viewportHeight - height) / 2 + params.margin + container.top) / scale
    const transform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`

    active.zoomed.style.transform = transform

    if (active.zoomedHd) {
      active.zoomedHd.style.left = left + 'px'
      active.zoomedHd.style.top = top + 'px'
      active.zoomedHd.style.transform = transform
    }
  }

  const open = ({ target } = {}) => {
    currentTarget = target

    const _animate = () => {
      let container = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }
      let viewportWidth
      let viewportHeight

      if (params.container) {
        if (params.container instanceof Object) {
          // The container is given as an object with properties like width, height, left, top
          container = {
            ...container,
            ...params.container,
          }

          // We need to adjust custom options like container.right or container.bottom
          viewportWidth =
            container.width -
            container.left -
            container.right -
            params.margin * 2

          viewportHeight =
            container.height -
            container.top -
            container.bottom -
            params.margin * 2
        } else {
          // The container is given as an element
          const zoomContainer = isNode(params.container)
            ? params.container
            : document.querySelector(params.container)

          const {
            width,
            height,
            left,
            top,
          } = zoomContainer.getBoundingClientRect()

          container = {
            ...container,
            width,
            height,
            left,
            top,
          }
        }
      }

      viewportWidth = viewportWidth || container.width - params.margin * 2
      viewportHeight = viewportHeight || container.height - params.margin * 2

      const imgTarget = active.zoomedHd || active.original

      const naturalWidth = isSvg(imgTarget) ? viewportWidth : imgTarget.naturalWidth || viewportWidth
      const naturalHeight = isSvg(imgTarget) ? viewportHeight : imgTarget.naturalHeight || viewportHeight

      const { top, left, width, height } = imgTarget.getBoundingClientRect()

      let scale = 1
      const arViewport = viewportWidth / viewportHeight
      const arImage = naturalWidth / naturalHeight

      if (arViewport < arImage) {
        scale = (viewportWidth / width)
      } else {
        scale = (viewportHeight / height)
      }

      const translateX = (-left + (viewportWidth - width) / 2 + params.margin + container.left) / scale
      const translateY = (-top + (viewportHeight - height) / 2 + params.margin + container.top) / scale
      const transform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`

      active.zoomed.style.transform = transform

      if (active.zoomedHd) {
        active.zoomedHd.style.transform = transform
      }
    }

    return new Promise(resolve => {
      if (target && images.indexOf(target) === -1) {
        resolve(zoom)
        return
      }

      const _handleOpenEnd = () => {
        isAnimating = false
        active.zoomed.removeEventListener('transitionend', _handleOpenEnd)
        active.original.dispatchEvent(
          createCustomEvent('medium-zoom:opened', {
            detail: { zoom },
          })
        )

        resolve(zoom)
      }

      if (active.zoomed) {
        resolve(zoom)
        return
      }

      if (target) {
        // The zoom was triggered manually via a click
        active.original = target
      } else if (images.length > 0) {
        // The zoom was triggered programmatically, select the first image in the list
        ;[active.original] = images
      } else {
        resolve(zoom)
        return
      }

      active.original.dispatchEvent(
        createCustomEvent('medium-zoom:open', {
          detail: { zoom },
        })
      )

      scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      isAnimating = true
      active.zoomed = cloneTarget(active.original)

      document.body.appendChild(overlay)

      if (params.template) {
        const template = isNode(params.template)
          ? params.template
          : document.querySelector(params.template)
        active.template = document.createElement('div')
        active.template.appendChild(template.content.cloneNode(true))

        document.body.appendChild(active.template)
      }

      // If the selected <img> tag is inside a <picture> tag, set the
      // currently-applied source as the cloned `src=` attribute.
      // (as these might differ, or src= might be unset in some cases)
      if (
        active.original.parentElement &&
        active.original.parentElement.tagName === 'PICTURE' &&
        active.original.currentSrc
      ) {
        active.zoomed.src = active.original.currentSrc
      }

      document.body.appendChild(active.zoomed)

      window.requestAnimationFrame(() => {
        document.body.classList.add('medium-zoom--opened')
      })

      active.original.classList.add('medium-zoom-image--hidden')
      active.zoomed.classList.add('medium-zoom-image--opened')

      active.zoomed.addEventListener('click', close)
      active.zoomed.addEventListener('transitionend', _handleOpenEnd)

      if (active.original.getAttribute('data-zoom-src')) {
        active.zoomedHd = active.zoomed.cloneNode()

        // Reset the `scrset` property or the HD image won't load.
        active.zoomedHd.removeAttribute('srcset')
        active.zoomedHd.removeAttribute('sizes')
        // Remove loading attribute so the browser can load the image normally
        active.zoomedHd.removeAttribute('loading')

        active.zoomedHd.src = active.zoomed.getAttribute('data-zoom-src')

        active.zoomedHd.onerror = () => {
          clearInterval(getZoomTargetSize)
          console.warn(
            `Unable to reach the zoom image target ${active.zoomedHd.src}`
          )
          active.zoomedHd = null
          _animate()
        }

        // We need to access the natural size of the full HD
        // target as fast as possible to compute the animation.
        const getZoomTargetSize = setInterval(() => {
          if (active.zoomedHd.complete) {
            clearInterval(getZoomTargetSize)
            active.zoomedHd.classList.add('medium-zoom-image--opened')
            active.zoomedHd.addEventListener('click', close)
            document.body.appendChild(active.zoomedHd)
            _animate()
          }
        }, 10)
      } else if (active.original.hasAttribute('srcset')) {
        // If an image has a `srcset` attribuet, we don't know the dimensions of the
        // zoomed (HD) image (like when `data-zoom-src` is specified).
        // Therefore the approach is quite similar.
        active.zoomedHd = active.zoomed.cloneNode()

        // Resetting the sizes attribute tells the browser to load the
        // image best fitting the current viewport size, respecting the `srcset`.
        active.zoomedHd.removeAttribute('sizes')

        // In Firefox, the `loading` attribute needs to be set to `eager` (default
        // value) for the load event to be fired.
        active.zoomedHd.removeAttribute('loading')

        // Wait for the load event of the hd image. This will fire if the image
        // is already cached.
        const loadEventListener = active.zoomedHd.addEventListener(
          'load',
          () => {
            active.zoomedHd.removeEventListener('load', loadEventListener)
            active.zoomedHd.classList.add('medium-zoom-image--opened')
            active.zoomedHd.addEventListener('click', close)
            document.body.appendChild(active.zoomedHd)
            _animate()
          }
        )
      } else {
        _animate()
      }
    })
  }

  const close = () =>
    new Promise(resolve => {
      if (isAnimating || !active.original) {
        resolve(zoom)
        return
      }

      const _handleCloseEnd = () => {
        active.original.classList.remove('medium-zoom-image--hidden')
        document.body.removeChild(active.zoomed)
        if (active.zoomedHd) {
          document.body.removeChild(active.zoomedHd)
        }
        document.body.removeChild(overlay)
        active.zoomed.classList.remove('medium-zoom-image--opened')
        if (active.template) {
          document.body.removeChild(active.template)
        }

        isAnimating = false
        active.zoomed.removeEventListener('transitionend', _handleCloseEnd)

        active.original.dispatchEvent(
          createCustomEvent('medium-zoom:closed', {
            detail: { zoom },
          })
        )

        active.original = null
        active.zoomed = null
        active.zoomedHd = null
        active.template = null

        resolve(zoom)
      }

      isAnimating = true
      document.body.classList.remove('medium-zoom--opened')
      active.zoomed.style.transform = ''

      if (active.zoomedHd) {
        active.zoomedHd.style.transform = ''
      }

      // Fade out the template so it's not too abrupt
      if (active.template) {
        active.template.style.transition = 'opacity 150ms'
        active.template.style.opacity = 0
      }

      active.original.dispatchEvent(
        createCustomEvent('medium-zoom:close', {
          detail: { zoom },
        })
      )

      active.zoomed.addEventListener('transitionend', _handleCloseEnd)
    })

  const toggle = ({ target } = {}) => {
    if (active.original) {
      return close()
    }

    return open({ target })
  }

  const getOptions = () => params

  const getImages = () => images

  const getZoomedImage = () => active.original

  // If the selector is omitted, it's replaced by the options
  if (Object.prototype.toString.call(selector) === '[object Object]') {
    params = selector
  } else if (
    selector ||
    typeof selector === 'string' // to process empty string as a selector
  ) {
    attach(selector)
  }

  // Apply the default option values
  params = {
    margin: 0,
    background: '#fff',
    scrollOffset: 40,
    container: null,
    template: null,
    ...params,
  }

  const overlay = createOverlay(params.background)

  document.addEventListener('click', _handleClick)
  document.addEventListener('keyup', _handleKeyUp)
  document.addEventListener('scroll', _handleScroll)
  window.addEventListener('resize', _handleResize)

  zoom = {
    open,
    close,
    toggle,
    update,
    clone,
    attach,
    detach,
    on,
    off,
    getOptions,
    getImages,
    getZoomedImage
  }

  return zoom
}

export default mediumZoom
