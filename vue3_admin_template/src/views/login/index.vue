<template>
  <div class="login_container">
    <el-row>
      <el-col :span="12" :xs="0"></el-col>
      <el-col :span="12" :xs="24">
        <!-- 登录的表单 -->
        <el-form
          class="login_form"
          :model="loginForm"
          :rules="rules"
          ref="loginForms"
        >
          <h1>Hello</h1>
          <h2>欢迎来到RBAC权限控制系统</h2>
          <el-form-item prop="username">
            <el-input
              :prefix-icon="User"
              v-model="loginForm.username"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              :prefix-icon="Lock"
              v-model="loginForm.password"
              show-password
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              :loading="loading"
              class="login_btn"
              type="primary"
              size="default"
              @click="login"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
//引入获取当前时间的函数
import { getTime } from '@/utils/time'
//引入用户相关的小仓库
import useUserStore from '@/store/modules/user'
let useStore = useUserStore()
//获取el-form组件
let loginForms = ref()
//获取路由器
let $router = useRouter()
//路由对象
let $route = useRoute()
//定义变量控制按钮加载效果
let loading = ref(false)
//收集账号与密码的数据
let loginForm = reactive({ username: 'zhangsan', password: '111111' })
//登录按钮回调
const login = async () => {
  //保证全部表单相校验通过再发请求
  await loginForms.value.validate()
  //加载效果:开始加载
  loading.value = true
  //点击登录按钮以后干什么?
  //通知仓库发登录请求
  //请求成功->首页展示数据的地方
  //请求失败->弹出登录失败信息
  try {
    //保证登录成功
    await useStore.userLogin(loginForm)
    //编程式导航跳转到展示数据首页
    //判断登录的时候,路由路径当中是否有query参数，如果有就往query参数跳转，没有跳转到首页
    // let redirect: any = $route.query.redirect
    // $router.push({ path: redirect || '/' })
    $router.push({ path: '/' })
    //登录成功提示信息
    ElNotification({
      type: 'success',
      message: '欢迎回来',
      title: `HI,${getTime()}好`,
    })
    //登录成功加载效果也消失
    loading.value = false
  } catch (error) {
    //登录失败加载效果消息
    loading.value = false
    //登录失败的提示信息
    ElNotification({
      type: 'error',
      message: (error as Error).message,
    })
  }
}

//自定义校验规则函数
// 账号校验：至少5位，只允许 字母、数字、下划线、短横线、点（常见用户名规则）
const validatorUserName = (rule: any, value: any, callback: any) => {
  //rule:即为校验规则对象
  //value:即为表单元素文本内容
  //函数:如果符合条件callBack放行通过即为
  //如果不符合条件callBack方法,注入错误提示信息
  if (!value) {
    callback(new Error('请输入账号'))
    return
  }
  if (value.length < 4) {
    callback(new Error('账号长度至少4位'))
    return
  }
  // 正则：只允许 英文字母、数字、下划线、短横线、点
  const reg = /^[a-zA-Z0-9._-]+$/
  if (!reg.test(value)) {
    callback(new Error('账号只能包含字母、数字、下划线、短横线或点'))
    return
  }
  // 额外：不允许全是数字（可选，根据需求）
  // if (/^\d+$/.test(value)) {
  //   callback(new Error('账号不能全是数字'))
  //   return
  // }
  callback() // 通过
}

// 密码校验：至少6位，只允许 字母、数字、常见符号（!@#$%^&*等）
const validatorPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  if (value.length < 6) {
    callback(new Error('密码长度至少6位'))
    return
  }
  // 正则：允许字母、数字、常见特殊字符
  const reg = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+$/
  if (!reg.test(value)) {
    callback(new Error('密码只能包含字母、数字和常见特殊字符'))
    return
  }
  callback() // 通过
}
const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { trigger: ['blur', 'change'], validator: validatorUserName },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { trigger: ['blur', 'change'], validator: validatorPassword },
  ],
}
</script>

<style scoped lang="scss">
.login_container {
  width: 100%;
  height: 100vh;
  background: url('@/assets/images/background.jpg') no-repeat;
  background-size: cover;

  .login_form {
    position: relative;
    width: 80%;
    top: 30vh;
    background: url('@/assets/images/login_form.png') no-repeat;
    background-size: cover;
    padding: 40px;

    h1 {
      color: white;
      font-size: 40px;
    }

    h2 {
      font-size: 20px;
      color: white;
      margin: 20px 0px;
    }

    .login_btn {
      width: 100%;
    }
  }
}
</style>
