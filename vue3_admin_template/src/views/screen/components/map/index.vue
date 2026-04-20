<template>
  <div class="map-container" ref="mapRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import { REPORT_SCREEN_CHART_READY_KEY } from '../../chartReadiness'
import * as echarts from 'echarts'
import chinaJSON from './china.json' // 建议使用精简版 china.json

const mapRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const reportScreenChartReady = inject(REPORT_SCREEN_CHART_READY_KEY, () => {})

// 注册地图（建议提前在 main.ts 或单独文件统一注册，避免重复）
echarts.registerMap('china', chinaJSON as any)

onMounted(() => {
  if (!mapRef.value) {
    reportScreenChartReady()
    return
  }

  myChart = echarts.init(mapRef.value, null, { renderer: 'canvas' })

  const option = {
    // backgroundColor: '#020B1A',

    tooltip: {
      show: true,
      // backgroundColor: 'rgba(15, 25, 45, 0.92)',
      borderWidth: 0,
      padding: [8, 12],
      textStyle: {
        color: '#E0F7FA',
        fontSize: 13,
      },
    },

    geo: {
      map: 'china',
      roam: true,
      zoom: 1.18,
      top: '12%',
      left: 'center',
      label: {
        show: true,
        color: '#C0E0FF',
        fontSize: 11,
        fontWeight: 'normal',
        textShadow: '0 0 3px rgba(0, 212, 255, 0.6)',
      },
      itemStyle: {
        areaColor: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#041B3D' },
            { offset: 1, color: '#000814' },
          ],
        },
        borderColor: 'rgba(0, 180, 255, 0.55)',
        borderWidth: 0.8,
        shadowColor: 'rgba(0, 212, 255, 0.35)',
        shadowBlur: 7,
        opacity: 0.92,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#1E88E5',
          shadowBlur: 12,
          shadowColor: 'rgba(30, 136, 229, 0.7)',
        },
        label: {
          show: true,
          color: '#FFFFFF',
          fontSize: 13,
          textShadow: '0 0 6px #00D4FF',
        },
      },
    },

    series: [
      {
        type: 'lines',
        zlevel: 1,
        progressive: 800, // 开启渐进渲染
        progressiveThreshold: 1200,
        effect: {
          show: true,
          period: 6, // 稍慢一点，降低 GPU 压力
          trailLength: 0.55,
          color: '#40C4FF',
          symbolSize: 2.4, // 缩小特效点
        },
        lineStyle: {
          color: '#17BDF7',
          width: 1,
          opacity: 0.18, // 更低的基础透明度
          curveness: 0.28,
        },
        data: [
          {
            coords: [
              [116.405285, 39.904989],
              [119.306239, 26.075302],
            ],
            lineStyle: { color: '#00E0FF' },
          },
          {
            coords: [
              [116.405285, 39.904989],
              [114.298572, 30.584355],
            ],
            lineStyle: { color: '#FFD740' },
          },
          // 可继续添加更多线路...
        ],
      },

      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        progressive: 400,
        progressiveThreshold: 800,
        rippleEffect: {
          brushType: 'stroke',
          scale: 5.2,
        },
        label: { show: false },
        itemStyle: {
          color: '#E0FFFF',
        },
        data: [
          { value: [116.405285, 39.904989], itemStyle: { color: '#00E0FF' } },
          { value: [119.306239, 26.075302] },
          { value: [114.298572, 30.584355] },
        ],
      },
    ],

    // 全局动画阈值，元素过多时自动降级
    animationThreshold: 1800,
  }

  myChart.setOption(option, true)
  reportScreenChartReady()

  // 可选：窗口 resize 防抖处理
  const resizeHandler = () => myChart?.resize()
  window.addEventListener('resize', resizeHandler)
  // 记得在销毁时移除（见下方）
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })
})

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
