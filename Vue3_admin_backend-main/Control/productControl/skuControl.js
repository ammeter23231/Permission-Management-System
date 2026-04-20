const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/verifyToken')
const {getSkuList,putGoosOnSale,getSkuInfo,saveSkuInfo,updateSkuInfo,deleteSkuById} = require("../../Mapper/productMapper/skuMapper");
// 获取已有的商品的数据-SKU
router.get('/admin/product/list/:page/:pageSize',verifyToken,async (req,res,next)=>{
    try {
        const page = parseInt(req.params.page) || 1
        const pageSize = parseInt(req.params.pageSize) || 10
        const data={
            records:[]
        }
        const result= await getSkuList(page,pageSize)
        data.records=result
        res.success(data)
    } catch (error) {
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 商品上架
router.get('/admin/product/onSale/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        await putGoosOnSale(skuId)
        res.success()
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 商品下架
router.get('/admin/product/cancelSale/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        await putGoosOnSale(skuId)

        res.success()
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 获取商品详情
router.get('/admin/product/getSkuInfo/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        const result=  await getSkuInfo(skuId)
        // const data={...result[0]}

        // console.log(data)
        res.success(result)
    } catch (error) {
        console.error('查询失败:', error)
        const msg = error.message || '服务器内部错误，请稍后再试'
        if (msg === 'SKU不存在') {
            return res.error(404, msg)
        }
        res.error(500, '服务器内部错误，请稍后再试')
    }
})
// 删除已有的商品（含图片、平台属性、销售属性等子表）
router.delete('/admin/product/deleteSku/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        await deleteSkuById(skuId)
        res.success()
    }catch (error){
        console.error('删除SKU失败:', error)
        const msg = error.message || '服务器内部错误，请稍后再试'
        if (msg === 'SKU不存在') {
            return res.error(404, msg)
        }
        res.error(500, msg)
    }
})
// 保存SKU信息
router.post('/admin/product/saveSkuInfo',verifyToken,async (req,res,next)=>{
    try {
        const body=req.body
        await saveSkuInfo(body)
        res.success()
    }catch (error){
        console.error('保存失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 更新已有 SKU（与 saveSkuInfo 结构一致，body 需带 id 为 sku_id）
router.post('/admin/product/updateSkuInfo',verifyToken,async (req,res,next)=>{
    try {
        const body=req.body
        await updateSkuInfo(body)
        res.success()
    }catch (error){
        console.error('更新SKU失败:', error)
        const msg = error.message || '服务器内部错误，请稍后再试'
        if (msg.includes('SKU不存在')) {
            return res.error(404, msg)
        }
        res.error(500, msg);
    }
})
module.exports = router;