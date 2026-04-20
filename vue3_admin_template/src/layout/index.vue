<template>
  <div class="layout_container">
    <!-- 左侧菜单 -->
    <div class="layout_slider">
      <Logo></Logo>
      <!-- 展示菜单 -->
      <!-- 滚动组件 -->
      <el-scrollbar class="scrollbar">
        <!-- 菜单组件-->
        <el-menu
          :collapse="LayOutSettingStore.fold ? true : false"
          :default-active="$route.path"
          background-color="#001529"
          text-color="white"
          active-text-color="yellowgreen"
        >
          <!--根据路由动态生成菜单-->
          <Menu :menuList="userStore.menuRoutes"></Menu>
        </el-menu>
      </el-scrollbar>
    </div>
    <!-- 顶部导航 -->
    <div
      class="layout_tabbar"
      :class="{ fold: LayOutSettingStore.fold ? true : false }"
    >
      <!-- layout组件的顶部导航tabbar -->
      <Tabbar></Tabbar>
    </div>
    <!-- 内容展示区域 -->
    <div
      class="layout_main"
      :class="{ fold: LayOutSettingStore.fold ? true : false }"
    >
      <Main></Main>
    </div>
  </div>
</template>

<script setup lang="ts">
//获取路由对象
import { useRoute } from 'vue-router'
//引入左侧菜单logo子组件
import Logo from './logo/index.vue'
//引入菜单组件
import Menu from './menu/index.vue'
//右侧内容展示区域
import Main from './main/index.vue'
//引入顶部tabbar组件
import Tabbar from './tabbar/index.vue'
//获取用户相关的小仓库
import useUserStore from '@/store/modules/user'
import useLayOutSettingStore from '@/store/modules/setting'
let userStore = useUserStore()
//获取layout配置仓库

let LayOutSettingStore = useLayOutSettingStore()

//获取路由对象
let $route = useRoute()
</script>

<script lang="ts">
export default {
  name: 'Layout',
}
</script>

<style scoped lang="scss">
.layout_container {
  width: 100%;
  height: 100vh;

  .layout_slider {
    color: white;
    width: $base-menu-width;
    height: 100vh;
    background: $base-menu-background;
    transition: all 0.3s;

    .scrollbar {
      width: 100%;
      height: calc(100vh - $base-menu-logo-height);

      .el-menu {
        border-right: none;
        // 与主内容区上内边距一致：Logo 底边 + 本值 = Tabbar 底边 + 主区域上 padding，首条菜单与右侧卡片/表单区域顶部对齐
        padding-top: $layout-main-padding;
        box-sizing: border-box;
      }
    }
  }

  .layout_tabbar {
    position: fixed;
    width: calc(100% - $base-menu-width);
    height: $base-tabbar-height;
    top: 0px;
    left: $base-menu-width;
    transition: all 0.3s;

    &.fold {
      width: calc(100vw - $base-menu-min-width);
      left: $base-menu-min-width;
    }
  }

  .layout_main {
    // 让元素脱离文档流：它不再像文字一样按顺序排队，而是像一张贴纸，“漂浮”在页面上。
    // 找爹原则：它会寻找距离自己最近的、设置了 position（只要不是 static 即可）的父级元素作为基准。
    // 如果往上找一圈都没找到，就以浏览器窗口（html）为准。
    // 坐标定位：通过 top、bottom、left、right 来决定具体贴在哪。top:从父容器的上边缘向下移动多少距离
    position: absolute;
    width: calc(100% - $base-menu-width);
    height: calc(100vh - $base-tabbar-height);
    left: $base-menu-width; // 从父容器的左边缘向右移动 $base-menu-width 这么宽的距离
    top: $base-tabbar-height;
    padding: $layout-main-padding;
    // overflow: auto;作用：
    // 作用：当右下侧内容区域（即layout_main对应的标签）的东西太多、太长，超出了屏幕高度时，它会自动出现滚动条。
    // 效果：确保你的页面不会因为内容太多而把整个布局撑乱，滚动条只会在内容区域内部出现，而顶部的 Tabbar 和左侧的 Menu 依然固定不动。
    overflow: auto;
    // transition: all 0.3s; 它告诉浏览器：“无论这个盒子的宽度、位置发生什么变化，不要瞬间完成，请花 0.3 秒 慢慢变。”
    // 效果：当你点击折叠按钮，菜单收缩、内容区变宽时，用户会看到一个平滑的移动效果，而不是生硬的闪现。
    transition: all 0.3s;

    &.fold {
      width: calc(100vw - $base-menu-min-width);
      left: $base-menu-min-width;
    }
  }
}
</style>
