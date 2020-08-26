<template>
  <div>
    <el-row>
      <el-col :span="4">
        <el-badge :value="numUndo" class="item">
          <el-button type="success" :disabled="!canUndo" @click="handerUndo">撤销</el-button>
        </el-badge>
      </el-col>
      <el-col :span="4">
        <el-badge :value="numRedo" class="item">
          <el-button type="info" :disabled="!canRedo" @click="handerRedo">恢复</el-button>
        </el-badge>
      </el-col>
      <el-col :span="4">
        <el-button type="danger" @click="handerClear">清空</el-button>
      </el-col>
    </el-row>
    <el-table :data="todos" style="width: 100%">
      <el-table-column label="日期" width="400">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="400">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>姓名: {{ scope.row.name }}</p>
            <p>住址: {{ scope.row.address }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.name }}</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot="header" slot-scope="scope">
          <el-button type="primary" @click="handerCreateItem(scope.$index, scope.row)">添加</el-button>
        </template>
        <template slot-scope="scope">
          <el-button type="danger" @click="handerDeleteItem(scope.$index, scope.row)">删除</el-button>
          <el-button @click="handerUpdateItem(scope.$index, scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { v4 as uuid } from 'uuid'
import { mapState, mapActions } from 'vuex'
export default {
  data() {
    return {}
  },
  created() {
    this.selectItem()
  },
  computed: {
    ...mapState(['todos', 'canUndo', 'canRedo', 'numUndo', 'numRedo'])
  },
  methods: {
    ...mapActions(['handerUndo', 'handerRedo', 'handerClear', 'selectItem', 'createItem', 'deleteItem', 'updateItem']),
    handerCreateItem() {
      this.createItem({ id: uuid(), date: '2016-05-02', name: '王小虎' + this.todos.length, address: '上海市普陀区金' })
    },
    handerDeleteItem(index, data) {
      this.deleteItem(data)
    },
    handerUpdateItem(index, data) {
      this.updateItem({
        old: Object.assign({}, data),
        new: Object.assign({}, data, { name: data.name + 1 })
      })
    }
  }
}
</script>
