<template>
  <h3 ref="root">打开控制台和代码调整观察</h3>
</template>
<script>
import {
  ref,
  reactive,
  readonly,
  isProxy,
  isReactive,
  isReadonly,
  toRaw,
  markRaw,
  shallowReactive,
  shallowReadonly,
  isRef,
  unref,
  toRef,
  toRefs,
  onMounted,
  nextTick
} from 'vue'
export default {
  setup() {
    const count = ref(1)
    const objReactive = reactive({ count })
    objReactive.count++
    console.log('1、reactive', objReactive.count)

    const objReadonly = readonly(objReactive)
    objReadonly.count++ // Set operation on key "count" failed: target is readonly
    console.log('2、readonly', objReadonly.count)

    // 是否是代理
    console.log('3、isProxy', isProxy(objReactive))
    console.log('3、isProxy', isProxy(objReadonly))
    console.log('3、isProxy', '"is not proxy"')

    // 是否是响应式
    console.log('4、isReactive', isReactive(objReactive))
    console.log('4、isReactive', isReactive(objReadonly))

    // 是否是只读
    console.log('5、isReadonly', isReadonly(objReactive))
    console.log('5、isReadonly', isReadonly(objReadonly))

    // 返回原始对象
    let source = {}
    console.log('6、toRaw', toRaw(reactive(source)) === source)

    // 永远不会被转化为响应式
    let raw = markRaw({ count: 0 })
    console.log('7、markRaw', isReactive(reactive(raw)))

    // 浅响应性是不会代理嵌套属性
    let shallow = {
      foo: 1,
      nested: {
        bar: 2
      }
    }

    let sReactive = shallowReactive(shallow)
    console.log('8、shallowReactive', sReactive)

    let sReadonly = shallowReadonly(shallow)
    console.log('8、shallowReadonly', sReadonly)

    // ref、isRef、unRef
    let state = ref(0)
    console.log('9、isRef', isRef(state))
    console.log('9、unref', unref(state))

    // 这时 props 整体是响应式，如果结构就会丢失
    let props = reactive({ foo: 1, bar: 1 })
    let fooRef = toRef(props, 'foo')
    let { bar } = toRefs(props) // { foo: Ref<number>, bar: Ref<number> }
    fooRef.value++
    bar.value++
    console.log('10、toRefs', props.foo, props.bar)

    // 获取模板
    const root = ref(null)

    onMounted(() => {
      nextTick(() => {
        console.log(root.value)
      })
    })

    return {
      root
    }
  }
}
</script>
