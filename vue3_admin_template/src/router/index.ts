//通过vue-router插件实现模板路由配置
import { createRouter, createWebHashHistory } from 'vue-router'
import { constantRoute } from './routes'
//创建路由器
const router = createRouter({
  //路由模式hash
  history: createWebHashHistory(),
  routes: constantRoute,
  //滚动行为
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    }
  },
})

// 数据大屏「第一部分」计时起点：从用户进入 /screen 路由开始（与 chunk 下载、组件渲染无关，仅表示导航开始）
router.beforeEach((to) => {
  if (to.name === 'Screen') {
    performance.mark('screen-phase1-start')
  }
})

export default router
