const clipboard = {
  copy(el) {
    if (typeof window === 'undefined') return

    el = typeof el === 'string' ? document.querySelector(el) : el

    // handle iOS as a special case
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      // save current contentEditable/readOnly status
      var editable = el.contentEditable
      var readOnly = el.readOnly

      // convert to editable with readonly to stop iOS keyboard opening
      el.contentEditable = true
      el.readOnly = true

      // create a selectable range
      var range = document.createRange()
      range.selectNodeContents(el)

      // select the range
      var selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      el.setSelectionRange(0, 999999)

      // restore contentEditable/readOnly to original state
      el.contentEditable = editable
      el.readOnly = readOnly
    } else {
      el.select()
    }

    // execute copy command
    document.execCommand('copy')
  }
}

export default clipboard
