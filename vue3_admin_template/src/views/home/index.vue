<template>
  <el-card>
    <div class="box">
      <img :src="userStore.avatar" alt="" class="avatar" />
      <div class="bottom">
        <h3 class="title">{{ getTime() }}好，{{ userStore.username }} !</h3>
        <div class="subtitle-row">
          <el-icon class="subtitle-icon">
            <Lock />
          </el-icon>
          <p class="subtitle">RBAC权限控制系统</p>
        </div>
      </div>
    </div>
  </el-card>
  <div class="bottoms">
    <svg-icon name="welcome" width="600px" height="300px"></svg-icon>
  </div>
</template>

<script setup lang="ts">
import { Lock } from '@element-plus/icons-vue'
import { getTime } from '@/utils/time'
//引入用户相关的仓库,获取当前用户的头像、昵称
import useUserStore from '@/store/modules/user'
//获取存储用户信息的仓库对象
let userStore = useUserStore()
</script>

<style scoped lang="scss">
.box {
  display: flex;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  .bottom {
    margin-left: 20px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .title {
      font-size: 30px;
      font-weight: 900;
      margin: 0 0 12px;
    }

    .subtitle-row {
      display: flex;
      align-items: center;
      // justify-content: center;
      gap: 10px;
      margin-top: 8px;
      // align-self: center;
    }

    .subtitle-icon {
      font-size: 20px;
      color: skyblue;
      flex-shrink: 0;
    }

    .subtitle {
      margin: 0;
      font-style: italic;
      color: skyblue;
    }
  }
}

.bottoms {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
</style>
