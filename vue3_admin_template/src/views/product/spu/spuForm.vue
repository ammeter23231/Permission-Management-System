<template>
  <el-form label-width="100px">
    <el-form-item label="SPU名称">
      <div class="name-row">
        <el-input
          placeholder="请你输入SPU名"
          v-model="SpuParams.spuName"
          clearable
        ></el-input>
        <el-popover placement="bottom-end" :width="340" trigger="click">
          <template #reference>
            <el-button text type="primary" :icon="MagicStick">
              名称建议
            </el-button>
          </template>
          <p class="ai-popover-tip">以下为本地草稿联想，可点选填入后自行修改；保存时才写入系统。</p>
          <div class="name-suggest-list">
            <el-button
              v-for="(n, idx) in nameSuggestions"
              :key="idx"
              class="name-suggest-item"
              text
              type="primary"
              @click="applyNameSuggestion(n)"
            >
              {{ n }}
            </el-button>
          </div>
        </el-popover>
      </div>
    </el-form-item>
    <el-form-item label="SPU品牌">
      <el-select v-model="SpuParams.tmId">
        <el-option
          v-for="item in AllTradeMark"
          :key="item.id"
          :label="item.tmName"
          :value="item.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <div
        class="ai-desc-wrap"
        :class="{ 'is-ai-pending': aiPendingReview }"
      >
        <div class="ai-desc-toolbar">
          <el-button-group>
            <el-button
              size="small"
              :icon="MagicStick"
              :loading="aiAssistLoading"
              @click="onAiDraft"
            >
              一键生成草稿
            </el-button>
            <el-button
              size="small"
              :icon="EditPen"
              :loading="aiAssistLoading"
              @click="onAiFormal"
            >
              润色·更正式
            </el-button>
            <el-button
              size="small"
              :icon="Promotion"
              :loading="aiAssistLoading"
              @click="onAiPromo"
            >
              润色·更促销
            </el-button>
          </el-button-group>
          <el-dropdown trigger="click" @command="onAiAltCommand">
            <el-button size="small" :loading="aiAssistLoading">
              多版本改写
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="a">语气 A · 简洁</el-dropdown-item>
                <el-dropdown-item command="b">语气 B · 故事</el-dropdown-item>
                <el-dropdown-item command="c">语气 C · 偏参数</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            v-if="aiPendingReview"
            size="small"
            text
            type="primary"
            :icon="CircleCheck"
            @click="confirmAiReview"
          >
            已核对
          </el-button>
          <el-button
            v-if="canUndoDescription"
            size="small"
            text
            :disabled="aiAssistLoading"
            @click="undoDescription"
          >
            撤销上一步
          </el-button>
        </div>
        <el-input
          type="textarea"
          :rows="8"
          placeholder="请你输入SPU描述；右侧工具为「智能输入法」式草稿，默认只改本框内容，保存后才落库。"
          v-model="SpuParams.description"
          @input="onDescriptionInput"
        />
        <p v-if="aiFallbackHint" class="ai-fallback-hint">{{ aiFallbackHint }}</p>
        <el-alert
          v-if="aiPendingReview"
          class="ai-alert"
          type="warning"
          show-icon
          :closable="false"
          title="待确认"
          description="内容已由助手流式预填，请核对事实与合规用语；可直接编辑或点「撤销上一步」恢复。"
        />
      </div>
    </el-form-item>
    <el-form-item label="SPU图片">
      <!-- v-model:fileList->展示默认图片 
                 action:上传图片的接口地址
                 list-type:文件列表的类型
            -->
      <el-upload
        v-model:file-list="imgList"
        action="/api/admin/product/fileUpload"
        name="file"
        :headers="uploadHeaders"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :before-upload="handlerUpload"
      >
        <el-icon>
          <Plus />
        </el-icon>
      </el-upload>
      <el-dialog v-model="dialogVisible">
        <img
          w-full
          :src="dialogImageUrl"
          alt="Preview Image"
          style="width: 100%; height: 100%"
        />
      </el-dialog>
    </el-form-item>
    <el-form-item label="SPU销售属性">
      <!-- 展示销售属性的下拉菜单 -->
      <el-select
        v-model="saleAttrIdAndValueName"
        :placeholder="
          unSelectSaleAttr.length
            ? `还未选择${unSelectSaleAttr.length}个`
            : '无'
        "
      >
        <el-option
          :value="`${item.id}:${item.name}`"
          v-for="item in unSelectSaleAttr"
          :key="item.id"
          :label="item.name"
        ></el-option>
      </el-select>
      <el-button
        @click="addSaleAttr"
        :disabled="saleAttrIdAndValueName ? false : true"
        style="margin-left: 10px"
        type="primary"
        size="default"
        icon="Plus"
      >
        添加属性
      </el-button>
      <!-- table展示销售属性与属性值的地方 -->
      <el-table border style="margin: 10px 0px" :data="saleAttr">
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="80px"
        ></el-table-column>
        <el-table-column
          label="销售属性名字"
          width="120px"
          prop="saleAttrName"
        ></el-table-column>
        <el-table-column label="销售属性值">
          <!-- row:即为当前SPU已有的销售属性对象 -->
          <template #default="{ row }">
            <el-tag
              style="margin: 0px 5px"
              @close="row.spuSaleAttrValueList.splice(tagIndex, 1)"
              v-for="(item, tagIndex) in row.spuSaleAttrValueList"
              :key="`${row.saleAttrName}-${tagIndex}-${item.saleAttrValueName}`"
              class="mx-1"
              closable
            >
              {{ item.saleAttrValueName }}
            </el-tag>
            <div v-if="row.flag == true" class="attr-val-editor">
              <el-input
                @blur="toLook(row)"
                v-model="row.saleAttrValue"
                placeholder="请你输入属性值"
                size="small"
                style="width: 100px"
              ></el-input>
              <el-dropdown
                trigger="click"
                @command="onSaleAttrDropdownCommand(row)"
              >
                <el-button size="small" text type="primary">联想值</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="(idea, i) in saleAttrValueIdeas(row.saleAttrName)"
                      :key="i"
                      :command="idea"
                    >
                      {{ idea }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <el-button
              @click="toEdit(row)"
              v-else
              type="primary"
              size="small"
              icon="Plus"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template #default="{ $index }">
            <el-button
              type="danger"
              size="small"
              icon="Delete"
              @click="saleAttr.splice($index, 1)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="sale-attr-ai-row">
        <el-button
          size="small"
          text
          type="primary"
          :icon="MagicStick"
          :disabled="!saleAttr.length || aiAssistLoading"
          @click="onAppendSaleAttrToDescription"
        >
          将已选销售属性写入描述要点
        </el-button>
        <span class="sale-attr-ai-hint">把表格中的属性组合成要点段落，追加到描述文末（流式预览）。</span>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button
        :disabled="saleAttr.length > 0 ? false : true"
        type="primary"
        size="default"
        @click="save"
      >
        保存
      </el-button>
      <el-button type="primary" size="default" @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { SpuData } from '@/api/product/spu/type'
import { ref, computed, onBeforeUnmount } from 'vue'
import {
  MagicStick,
  EditPen,
  Promotion,
  ArrowDown,
  CircleCheck,
} from '@element-plus/icons-vue'
import {
  streamMockText,
  buildMockDraft,
  polishFormalMock,
  polishPromoMock,
  alternateVersionMock,
  buildSaleAttrBulletBlock,
  suggestSpuNames,
  suggestSaleAttrValues,
} from '@/views/product/spu/spuCopyAssist'
import type { CopyToneVariant } from '@/views/product/spu/spuCopyAssist'
import {
  reqAllTradeMark,
  reqSpuImageList,
  reqSpuHasSaleAttr,
  reqAllSaleAttr,
  reqAddOrUpdateSpu,
} from '@/api/product/spu'
import type {
  SaleAttrValue,
  HasSaleAttr,
  SaleAttr,
  SpuImg,
  Trademark,
  AllTradeMark,
  SpuHasImg,
  SaleAttrResponseData,
  HasSaleAttrResponseData,
} from '@/api/product/spu/type'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'

let $emit = defineEmits(['changeScene'])
const userStore = useUserStore()
const uploadHeaders = computed(() => ({
  token: userStore.token || '',
}))
//点击取消按钮:通知父组件切换场景为1,展示有的SPU的数据
const cancel = () => {
  $emit('changeScene', { flag: 0, params: 'update' })
}
//存储已有的SPU这些数据
let AllTradeMark = ref<Trademark[]>([])
//商品图片
let imgList = ref<SpuImg[]>([])
//已有的SPU销售属性
let saleAttr = ref<SaleAttr[]>([])
//全部销售属性
let allSaleAttr = ref<HasSaleAttr[]>([])
//控制对话框的显示与隐藏
let dialogVisible = ref<boolean>(false)
//存储预览图片地址
let dialogImageUrl = ref<string>('')
//存储已有的SPU对象
let SpuParams = ref<SpuData>({
  category3Id: '', //收集三级分类的ID
  spuName: '', //SPU的名字
  description: '', //SPU的描述
  tmId: '', //品牌的ID
  spuImageList: [],
  spuSaleAttrList: [],
})
//将来收集还未选择的销售属性的ID与属性值的名字
let saleAttrIdAndValueName = ref<string>('')

/** —— 商品描述「轻量文案助手」：仅前端占位，可替换为流式 API —— */
const aiAssistLoading = ref(false)
const aiPendingReview = ref(false)
const aiFallbackHint = ref('')
const canUndoDescription = ref(false)
const lastDescriptionSnapshot = ref('')
const streamAbort = ref<AbortController | null>(null)

const currentBrandName = computed(() => {
  const id = SpuParams.value.tmId
  const hit = AllTradeMark.value.find((t) => String(t.id) === String(id))
  return hit?.tmName ?? ''
})

const nameSuggestions = computed(() =>
  suggestSpuNames({
    spuName: SpuParams.value.spuName,
    brandName: currentBrandName.value,
  }),
)

const saleAttrSummaryLines = computed(() =>
  saleAttr.value.map((row) => {
    const vals = row.spuSaleAttrValueList
      .map((v) => v.saleAttrValueName)
      .join('、')
    return `${row.saleAttrName}：${vals || '待补充'}`
  }),
)

const resetAiUi = () => {
  streamAbort.value?.abort()
  streamAbort.value = null
  aiAssistLoading.value = false
  aiPendingReview.value = false
  aiFallbackHint.value = ''
  canUndoDescription.value = false
}

async function runDescriptionStream(buildFull: () => string) {
  lastDescriptionSnapshot.value = SpuParams.value.description
  canUndoDescription.value = true
  streamAbort.value?.abort()
  streamAbort.value = new AbortController()
  const signal = streamAbort.value.signal
  const full = buildFull()
  aiAssistLoading.value = true
  aiPendingReview.value = false
  aiFallbackHint.value = ''
  SpuParams.value.description = ''
  try {
    await streamMockText(
      full,
      (partial) => {
        SpuParams.value.description = partial
      },
      { signal },
    )
    aiPendingReview.value = true
  } catch (e: unknown) {
    const aborted = e instanceof Error && e.name === 'AbortError'
    SpuParams.value.description = lastDescriptionSnapshot.value
    if (!aborted) {
      aiFallbackHint.value =
        '文案助手暂不可用，请手动编辑；稍后可重试。'
      canUndoDescription.value = false
    }
    aiPendingReview.value = false
  } finally {
    aiAssistLoading.value = false
  }
}

const onAiDraft = () => {
  runDescriptionStream(() =>
    buildMockDraft({
      spuName: SpuParams.value.spuName,
      brandName: currentBrandName.value,
      saleAttrLines: saleAttrSummaryLines.value,
    }),
  )
}

const onAiFormal = () => {
  runDescriptionStream(() =>
    polishFormalMock(lastDescriptionSnapshot.value),
  )
}

const onAiPromo = () => {
  runDescriptionStream(() =>
    polishPromoMock(lastDescriptionSnapshot.value),
  )
}

const onAiAltCommand = (cmd: string) => {
  if (cmd !== 'a' && cmd !== 'b' && cmd !== 'c') return
  const variant = cmd as CopyToneVariant
  runDescriptionStream(() =>
    alternateVersionMock(lastDescriptionSnapshot.value, variant),
  )
}

const onAppendSaleAttrToDescription = () => {
  const block = buildSaleAttrBulletBlock(saleAttrSummaryLines.value)
  if (!block.trim()) return
  const cur = SpuParams.value.description.trim()
  const full = cur ? `${cur}\n\n${block}` : block
  runDescriptionStream(() => full)
}

const undoDescription = () => {
  SpuParams.value.description = lastDescriptionSnapshot.value
  aiPendingReview.value = false
  aiFallbackHint.value = ''
  canUndoDescription.value = false
}

const confirmAiReview = () => {
  aiPendingReview.value = false
}

const onDescriptionInput = () => {
  if (aiPendingReview.value) {
    aiPendingReview.value = false
  }
}

const applyNameSuggestion = (name: string) => {
  SpuParams.value.spuName = name
}

const saleAttrValueIdeas = (saleAttrName: string) =>
  suggestSaleAttrValues(saleAttrName)

const applyAttrValueSuggestion = (row: SaleAttr, value: string) => {
  row.saleAttrValue = value
}

const onSaleAttrDropdownCommand =
  (row: SaleAttr) => (cmd: string | number | boolean) => {
    applyAttrValueSuggestion(row, String(cmd))
  }

onBeforeUnmount(() => {
  streamAbort.value?.abort()
})

//子组件书写一个方法
const initHasSpuData = async (spu: SpuData) => {
  resetAiUi()
  //存储已有的SPU对象,将来在模板中展示
  SpuParams.value = { ...spu }
  //spu:即为父组件传递过来的已有的SPU对象[不完整]
  //获取全部品牌的数据
  let result: AllTradeMark = await reqAllTradeMark()
  //获取某一个品牌旗下全部售卖商品的图片
  let result1: SpuHasImg = await reqSpuImageList(spu.id as number)
  //获取已有的SPU销售属性的数据
  let result2: SaleAttrResponseData = await reqSpuHasSaleAttr(spu.id as number)
  //获取整个项目全部SPU的销售属性
  let result3: HasSaleAttrResponseData = await reqAllSaleAttr()

  //存储全部品牌的数据
  AllTradeMark.value = result.data || []
  //SPU对应商品图片
  imgList.value = (result1.data || []).map((item) => ({
    name: item.imgName,
    url: item.imgUrl,
  }))
  console.log('1. 已有的销售属性(result2):', result2.data)
  console.log('2. 全部销售属性(result3):', result3.data)
  //存储已有的SPU的销售属性
  saleAttr.value = result2.data || []
  //存储全部的销售属性
  allSaleAttr.value = result3.data || []
  console.log('3. 赋值后的 allSaleAttr:', allSaleAttr.value)
}
//照片墙点击预览按钮的时候触发的钩子
const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url
  //对话框弹出来
  dialogVisible.value = true
}
//照片墙删除文件钩子
const handleRemove = () => {
  console.log(123)
}
//照片钱上传成功之前的钩子约束文件的大小与类型
const handlerUpload = (file: any) => {
  if (
    file.type == 'image/png' ||
    file.type == 'image/jpeg' ||
    file.type == 'image/gif'
  ) {
    if (file.size / 1024 / 1024 < 3) {
      return true
    } else {
      ElMessage({
        type: 'error',
        message: '上传文件务必小于3M',
      })
      return false
    }
  } else {
    ElMessage({
      type: 'error',
      message: '上传文件务必PNG|JPG|GIF',
    })
    return false
  }
}

//计算出当前SPU还未拥有的销售属性
// src\views\product\spu\spuForm.vue

let unSelectSaleAttr = computed(() => {
  // 确保两个数组都有值才进行过滤，否则直接返回全部属性或空数组
  if (!allSaleAttr.value) return []
  if (!saleAttr.value) return allSaleAttr.value

  return allSaleAttr.value.filter((item) => {
    return saleAttr.value.every((item1) => {
      return item.name != item1.saleAttrName
    })
  })
})

//添加销售属性的方法
const addSaleAttr = () => {
  /*
    "baseSaleAttrId": number,
    "saleAttrName": string,
    "spuSaleAttrValueList": SpuSaleAttrValueList
    */
  const [baseSaleAttrId, saleAttrName] = saleAttrIdAndValueName.value.split(':')
  //准备一个新的销售属性对象:将来带给服务器即可
  let newSaleAttr: SaleAttr = {
    baseSaleAttrId,
    saleAttrName,
    spuSaleAttrValueList: [],
  }
  //追加到数组当中
  saleAttr.value.push(newSaleAttr)
  //清空收集的数据
  saleAttrIdAndValueName.value = ''
}

//属性值按钮的点击事件
const toEdit = (row: SaleAttr) => {
  //点击按钮的时候,input组件不就不出来->编辑模式
  row.flag = true
  row.saleAttrValue = ''
}
//表单元素失却焦点的事件回调
const toLook = (row: SaleAttr) => {
  //整理收集的属性的ID与属性值的名字
  const { baseSaleAttrId, saleAttrValue } = row
  //整理成服务器需要的属性值形式
  let newSaleAttrValue: SaleAttrValue = {
    baseSaleAttrId,
    saleAttrValueName: saleAttrValue as string,
  }

  //非法情况判断
  if ((saleAttrValue as string).trim() == '') {
    ElMessage({
      type: 'error',
      message: '属性值不能为空的',
    })
    return
  }
  //判断属性值是否在数组当中存在
  let repeat = row.spuSaleAttrValueList.find((item) => {
    return item.saleAttrValueName == saleAttrValue
  })

  if (repeat) {
    ElMessage({
      type: 'error',
      message: '属性值重复',
    })
    return
  }

  //追加新的属性值对象
  row.spuSaleAttrValueList.push(newSaleAttrValue)
  //切换为查看模式
  row.flag = false
}

//保存按钮的回调
const save = async () => {
  //整理参数
  //发请求:添加SPU|更新已有的SPU
  //成功
  //失败
  //1:照片墙的数据
  SpuParams.value.spuImageList = imgList.value.map((item: any) => {
    return {
      imgName: item.name, //图片的名字
      imgUrl: (item.response && item.response.data) || item.url,
    }
  })
  //2:整理销售属性的数据
  SpuParams.value.spuSaleAttrList = saleAttr.value
  let result = await reqAddOrUpdateSpu(SpuParams.value)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: SpuParams.value.id ? '更新成功' : '添加成功',
    })
    //通知父组件切换场景为0
    $emit('changeScene', {
      flag: 0,
      params: SpuParams.value.id ? 'update' : 'add',
    })
  } else {
    ElMessage.error(result.data || '保存失败')
  }
}

//添加一个新的SPU初始化请求方法
const initAddSpu = async (c3Id: number | string) => {
  resetAiUi()
  //清空数据
  Object.assign(SpuParams.value, {
    category3Id: '', //收集三级分类的ID
    spuName: '', //SPU的名字
    description: '', //SPU的描述
    tmId: '', //品牌的ID
    spuImageList: [],
    spuSaleAttrList: [],
  })
  //清空照片
  imgList.value = []
  //清空销售属性
  saleAttr.value = []
  saleAttrIdAndValueName.value = ''
  //存储三级分类的ID
  SpuParams.value.category3Id = c3Id
  //获取全部品牌的数据
  let result: AllTradeMark = await reqAllTradeMark()
  let result1: HasSaleAttrResponseData = await reqAllSaleAttr()
  //存储数据
  AllTradeMark.value = result.data
  allSaleAttr.value = result1.data
}
//对外暴露
defineExpose({ initHasSpuData, initAddSpu })
</script>

<style scoped>
.name-row {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  max-width: 720px;
}

.name-row :deep(.el-input) {
  flex: 1;
}

.ai-popover-tip {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.name-suggest-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.name-suggest-item {
  height: auto !important;
  padding: 4px 0 !important;
  white-space: normal;
  text-align: left;
}

.ai-desc-wrap {
  width: 100%;
  max-width: 900px;
}

.ai-desc-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.ai-desc-wrap.is-ai-pending :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--el-color-warning-light-5) inset;
  background-color: var(--el-color-warning-light-9);
}

.ai-fallback-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.ai-alert {
  margin-top: 10px;
}

.sale-attr-ai-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.sale-attr-ai-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.attr-val-editor {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
</style>
