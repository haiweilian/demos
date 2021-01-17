// ~策略类 strategies
let strategies = {
  S: function (salary) {
    return salary * 4
  },
  A: function (salary) {
    return salary * 3
  },
  B: function (salary) {
    return salary * 2
  },
}

// ~环境类 calculateBonus
let calculateBonus = function (level, salary) {
  return strategies[level](salary)
}

console.log(calculateBonus("S", 10000)) // 40000
console.log(calculateBonus("A", 10000)) // 30000
console.log(calculateBonus("B", 10000)) // 20000
