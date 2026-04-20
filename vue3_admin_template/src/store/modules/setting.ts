//小仓库:layout组件相关配置仓库
import { defineStore } from 'pinia'
import {
  getDarkModePreference,
  setDarkModePreference,
  applyDarkModeToDocument,
} from '@/utils/theme'

const useLayOutSettingStore = defineStore('SettingStore', {
  state: () => {
    return {
      fold: false, //用户控制菜单折叠还是收起控制
      refsh: false, //仓库的这个属性用于控制刷新效果
      isDark: getDarkModePreference(),
    }
  },
  actions: {
    setDark(isDark: boolean) {
      this.isDark = isDark
      setDarkModePreference(isDark)
      applyDarkModeToDocument(isDark)
    },
    syncDarkFromPreference() {
      const isDark = getDarkModePreference()
      this.isDark = isDark
      applyDarkModeToDocument(isDark)
    },
  },
})

export default useLayOutSettingStore
