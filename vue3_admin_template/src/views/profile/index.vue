<template>
  <el-card class="profile-card">
    <template #header>
      <span>个人资料</span>
    </template>
    <div class="profile-body">
      <div class="preview-wrap">
        <p class="label">当前头像</p>
        <img :src="previewUrl" alt="avatar" class="preview" @error="handleAvatarError" />
      </div>
      <el-form label-width="100px" class="form">
        <el-form-item label="上传头像">
          <el-upload
            class="avatar-uploader"
            action="/api/admin/product/fileUpload"
            name="file"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <el-icon v-if="!previewUrl" class="avatar-uploader-icon">
              <Plus />
            </el-icon>
            <img v-else :src="previewUrl" class="upload-thumb" alt="" @error="handleAvatarError" />
          </el-upload>
          <p class="hint">支持 PNG / JPG / GIF，不超过 4MB（与品牌管理上传一致）</p>
        </el-form-item>
        <el-form-item label="图片地址">
          <el-input
            v-model="avatarInput"
            placeholder="也可直接粘贴图片 URL"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="onSave">
            保存头像
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { getDefaultAvatarUrl, normalizeAvatarUrl } from '@/utils/avatar'

const userStore = useUserStore()
const avatarInput = ref(normalizeAvatarUrl(userStore.avatar))
const saving = ref(false)

watch(
  () => userStore.avatar,
  (v) => {
    avatarInput.value = normalizeAvatarUrl(v)
  },
)

const previewUrl = computed(() =>
  normalizeAvatarUrl(avatarInput.value || userStore.avatar),
)

const uploadHeaders = computed(() => ({
  token: userStore.token || '',
}))

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const okType =
    rawFile.type === 'image/png' ||
    rawFile.type === 'image/jpeg' ||
    rawFile.type === 'image/gif'
  if (!okType) {
    ElMessage.error('文件格式须为 PNG、JPG 或 GIF')
    return false
  }
  if (rawFile.size / 1024 / 1024 >= 4) {
    ElMessage.error('文件须小于 4MB')
    return false
  }
  return true
}

const handleUploadSuccess: UploadProps['onSuccess'] = (response: any) => {
  if (response?.code !== 200 || !response?.data) {
    ElMessage.error(response?.message || '上传失败，请检查登录状态')
    return
  }
  avatarInput.value = normalizeAvatarUrl(response.data as string)
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const defaultAvatar = getDefaultAvatarUrl()
  if (target.src.endsWith(defaultAvatar)) return
  target.src = defaultAvatar
}

const onSave = async () => {
  const url = avatarInput.value?.trim()
  if (!url) {
    ElMessage.warning('请先上传或填写头像地址')
    return
  }
  saving.value = true
  try {
    const mode = await userStore.updateUserAvatar(url)
    if (mode === 'ok') {
      ElMessage.success('头像已同步到服务端')
    } else {
      ElMessage.warning(
        '服务端未返回成功，已保存到本机缓存（刷新后仍生效；对接后端后可去掉该提示）',
      )
    }
  } finally {
    saving.value = false
  }
}
</script>

<script lang="ts">
export default { name: 'Profile' }
</script>

<style scoped lang="scss">
.profile-card {
  max-width: 640px;
}
.profile-body {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: flex-start;
}
.preview-wrap {
  .label {
    margin: 0 0 8px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
  .preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--el-border-color);
  }
}
.form {
  flex: 1;
  min-width: 260px;
}
.hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.upload-thumb {
  width: 120px;
  height: 120px;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}
</style>

<style lang="scss">
.profile-body .avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.profile-body .avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.profile-body .el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
