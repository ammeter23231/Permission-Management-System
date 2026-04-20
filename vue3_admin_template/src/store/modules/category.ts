//商品分类全局组件的小仓库
import { defineStore } from 'pinia'
import { reqC1, reqC2, reqC3 } from '@/api/product/attr'
import type { CategoryResponseData } from '@/api/product/attr/type'
import type { CategoryState } from './types/type'
const useCategoryStore = defineStore('Category', {
  state: (): CategoryState => {
    return {
      //存储一级分类的数据
      c1Arr: [],
      //存储一级分类的ID
      // c1Id: '',
      // c1Id: undefined as any, // 改为 undefined，不要用空字符串
      c1Id: undefined,
      //存储对应一级分类下二级分类的数据
      c2Arr: [],
      //收集二级分类的ID
      // c2Id: '',
      // c2Id: undefined as any,
      c2Id: undefined,
      //存储三级分类的数据
      c3Arr: [],
      //存储三级分类的ID
      // c3Id: '',
      // c3Id: undefined as any,
      c3Id: undefined,
    }
  },
  actions: {
    //获取一级分类的方法
    async getC1() {
      //发请求获取一级分类的数据
      const result: CategoryResponseData = await reqC1()
      // console.log(
      //   '%c 一级分类返回结果:',
      //   'color: white; background: #42b983; padding: 2px 5px;',
      //   result,
      // )
      if (result.code == 200) {
        // 确保 ID 全是 number 类型
        this.c1Arr = result.data.map((item) => ({
          ...item,
          id: Number(item.id),
        }))
        // this.c1Arr = result.data
        // console.log('第一条数据详情:', result.data[0])
      }
    },
    //获取二级分类的数据
    async getC2() {
      this.c2Arr = []
      this.c2Id = undefined
      this.c3Arr = []
      this.c3Id = undefined
      const result: CategoryResponseData = await reqC2(this.c1Id)
      if (result.code == 200) {
        // 统一转换为 Number 类型
        this.c2Arr = result.data.map((item) => ({
          ...item,
          id: Number(item.id),
        }))
      }
    },
    //获取三级分类的数据
    async getC3() {
      this.c3Arr = []
      this.c3Id = undefined
      const result: CategoryResponseData = await reqC3(this.c2Id)
      if (result.code == 200) {
        // 统一转换为 Number 类型
        this.c3Arr = result.data.map((item) => ({
          ...item,
          id: Number(item.id),
        }))
      }
    },
    resetLevel(level: number) {
      if (level <= 1) {
        this.c2Id = undefined
        this.c2Arr = []
      }
      if (level <= 2) {
        this.c3Id = undefined
        this.c3Arr = []
      }
    },
    /** 按已保存的一级/二级/三级 ID 依次拉取下拉数据并还原选择（用于离开页面后再次进入） */
    async restoreCascade(
      c1Id: number | string,
      c2Id: number | string,
      c3Id: number | string,
    ) {
      await this.getC1()
      this.c1Id = Number(c1Id)
      this.c2Arr = []
      this.c2Id = undefined
      this.c3Arr = []
      this.c3Id = undefined
      const r2: CategoryResponseData = await reqC2(this.c1Id)
      if (r2.code == 200) {
        this.c2Arr = r2.data.map((item) => ({
          ...item,
          id: Number(item.id),
        }))
      }
      this.c2Id = Number(c2Id)
      const r3: CategoryResponseData = await reqC3(this.c2Id)
      if (r3.code == 200) {
        this.c3Arr = r3.data.map((item) => ({
          ...item,
          id: Number(item.id),
        }))
      }
      this.c3Id = Number(c3Id)
    },
  },
  getters: {},
})

export default useCategoryStore
