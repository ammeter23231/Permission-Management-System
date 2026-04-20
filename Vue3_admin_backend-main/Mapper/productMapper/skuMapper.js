const getConnection = require('../../dataBase/db')
// 获取已有的商品的数据-SKU
const getSkuList=async (page,pageSize)=>{
    let connection = null
    try {
        connection = await getConnection()
        const [row] =await connection.query("select sku_id as id,spu_id as spuID,category_3_id as category3Id,tm_id as tmId,sku_name as skuName,weight,price,sku_desc as skuDesc,sku_Desc as skuDesc,sku_default_img as skuDefaultImg, is_sale as isSale from sku")
        return row
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 商品上架
const putGoosOnSale=async (skuId)=>{
    let connection = null
    try {
        connection = await getConnection()
        //校验商品Id参数
        if(!skuId){
            throw new Error('商品ID不能为空')
        }
        const [row] =await connection.query('select is_sale as isSale from sku where sku_id=?',[skuId])
        //没有查到商品
        if(row.length===0){
            throw new Error('商品不存在')
        }
        const  currentState=row[0].isSale
        const newState=1-currentState

        const result = await connection.query('update sku set is_sale=? where sku_id=?', [newState, skuId])
        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 获取商品详情
const getSkuInfo=async (skuId)=>{
    let connection = null
    try {
        connection = await getConnection()
        const [row1] = await connection.query(
            `select s.sku_id as id,s.spu_id as spuID,s.category_3_id as category3Id,s.tm_id as tmId,
                s.sku_name as skuName,s.weight,s.price,s.sku_desc as skuDesc,s.sku_default_img as skuDefaultImg,s.is_sale as isSale,
                c3.category2_id as category2Id,c2.category1_id as category1Id
            from sku s
            inner join category3 c3 on s.category_3_id = c3.category3_id
            inner join category2 c2 on c3.category2_id = c2.category2_id
            where s.sku_id=?`,
            [skuId]
        )
        if (!row1 || row1.length === 0) {
            throw new Error('SKU不存在')
        }
        //获取平台属性
        const [row2]=await connection.query(
            'select sku_attr_value_id as rowPk,attr_id as attrId,value_id as valueId,value_name as valueName,attr_name as attrName,sku_id as skuId from sku_attr_value where sku_id=?',
            [skuId]
        )

        //获取销售属性（必须按 sku_id 过滤，否则会把所有 SKU 的销售属性混在一起）
        const [row3] = await connection.query(
            'select sku_sale_attr_value_id as rowPk,sale_attr_id as saleAttrId,sale_attr_value_id as saleAttrValueId,sale_attr_name as saleAttrName,sale_attr_value_name as saleAttrValueName,sku_id as skuId from sku_sale_attr_value where sku_id=?',
            [skuId]
        )
        //获取商品图片
        const [row4]= await connection.query(
            'select image_id as id,sku_id as skuId,image_url as imgUrl,spu_image_id as spuImgId,is_default as isDefault from sku_image where sku_id=?',
            [skuId]
        )
        const result={
            ...row1[0],
            "skuAttrValueList":row2,
            "skuSaleAttrValueList":row3,
            "skuImageList":row4
        }
        // console.log(result)

        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const saveSkuInfo = async (params) => {
    let connection = null
    try {
        connection = await getConnection()
        const { spuId, category3Id, tmId, skuName, weight, price, skuDesc, skuDefaultImg, isSale, skuAttrValueList, skuSaleAttrValueList, skuImageList } = params;

        if (!spuId || !category3Id || !tmId || !skuName) {
            throw new Error('缺少必要参数');
        }
        const finalIsSale = (isSale === undefined || isSale === null) ? 0 : isSale;

        await connection.beginTransaction();

        const skuId = Date.now() + Math.floor(Math.random() * 1000);

        await connection.query(
            "INSERT INTO sku (sku_id, spu_id, category_3_id, tm_id, sku_name, weight, price, sku_desc, sku_default_img, is_sale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                // [skuId, spuId, category3Id, tmId, skuName, weight, price, skuDesc, skuDefaultImg, isSale]
                [skuId, spuId, category3Id, tmId, skuName, weight, price, skuDesc, skuDefaultImg, finalIsSale]
        );

        for (let imageItem of skuImageList) {
            if (imageItem.imgUrl) {
                const imageId = Date.now() + Math.floor(Math.random() * 1000);
                const isDefault = imageItem.isDefault === "1" ? 1 : 0;
                await connection.query(
                    "INSERT INTO sku_image (image_id, sku_id, image_url, spu_image_id, is_default) VALUES (?, ?, ?, ?, ?)",
                    [imageId, skuId, imageItem.imgUrl, imageItem.spuImgId, isDefault]
                );
            }
        }

        for (let attrItem of skuAttrValueList) {
            if (attrItem.attrId && attrItem.valueId) {
                const [attrNameResult] = await connection.query("SELECT attr_name FROM attr WHERE attr_id = ?", [attrItem.attrId]);
                const [valueNameResult] = await connection.query("SELECT value_name FROM attr_value WHERE attr_value_id = ?", [attrItem.valueId]);
                
                if (attrNameResult.length > 0 && valueNameResult.length > 0) {
                    const skuAttrValueId = Date.now() + Math.floor(Math.random() * 1000);
                    await connection.query(
                        "INSERT INTO sku_attr_value (sku_attr_value_id, attr_id, value_id, value_name, attr_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)",
                        [skuAttrValueId, attrItem.attrId, attrItem.valueId, valueNameResult[0].value_name, attrNameResult[0].attr_name, skuId]
                    );
                }
            }
        }

        for (let saleAttrItem of skuSaleAttrValueList) {
            if (saleAttrItem.saleAttrId && saleAttrItem.saleAttrValueId) {
                const [saleAttrNameResult] = await connection.query("SELECT sale_attr_name FROM spu_sale_attr WHERE spu_sale_attr_id = ?", [saleAttrItem.saleAttrId]);
                const [saleAttrValueNameResult] = await connection.query("SELECT sale_attr_value_name FROM sale_attr_value WHERE sale_attr_value_id = ?", [saleAttrItem.saleAttrValueId]);
                
                if (saleAttrNameResult.length > 0 && saleAttrValueNameResult.length > 0) {
                    const skuSaleAttrValueId = Date.now() + Math.floor(Math.random() * 1000);
                    await connection.query(
                        "INSERT INTO sku_sale_attr_value (sku_sale_attr_value_id, sale_attr_id, sale_attr_value_id, sale_attr_name, sale_attr_value_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)",
                        [skuSaleAttrValueId, saleAttrItem.saleAttrId, saleAttrItem.saleAttrValueId, saleAttrNameResult[0].sale_attr_name, saleAttrValueNameResult[0].sale_attr_value_name, skuId]
                    );
                }
            }
        }

        await connection.commit();
        console.log('SKU 信息保存成功，SKU ID:', skuId);
        return { success: true, message: '保存成功', skuId: skuId };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('保存失败:', error);
        throw new Error('保存失败: ' + error.message);
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

const updateSkuInfo = async (params) => {
    let connection = null
    try {
        connection = await getConnection()
        const {
            id: skuId,
            spuId,
            category3Id,
            tmId,
            skuName,
            weight,
            price,
            skuDesc,
            skuDefaultImg,
            isSale,
            skuAttrValueList,
            skuSaleAttrValueList,
            skuImageList,
        } = params

        if (!skuId || !spuId || !category3Id || !tmId || !skuName) {
            throw new Error('缺少必要参数');
        }
        const [exists] = await connection.query('select sku_id from sku where sku_id=?', [skuId])
        if (exists.length === 0) {
            throw new Error('SKU不存在')
        }
        const finalIsSale = (isSale === undefined || isSale === null) ? 0 : isSale

        await connection.beginTransaction()

        await connection.query(
            'UPDATE sku SET spu_id=?, category_3_id=?, tm_id=?, sku_name=?, weight=?, price=?, sku_desc=?, sku_default_img=?, is_sale=? WHERE sku_id=?',
            [spuId, category3Id, tmId, skuName, weight, price, skuDesc, skuDefaultImg, finalIsSale, skuId],
        )

        await connection.query('DELETE FROM sku_image WHERE sku_id=?', [skuId])
        await connection.query('DELETE FROM sku_attr_value WHERE sku_id=?', [skuId])
        await connection.query('DELETE FROM sku_sale_attr_value WHERE sku_id=?', [skuId])

        for (let imageItem of skuImageList || []) {
            if (imageItem.imgUrl) {
                const imageId = Date.now() + Math.floor(Math.random() * 1000)
                const isDefault = imageItem.isDefault === '1' ? 1 : 0
                await connection.query(
                    'INSERT INTO sku_image (image_id, sku_id, image_url, spu_image_id, is_default) VALUES (?, ?, ?, ?, ?)',
                    [imageId, skuId, imageItem.imgUrl, imageItem.spuImgId, isDefault],
                )
            }
        }

        for (let attrItem of skuAttrValueList || []) {
            if (attrItem.attrId && attrItem.valueId) {
                const [attrNameResult] = await connection.query('SELECT attr_name FROM attr WHERE attr_id = ?', [attrItem.attrId])
                const [valueNameResult] = await connection.query('SELECT value_name FROM attr_value WHERE attr_value_id = ?', [attrItem.valueId])

                if (attrNameResult.length > 0 && valueNameResult.length > 0) {
                    const skuAttrValueId = Date.now() + Math.floor(Math.random() * 1000)
                    await connection.query(
                        'INSERT INTO sku_attr_value (sku_attr_value_id, attr_id, value_id, value_name, attr_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)',
                        [skuAttrValueId, attrItem.attrId, attrItem.valueId, valueNameResult[0].value_name, attrNameResult[0].attr_name, skuId],
                    )
                }
            }
        }

        for (let saleAttrItem of skuSaleAttrValueList || []) {
            if (saleAttrItem.saleAttrId && saleAttrItem.saleAttrValueId) {
                const [saleAttrNameResult] = await connection.query('SELECT sale_attr_name FROM spu_sale_attr WHERE spu_sale_attr_id = ?', [saleAttrItem.saleAttrId])
                const [saleAttrValueNameResult] = await connection.query('SELECT sale_attr_value_name FROM sale_attr_value WHERE sale_attr_value_id = ?', [saleAttrItem.saleAttrValueId])

                if (saleAttrNameResult.length > 0 && saleAttrValueNameResult.length > 0) {
                    const skuSaleAttrValueId = Date.now() + Math.floor(Math.random() * 1000)
                    await connection.query(
                        'INSERT INTO sku_sale_attr_value (sku_sale_attr_value_id, sale_attr_id, sale_attr_value_id, sale_attr_name, sale_attr_value_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)',
                        [skuSaleAttrValueId, saleAttrItem.saleAttrId, saleAttrItem.saleAttrValueId, saleAttrNameResult[0].sale_attr_name, saleAttrValueNameResult[0].sale_attr_value_name, skuId],
                    )
                }
            }
        }

        await connection.commit()
        return { success: true, message: '更新成功', skuId }
    } catch (error) {
        if (connection) {
            await connection.rollback()
        }
        console.error('更新SKU失败:', error)
        throw new Error('更新失败: ' + error.message)
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

/** 按业务主键 sku_id 删除 SKU 及其子表数据 */
const deleteSkuById = async (skuId) => {
    let connection = null
    try {
        connection = await getConnection()
        if (!skuId) {
            throw new Error('SKU ID不能为空')
        }
        const [exists] = await connection.query('select sku_id from sku where sku_id=?', [skuId])
        if (exists.length === 0) {
            throw new Error('SKU不存在')
        }
        await connection.beginTransaction()
        await connection.query('DELETE FROM sku_image WHERE sku_id=?', [skuId])
        await connection.query('DELETE FROM sku_attr_value WHERE sku_id=?', [skuId])
        await connection.query('DELETE FROM sku_sale_attr_value WHERE sku_id=?', [skuId])
        await connection.query('DELETE FROM sku WHERE sku_id=?', [skuId])
        await connection.commit()
    } catch (error) {
        if (connection) {
            await connection.rollback()
        }
        throw error
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports={
    getSkuList,
    putGoosOnSale,
    getSkuInfo,
    saveSkuInfo,
    updateSkuInfo,
    deleteSkuById
}