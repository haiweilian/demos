import Vue from 'vue'
// 在 store 文件下创建一个 vuex.js 替换vuex。
// import Vuex from 'vuex'
import Vuex from './vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    counter: 0
  },
  getters: {
    doubleCount (state) {
      return state.counter * 2
    }
  },
  mutations: {
    add (state) {
      state.counter++
    }
  },
  actions: {
    add ({ commit }) {
      setTimeout(() => {
        commit('add')
      }, 1000)
    }
  }
})
