/**
 * 与 index.vue 中 defineAsyncComponent 使用相同的动态 import，
 * 提前并行拉取 chunk，缩短第二部分（图表全部就绪）耗时。
 */
let prefetchPromise: Promise<unknown[]> | null = null

export function prefetchScreenChartChunks(): Promise<unknown[]> {
  if (prefetchPromise) return prefetchPromise
  prefetchPromise = Promise.all([
    import('./components/tourist/index.vue'),
    import('./components/sex/index.vue'),
    import('./components/age/index.vue'),
    import('./components/map/index.vue'),
    import('./components/line/index.vue'),
    import('./components/rank/index.vue'),
    import('./components/year/index.vue'),
    import('./components/couter/index.vue'),
  ])
  return prefetchPromise
}
