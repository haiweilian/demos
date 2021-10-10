// ====== 后缀名查找
// .ts
// .tsx
// .d.ts

// ====== 如果使用相对路径导入 "./moduleB"
// --基于项目目录查找
// 1. `/root/src/moduleB.ts`
// 2. `/root/src/moduleB.tsx`
// 3. `/root/src/moduleB.d.ts`
// 4. `/root/src/moduleB/package.json` \(如果指定了`"types"`属性\)
// 5. `/root/src/moduleB/index.ts`
// 6. `/root/src/moduleB/index.tsx`
// 7. `/root/src/moduleB/index.d.ts`

// ====== 如果使用非相对的导入 "moduleB"
// --从本层开始往上找 node_modules 下的包文件
// 1. `/root/src/node_modules/moduleB.ts`
// 2. `/root/src/node_modules/moduleB.tsx`
// 3. `/root/src/node_modules/moduleB.d.ts`
// 4. `/root/src/node_modules/moduleB/package.json` \(如果指定了`"types"`属性\)
// 5. `/root/src/node_modules/@types/moduleB.d.ts`
// 6. `/root/src/node_modules/moduleB/index.ts`
// 7. `/root/src/node_modules/moduleB/index.tsx`
// 8. `/root/src/node_modules/moduleB/index.d.ts`
// 9. `/root/node_modules/moduleB.ts`
// 10. `/root/node_modules/moduleB.tsx`
// 11. `/root/node_modules/moduleB.d.ts`
// 12. `/root/node_modules/moduleB/package.json` \(如果指定了`"types"`属性\)
// 13. `/root/node_modules/@types/moduleB.d.ts`
// 14. `/root/node_modules/moduleB/index.ts`
// 15. `/root/node_modules/moduleB/index.tsx`
// 16. `/root/node_modules/moduleB/index.d.ts`
// 17. `/node_modules/moduleB.ts`
// 18. `/node_modules/moduleB.tsx`
// 19. `/node_modules/moduleB.d.ts`
// 20. `/node_modules/moduleB/package.json` \(如果指定了`"types"`属性\)
// 21. `/node_modules/@types/moduleB.d.ts`
// 22. `/node_modules/moduleB/index.ts`
// 23. `/node_modules/moduleB/index.tsx`
// 24. `/node_modules/moduleB/index.d.ts`
