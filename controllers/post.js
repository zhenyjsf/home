var { filterSignin, loginSignin, cookieSignin, TextFilter } = require('../untils/filter')
var { Model } = require('../models/users')

var post = {
    one: (req, res, next) => {
        res.send({
            status: 1,
            body: 'Hello world Post'
        })
    },//post请求验证
    login: async (req, res, next) => {
        if (req.cookies.token === undefined) {
            var { email, password } = req.body;
            let isToken = await loginSignin(email, password);
            if (isToken.status !== 200) return res.send({ status: -1, body: isToken.body })
            let token = Math.random().toString().substring(2, 8);
            Model.user(3, [{ id: isToken.body.id }, { cookies: token, isToken: true }]);
            let records = await Model.record(4, { userId: isToken.body.id });
            if (records.status !== 200) return res.send({ status: -1, body: records.body })
            let timeLogin = records.body[0].timeLogin + 1;
            Model.record(3, [{ userId: isToken.body.id }, { dateLogin: new Date(), timeLogin: timeLogin }]);
            Model.history(3, [{ userId: isToken.body.id }, { state: 0, value: '用户登录', position: 'user' }]);
            res.cookie('token', { token: token, id: parseInt(isToken.body.id) }, { maxAge: 60 * 1000 * 60 * 7 });
            if(isToken.state !== undefined) return res.send({ status: 200, body: '登录成功',state:isToken.state });
            res.send({ status: 200, body: '登录成功' });
        } else {
            var { email } = req.body;
            if (email !== undefined) return res.send({ status: -1, body: '您已登录其他账户，请退出后重新登录' });
            var id = req.cookies.token.id;
            var cookies = req.cookies.token.token;
            let isToken = await cookieSignin(cookies, id);
            if (isToken.status !== 200) return res.send({ status: -1, body: isToken.body })
            Model.record(3, [{ userId: isToken.body.id }, { dateLogin: new Date(), timeLogin: timeLogin }]);
            Model.history(3, [{ userId: isToken.body.id }, { state: 0, value: '用户登录', position: 'user' }]);
            Model.user(3, [{ id: id }, { isToken: true }]);
            res.send({ status: 200, body: '登录成功' });
        }
    },//登录请求
    signin: async (req, res, next) => {
        var { username, password, sex, age, email } = req.body;
        var data = {
            username: username,
            password: password,
            sex: sex,
            age: parseInt(age),
            email: email,
        };
        let filter = await filterSignin(data);
        if (filter.status !== 200) return res.send({ status: -1, body: filter.body })
        var ids = await Model.user(5);
        var id = ids.body;
        id++;
        let record = await Model.record(1, { userId: id });
        let history = await Model.history(1, { userId: id });
        if (record.status !== 200) res.send({ status: -1, body: record.body });
        if (history.status !== 200) res.send({ status: -1, body: history.body });
        let user = await Model.user(1, data);
        if (user.status === 200) return res.send({ status: 200, body: '注册成功' });
        res.send({ status: -1, body: '注册失败，' + user.body });
    },//注册请求
    submitText: async (req, res, next) => {
        var { text } = req.body;
        var id = req.cookies.token.id;
        var cookies = req.cookies.token.token;
        let filter = await TextFilter(text, cookies, id);
        if (filter.status !== 200) return res.send(filter);
        let comment = await Model.comment(1, { userID: id, value: text });
        if (comment.status !== 200) return res.send({ status: -1, body: '添加失败' });
        let record = await Model.record(4, { userId: id });
        if (record.status !== 200) return res.send({ status: -1, body: '读取record数据库失败' });
        let timeComment = record.body[0].timeComment + 1;
        Model.record(3, [{ userId: id }, { dateComment: new Date(), timeComment: timeComment }]);
        Model.history(3, [{ userId: id }, { state: 0, value: '写评论 = ' + text, position: 'comment' }])
        res.send({ status: 200, body: '添加成功' })
    },//收到评论请求
}


module.exports = post;