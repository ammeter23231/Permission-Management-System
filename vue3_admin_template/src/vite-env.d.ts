/// <reference types="vite/client" />
//解决ts文件引入vue文件出现红色警告问题
declare module '*.vue' {
  import { defineComponent } from 'vue'
  const Component: ReturnType<typeof defineComponent>
  export default Component
}

import 'axios'
declare module 'axios' {
  interface AxiosRequestConfig {
    /** 为 true 时，业务 code 201/401 不触发全局登出（用于更新头像等可降级接口） */
    skipExpireRedirect?: boolean
  }
}
