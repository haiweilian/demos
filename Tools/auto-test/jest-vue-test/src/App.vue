<template>
  <div class="w-screen h-screen flex flex-col justify-evenly">
    <div class="flex justify-evenly items-center">
      <Button>默认按钮</Button>
      <Button type="primary">普通按钮</Button>
      <Button type="success">成功按钮</Button>
      <Button type="warning">警告按钮</Button>
      <Button type="danger">危险按钮</Button>
    </div>
    <div class="flex justify-evenly items-center">
      <Button size="lg">大按钮</Button>
      <Button>中按钮</Button>
      <Button size="sm">小按钮</Button>
    </div>
    <div class="flex justify-evenly items-center">
      <Button icon="icon-rocket">自定义图标</Button>
      <Button type="primary" icon="icon-rocket">自定义图标</Button>
      <Button type="success" icon="icon-rocket">自定义图标</Button>
      <Button type="warning" icon="icon-rocket">自定义图标</Button>
      <Button type="danger" icon="icon-rocket">自定义图标</Button>
    </div>
    <div class="flex justify-evenly items-center">
      <Button :loading="true" />
      <Button :loading="true" loadingText="正在加载中" />
      <Button
        :loading="true"
        loadingText="自定义加载图标"
        loadingIcon="icon-reload"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from './components/Button.tsx';

export default defineComponent({
  name: 'App',

  components: {
    Button,
  },
});
</script>
