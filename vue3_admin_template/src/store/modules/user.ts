//创建用户相关的小仓库
import { defineStore } from 'pinia'
//引入接口
import { reqLogin, reqUserInfo, reqLogout, reqUpdateAvatar } from '@/api/user'
import type {
  loginFormData,
  loginResponseData,
  userInfoReponseData,
} from '@/api/user/type'
import type { UserState } from './types/type'
//引入操作本地存储的工具方法
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'
import {
  getLocalAvatarOverride,
  setLocalAvatarOverride,
  clearLocalAvatarOverride,
} from '@/utils/userAvatarLocal'
import { normalizeAvatarUrl } from '@/utils/avatar'
import pinia from '@/store'
import useLayOutSettingStore from '@/store/modules/setting'
//引入路由(常量路由)
import { constantRoute, asnycRoute, anyRoute } from '@/router/routes'

//引入深拷贝方法
import cloneDeep from 'lodash/cloneDeep'
import router from '@/router'
// 用于过滤当前用户需要展示的异步路由
function filterAsyncRoute(asnycRoute: any, routes: any) {
  return asnycRoute.filter((item: any) => {
    if (routes.includes(item.name)) {
      if (item.children && item.children.length > 0) {
        // 硅谷333账号:product\trademark\attr\sku
        item.children = filterAsyncRoute(item.children, routes)
      }
      return true
    }
  })
}

//创建用户小仓库
const useUserStore = defineStore('User', {
  //小仓库存储数据地方
  // state: (): UserState => {
  state: (): UserState => {
    return {
      token: GET_TOKEN(), //用户唯一标识token
      menuRoutes: constantRoute, //仓库存储生成菜单需要数组(路由)
      username: '',
      avatar: '',
      //存储当前用户是否包含某一个按钮
      buttons: [],
      roleIds: [], // 新增
    }
  },
  //异步|逻辑的地方
  actions: {
    // 不需要发请求的纯清理函数。在拦截器里会调用这个函数
    clearUserData() {
      this.token = ''
      this.username = ''
      this.avatar = ''
      this.buttons = []
      this.roleIds = []
      this.menuRoutes = constantRoute // 重置为基础路由
      REMOVE_TOKEN() // 清除本地存储
    },
    //用户登录的方法
    async userLogin(data: loginFormData) {
      //登录请求
      const result: loginResponseData = await reqLogin(data)
      //登录请求:成功200->token
      //登录请求:失败201->登录失败错误的信息
      if (result.code == 200) {
        //pinia仓库存储一下token
        //由于pinia|vuex存储数据其实利用js对象
        this.token = result.data as string
        //本地存储持久化存储一份
        SET_TOKEN(result.data as string)
        // 登录后立即按偏好应用暗黑模式（含首次登录默认暗黑）
        useLayOutSettingStore(pinia).syncDarkFromPreference()
        //能保证当前async函数返回一个成功的promise
        return 'ok'
      } else {
        return Promise.reject(new Error(result.data))
      }
    },
    //获取用户信息方法
    async userInfo() {
      //获取用户信息进行存储仓库当中[用户头像、名字]
      const result: userInfoReponseData = await reqUserInfo()
      console.log('后端返回的用户原始数据:', result.data)
      //如果获取用户信息成功，存储一下用户信息
      if (result.code == 200) {
        this.username = result.data.name
        this.avatar = normalizeAvatarUrl(result.data.avatarUrl || result.data.avatar)
        const localAvatar = getLocalAvatarOverride(this.username)
        if (localAvatar) this.avatar = normalizeAvatarUrl(localAvatar)
        this.buttons = result.data.buttons
        this.roleIds = result.data.roleIds // 新增：存储当前用户的角色ID列表
        // 计算当前用户需要展示的异步路由
        const userAsyncRoute = filterAsyncRoute(
          cloneDeep(asnycRoute),
          result.data.routes,
        )
        //菜单需要的数据整理完毕
        this.menuRoutes = [...constantRoute, ...userAsyncRoute, anyRoute]
        //目前路由器管理的只有常量路由:用户计算完毕异步路由、任意路由动态追加
        ;[...userAsyncRoute, anyRoute].forEach((route: any) => {
          router.addRoute(route)
        })
        return 'ok'
      } else {
        return Promise.reject(new Error(result.message))
      }
    },
    /**
     * 更新头像：优先调用服务端；接口不存在或失败时写入本机缓存，保证界面可用。
     * @returns 'ok' | 'local'
     */
    async updateUserAvatar(avatar: string): Promise<'ok' | 'local'> {
      if (!avatar?.trim()) {
        return Promise.reject(new Error('头像地址不能为空'))
      }
      const normalizedAvatar = normalizeAvatarUrl(avatar)
      try {
        const result = await reqUpdateAvatar(normalizedAvatar)
        if (result.code == 200) {
          const serverAvatar =
            typeof result.data === 'string'
              ? result.data
              : result?.data?.avatarUrl || result?.data?.avatar || normalizedAvatar
          this.avatar = normalizeAvatarUrl(serverAvatar)
          clearLocalAvatarOverride(this.username)
          return 'ok'
        }
        throw new Error(result.message || '更新失败')
      } catch {
        if (this.username) {
          setLocalAvatarOverride(this.username, normalizedAvatar)
          this.avatar = normalizedAvatar
          return 'local'
        }
        return Promise.reject(new Error('无法保存头像'))
      }
    },
    //退出登录
    async userLogout() {
      try {
        // 尝试通知服务器注销
        await reqLogout()
        // 无论请求是否成功，最终都要执行 finally 里的清理逻辑
      } catch (error) {
        // 即使后端接口报错（如 Token 过期），前端也继续向下执行清理
      } finally {
        this.clearUserData() // 调用你写的清理函数
        REMOVE_TOKEN() // 必须保证这行代码被执行
        window.location.reload() // 关键：彻底重置整个应用的状态，清空内存中的动态路由
      }
      return 'ok'

      //退出登录请求
      // const result: any = await reqLogout()
      // if (result.code == 200) {
      //   //目前没有mock接口:退出登录接口(通知服务器本地用户唯一标识失效)
      //   this.token = ''
      //   this.username = ''
      //   this.avatar = ''
      //   REMOVE_TOKEN()
      //   return 'ok'
      // } else {
      //   return Promise.reject(new Error(result.message))
      // }
    },
  },
  getters: {},
})
//对外暴露获取小仓库方法
export default useUserStore
