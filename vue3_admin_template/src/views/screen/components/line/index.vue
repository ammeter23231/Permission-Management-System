<template>
  <div class="box5">
    <div class="title">
      <p>未来七天游客数量趋势图</p>
      <img src="../../images/dataScreen-title.png" alt="" />
    </div>
    <div class="charts" ref="lineRef"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import { REPORT_SCREEN_CHART_READY_KEY } from '../../chartReadiness'

const lineRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null

const reportScreenChartReady = inject(REPORT_SCREEN_CHART_READY_KEY, () => {})

onMounted(() => {
  if (!lineRef.value) {
    reportScreenChartReady()
    return
  }
  // 性能优化点1：手动指定渲染器为 canvas
  myChart = echarts.init(lineRef.value)

  myChart.setOption({
    title: {
      text: '访问量 (人)',
      textStyle: {
        color: '#00eaff',
        fontSize: 14,
        fontWeight: 'lighter',
      },
      left: 'center',
      top: '5%',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#00eaff',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '5%',
      top: '25%',
      right: '5%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: '#fff' },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#fff' },
      // 性能优化点2：减少分割线数量
      splitNumber: 4,
      splitLine: {
        show: true,
        lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' },
      },
    },
    series: [
      {
        name: '访问人数',
        type: 'line',
        data: [120, 1240, 66, 2299, 321, 890, 1200],
        smooth: true,
        showSymbol: false, // 平时隐藏圆点，悬浮显示，减少绘制节点
        lineStyle: {
          width: 4,
          color: '#00eaff', // 亮青色线条
          shadowColor: '#00eaff', // 线条发光
          shadowBlur: 10,
        },
        areaStyle: {
          // 区域渐变：从青色半透明到全透明
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 234, 255, 0.4)' },
            { offset: 1, color: 'rgba(0, 234, 255, 0)' },
          ]),
        },
      },
    ],
  })
  reportScreenChartReady()
})

// 性能优化点3：及时销毁实例
onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped lang="scss">
.box5 {
  width: 100%;
  height: 100%;
  background: url(../../images/dataScreen-main-cb.png) no-repeat;
  background-size: 100% 100%;
  margin: 0px 20px;
  display: flex;
  flex-direction: column;

  .title {
    margin: 10px 0 0 10px;
    p {
      color: #fff;
      font-size: 20px;
      margin-bottom: 5px;
      letter-spacing: 1px;
    }
  }

  .charts {
    flex: 1; /* 使用 flex 自动占满剩余空间 */
    min-height: 0;
  }
}
</style>
