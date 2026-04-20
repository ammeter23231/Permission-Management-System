<template>
  <div class="box">
    <div class="top">
      <div class="title-wrap">
        <p class="title">实时游客统计</p>
        <p class="title-line"></p>
      </div>
      <p class="total-info">
        可预约总量
        <span>99,999</span>
        人
      </p>
    </div>

    <div class="number-display">
      <span
        v-for="(item, index) in peopleDigits"
        :key="index"
        class="digit-box"
      >
        {{ item }}
      </span>
    </div>

    <div class="charts-container" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, inject } from 'vue'
import { REPORT_SCREEN_CHART_READY_KEY } from '../../chartReadiness'
import * as echarts from 'echarts'
import 'echarts-liquidfill'

const people = ref('215908人')
const chartRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null

// 计算属性：提取纯数字数组
const peopleDigits = computed(() => {
  return people.value.replace('人', '').split('')
})

const reportScreenChartReady = inject(REPORT_SCREEN_CHART_READY_KEY, () => {})

onMounted(() => {
  if (!chartRef.value) {
    reportScreenChartReady()
    return
  }
  myChart = echarts.init(chartRef.value)

  const progress = 0.62 // 模拟当前占比

  myChart.setOption({
    series: [
      {
        type: 'liquidFill',
        data: [
          {
            value: progress,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00f2ff' },
                { offset: 1, color: '#0062ff' },
              ]),
            },
          },
          progress - 0.1,
          progress - 0.15,
        ],
        radius: '80%',
        center: ['50%', '50%'],
        amplitude: 6, // 降低振幅，显得更沉稳
        waveAnimation: true,
        period: 3000, // 动画周期
        backgroundStyle: {
          color: 'rgba(0, 50, 100, 0.2)',
          borderWidth: 1,
          borderColor: '#00f2ff',
        },
        outline: {
          show: true,
          borderDistance: 8,
          itemStyle: {
            borderWidth: 3,
            borderColor: '#00f2ff',
            shadowBlur: 15,
            shadowColor: 'rgba(0, 242, 255, 0.5)',
          },
        },
        label: {
          show: true,
          fontSize: 36,
          color: '#fff',
          fontWeight: 'bold',
          insideColor: '#fff', // 被波浪盖过时的文字颜色
          formatter: () => `占比\n${(progress * 100).toFixed(0)}%`,
          lineHeight: 40,
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
.box {
  width: 100%;
  height: 100%;
  background: url(../../images/dataScreen-main-lb.png) no-repeat;
  background-size: 100% 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .title-wrap {
      .title {
        color: white;
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 2px;
      }
      .title-line {
        width: 68px;
        height: 7px;
        background: url(../../images/dataScreen-title.png) no-repeat;
        background-size: 100% 100%;
        margin-top: 8px;
      }
    }

    .total-info {
      color: #ccc;
      font-size: 16px;
      span {
        color: #f7da47; /* 荧光金，强调重点内容 */
        font-weight: bold;
        padding: 0 5px;
      }
    }
  }

  .number-display {
    margin: 30px 0;
    display: flex;
    justify-content: center;
    gap: 10px;

    .digit-box {
      width: 45px;
      height: 55px;
      background: url(../../images/total.png) no-repeat;
      background-size: 100% 100%;
      color: #29fcff;
      font-size: 32px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      text-shadow: 0 0 10px rgba(41, 252, 255, 0.8);
    }
  }

  .charts-container {
    flex: 1;
    min-height: 0;
  }
}
</style>
