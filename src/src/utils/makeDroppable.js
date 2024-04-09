const makeDroppable = function (element, clickable, cb) {
  var callback = cb || function (files, items) {}

  if (!element || element.__droppable__) return false

  const triggerCallback = function (e) {
    var files = null
    var items = null

    if (e.dataTransfer) {
      files = e.dataTransfer.files
      items = e.dataTransfer.items
    } else if (e.target && e.target.files) {
      files = e.target.files
      items = e.target.items
    }
    callback(files, items)
  }

  const containsFiles = function (event) {
    var types = event.dataTransfer ? event.dataTransfer.types : null

    if (types) {
      for (var i = 0; i < types.length; i++) {
        if (types[i] === 'Files') return true
      }
    }
    return false
  }

  /* Passive event feature detection */
  let passive = false
  if (typeof window !== 'undefined') {
    try {
      window.addEventListener('test', null,
        Object.defineProperty(
          {},
          'passive',
          {
            get() {
              passive = { passive: true }
            }
          }
        )
      )
    } catch (err) {}
  }

  var input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('multiple', true)
  input.setAttribute('class', 'file-input')

  input.addEventListener('change', triggerCallback)
  element.appendChild(input)

  element.addEventListener('dragover', function (e) {
    e.preventDefault()
    e.stopPropagation()
    if (containsFiles(e)) {
      element.classList.add('dragover')
    }
  })

  element.addEventListener('dragleave', function (e) {
    e.preventDefault()
    e.stopPropagation()
    if (containsFiles(e)) {
      element.classList.remove('dragover')
    }
  })

  element.addEventListener('drop', function (e) {
    e.preventDefault()
    e.stopPropagation()
    element.classList.remove('dragover')

    if (containsFiles(e) && e.dataTransfer.files.length > 0) {
      triggerCallback(e)
    } else {
      callback(null)
    }
  })

  if (clickable) {
    clickable.addEventListener('click', function (e) {
      e.stopPropagation()
      input.value = null
      input.click()
    })

    clickable.addEventListener('touchstart', function (e) {
      clickable.classList.add('touchstart')
      e.stopPropagation()
    }, passive)

    clickable.addEventListener('touchend', function (e) {
      clickable.classList.remove('touchstart')
      e.stopPropagation()
    }, passive)
  }

  element.__droppable__ = true
}

export default makeDroppable
