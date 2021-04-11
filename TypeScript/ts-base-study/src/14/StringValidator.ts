// 导出接口，模块的方式不是全局的。
export interface StringValidator {
  isAcceptable(s: string): boolean;
}
