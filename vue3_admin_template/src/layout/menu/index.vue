<template>
  <template v-for="(item, index) in menuList" :key="item.path">
    <!--没有子路由-->
    <template v-if="!item.children">
      <el-menu-item
        :index="item.path"
        v-if="!item.meta.hidden"
        @click="goRoute"
        @mouseenter="onMenuItemEnter(item.path)"
      >
        <el-icon>
          <component :is="item.meta.icon"></component>
        </el-icon>
        <template #title>
          <span>{{ item.meta.title }}</span>
        </template>
      </el-menu-item>
    </template>
    <!-- 有子路由：按「未隐藏」的子项数量分支，避免「首页+隐藏 profile」被当成多级子菜单导致与「数据大屏」缩进不一致 -->
    <template v-else-if="item.children">
      <template v-if="visibleChildren(item).length === 1">
        <el-menu-item
          :index="visibleChildren(item)[0].path"
          @click="goRoute"
          @mouseenter="onMenuItemEnter(visibleChildren(item)[0].path)"
        >
          <el-icon>
            <component :is="visibleChildren(item)[0].meta.icon"></component>
          </el-icon>
          <template #title>
            <span>{{ visibleChildren(item)[0].meta.title }}</span>
          </template>
        </el-menu-item>
      </template>
      <!-- 多个可见子路由：多级菜单 -->
      <el-sub-menu
        :index="item.path"
        v-else-if="visibleChildren(item).length > 1"
      >
        <template #title>
          <el-icon>
            <component :is="item.meta.icon"></component>
          </el-icon>
          <span>{{ item.meta.title }}</span>
        </template>
        <Menu :menuList="visibleChildren(item)"></Menu>
      </el-sub-menu>
    </template>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { prefetchScreenChartChunks } from '@/views/screen/prefetchCharts'
//获取父组件传递过来的全部路由数组
defineProps(['menuList'])

/** 菜单展示用：过滤 meta.hidden，避免隐藏子路由把「单页菜单」误判成多级 */
const visibleChildren = (item: any): any[] => {
  if (!item.children?.length) return []
  return item.children.filter((c: any) => !c.meta?.hidden)
}

//获取路由器对象
let $router = useRouter()
//点击菜单的回调
const goRoute = (vc: any) => {
  //路由跳转
  $router.push(vc.index)
}

/** 悬停「数据大屏」时预取图表 chunk，点击后第二部分更短 */
const onMenuItemEnter = (path: string) => {
  if (path === '/screen') prefetchScreenChartChunks()
}
</script>
<script lang="ts">
export default {
  name: 'Menu',
}
</script>

<style scoped></style>
