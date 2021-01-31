// ====== 字符串字面量类型
// --使用联合类型、定义具体的值，类似枚举的行为
type Easing = "ease-in" | "ease-out" | "ease-in-out";
let easing: Easing;
// easing = "ease"; // Error
easing = "ease-in";
easing = "ease-out";
easing = "ease-in-out";

// ====== 数字字面量类型
type RollDice = 1 | 2 | 3 | 4 | 5;
let rollDice: RollDice;
rollDice = 1;
rollDice = 5;

// ====== 布尔字面量类型
interface ValidationSuccess {
  isValid: boolean;
}

interface ValidationFailure {
  isValid: boolean;
  reason: string;
}

// --- 联合类型是取交集
type ValidationResult = ValidationSuccess | ValidationFailure;
let validationResul = {} as ValidationResult;
validationResul.isValid = true;
// validationResul.reason = "reason"; // Error: 联合类型只有相同的属性才能使用

// -- 交叉类型是取并集
type ValidationResults = ValidationSuccess & ValidationFailure;
let validationResuls = {} as ValidationResults;
validationResuls.isValid = true;
validationResuls.reason = "111";
