//统一管理咱们项目用户相关的接口
import request from '@/utils/request'
import type {
  loginFormData,
  loginResponseData,
  userInfoReponseData,
  updateAvatarResponseData,
} from './type'
//项目用户相关的请求地址
enum API {
  LOGIN_URL = '/admin/acl/index/login',
  USERINFO_URL = '/admin/acl/index/info',
  LOGOUT_URL = '/admin/acl/index/logout',
  /** 若后端路径不同，请在后端对齐或改此处常量 */
  UPDATE_AVATAR_URL = '/admin/acl/index/updateAvatar',
}

//登录接口
export const reqLogin = (data: loginFormData) =>
  request.post<any, loginResponseData>(API.LOGIN_URL, data)
//获取用户信息
export const reqUserInfo = () =>
  request.get<any, userInfoReponseData>(API.USERINFO_URL)
//退出登录
export const reqLogout = () => request.post<any, any>(API.LOGOUT_URL) // 第一个any是请求体数据类型，第二个是响应的数据的类型 API.LOGOUT_URL后端负责处理退出登录逻辑的接口地址字符串。

// 更新当前登录用户头像（请求体：{ avatar: 图片 URL }）
export const reqUpdateAvatar = (avatar: string) =>
  request.post<any, updateAvatarResponseData>(API.UPDATE_AVATAR_URL, { avatar }, {
    skipExpireRedirect: true,
  })
