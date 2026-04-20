//SKU模块接口管理
import request from '@/utils/request'
import type { SkuResponseData, SkuInfoData } from './type'
//枚举地址
enum API {
  //获取已有的商品的数据-SKU
  SKU_URL = '/admin/product/list/',
  //上架
  SALE_URL = '/admin/product/onSale/',
  //下架的接口
  CANCELSALE_URL = '/admin/product/cancelSale/',
  //获取商品详情的接口
  SKUINFO_URL = '/admin/product/getSkuInfo/',
  //删除已有的商品
  DELETESKU_URL = '/admin/product/deleteSku/',
}
//获取商品SKU的接口（带时间戳避免 GET 被缓存为 304，删除/上下架后列表不刷新）
export const reqSkuList = (page: number, limit: number) =>
  request.get<any, SkuResponseData>(API.SKU_URL + `${page}/${limit}`, {
    params: { _t: Date.now() },
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
//已有商品上架的请求
export const reqSaleSku = (skuId: number) =>
  request.get<any, any>(API.SALE_URL + skuId)
//下架的请求
export const reqCancelSale = (skuId: number) =>
  request.get<any, any>(API.CANCELSALE_URL + skuId)
//获取商品详情的接口（带时间戳与禁用缓存头，避免 304 返回旧数据与当前行不一致）
export const reqSkuInfo = (skuId: number) =>
  request.get<any, SkuInfoData>(API.SKUINFO_URL + skuId, {
    params: { _t: Date.now() },
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
//删除某一个已有的商品
export const reqRemoveSku = (skuId: number) =>
  request.delete<any, any>(API.DELETESKU_URL + skuId)
