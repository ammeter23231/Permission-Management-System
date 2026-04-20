const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const { userLogin, getUserPermissions, updateCurrentUserAvatar } = require('../dataBase/api');
const { verifyToken} =require('../utils/verifyToken')
const JWT_EXPIRES_IN = 72000;
const JWT_SECRET = 'chenmiaozhan2024';

function toPublicAvatarUrl(req, avatarPath) {
  if (typeof avatarPath !== 'string' || !avatarPath.trim()) return '';
  const trimmedPath = avatarPath.trim();
  if (/^https?:\/\//i.test(trimmedPath) || trimmedPath.startsWith('data:')) {
    return trimmedPath;
  }
  const normalizedPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
  return `${req.protocol}://${req.get('host')}${normalizedPath}`;
}
// 登录接口
router.post('/admin/acl/index/login', async (req, res, next) => {
  try {
    // 1. 从POST请求体中获取前端传递的用户名和密码
    const { username, password } = req.body;

    // 2. 校验：如果前端没传用户名/密码，直接返回参数错误
    if (!username || !password) {
      return res.error(400, '错误：请输入用户名和密码');
    }
    const md5Password = md5(password);
    console.log(md5Password)
    // 3. 传入账号密码，调用登录方法
    const result = await userLogin(username, md5Password);
    // 4. 判断登录结果
    if (result.length > 0) {
      const userInfo = result[0];
      const token = jwt.sign(
        {
          userid: userInfo.id,
          username: userInfo.username
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.success(token , 'success');
    } else {
      res.error(401, '用户名或密码错误');
    }
  } catch (err) {
    console.log('登录接口异常：', err);
    res.error(500, '服务器内部错误，请稍后再试');
  }
});

// 获取用户个人信息接口
router.get('/admin/acl/index/info', verifyToken, async (req, res, next) => {
  try {
    // 从中间件中获取用户ID
    const userId = req.userId;

    // 调用数据库方法获取用户权限信息
    const userInfo = await getUserPermissions(userId);

    if (!userInfo) {
      return res.error(404, '用户不存在');
    }

    const avatarUrl = toPublicAvatarUrl(req, userInfo.avatar);

    // 返回权限信息（直接给前端可展示头像 URL）
    res.send({
      code: 200,
      message: 'success',
      data: {
        ...userInfo,
        avatarUrl
      }
    });
  } catch (err) {
    console.log('获取用户信息异常：', err);
    res.error(500, '服务器内部错误，请稍后再试');
  }
});

// 更新当前登录用户头像
router.post('/admin/acl/index/updateAvatar', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { avatar } = req.body || {};
    const avatarForSave = toPublicAvatarUrl(req, avatar);
    const result = await updateCurrentUserAvatar(userId, avatarForSave);
    if (!result.affectedRows) {
      return res.error(404, '用户不存在');
    }
    res.success({
      avatar: result.avatar,
      avatarUrl: toPublicAvatarUrl(req, result.avatar)
    }, 'success');
  } catch (err) {
    console.log('更新头像异常：', err);
    res.error(500, '服务器内部错误，请稍后再试');
  }
});
// 退出登录
router.post('/admin/acl/index/logout', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    res.send({
      code: 200,
      message: 'success',
      data: null,
      ok: true
    });
  } catch (err) {
    console.log('退出登录异常：', err);
    res.send({
      code: 200,
      message: 'success',
      data: null,
      ok: true
    });
  }
});

module.exports = router;
