import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state() {
    return {
      count: 0
    }
  },
  getters: {
    evenOrOdd() {
      return this.count % 2 === 0 ? 'even' : 'odd'
    }
  },
  actions: {
    increment() {
      this.count++
    },
    decrement(state) {
      this.count--
    },
    incrementIfOdd() {
      if ((this.count + 1) % 2 === 0) {
        this.increment()
      }
    },
    incrementAsync() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.increment()
          resolve()
        }, 1000)
      })
    }
  }
})
