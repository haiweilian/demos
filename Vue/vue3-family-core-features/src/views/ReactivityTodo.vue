<template>
  <section class="todoapp">
    <header class="header" :class="{ fixed: top > 130 }">
      <h1>{{ x }},{{ y }}</h1>
      <input class="new-todo" placeholder="想干的事" v-model="newTodo" @keyup.enter="addTodo" />
    </header>
    <section class="main" v-show="todos.length">
      <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone" />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          v-for="todo in todos"
          class="todo"
          :key="todo.id"
          :class="{ completed: todo.completed }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" />
            <label>{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="todos.length" v-cloak>
      <span class="todo-count">
        items <strong>{{ remaining }}</strong> left
      </span>
      <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
        Clear completed
      </button>
    </footer>
  </section>
</template>
<script>
import { reactive, toRefs, computed, watchEffect, watch } from 'vue'
import useScroll from '../use/scroll'
import useMouse from '../use/mouse'
export default {
  setup(props, ctx) {
    const state = reactive({
      todos: [],
      newTodo: ''
    })

    const addTodo = () => {
      var value = state.newTodo && state.newTodo.trim()
      if (!value) {
        return
      }
      state.todos.push({
        id: state.todos.length + 1,
        title: value,
        completed: false
      })
      state.newTodo = ''
    }

    const removeTodo = (todo) => {
      var index = state.todos.indexOf(todo)
      state.todos.splice(index, 1)
    }

    watchEffect(() => {
      console.log('watchEffect', state.todos.length)
    })

    watch(state.todos, (val) => {
      console.log('watch', val)
    })

    const remaining = computed(() => {
      return state.todos.filter((todo) => !todo.completed).length
    })

    const allDone = computed({
      get: function () {
        return remaining.value === 0
      },
      set: function (value) {
        state.todos.forEach(function (todo) {
          todo.completed = value
        })
      }
    })

    const removeCompleted = () => {
      state.todos = state.todos.filter((todo) => !todo.completed)
    }

    const { top } = useScroll()

    const { x, y } = useMouse()

    return {
      ...toRefs(state),
      remaining,
      addTodo,
      removeTodo,
      allDone,
      removeCompleted,
      top,
      x,
      y
    }
  }
}
</script>
<style scoped>
@import 'todomvc-app-css/index.css';

.fixed {
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
}

.todoapp {
  width: 500px;
  margin: 130px auto 40px auto;
}

.todoapp h1 {
  top: -190px;
}
</style>
