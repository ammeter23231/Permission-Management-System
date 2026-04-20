<template>
  <el-card>
    <el-form :inline="true" class="form">
      <el-form-item label="职位搜索">
        <el-input
          placeholder="请你输入搜索职位关键字"
          v-model="keyword"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="default"
          :disabled="keyword ? false : true"
          @click="search"
        >
          搜索
        </el-button>
        <el-button type="primary" size="default" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-card style="margin: 10px 0px">
    <el-button type="primary" size="default" icon="Plus" @click="addRole">
      添加职位
    </el-button>
    <el-table border style="margin: 10px 0px" :data="allRole">
      <el-table-column type="index" align="center" label="#"></el-table-column>
      <el-table-column
        label="职位ID"
        align="center"
        prop="id"
      ></el-table-column>
      <el-table-column
        label="职位名称"
        align="center"
        prop="roleName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        show-overflow-tooltip
        prop="createTime"
      ></el-table-column>
      <el-table-column
        label="更新时间"
        align="center"
        show-overflow-tooltip
        prop="updateTime"
      ></el-table-column>
      <el-table-column label="操作" width="280px" align="center">
        <!-- row:已有的职位对象。来自于父标签el-table的:data="allRole" -->
        <template #="{ row, $index }">
          <el-button
            type="primary"
            size="small"
            icon="User"
            @click="setPermisstion(row)"
            :disabled="userStore.roleIds?.includes(row.id)"
          >
            分配权限
          </el-button>
          <el-button
            type="primary"
            size="small"
            icon="Edit"
            @click="updateRole(row)"
            :disabled="userStore.roleIds?.includes(row.id)"
          >
            编辑
          </el-button>
          <el-popconfirm
            :title="`你确定要删除${row.roleName}?`"
            width="260px"
            @confirm="removeRole(row.id)"
            :disabled="userStore.roleIds?.includes(row.id)"
          >
            <template #reference>
              <el-button
                type="danger"
                size="small"
                icon="Delete"
                :disabled="userStore.roleIds?.includes(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      :background="true"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @current-change="getHasRole"
      @size-change="sizeChange"
    />
  </el-card>

  <!-- 添加职位与更新已有职位的结构:对话框。意思是RoleParams.id有值则给title绑定更新职位，否则绑定添加职位？ -->
  <el-dialog
    v-model="dialogVisite"
    :title="RoleParams.id ? '更新职位' : '添加职位'"
  >
    <el-form :model="RoleParams" :rules="rules" ref="form">
      <el-form-item label="职位名称" prop="roleName">
        <el-input
          placeholder="请你输入职位名称"
          v-model="RoleParams.roleName"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" size="default" @click="dialogVisite = false">
        取消
      </el-button>
      <el-button type="primary" size="default" @click="save">确定</el-button>
    </template>
  </el-dialog>

  <!-- 抽屉组件:分配职位的菜单权限与按钮的权限 -->
  <el-drawer v-model="drawer">
    <template #header>
      <h4>分配菜单与按钮的权限</h4>
    </template>
    <template #default>
      <!-- 树形控件 -->
      <el-tree
        ref="tree"
        :data="menuArr"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="selectArr"
        :props="defaultProps"
      />
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawer = false">取消</el-button>
        <el-button type="primary" @click="handler">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
//请求方法
import {
  reqRemoveRole,
  reqAllRoleList,
  reqAddOrUpdateRole,
  reqAllMenuList,
  reqSetPermisstion,
} from '@/api/acl/role'
import type {
  RoleResponseData,
  Records,
  RoleData,
  MenuResponseData,
  MenuList,
} from '@/api/acl/role/type'
//引入骨架的仓库
import useLayOutSettingStore from '@/store/modules/setting'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
let settingStore = useLayOutSettingStore()
//当前页码
let pageNo = ref<number>(1)
//一页展示几条数据
let pageSize = ref<number>(10)
//搜索职位关键字
let keyword = ref<string>('')
//存储全部已有的职位
let allRole = ref<Records>([])
//职位总个数
let total = ref<number>(0)
//控制对话框的显示与隐藏
let dialogVisite = ref<boolean>(false)
//获取form组件实例
let form = ref<any>()
//控制抽屉显示与隐藏
let drawer = ref<boolean>(false)
//收集新增岗位数据
let RoleParams = reactive<RoleData>({
  roleName: '',
})
//准备一个数组:数组用于存储勾选的节点的ID(四级的)
let selectArr = ref<number[]>([])
//定义数组存储用户权限的数据
let menuArr = ref<MenuList>([])
//获取tree组件实例
let tree = ref<any>()
//组件挂载完毕
onMounted(() => {
  //获取职位请求
  getHasRole()
  console.log('当前登录用户的角色IDs:', userStore.roleIds)
})
//获取全部用户信息的方法|分页器当前页码发生变化的回调
const getHasRole = async (pager = 1) => {
  //修改当前页码
  pageNo.value = pager
  let result: RoleResponseData = await reqAllRoleList(
    pageNo.value,
    pageSize.value,
    keyword.value,
  )
  if (result.code == 200) {
    total.value = result.data.total
    allRole.value = result.data.records
  }
}
//下拉菜单的回调
const sizeChange = () => {
  getHasRole()
}
//搜索按钮的回调
const search = () => {
  //再次发请求根据关键字
  getHasRole()
  keyword.value = ''
}
//重置按钮的回调
const reset = () => {
  settingStore.refsh = !settingStore.refsh
}
//添加职位按钮的回调
const addRole = () => {
  //对话框显示出来
  dialogVisite.value = true
  //清空数据
  Object.assign(RoleParams, {
    roleName: '',
    id: 0,
  })
  //清空上一次表单校验错误结果
  nextTick(() => {
    form.value.clearValidate('roleName')
  })
}
//更新已有的职位按钮的回调
const updateRole = (row: RoleData) => {
  //显示出对话框
  dialogVisite.value = true
  //存储已有的职位----带有ID的
  Object.assign(RoleParams, row)
  //清空上一次表单校验错误结果
  nextTick(() => {
    form.value.clearValidate('roleName')
  })
}
//自定义校验规则的回调
const validatorRoleName = (rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 2) {
    callBack()
  } else {
    callBack(new Error('职位名称至少两位'))
  }
}
//职位校验规则
const rules = {
  roleName: [{ required: true, trigger: 'blur', validator: validatorRoleName }],
}

//确定按钮的回调
const save = async () => {
  //表单校验结果,结果通过在发请求、结果没有通过不应该在发生请求
  await form.value.validate()
  //添加职位|更新职位的请求
  let result: any = await reqAddOrUpdateRole(RoleParams)
  if (result.code == 200) {
    //提示文字
    ElMessage({
      type: 'success',
      message: RoleParams.id ? '更新成功' : '添加成功',
    })
    //对话框显示
    dialogVisite.value = false
    //再次获取全部的已有的职位
    getHasRole(RoleParams.id ? pageNo.value : 1)
  }
}

// 定义需要过滤掉的权限名称或标识符
const blackList = [
  '订单管理',
  '客户管理',
  '优惠管理',
  '分类管理',
  '测试',
  'Labelme',
  '全部',
]

const filterMenuData = (data: MenuList): MenuList => {
  return data.filter((item) => {
    // 如果名称在黑名单中，直接过滤掉
    if (blackList.includes(item.name)) return false

    // 如果有子节点，递归过滤子节点
    if (item.children && item.children.length > 0) {
      item.children = filterMenuData(item.children)
    }
    return true
  })
}

//分配权限按钮的回调
//已有的职位的数据
const setPermisstion = async (row: RoleData) => {
  selectArr.value = [] // 清空上一次的选中状态，防止数据残留
  drawer.value = true // 显示抽屉
  Object.assign(RoleParams, row) //收集当前要分类权限的职位的数据
  //根据职位获取权限的数据
  let result: MenuResponseData = await reqAllMenuList(RoleParams.id as number)
  if (result.code == 200) {
    menuArr.value = filterMenuData(result.data) // 先过滤掉多余的
    const checkedKeys = filterSelectArr(menuArr.value, []) // 获取需要勾选的 ID 数组
    console.log(checkedKeys) // []  length: 0  [[Prototype]]: Array(0)
    selectArr.value = filterSelectArr(menuArr.value, [])
    // 使用 nextTick 确保 DOM 更新后操作组件实例
    await nextTick()
    if (tree.value) {
      // 强制设置选中的节点
      tree.value.setCheckedKeys(checkedKeys)
    }
  }
}
//树形控件的测试数据
const defaultProps = {
  children: 'children',
  label: 'name',
}

const filterSelectArr = (allData: any, initArr: any) => {
  allData.forEach((item: any) => {
    if (item.select && item.level == 4) {
      initArr.push(item.id)
    }
    if (item.children && item.children.length > 0) {
      filterSelectArr(item.children, initArr)
    }
  })

  return initArr
}

//抽屉确定按钮的回调
const handler = async () => {
  //职位的ID
  const roleId = RoleParams.id as number
  //选中节点的ID
  let arr = tree.value.getCheckedKeys()
  //半选的ID
  let arr1 = tree.value.getHalfCheckedKeys()
  let permissionId = arr.concat(arr1)
  //下发权限
  let result: any = await reqSetPermisstion(roleId, permissionId)
  if (result.code == 200) {
    //抽屉关闭
    drawer.value = false
    //提示信息
    ElMessage({ type: 'success', message: '分配权限成功' })
    //页面刷新
    window.location.reload()
  }
}

//删除已有的职位
const removeRole = async (id: number) => {
  let result: any = await reqRemoveRole(id)
  if (result.code == 200) {
    //提示信息
    ElMessage({ type: 'success', message: '删除成功' })
    getHasRole(allRole.value.length > 1 ? pageNo.value : pageNo.value - 1)
  }
}
</script>

<style scoped>
.form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}
</style>
