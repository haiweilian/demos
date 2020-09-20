import isNumber from './lib/is'

function sum(n = 1, m = 2) {
  if (isNumber(n) && isNumber(m)) {
    return n + m
  } else {
    return 0
  }
}

export default sum
