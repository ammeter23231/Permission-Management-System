<template>
  <div class="box-sex">
    <div class="title">
      <p>男女比例</p>
      <img src="../../images/dataScreen-title.png" alt="装饰线" />
    </div>

    <div class="sex-icons">
      <div class="man">
        <img src="../../images/man.png" alt="男士" />
      </div>
      <div class="woman">
        <img src="../../images/woman.png" alt="女士" />
      </div>
    </div>

    <div class="rate-text">
      <span class="man-val">男士 58%</span>
      <span class="woman-val">女士 42%</span>
    </div>

    <div class="charts-container" ref="chartRef"></div>
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

  // 性能优化点1：对于这种极其简单的图形，强制使用 SVG 渲染器
  myChart = echarts.init(chartRef.value, null, { renderer: 'svg' })

  myChart.setOption({
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, type: 'category' },
    grid: { left: 50, right: 50, top: 0, bottom: 0 },
    series: [
      {
        // 男士进度条
        type: 'bar',
        data: [58],
        barWidth: 18,
        z: 20,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#007afe' },
            { offset: 1, color: '#00e4ff' },
          ]),
          borderRadius: 10,
        },
      },
      {
        // 女士背景条
        type: 'bar',
        data: [100],
        barWidth: 18,
        barGap: '-100%',
        itemStyle: {
          color: 'rgba(255, 75, 125, 0.2)', // 降低底层透明度，增加高级感
          borderColor: '#ff4b7d', // 增加描边
          borderWidth: 1,
          borderRadius: 10,
        },
      },
    ],
  })
  reportScreenChartReady()
})

// 性能优化点2：卸载时释放内存
onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped lang="scss">
.box-sex {
  width: 100%;
  height: 100%;
  background: url(../../images/dataScreen-main-cb.png) no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;

  .title {
    p {
      color: #fff;
      font-size: 20px;
      margin: 0;
    }
    img {
      margin-top: 5px;
    }
  }

  .sex-icons {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin-top: 30px;

    .man,
    .woman {
      width: 110px;
      height: 115px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: transform 0.3s;
      &:hover {
        transform: scale(1.05);
      }
    }

    .man {
      background: url(../../images/man-bg.png) no-repeat center;
    }
    .woman {
      background: url(../../images/woman-bg.png) no-repeat center;
    }
  }

  .rate-text {
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
    margin-top: 15px;
    font-size: 16px;

    .man-val {
      color: #00e4ff;
      text-shadow: 0 0 10px rgba(0, 228, 255, 0.5);
    }
    .woman-val {
      color: #ff4b7d;
      text-shadow: 0 0 10px rgba(255, 75, 125, 0.5);
    }
  }

  .charts-container {
    height: 40px;
    margin-top: 10px;
  }
}
</style>
