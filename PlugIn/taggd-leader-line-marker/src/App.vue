<template>
  <div id="app">
    <div id="taggd">
      <img ref="img" width="100%" src="./assets/wallhaven-eylvor.jpg" alt />
    </div>
    <div id="form">
      <el-form label-width="100px" inline>
        <el-form-item label="x">
          <el-input :value="form.x" />
        </el-form-item>
        <el-form-item label="y">
          <el-input :value="form.y" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handerSave">保存</el-button>
          <el-button type="danger" @click="handerDelete">删除</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="name" label="名称" width="180">
          <template slot-scope="scope">
            <span :uuid="scope.row.uuid">{{scope.$index}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="180"></el-table-column>
        <el-table-column prop="desc" label="描述" width></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { Taggd, Tag } from "taggd";
import { v4 as uuid } from "uuid";
import LeaderLine from "leader-line";
export default {
  name: "App",
  data() {
    return {
      tag: null,
      taggd: null,
      list: [],
      form: {
        name: "",
        desc: "",
      },
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initTaggd();
    });
  },
  methods: {
    /**
     * 初始化标记
     */
    initTaggd() {
      // 初始化
      this.taggd = new Taggd(this.$refs.img, { show: "click", hide: "click" }, []);

      // 开启编辑
      this.taggd.enableEditorMode();

      // 事件监听-添加
      this.taggd.on("taggd.tag.added", (taggd, tag) => {
        console.log(taggd, tag, json);

        // 保存当前的标记，设置标识数据，因为不能改变渲染结构，只能自己处理后续操作。
        Tag.setElementAttributes(tag.buttonElement, {
          uuid: uuid(),
        });

        // 保存数据
        const json = tag.toJSON();
        this.list.push({
          ...json.position,
          ...json.buttonAttributes,
          ...json.popupAttributes,
        });
        this.createLeaderLine(json.buttonAttributes.uuid);

        // 默认展示
        tag.show();
      });

      // 事件监听-展示
      this.taggd.on("taggd.tag.shown", (taggd, tag) => {
        const json = tag.toJSON();
        console.log(taggd, tag, json);

        // 当打开标记时，展示当前信息
        this.tag = tag;
        this.form = this.list.find((item) => item.uuid === json.buttonAttributes.uuid);
      });
    },
    /**
     * 处理添加
     */
    handerSave() {
      let index = this.list.findIndex((item) => item.uuid === this.form.uuid);
      this.list.splice(index, 1, this.form);
    },
    /**
     * 处理删除
     */
    handerDelete() {
      this.list = this.list.filter((item) => item.uuid !== this.form.uuid);
      this.taggd.deleteTag(this.taggd.tags.indexOf(this.tag));
      this.tag = null;
      this.form = {};
    },
    /**
     * 创建连接线
     */
    createLeaderLine(id) {
      this.$nextTick(() => {
        new LeaderLine(LeaderLine.mouseHoverAnchor(document.querySelector(`#taggd [uuid="${id}"]`), "draw"), document.querySelector(`#form [uuid="${id}"]`));
        new LeaderLine(LeaderLine.mouseHoverAnchor(document.querySelector(`#form [uuid="${id}"]`), "draw"), document.querySelector(`#taggd [uuid="${id}"]`));
      });
    },
  },
};
</script>
<style>
* {
  margin: 0;
  padding: 0px;
}

#app {
  display: flex;
}

#taggd {
  width: 50vw;
  height: 100vh;
}

#form {
  width: 50vw;
  text-align: center;
}

/* 隐藏掉默认创建的元素 */
.taggd__popup {
  display: none;
}
.taggd__button {
  background-color: rgba(0, 0, 0, 1) !important;
  border-radius: 50%;
}
</style>
