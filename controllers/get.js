let { Model } = require('../models/users');
let { isAdmin } = require('../untils/filter');
let { GiftCommet, GiftUsers, GiftUserItem, GiftHistory } = require('../untils/gift');

var get = {
    one: (req, res, next) => {
        let a = Model.user(5);
        a.then((rest) => {
            res.send({
                status: 200,
                body: rest
            })
        })
    },
    two: (req, res, next) => {
        let data = parseInt(req.query.data);
        if (data === undefined || data === '') return res.send({ status: -1, body: '请填写参数' })
        let body = Model.gettwo(data);
        body.then(() => { return res.send({ status: 200, body: '已成功保存入数据库' }) }).catch(() => {
            res.send({ status: -1, body: '保存入数据库失败' })
        })
    },
    three: (req, res, next) => {
        if (req.cookies.isFirst) {
            res.send({
                status: 201
            })
        } else {
            res.cookie('isFirst', 1, { maxAge: 60 * 1000 });
            res.send({ status: 200 })
        }
    },
    four: (req, res, next) => {
        if (req.session.token) {
            res.send({
                status: 201
            })
        } else {
            req.session.token = true;
            res.send({
                status: 200
            })
        }
    },
    five: (req, res, next) => {
        let data = req.query.data;
        if (data === '' || data === undefined) {
            return res.send({ status: -1 });
        }
        req.session.data = data;
        res.cookie('data', data, { maxAge: 1000 * 2 });
        res.send({ status: 200 });
    },
    fiveOne: (req, res, next) => {
        if (req.session.data) {
            return res.send({ status: 200, body: req.session.data });
        }
        return res.send({ status: -1 })
    },
    loginExit: (req, res, next) => {
        var id = undefined;
        if (req.query.id === '') {
            id = req.cookies.token.id;
        } else {
            id = req.query.id;
        }
        let exit = Model.user(3, [{ id: id }, { isToken: false, cookies: 0 }]);
        Model.history(3, [{ userId: id }, { state: 0, value: '用户退出登录', position: 'user' }]);
        exit.then(() => {
            res.cookie('token', 1, { maxAge: 0 });
            res.send({
                status: 200, body: '已成功退出'
            })
        })
    },//完全退出
    nowexit: (req, res, next) => {
        var id = req.cookies.token.id;
        if (id === undefined) return res.send({ status: -1, body: '请检查cookie' });
        let exit = Model.user(3, [{ id: id }, { isToken: false }]);
        exit.then(() => {
            res.send({
                status: 200, body: '已成功退出'
            })
        })
    },//网页关闭
    ball: (req, res, next) => {
        var ball = req.query.ball;
        ball++
        res.send({
            status: 200,
            body: ball
        })
    },//踢球
    isLogin: async (req, res, next) => {
        if (req.cookies.token === undefined) {
            return res.send({ status: -1, body: '您未登录，请手动登录' });
        }
        let token = req.cookies.token.token;
        let id = req.cookies.token.id;
        let user = await Model.user(4, { id: id });
        if (user.body.length === 0) return res.send({ status: -1, body: '该账户不存在' });
        if (!user.body[0].isToken) {
            if (user.body[0].cookies != token) {
                return res.send({ status: -1, body: '登录过期，请重新登录' });
            }
            Model.user(3, [{ id: id }, { isToken: true }]);
            return res.send({ status: 200 });
        }
        return res.send({ status: 200 });
    },
    commetTake: async (req, res, next) => {
        var data = new Object();
        let { age, size, sort, filter, username } = req.query;
        if (username !== '') {
            let cookies = req.cookies.token.token;//管理员随机码
            let id = req.cookies.token.id;//管理员id
            let admin = await isAdmin(0, 0, cookies, id);
            if (admin.status !== 200) return res.send({ status: -1, body: admin.body });
            //传进来判断管理员
            let user = await Model.user(4, { username: username });
            if (user.body.length === 0) return res.send({ status: -1, body: '未找到对应数据' })
            var userID = { userID: user.body[0].id };
        } else {
            var userID = {};
        }
        if (filter === undefined) { data.filter = { status: 0 } } else { data.filter = filter };
        data.filter = Object.assign(userID, data.filter);
        if (age === undefined) { data.pageNo = 1 } else { data.pageNo = age };
        if (size === undefined) { data.pageSize = 20 } else { data.pageSize = size };
        if (sort === undefined) { data.sort = { id: 1 } } else { data.sort = sort };
        let page = await Model.page('comment', data);
        let comment = await GiftCommet(page)
        res.send(comment);
    },//读取评论
    random: (req, res, next) => {
        res.send({ status: 200, body: Math.random().toString().substring(2, 4) })
    },//返回一个4位随机数
    alterUser: async (req, res, next) => {
        let status = parseInt(req.query.status);//账号状态
        let userId = req.query.userId;//账号id
        let cookies = req.cookies.token.token;//管理员随机码
        let id = req.cookies.token.id;//管理员id
        let admin = await isAdmin(userId, status, cookies, id);
        if (admin.status !== 200) return res.send({ status: -1, body: admin.body });
        let alteruser = await Model.user(3, [{ id: userId }, { status: status }]);
        if (alteruser.status !== 200) return res.send({ status: -1, body: alteruser.body });
        let user = await Model.record(4, { userId: userId });
        if (user.status !== 200) console.log(user.body);
        let users = await Model.user(4, { id: userId });
        let adminuser = await Model.user(4, { id: id });
        let username = users.body[0].username;//账号名称
        let adminname = adminuser.body[0].username;//管理员名称
        switch (status) {
            case -2:
                let warnUser = user.body[0].warnUser + 1;
                Model.record(3, [{ userId: userId }, { warnUser: warnUser }]);
                Model.history(3, [{ userId: userId }, { state: -1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')封禁', position: 'user', adminId: id, remark: '' }])
                Model.history(3, [{ userId: id }, { state: 1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')封禁', position: 'user', adminId: id, remark: '' }]);
                break;
            case -1:
                Model.history(3, [{ userId: userId }, { state: -1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')处于警告', position: 'user', adminId: id, remark: '' }])
                Model.history(3, [{ userId: id }, { state: 1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')处于警告', position: 'user', adminId: id, remark: '' }]);
                break;
            case 0:
                Model.history(3, [{ userId: userId }, { state: 0, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')解除禁封状态', position: 'user', adminId: id, remark: '' }])
                Model.history(3, [{ userId: id }, { state: 1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')解除禁封状态', position: 'user', adminId: id, remark: '' }]);
                break;
            case 1:
                Model.history(3, [{ userId: userId }, { state: 1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')提升为一级管理员', position: 'user', adminId: id, remark: '' }])
                Model.history(3, [{ userId: id }, { state: 1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')提升为一级管理员', position: 'user', adminId: id, remark: '' }]);
                break;
            case 2:
                Model.history(3, [{ userId: userId }, { state: 1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')提升为二级管理员', position: 'user', adminId: id, remark: '' }])
                Model.history(3, [{ userId: id }, { state: 1, value: username + '账号(id为' + userId + ')被管理员' + adminname + '(id为' + id + ')提升为二级管理员', position: 'user', adminId: id, remark: '' }]);
                break;
        }
        res.send({ status: 200, body: '已完成操作' });
    }, // 改变用户状态
    alterComment: async (req, res, next) => {
        let status = parseInt(req.query.status);//改变的评论状态
        let commentID = req.query.commentID;//评论id
        let cookies = req.cookies.token.token;//cookie中的随机值
        let id = req.cookies.token.id;//管理员id
        let admin = await isAdmin(commentID, status, cookies, id);
        if (admin.status !== 200) return res.send({ status: -1, body: admin.body });
        let altercomment = await Model.comment(3, [{ commentID: commentID }, { status: status, adminId: id }])//改变评论状态
        if (altercomment.status !== 200) return res.send({ status: -1, body: altercomment.body });
        let adminuser = await Model.user(4, { id: id });
        let adminname = adminuser.body[0].username;//管理员名称
        let comments = await Model.comment(4, { commentID: commentID });
        let commentValue = comments.body[0].value;//评论内容
        let userId = comments.body[0].userID;//写评论用户id
        let user = await Model.user(4, { id: userId });
        let username = user.body[0].username;//写评论用户名称
        let userRecord = await Model.record(4, { userId: userId });
        if (userRecord.status !== 200) console.log(user.body);
        if (status < 0) {
            let warnComment = userRecord.body[0].warnComment + 1;//被删评论+1
            Model.record(3, [{ userId: userId }, { warnComment: warnComment }]);
            Model.history(3, [{ userId: userId }, { state: -1, value: username + '(id为' + userId + ')发表的评论' + commentValue + '(评论id为' + commentID + ')所删除', position: 'comment', adminId: id, remark: '' }]);//被删账号视角
            Model.history(3, [{ userId: id }, { state: 1, value: '用户' + username + '(id为' + userId + ')所发的评论' + commentValue + '(评论id为' + commentID + ')被管理员' + adminname + '(id为' + id + ')删除', position: 'comment', adminId: id, remark: '' }]);//管理员视角
        }
        res.send({ status: 200, body: '已删除评论' })
    }, // 改变评论状态
    users: async (req, res, next) => {
        let { page, filter, pageSize, sort } = req.query
        if (page === undefined || page === '') page = 1;
        if (req.cookies.token === undefined) return res.send({ status: -1, body: '请登录管理员账号' })
        let id = req.cookies.token.id;
        let cookies = req.cookies.token.token;
        let admin = await isAdmin(0, 0, cookies, id);
        if (admin.status !== 200) return res.send(admin);
        if (filter === '' || filter === undefined) { filter = {} } else { filter = JSON.parse(filter) }
        let data = {
            filter: filter,
            pageNo: page,
            pageSize: pageSize,
            sort: sort,
        }
        let users = await Model.page('user', data);
        let user = await GiftUsers(users)
        res.send(user);
    },//返回全体用户资料，需要管理员
    userItem: async (req, res, next) => {
        let userId = req.query.userId;
        if (req.cookies.token === undefined) return res.send({ status: -1, body: '请登录管理员账号' })
        let id = req.cookies.token.id;
        let cookies = req.cookies.token.token;
        let user = await isAdmin(userId, 0, cookies, id);
        if (user.status !== 200) return res.send(user);
        let userItem = await Model.user(4, { id: userId });
        let userRecord = await Model.record(4, { userId: userId });
        if (userItem.status !== 200) return res.send(userItem);
        if (userRecord.status !== 200) return res.send(userRecord);
        let useritem = await GiftUserItem(userItem, userRecord);
        res.send(useritem);
    },//返回单个用户详细资料，需要管理员
    userHistory: async (req, res, next) => {
        let userId = req.query.userId;
        let { page, filter, pageSize } = req.query;//当前页数，过滤器，一页多少个
        if (req.cookies.token === undefined) return res.send({ status: -1, body: '请登录管理员账号' })
        let id = req.cookies.token.id;//管理员id
        let cookies = req.cookies.token.token;//管理员随机码
        let user = await isAdmin(userId, page, cookies, id);
        if (user.status !== 200) return res.send(user);
        //检查是否为管理员
        let body = await GiftHistory(userId, page, filter, pageSize);
        res.send(body);
    },//返回一个账号的历史资料
    isAdmin: async (req, res, next) => {
        if (req.cookies.token === undefined) return res.send({ status: -1, body: '请登录管理员账号' })
        let id = req.cookies.token.id;//管理员id
        let cookies = req.cookies.token.token;//管理员随机码
        let user = await isAdmin(0, 0, cookies, id);
        if (user.status !== 200) return res.send(user);
        return res.send({ status: 200 });
    },//检查是否为管理员
}


module.exports = get;