//查询数据库方法
const fs = require('fs')
const path = require('path')
const getConnection = require('./db')

// 用户登录
const userLogin = async (username, password) => {
    let connection = null
    try {
        connection = await getConnection()
        console.log("select * from user where username=? and password =?", [username, password])
        const [rows] = await connection.query("select * from user where username=? and password =?", [username, password])
        return rows
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

const DEFAULT_AVATAR_PATH = '/static/img/userDefaultAvatar/defaultAvatar.svg'
const DEFAULT_AVATAR_API_PATH = '/api/static/img/userDefaultAvatar/defaultAvatar.svg'
const STATIC_DIR = path.join(__dirname, '..', 'static')

const isMisplacedDefaultAvatar = (avatarPath) => {
    if (typeof avatarPath !== 'string') return false
    const normalized = avatarPath.trim().toLowerCase()
    return normalized.includes('/img/sph/') && normalized.endsWith('/defaultavatar.jpg')
}

const toApiStaticPath = (avatarPath) => {
    if (typeof avatarPath !== 'string') return DEFAULT_AVATAR_API_PATH
    if (avatarPath.startsWith('/api/static/')) return avatarPath
    if (avatarPath.startsWith('/static/')) return avatarPath.replace('/static/', '/api/static/')
    return avatarPath
}

const getAvatarOrDefault = (avatar) => {
    if (typeof avatar !== 'string') return DEFAULT_AVATAR_API_PATH
    const trimmedAvatar = avatar.trim()
    if (!trimmedAvatar) return DEFAULT_AVATAR_API_PATH

    // 兼容历史数据：先统一成 /static 用于本地文件校验
    const normalizedAvatarPath = trimmedAvatar.startsWith('/api/static/')
        ? trimmedAvatar.replace('/api/static/', '/static/')
        : trimmedAvatar

    // 历史误用路径纠偏：defaultAvatar.jpg 应该固定指向 userDefaultAvatar 目录
    if (isMisplacedDefaultAvatar(normalizedAvatarPath)) {
        return DEFAULT_AVATAR_API_PATH
    }

    // 对本地静态资源做存在性校验，不存在则兜底默认头像
    if (normalizedAvatarPath.startsWith('/static/')) {
        const relativePath = normalizedAvatarPath.replace('/static/', '')
        const absolutePath = path.join(STATIC_DIR, ...relativePath.split('/'))
        if (!fs.existsSync(absolutePath)) {
            return DEFAULT_AVATAR_API_PATH
        }
    }

    return toApiStaticPath(normalizedAvatarPath)
}

// 获取用户权限信息
const getUserPermissions = async (userId) => {
    let connection = null
    try {
        connection = await getConnection()

        // 1. 通过 id 查询用户基本信息，获取 user_id
        const [userRows] = await connection.query("SELECT user_id, username, name, avatar FROM user WHERE id = ?", [userId])
        if (userRows.length === 0) {
            return null
        }
        const userInfo = userRows[0]
        const businessUserId = userInfo.user_id  // 获取业务主键 user_id

        // 2. 查询用户的角色名称（使用 user_id）
        const [roleRows] = await connection.query(`
            SELECT r.role_name, r.role_id
            FROM role r
            INNER JOIN user_role ur ON r.role_id = ur.role_id
            WHERE ur.user_id = ?
        `, [businessUserId])
        const roles = roleRows.map(row => row.role_name)
        const roleIds = roleRows.map(row => row.role_id) // 新增：提取角色ID列表

        // 3. 查询用户的菜单权限（使用 user_id）
        const [menuRows] = await connection.query(`
            SELECT DISTINCT m.code, m.type
            FROM menu m
            INNER JOIN role_menu rm ON m.menu_id = rm.menu_id
            INNER JOIN user_role ur ON rm.role_id = ur.role_id
            WHERE ur.user_id = ?
            AND m.type IN (1, 2)
            AND m.code != ''
        `, [businessUserId])

        // 分离路由和按钮权限
        const routes = []
        const buttons = []
        menuRows.forEach(menu => {
            if (menu.type === 1) {
                // type=1 是菜单/路由
                routes.push(menu.code)
            } else if (menu.type === 2 && menu.code.startsWith('btn.')) {
                // type=2 是按钮
                buttons.push(menu.code)
            }
        })

        return {
            routes,
            buttons,
            roles,
            roleIds, // 新增：返回角色ID数组
            name: userInfo.username,
            avatar: getAvatarOrDefault(userInfo.avatar)
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// 更新当前登录用户头像
const updateCurrentUserAvatar = async (userId, avatar) => {
    let connection = null
    try {
        connection = await getConnection()
        const finalAvatar = getAvatarOrDefault(avatar)
        const [result] = await connection.query(
            'UPDATE user SET avatar = ? WHERE id = ?',
            [finalAvatar, userId]
        )
        return {
            affectedRows: result.affectedRows,
            avatar: finalAvatar
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// 分页查询属性列表
const attrList = async (page = 1, limit = 10) => {
    let connection = null
    try {
        connection = await getConnection()

        // 计算偏移量
        const offset = (page - 1) * limit

        // 查询总记录数
        const [countRows] = await connection.query("SELECT COUNT(*) as total FROM attr")
        const total = countRows[0].total

        // 查询当前页数据
        const [dataRows] = await connection.query("SELECT * FROM attr LIMIT ? OFFSET ?", [limit, offset])

        return {
            data: dataRows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = {
    userLogin,
    getUserPermissions,
    updateCurrentUserAvatar,
    attrList
}
