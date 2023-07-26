// ~策略类 strategies
let strategies = {
  isNonEmpry: function (value, error) {
    if (value === "") {
      return error
    }
  },
  isMobile: function (value, error) {
    if (!/^(\+?0?86\-?)?1[3456789]\d{9}$/.test(value)) {
      return error
    }
  },
}

// ~环境类 Validator
let Validator = function () {
  this.cache = []
  this.add = function (value, rule, message) {
    // 保存一个函数，返回对应的验证结果
    this.cache.push(function () {
      return strategies[rule](value, message)
    })
  }
  this.validator = function () {
    for (let i = 0; i < this.cache.length; i++) {
      // 循环已经保存的验证规则，如果有错误的，就直接返回错误信息
      let error = this.cache[i]()
      if (error) {
        return error
      }
    }
  }
}

// ~测试组 Validator
let validator1 = new Validator()
validator1.add("", "isNonEmpry", "不能为空")
validator1.add("123123", "isMobile", "不是一个手机号")
console.log("validator1:", validator1.validator()) // validator1: 不能为空

let validator2 = new Validator()
validator2.add("123123", "isNonEmpry", "不能为空")
validator2.add("123123", "isMobile", "不是一个手机号")
console.log("validator2:", validator2.validator()) // validator2: 不是一个手机号
