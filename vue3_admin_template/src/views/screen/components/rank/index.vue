<template>
  <div class="box6">
    <div class="title">
      <p>热门景区排行</p>
      <img src="../../images/dataScreen-title.png" alt="装饰线" />
    </div>
    <div class="charts-container" ref="chartsRef"></div>
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

  // 渲染优化：对于简单的柱状图，SVG 渲染性能更优
  myChart = echarts.init(chartsRef.value, null, { renderer: 'svg' })

  myChart.setOption({
    title: {
      text: '实时排行情况',
      left: 'center',
      top: '5%',
      textStyle: {
        color: '#00eaff',
        fontSize: 16,
        fontWeight: 'lighter',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '25%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['长城', '故宫', '峨眉山', '黄山', '西湖', '泰山', '华山'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: '#fff', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' },
      },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        name: '热度值',
        type: 'bar',
        data: [50, 65, 45, 80, 95, 70, 60],
        barWidth: 20,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          // 统一色系：青蓝渐变
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00eaff' },
            { offset: 1, color: '#007afe' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          color: '#00eaff',
          fontSize: 12,
        },
        // 背景条增加层次感
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderRadius: [10, 10, 0, 0],
        },
      },
      {
        name: '趋势图',
        type: 'line',
        data: [50, 65, 45, 80, 95, 70, 60],
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#ffcc00', // 使用对比黄色作为趋势线
          width: 2,
          type: 'dashed',
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
.box6 {
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
      font-size: 20px;
      margin: 0;
    }
  }

  .charts-container {
    flex: 1;
    min-height: 0;
  }
}
</style>
