<template>
  <div class="category-container">
    <div class="category-form">
      <div class="form-item">
        <label>一级分类</label>
        <select
          :disabled="scene != 0"
          v-model="categoryStore.c1Id"
          @change="handler"
          class="native-select"
        >
          <option :value="undefined" disabled>请选择一级分类</option>
          <option v-for="c1 in categoryStore.c1Arr" :key="c1.id" :value="c1.id">
            {{ c1.name }}
          </option>
        </select>
      </div>

      <div class="form-item">
        <label>二级分类</label>
        <select
          :disabled="scene != 0"
          v-model="categoryStore.c2Id"
          @change="handler1"
          class="native-select"
        >
          <option :value="undefined" disabled>请选择二级分类</option>
          <option v-for="c2 in categoryStore.c2Arr" :key="c2.id" :value="c2.id">
            {{ c2.name }}
          </option>
        </select>
      </div>

      <div class="form-item">
        <label>三级分类</label>
        <select
          :disabled="scene != 0"
          v-model="categoryStore.c3Id"
          class="native-select"
        >
          <option :value="undefined" disabled>请选择三级分类</option>
          <option v-for="c3 in categoryStore.c3Arr" :key="c3.id" :value="c3.id">
            {{ c3.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import useCategoryStore from '@/store/modules/category'
let categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.getC1()
})

const handler = () => {
  categoryStore.resetLevel(1)
  categoryStore.getC2()
}

const handler1 = () => {
  categoryStore.resetLevel(2)
  categoryStore.getC3()
}

defineProps(['scene'])
</script>

<style scoped>
.category-container {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: var(--el-box-shadow-light);
  margin-bottom: 15px;
}

.category-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-item label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

/* 原生 Select 的样式美化 */
.native-select {
  height: 32px;
  min-width: 200px;
  padding: 0 10px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-blank);
  color: var(--el-text-color-regular);
  outline: none;
  cursor: pointer;
  transition: border-color var(--el-transition-duration-fast);
}

.native-select:focus {
  border-color: var(--el-color-primary);
}

.native-select:disabled {
  background-color: var(--el-fill-color-light);
  cursor: not-allowed;
  color: var(--el-text-color-disabled);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .category-form {
    flex-direction: column;
    gap: 15px;
  }
  .form-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .native-select {
    width: 100%;
  }
}
</style>
