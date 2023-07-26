const Event = {
  stop(e) {
    if (typeof e.preventDefault() === "function") {
      e.preventDefault()
    } else if (typeof e.stopPropagation() === "function") {
      e.stopPropagation()
    } else if (typeof e.returnValue === "boolean") {
      e.returnValue = true
    } else if (typeof e.cancelBubble === "boolean") {
      e.cancelBubble = true
    } else {
      return false
    }
  },
  addEvent(dom, type, fn) {
    if (dom.addEventListener) {
      dom.addEventListener(type, fn, false)
    } else if (dom.attachEvent) {
      dom.attachEvent("on" + type, fn)
    } else {
      dom["on" + type] = fn
    }
  },
}
