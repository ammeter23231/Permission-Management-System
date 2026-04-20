<template>
  <div class="box-age">
    <div class="title">
      <p>年龄比例</p>
      <img src="../../images/dataScreen-title.png" alt="装饰线" />
    </div>
    <div class="charts-box" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import { REPORT_SCREEN_CHART_READY_KEY } from '../../chartReadiness'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null

const reportScreenChartReady = inject(REPORT_SCREEN_CHART_READY_KEY, () => {})

onMounted(() => {
  if (!chartRef.value) {
    reportScreenChartReady()
    return
  }

  // 性能优化点1：使用 SVG 渲染器，减少 Canvas 内存占用
  myChart = echarts.init(chartRef.value, null, { renderer: 'svg' })

  const option = {
    // 调色盘：采用科技感十足的邻近色+对比色
    color: ['#00eaff', '#007afe', '#ffcc00', '#ff4b7d', '#a256ff'],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#fff',
        fontSize: 14,
        padding: [0, 0, 0, 5],
      },
    },
    series: [
      {
        name: '年龄分布',
        type: 'pie',
        // 环形半径：内部45%，外部75%，留出中间空间
        radius: ['45%', '75%'],
        // 饼图中心位置左移，为右侧图例留出空间
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          // 将白色边框改为深色背景色，增加块状感而非发光感
          borderColor: '#061E3D',
          borderWidth: 3,
        },
        label: {
          show: false, // 隐藏内部文字，依靠 Tooltip 和图例，降低视觉负担
          position: 'center',
        },
        // 高亮样式
        emphasis: {
          scale: true,
          scaleSize: 10,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: [
          { value: 1048, name: '10-18岁' },
          { value: 735, name: '19-30岁' },
          { value: 580, name: '31-45岁' },
          { value: 484, name: '46-60岁' },
          { value: 300, name: '60岁以上' },
        ],
      },
    ],
  }
  myChart.setOption(option)
  reportScreenChartReady()
})

// 性能优化点2：及时销毁
onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped lang="scss">
.box-age {
  width: 100%;
  height: 100%;
  background: url(../../images/dataScreen-main-cb.png) no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;

  .title {
    margin: 15px 0 0 20px;
    p {
      color: white;
      font-size: 20px;
      margin: 0;
    }
  }

  .charts-box {
    flex: 1; /* 自动撑开 */
    min-height: 0;
  }
}
</style>
