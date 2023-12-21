// 还未成为标准，因此想使用reflect-metadata中的方法就需要手动引入该库，引入后相关方法会自动挂在Reflect全局对象上
import 'reflect-metadata'

class Example {
  text: string
}
// 定义一个exp接收Example实例,: Example/: string提供给TS编译器进行静态类型检查，不过这些类型信息会在编译后消失
const exp: Example = new Example()

// 注意：手动添加元数据仅为展示reflect-metadata的使用方式，实际上大部分情况下应该由编译器在编译时自动添加相关代码
// 为了在运行时也能获取exp的类型，我们手动调用defineMetadata方法为exp添加了一个key为type，value为Example的元数据
Reflect.defineMetadata('type', 'Example', exp)
// 为了在运行时也能获取text属性的类型，我们手动调用defineMetadata方法为exp的属性text添加了一个key为type，value为Example的元数据
Reflect.defineMetadata('type', 'String', exp, 'text')

// 运行时调用getMetadata方法，传入希望获取的元数据key以及目标就可以得到相关信息（这里得到了exp以及text的类型信息）
// 输出'Example' 'String'
console.log(Reflect.getMetadata('type', exp))
console.log(Reflect.getMetadata('type', exp, 'text'))
