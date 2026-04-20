<template>
  <div class="box7">
    <div class="title">
      <p>年度游客量对比</p>
      <img src="../../images/dataScreen-title.png" alt="装饰线" />
    </div>
    <div class="charts-box" ref="chartsRef"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import { REPORT_SCREEN_CHART_READY_KEY } from '../../chartReadiness'

const chartsRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null

const reportScreenChartReady = inject(REPORT_SCREEN_CHART_READY_KEY, () => {})

onMounted(() => {
  if (!chartsRef.value) {
    reportScreenChartReady()
    return
  }

  // 性能优化：使用 SVG 渲染器处理离散图形
  myChart = echarts.init(chartsRef.value, null, { renderer: 'svg' })

  myChart.setOption({
    title: {
      text: '年度对比分布',
      left: 'center',
      top: '5%',
      textStyle: {
        color: '#00eaff',
        fontSize: 16,
        fontWeight: 'lighter',
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
      formatter: '数据点: {c}',
    },
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: '#fff' },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      show: true,
      axisLabel: { color: '#fff' },
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' },
      },
    },
    series: [
      {
        type: 'scatter',
        data: [
          33, 88, 21, 9, 88, 234, 113, 1231, 674, 3, 88, 33, 21, 888, 3332, 313,
          123, 5, 657, 7,
        ],
        symbol: 'circle', // 使用圆形更具呼吸感
        symbolSize: (data: number) => {
          // 根据数值大小动态计算尺寸，增强视觉表现力
          return Math.sqrt(data) * 1.5 + 5
        },
        label: {
          show: false, // 默认不显示，减少画面杂乱感
          position: 'top',
          color: '#fff',
        },
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            { offset: 0, color: '#00eaff' },
            { offset: 1, color: '#007afe' },
          ]),
          shadowBlur: 10,
          shadowColor: 'rgba(0, 234, 255, 0.5)',
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      },
    ],
  })
  reportScreenChartReady()
})

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped lang="scss">
.box7 {
  width: 100%;
  height: 100%;
  background: url(../../images/dataScreen-main-cb.png) no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;

  .title {
    margin: 15px 0 0 15px;
    p {
      color: white;
      font-size: 18px;
      margin: 0;
    }
  }

  .charts-box {
    flex: 1;
    min-height: 0;
  }
}
</style>
