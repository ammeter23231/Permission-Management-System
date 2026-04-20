<template>
  <div class="breadcrumb-bar">
    <el-icon class="fold-trigger" @click="changeIcon">
      <component :is="LayOutSettingStore.fold ? 'Fold' : 'Expand'"></component>
    </el-icon>
    <el-breadcrumb separator-icon="ArrowRight" class="breadcrumb-trail">
      <el-breadcrumb-item
        v-for="(item, index) in $route.matched"
        :key="index"
        v-show="item.meta.title"
        :to="item.path"
      >
        <span class="breadcrumb-item-inner">
          <el-icon v-if="item.meta.icon" class="bc-icon">
            <component :is="item.meta.icon"></component>
          </el-icon>
          <span class="bc-title">{{ item.meta.title }}</span>
        </span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
// import { ref } from 'vue'
import useLayOutSettingStore from '@/store/modules/setting'
//获取layout配置相关的仓库
let LayOutSettingStore = useLayOutSettingStore()
//获取路由对象
let $route = useRoute()
//点击图标的方法
const changeIcon = () => {
  //图标进行切换
  LayOutSettingStore.fold = !LayOutSettingStore.fold
}
</script>
<script lang="ts">
export default {
  name: 'Breadcrumb',
}
</script>

<style scoped lang="scss">
.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.fold-trigger {
  flex-shrink: 0;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: var(--el-color-primary);
  }
}

.breadcrumb-trail {
  min-width: 0;
  flex: 1;

  :deep(.el-breadcrumb__separator) {
    margin: 0 10px;
  }

  :deep(.el-breadcrumb__item) {
    display: inline-flex;
    align-items: center;
  }
}

.breadcrumb-item-inner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bc-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.bc-title {
  line-height: 1.4;
}
</style>
