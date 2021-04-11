// 没有导出语句是全局的
interface Box {
  scale: number;
}

// 包含导出语句，就会变成模板就不会影响全局
// export interface Box1 {
//   scale: number;
// }
