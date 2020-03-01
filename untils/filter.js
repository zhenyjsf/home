var { Model } = require('../models/users');

var filterSignin = async function (data) {
    let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (data.username === undefined || data.username === '') return { status: -1, body: '请填写用户名' };
    if (data.username.length < 2 || data.username.length > 20) return { status: -1, body: '用户名在3-20字之间' };
    if (data.password === undefined || data.password === '') return { status: -1, body: '请填写密码' };
    if (data.email === undefined || data.email === '') return { status: -1, body: '请输入邮箱' };
    if (!reg.test(data.email)) return { status: -1, body: '邮箱格式错误' };
    let flag = await Model.user(4, { email: data.email });
    if (flag.body.length !== 0) return { status: -1, body: '已有相同邮箱' }
    return { status: 200 }
};//注册录过滤

var loginSignin = async function (email, password) {
    let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    let user = await Model.user(4, { email: email });
    if (!reg.test(email)) return { status: -1, body: '邮箱格式错误' };
    if (user.body.length === 0) return { status: -1, body: '该账户不存在' };
    if (user.body[0].status < -2) return { status: -1, body: '该账户已被封禁' };
    if (user.body[0].isToken) return { status: -1, body: '该账户已登录' };
    if (user.body[0].password !== password) return { status: -1, body: '密码错误' };
    if(user.body[0].status === -2) return { status: -1, body: '您被封禁，请联系管理员' };
    if(user.body[0].status === -1) return { status: 200, body: user.body[0] ,state:'您已经被警告，请注意言论，再次被警告则会被封禁'};
    return { status: 200, body: user.body[0] };
};//邮箱登录过滤

var cookieSignin = async function (cookies, id) {
    let user = await Model.user(4, { id: parseInt(id) });
    if (user.body.length === 0) return { status: -1, body: '该账户不存在' };
    if (user.body[0].status < -2) return { status: -1, body: '该账户已被封禁' };
    if (user.body[0].cookies != cookies) return { status: -1, body: '验证已过期，请重新登录' };
    if(user.body[0].status === -2) return { status: -1, body: '您被封禁，请联系管理员' };
    var data = {};
    if (user.body[0].isToken) { data = { status: -2, body: '该账户已登录' } }else{ data = { status: 200 }  }
    if (user.body[0].status > 0) { data.admin = true } else { data.admin = false };
    if(user.body[0].status === -1) {data.state = '您已经被警告，请注意言论，再次被警告则会被封禁' };
    return data
};//cookie登录过滤

var TextFilter = async function (text, cookies, id) {
    if (text === undefined || text === '') return { status: -1, body: '请输入评论' };
    if (typeof text !== 'string') return { status: -1, body: '评论格式错误' };
    let user = await cookieSignin(cookies, id);
    if (user.status !== 200 && user.status !== -2) return user;
    return { status: 200 };
};//评论过滤

var isAdmin = async function (userId, status, cookies, id) {
    if (userId === undefined || userId === '') return { status: -1, body: '请输入用户id' };
    if (status === undefined || status === '') return { status: -1, body: '请输入需要更改的用户状态' };
    if (cookies === undefined || cookies === '') return { status: -1, body: '请检查cookie，或者请登录' };
    if (id === undefined || id === '') return { status: -1, body: '请检查cookie，或者请登录' };
    let user = await cookieSignin(cookies, id);
    if (user.status !== 200 && user.status !== -2) return user;
    if (!user.admin) return { status: -1, body: '请登录管理员账户' };
    return { status: 200 };
};//判断是否为管理员账号

module.exports = { filterSignin, loginSignin, cookieSignin, TextFilter, isAdmin };