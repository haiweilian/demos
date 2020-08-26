/* eslint-disable no-unused-vars */
import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuid } from 'uuid'
import UndoManager from 'undo-manager'

Vue.use(Vuex)

const undoManager = new UndoManager()
undoManager.setCallback(function() {
  // console.log(undoManager.getIndex())
  // console.log(undoManager.getCommands())
})
const axiosCallBack = type => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
      console.log(`异步接口，${type}完成。。`)
    }, 500)
  })
}

export default new Vuex.Store({
  state: {
    todos: [],
    message: '',
    canUndo: false,
    canRedo: false,
    numUndo: 0,
    numRedo: 0
  },
  mutations: {
    /**
     * @desc 标识状态
     */
    setCanUndoRedo(state, payload) {
      state.canUndo = payload ? payload.canUndo : undoManager.hasUndo()
      state.canRedo = payload ? payload.canRedo : undoManager.hasRedo()
      state.numUndo = undoManager.getIndex() + 1
      state.numRedo = undoManager.getCommands().length - undoManager.getIndex() - 1
    },
    /**
     * @desc 修改数据的方式
     */
    selectItem(state, payload) {
      state.todos = payload
    },
    createItem(state, payload) {
      state.todos.push(payload)
    },
    deleteItem(state, payload) {
      state.todos.forEach((item, index) => {
        if (item.id === payload.id) {
          state.todos.splice(index, 1)
        }
      })
    },
    updateItem(state, payload) {
      state.todos.forEach((item, index) => {
        if (item.id === payload.id) {
          item.name = payload.name
        }
      })
    }
  },
  actions: {
    /**
     * @desc 撤销恢复操作
     */
    handerUndo({ dispatch, commit }, payload) {
      undoManager.undo()
      commit('setCanUndoRedo')
    },
    handerRedo({ dispatch, commit }, payload) {
      undoManager.redo()
      commit('setCanUndoRedo')
    },
    handerClear({ dispatch, commit }, payload) {
      undoManager.clear()
      commit('setCanUndoRedo')
    },
    /**
     * @desc 接口调用声明
     */
    selectItemRequest({ dispatch, commit }, payload) {
      return axiosCallBack('查询').then(() => {
        commit('selectItem', [
          { id: uuid(), date: '2016-05-02', name: '王小虎1', address: '上海市普陀区金' },
          { id: uuid(), date: '2016-05-02', name: '王小虎1', address: '上海市普陀区金' }
        ])
      })
    },
    createItemRequest({ dispatch, commit }, payload) {
      // 限制不能重复再次点击
      commit('setCanUndoRedo', {
        canUndo: false,
        canRedo: false
      })
      return axiosCallBack('创建').then(() => {
        // 添加完成后 commit('createItem') 手动处理本地数据 或 dispatch('selectItem') 重新调用接口
        commit('createItem', payload)
      })
    },
    deleteItemRequest({ dispatch, commit }, payload) {
      // 限制不能重复再次点击
      commit('setCanUndoRedo', {
        canUndo: false,
        canRedo: false
      })
      return axiosCallBack('删除').then(() => {
        // 添加完成后 commit('deleteItem') 手动处理本地数据 或 dispatch('selectItem') 重新调用接口
        commit('deleteItem', payload)
      })
    },
    updateItemRequest({ dispatch, commit }, payload) {
      // 限制不能重复再次点击
      commit('setCanUndoRedo', {
        canUndo: false,
        canRedo: false
      })
      return axiosCallBack('更新').then(() => {
        // 添加完成后 commit('updateItem') 手动处理本地数据 或 dispatch('selectItem') 重新调用接口
        commit('updateItem', payload)
      })
    },
    /**
     * @desc 操作动作声明
     */
    selectItem: async ({ dispatch, commit }, payload) => {
      // 1、模拟调用异步 --> 创建接口
      await dispatch('selectItemRequest', payload)
    },
    createItem: async ({ dispatch, commit }, payload) => {
      // 1、模拟调用异步 --> 创建接口
      await dispatch('createItemRequest', payload)
      // 2、调用成功添加记录
      undoManager.add({
        undo: async () => {
          // 创建时 ——> 撤销步骤是删除
          await dispatch('deleteItemRequest', payload)
        },
        redo: async () => {
          // 创建时 ——> 恢复步骤是创建
          await dispatch('createItemRequest', payload)
        }
      })
      commit('setCanUndoRedo')
    },
    deleteItem: async ({ dispatch, commit }, payload) => {
      // 1、模拟调用异步 --> 删除接口
      await dispatch('deleteItemRequest', payload)
      // 2、调用成功添加记录
      undoManager.add({
        undo: async () => {
          // 删除时 ——> 撤销步骤是创建
          await dispatch('createItemRequest', payload)
        },
        redo: async () => {
          // 删除时 ——> 恢复步骤是删除
          await dispatch('deleteItemRequest', payload)
        }
      })
      commit('setCanUndoRedo')
    },
    updateItem: async ({ dispatch, commit }, payload) => {
      // 1、模拟调用异步 --> 更新接口
      await dispatch('updateItemRequest', payload.new)
      // 2、调用成功添加记录
      undoManager.add({
        undo: async () => {
          // 更新时 ——> 撤销步骤是更新旧的
          await dispatch('updateItemRequest', payload.old)
        },
        redo: async () => {
          // 更新时 ——> 恢复步骤是更新新的
          await dispatch('updateItemRequest', payload.new)
        }
      })
      commit('setCanUndoRedo')
    }
  }
})
