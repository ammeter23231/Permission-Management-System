<template>
  <el-form label-width="100px">
    <el-form-item label="SKU名称">
      <el-input placeholder="SKU名称" v-model="skuParams.skuName"></el-input>
    </el-form-item>
    <el-form-item label="价格(元)">
      <el-input
        placeholder="价格(元)"
        type="number"
        v-model="skuParams.price"
      ></el-input>
    </el-form-item>
    <el-form-item label="重量(g)">
      <el-input
        placeholder="重量(g)"
        type="number"
        v-model="skuParams.weight"
      ></el-input>
    </el-form-item>
    <el-form-item label="SKU描述">
      <el-input
        placeholder="SKU描述"
        type="textarea"
        v-model="skuParams.skuDesc"
      ></el-input>
    </el-form-item>
    <el-form-item label="平台属性">
      <div class="attr-block">
        <div class="attr-rows">
          <div
            v-for="(item, index) in attrArr"
            :key="`platform-attr-${index}`"
            class="attr-row"
          >
            <span class="attr-row-label">{{ item.attrName }}</span>
            <el-select
              v-model="item.attrIdAndValueId"
              placeholder="请选择"
              clearable
              class="attr-row-select"
            >
              <el-option
                v-for="(attrValue, vidx) in item.attrValueList"
                :key="`pfv-${index}-${attrValue.id ?? attrValue.valueId ?? vidx}`"
                :value="platformOptionValue(item, attrValue)"
                :label="attrValue.valueName"
              ></el-option>
            </el-select>
          </div>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="销售属性">
      <div class="attr-block">
        <div class="attr-rows">
          <div
            v-for="(item, index) in saleArr"
            :key="`sale-attr-${index}`"
            class="attr-row"
          >
            <span class="attr-row-label">{{ item.saleAttrName }}</span>
            <el-select
              v-model="item.saleIdAndValueId"
              placeholder="请选择"
              clearable
              class="attr-row-select"
            >
              <el-option
                v-for="(saleAttrValue, vidx) in item.spuSaleAttrValueList"
                :key="`sfv-${index}-${saleAttrValue.id ?? saleAttrValue.valueId ?? vidx}`"
                :value="saleOptionValue(item, saleAttrValue)"
                :label="saleAttrValue.saleAttrValueName"
              ></el-option>
            </el-select>
          </div>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="图片名称">
      <el-table border :data="imgArr" ref="table">
        <el-table-column
          type="selection"
          width="80px"
          align="center"
        ></el-table-column>
        <el-table-column label="图片">
          <template #="{ row, $index }">
            <img :src="row.imgUrl" alt="" style="width: 100px; height: 100px" />
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="imgName"></el-table-column>
        <el-table-column label="操作">
          <template #="{ row, $index }">
            <el-button type="primary" size="small" @click="handler(row)">
              设置默认
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="default" @click="save">保存</el-button>
      <el-button type="primary" size="default" @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
//引入请求API
import { reqAttr } from '@/api/product/attr'
import {
  reqSpuImageList,
  reqSpuHasSaleAttr,
  reqAddOrUpdateSku,
} from '@/api/product/spu'
import { reqSkuInfo } from '@/api/product/sku'
import type { SkuData } from '@/api/product/spu/type'
import { ElMessage } from 'element-plus'
import { ref, reactive, nextTick } from 'vue'
//平台属性
let attrArr = ref<any>([])
//销售属性
let saleArr = ref<any>([])

/** 与 el-option :value 一致，避免后端只返回 attrId/baseSaleAttrId 时 key 重复导致下拉不展示已选项 */
function platformOptionValue(item: any, attrValue: any) {
  const aid = item?.id ?? item?.attrId
  const vid = attrValue?.id ?? attrValue?.valueId
  return `${aid}:${vid}`
}

function saleOptionValue(item: any, saleAttrValue: any) {
  const sid = item?.id ?? item?.baseSaleAttrId
  const vid = saleAttrValue?.id ?? saleAttrValue?.valueId
  return `${sid}:${vid}`
}
//照片的数据
let imgArr = ref<any>([])
//获取table组件实例
let table = ref<any>()
//收集SKU的参数
let skuParams = reactive<SkuData>({
  //父组件传递过来的数据
  category3Id: '', //三级分类的ID
  spuId: '', //已有的SPU的ID
  tmId: '', //SPU品牌的ID
  //v-model收集
  skuName: '', //sku名字
  price: '', //sku价格
  weight: '', //sku重量
  skuDesc: '', //sku的描述

  skuAttrValueList: [
    //平台属性的收集
  ],
  skuSaleAttrValueList: [
    //销售属性
  ],
  skuDefaultImg: '', //sku图片地址
})
//当前子组件的方法对外暴露
const initSkuData = async (
  c1Id: number | string,
  c2Id: number | string,
  spu: any,
) => {
  Reflect.deleteProperty(skuParams as object, 'id')
  Reflect.deleteProperty(skuParams as object, 'isSale')
  //收集数据
  skuParams.category3Id = spu.category3Id
  skuParams.spuId = spu.id
  skuParams.tmId = spu.tmId
  // 1. 打印传入的 spu 对象，确保 spu.id 存在
  console.log('传入的SPU信息:', spu)
  console.log('传给后端的spu.id', spu.id)
  // 获取平台属性...
  let result: any = await reqAttr(c1Id, c2Id, spu.category3Id)

  // 2. 获取销售属性
  let result1: any = await reqSpuHasSaleAttr(spu.id)

  // 3. 核心打印：查看后端返回的销售属性原始数据
  console.log('销售属性接口返回结果:', result1)
  attrArr.value = result.data
  console.log('attrArr.value', attrArr.value)
  // 4. 赋值后打印，确认响应式变量是否更新
  saleArr.value = result1.data
  console.log('赋值后的saleArr:', saleArr.value)

  // 获取照片墙...
  let result2: any = await reqSpuImageList(spu.id)
  imgArr.value = result2.data
}

/** 编辑已有 SKU：从 SKU 管理页等入口调用 */
const initSkuEditData = async (skuId: number | string) => {
  const result: any = await reqSkuInfo(Number(skuId))
  if (result.code !== 200 || !result.data) {
    ElMessage.error('加载 SKU 失败')
    return
  }
  const info: any = result.data
  const c1 = info.category1Id
  const c2 = info.category2Id
  if (c1 == null || c2 == null) {
    ElMessage.error('无法解析分类信息，请检查数据库分类关联')
    return
  }

  Reflect.deleteProperty(skuParams as object, 'id')
  Reflect.deleteProperty(skuParams as object, 'isSale')

  skuParams.id = info.id
  skuParams.category3Id = info.category3Id
  skuParams.spuId = info.spuID
  skuParams.tmId = info.tmId
  skuParams.skuName = info.skuName ?? ''
  skuParams.price = info.price ?? ''
  skuParams.weight = info.weight ?? ''
  skuParams.skuDesc = info.skuDesc ?? ''
  skuParams.skuDefaultImg = info.skuDefaultImg ?? ''
  skuParams.isSale = info.isSale

  const attrRes: any = await reqAttr(c1, c2, info.category3Id)
  attrArr.value = attrRes.data || []
  for (const row of attrArr.value) {
    const hit = (info.skuAttrValueList || []).find(
      (x: any) => String(x.attrId) === String(row.id),
    )
    if (hit && hit.valueId != null) {
      row.attrIdAndValueId = platformOptionValue(row, {
        id: hit.valueId,
        valueId: hit.valueId,
      })
    } else {
      row.attrIdAndValueId = undefined
    }
  }

  const saleRes: any = await reqSpuHasSaleAttr(info.spuID)
  saleArr.value = saleRes.data || []
  for (const row of saleArr.value) {
    const hit = (info.skuSaleAttrValueList || []).find(
      (x: any) => String(x.saleAttrId) === String(row.id),
    )
    if (hit && hit.saleAttrValueId != null) {
      row.saleIdAndValueId = `${row.id}:${hit.saleAttrValueId}`
    } else {
      row.saleIdAndValueId = undefined
    }
  }

  const imgRes: any = await reqSpuImageList(info.spuID)
  imgArr.value = imgRes.data || []

  await nextTick()
  if (table.value) {
    table.value.clearSelection?.()
    const skuImgs = info.skuImageList || []
    for (const row of imgArr.value) {
      const picked = skuImgs.some(
        (si: any) => String(si.spuImgId) === String(row.id),
      )
      if (picked) {
        table.value.toggleRowSelection(row, true)
      }
    }
  }
}

//取消按钮的回调
const cancel = () => {
  $emit('changeScene', { flag: 0, params: '' })
}

//设置默认图片的方法回调
const handler = (row: any) => {
  //点击的时候,全部图片的的复选框不勾选
  imgArr.value.forEach((item: any) => {
    table.value.toggleRowSelection(item, false)
  })
  //选中的图片才勾选
  table.value.toggleRowSelection(row, true)
  //收集图片地址
  skuParams.skuDefaultImg = row.imgUrl
}
//对外暴露方法
defineExpose({
  initSkuData,
  initSkuEditData,
})

//保存按钮的方法
// src/views/product/spu/skuForm.vue
const save = async () => {
  // 1. 整理平台属性：必须确保 attrId 和 valueId 是数字，且后端通常要求至少选一个
  skuParams.skuAttrValueList = (attrArr.value || []).reduce(
    (prev: any, next: any) => {
      if (next.attrIdAndValueId) {
        let [attrId, valueId] = next.attrIdAndValueId.split(':')
        prev.push({
          attrId: Number(attrId),
          valueId: Number(valueId),
        })
      }
      return prev
    },
    [],
  )

  // 2. 整理销售属性：同理转换为数字
  skuParams.skuSaleAttrValueList = (saleArr.value || [])
    .filter((item: any) => item.saleIdAndValueId)
    .map((item: any) => {
      let [saleAttrId, saleAttrValueId] = item.saleIdAndValueId.split(':')
      return {
        saleAttrId: Number(saleAttrId),
        saleAttrValueId: Number(saleAttrValueId),
      }
    })

  // 3. 整理图片列表
  const selectedRows = table.value.getSelectionRows()
  skuParams.skuImageList = selectedRows.map((item: any) => {
    return {
      imgName: item.imgName,
      imgUrl: item.imgUrl,
      spuImgId: item.id,
      isDefault: item.imgUrl === skuParams.skuDefaultImg ? '1' : '0',
    }
  })

  // 4. 关键：强制类型转换与完整性校验
  // 后端校验通常包含：skuName, price, weight, tmId, category3Id, spuId, skuDefaultImg
  // 以及三个数组长度不能为 0

  skuParams.price = Number(skuParams.price)
  skuParams.weight = Number(skuParams.weight)

  if (!skuParams.skuName || !skuParams.price || !skuParams.skuDefaultImg) {
    ElMessage.warning('请填写完整的商品基本信息并设置默认图片')
    return
  }

  if ((skuParams.skuAttrValueList ?? []).length === 0) {
    ElMessage.warning('请至少选择一个平台属性')
    return
  }

  if ((skuParams.skuSaleAttrValueList ?? []).length === 0) {
    ElMessage.warning('请至少选择一个销售属性')
    return
  }

  if ((skuParams.skuImageList ?? []).length === 0) {
    ElMessage.warning('请至少勾选一张图片')
    return
  }

  // 5. 发送请求
  try {
    console.log('11111111111111111111111111111', skuParams)
    const isUpdate = Boolean((skuParams as SkuData).id)
    let result: any = await reqAddOrUpdateSku(skuParams as SkuData)
    if (result.code == 200) {
      ElMessage.success(isUpdate ? '更新 SKU 成功' : '添加SKU成功')
      Reflect.deleteProperty(skuParams as object, 'id')
      Reflect.deleteProperty(skuParams as object, 'isSale')
      $emit('changeScene', { flag: 0, params: '' })
    } else {
      // 如果后端返回 201 或其他错误码，这里会显示具体的后端提示
      ElMessage.error(result.data || result.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('系统错误：请检查控制台网络详情')
  }
}
//自定义事件的方法
let $emit = defineEmits(['changeScene'])
</script>

<style scoped>
/* 仅 1～少数几行时：用区块收拢 + 与表单项一致的「右对齐标签 + 下拉铺满」避免显得空散 */
.attr-block {
  box-sizing: border-box;
  width: 100%;
  max-width: 640px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-extra-light);
}

.attr-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.attr-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.attr-row-label {
  flex: 0 0 108px;
  text-align: right;
  font-size: 14px;
  line-height: 32px;
  color: var(--el-text-color-secondary);
}

.attr-row-select {
  flex: 1;
  min-width: 0;
  width: 100%;
}
</style>
