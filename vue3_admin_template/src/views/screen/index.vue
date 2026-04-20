<template>
  <div class="container">
    <!-- 数据大屏展示内容区域 -->
    <div class="screen" ref="screen">
      <!-- 数据大屏顶部 -->
      <div class="top">
        <Top />
      </div>
      <div class="bottom">
        <div class="left">
          <div class="tourist"><Tourist /></div>
          <div class="sex"><Sex /></div>
          <div class="age"><Age /></div>
        </div>
        <div class="center">
          <div class="map"><Map /></div>
          <div class="line"><Line /></div>
        </div>
        <div class="right">
          <div class="rank"><Rank /></div>
          <div class="year"><Year /></div>
          <div class="count"><Counter /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, defineAsyncComponent, provide } from 'vue'
import Top from './components/top/index.vue'
import {
  REPORT_SCREEN_CHART_READY_KEY,
  SCREEN_CHART_SLOT_COUNT,
} from './chartReadiness'
import { prefetchScreenChartChunks } from './prefetchCharts'

// 路由 chunk 一执行就立刻并行预取各图表子模块（与下方异步组件共用浏览器缓存）
prefetchScreenChartChunks()

// 图表区异步加载：首屏 chunk 不含 ECharts，第一部分耗时会明显下降（图表随后在各自 chunk 就绪后渲染）
const Tourist = defineAsyncComponent(() => import('./components/tourist/index.vue'))
const Sex = defineAsyncComponent(() => import('./components/sex/index.vue'))
const Age = defineAsyncComponent(() => import('./components/age/index.vue'))
const Map = defineAsyncComponent(() => import('./components/map/index.vue'))
const Line = defineAsyncComponent(() => import('./components/line/index.vue'))
const Rank = defineAsyncComponent(() => import('./components/rank/index.vue'))
const Year = defineAsyncComponent(() => import('./components/year/index.vue'))
const Counter = defineAsyncComponent(() => import('./components/couter/index.vue'))

let phase1Complete = false
let chartReadyCount = 0

function tryFinishPhase2() {
  if (!phase1Complete || chartReadyCount < SCREEN_CHART_SLOT_COUNT) return
  performance.mark('screen-phase2-end')
  try {
    performance.measure('screen-phase2', 'screen-phase1-end', 'screen-phase2-end')
    const list = performance.getEntriesByName('screen-phase2', 'measure')
    const m = list[list.length - 1]
    if (m) {
      console.log('[数据大屏] 第二部分耗时(ms):', Math.round(m.duration))
    }
  } catch {
    /* 无 phase1-end 等情况 */
  }
}

provide(REPORT_SCREEN_CHART_READY_KEY, () => {
  chartReadyCount += 1
  tryFinishPhase2()
})

//获取数据大屏展示内容盒子的DOM元素
let screen = ref()
onMounted(async () => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
  await nextTick()
  // 连续两帧 rAF：等浏览器完成布局并真正画完一帧，再记「壳层已上屏」（比单纯 onMounted 更接近可见时刻）
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
  performance.mark('screen-phase1-end')
  try {
    performance.measure('screen-phase1', 'screen-phase1-start', 'screen-phase1-end')
    const list = performance.getEntriesByName('screen-phase1', 'measure')
    const m = list[list.length - 1]
    if (m) {
      console.log('[数据大屏] 第一部分耗时(ms):', Math.round(m.duration))
    }
  } catch {
    /* 无起点 mark 等情况 */
  }
  phase1Complete = true
  tryFinishPhase2()
})
//定义大屏缩放比例
function getScale(w = 1920, h = 1080) {
  const ww = window.innerWidth / w
  const wh = window.innerHeight / h
  return ww < wh ? ww : wh
}
//监听视口变化
window.onresize = () => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
}
</script>

<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  background: url(./images/bg.png) no-repeat;
  background-size: cover;

  .screen {
    position: fixed;
    width: 1920px;
    height: 1080px;
    left: 50%;
    top: 50%;
    transform-origin: left top;

    .top {
      width: 100%;
      height: 40px;
    }

    .bottom {
      display: flex;

      .right {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 40px;

        .rank {
          flex: 1.5;
        }

        .year {
          flex: 1;
        }

        .count {
          flex: 1;
        }
      }

      .left {
        flex: 1;
        height: 1040px;
        display: flex;
        flex-direction: column;

        .tourist {
          flex: 1.2;
        }

        .sex {
          flex: 1;
        }

        .age {
          flex: 1;
        }
      }

      .center {
        flex: 1.5;
        display: flex;
        flex-direction: column;

        .map {
          flex: 4;
        }

        .line {
          flex: 1;
        }
      }
    }
  }
}
</style>
