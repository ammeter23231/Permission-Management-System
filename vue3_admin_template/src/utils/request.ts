//进行axios二次封装:使用请求与响应拦截器
import axios from 'axios'
import { ElMessage } from 'element-plus'
//引入用户相关的仓库
import useUserStore from '@/store/modules/user'
import router from '@/router'
//第一步:利用axios对象的create方法,创建axios实例(其他的配置:基础路径、超时的时间)
const request = axios.create({
  //基础路径
  baseURL: import.meta.env.VITE_APP_BASE_API, //基础路径上会携带/api
  timeout: 5000, //超时的时间的设置
})

//第二步:添加请求拦截器
request.interceptors.request.use((config) => {
  //获取用户相关的小仓库:获取仓库内部token,登录成功以后携带给服务器
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.token = userStore.token
  }
  //config配置对象,headers属性请求头,经常给服务器端携带公共参数
  //返回配置对象
  return config
})

//第三步:响应拦截器
request.interceptors.response.use(
  (response) => {
    // 获取后端返回的数据
    const result = response.data
    // 关键点：处理业务上的 Token 失效（假设后端 code 为 201 代表失效）
    if (result.code !== 200) {
      const isLoginRequest = response.config.url?.includes('login')
      const skipExpireRedirect = response.config.skipExpireRedirect
      // 只有在【不是登录请求】且【代码为201/401】时，才执行过期清理逻辑
      if (
        (result.code === 201 || result.code === 401) &&
        !isLoginRequest &&
        !skipExpireRedirect
      ) {
        const userStore = useUserStore()
        userStore.clearUserData()
        // 2. 强制跳转到登录页，并记录当前路径以便登录后跳回
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
        ElMessage.error('登录状态已过期，请重新登录')
      }
      return Promise.reject(new Error(result.data || result.message))
    }
    return result
  },
  (error) => {
    //失败回调:处理http网络错误的
    //定义一个变量:存储网络错误信息
    let message = ''
    //http状态码
    const status = error.response?.status
    if (status === undefined) {
      ElMessage.error('网络异常，请稍后重试')
      return Promise.reject(error)
    }
    // 在switch外声明userStore变量
    let userStore
    switch (status) {
      case 401:
        message = 'TOKEN过期'
        userStore = useUserStore()
        userStore.clearUserData() // 清除仓库和 LocalStorage 中的 token 及用户信息
        router.push('/login') // 使用 window.location.href 清除所有内存状态，强制跳转到登录页面
        break
      case 403:
        message = '无权访问'
        break
      case 404:
        message = '请求地址错误'
        break
      case 500:
        message = '服务器出现问题'
        break
      default:
        message = '网络出现问题'
        break
    }
    //提示错误信息
    ElMessage.error(message)
    return Promise.reject(error)
  },
)
//对外暴露
export default request






