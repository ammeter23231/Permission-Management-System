import type { InjectionKey } from 'vue'

/** 子组件在图表 setOption（及异步取数）完成后调用，用于统计第二部分耗时 */
export const REPORT_SCREEN_CHART_READY_KEY: InjectionKey<() => void> = Symbol(
  'reportScreenChartReady',
)

/** 须与 index 中图表区异步组件个数一致 */
export const SCREEN_CHART_SLOT_COUNT = 8
