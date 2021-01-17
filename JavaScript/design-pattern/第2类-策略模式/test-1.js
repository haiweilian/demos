let calculateBonus = function (performanceLevel, salary) {
  if (performanceLevel === "S") {
    return salary * 4
  }
  if (performanceLevel === "A") {
    return salary * 3
  }
  if (performanceLevel === "B") {
    return salary * 2
  }
}

console.log(calculateBonus("S", 10000)) // 40000
console.log(calculateBonus("A", 10000)) // 30000
console.log(calculateBonus("B", 10000)) // 20000
