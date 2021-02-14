<template>
  <div id="app">
    <div v-if="error">{{ error }}</div>
    <Suspense v-else>
    	<template #default>
    		<User />
    	</template>
			<template #fallback>
    		Loading...
    	</template>
    </Suspense>
  </div>
</template>
<script>
import User from "./Suspense/User.vue";
import { onErrorCaptured, ref } from "vue";
export default {
	components: {
  	User,
  },
  setup() {
  	const error = ref(null);
    onErrorCaptured(e =>{
    	error.value = e;
      // 不对错误进行拦截
      return true;
    });
    return { error };
  },
}
</script>
