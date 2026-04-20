<template>
  <div class="logo" v-if="setting.logoHidden">
    <img :src="setting.logo" alt="" />
    <p>{{ setting.title }}</p>
  </div>
</template>

<script setup lang="ts">
//引入设置标题与logo这配置文件，src下的setting.ts
import setting from '@/setting'
</script>
<script lang="ts">
export default {
  name: 'Logo',
}
</script>
<style scoped lang="scss">
.logo {
  width: 100%;
  height: $base-menu-logo-height;
  color: white;
  display: flex;
  align-items: center;
  padding: 20px;
  img {
    width: 50px;
    height: 50px;
    margin-top: 30px;
    margin-right: 10px;
    margin-left: 5px;
  }
  p {
    font-size: $base-logo-title-fontSize;
    margin-left: 10px;
    margin-top: 30px;
  }
}
</style>
