let { Model } = require('../models/users');

var GiftCommet = async function (page) {
    let newresult = new Array();
    let result = page.body.result;
    if (result === undefined) return { status: -1, body: '没有评论' }
    for (let i = 0; i < result.length; i++) {
        let user = await Model.user(4, { id: result[i].userID });
        let username = user.body[0].username
        let a = new Object();
        a.commentID = result[i].commentID;
        a.userID = result[i].userID;
        a.username = username;
        a.value = result[i].value;
        a.date = result[i].date;
        a.state = result[i].status;
        newresult.push(a);
    }
    let thead = {
        commentID: '评论ID',
        userID: '评论人ID',
        username: '评论人名称',
        value: '评论内容',
        date: '评论时间',
    }
    page.body.thead = thead;
    page.body.tbody = newresult;
    page.body.result = undefined;
    return page
}; //包装全部评论

var GiftUsers = async function (users) {
    let result = users.body.result;
    let tbody = new Array();
    for (let i = 0; i < result.length; i++) {
        var item = new Object();
        item.username = result[i].username;
        item.userId = result[i].id;
        item.sex = result[i].sex;
        item.age = result[i].age;
        item.email = result[i].email;
        item.signinDate = result[i].date;
        item.state = result[i].status;
        item.isLogin = result[i].isToken;
        tbody.push(item);
    };
    users.body.tbody = tbody;
    users.body.result = undefined;
    users.body.thead = {
        username: "用户名",
        userId: "用户ID",
        sex: "性别",
        age: "年龄",
        email: "邮箱",
        signinDate: "注册时间",
        state: "状态",
        isLogin: "是否登录"
    }
    return users
};

var GiftUserItem = async function (userItem, userRecord) {
    let upper = {};
    let lower = {}
    upper.thead = {
        username: "用户名",
        userId: "用户ID",
        sex: "性别",
        age: "年龄",
        email: "邮箱",
        signinDate: "注册时间",
        state: "状态"
    };
    lower.thead = {
        isLogin: "是否登录",
        dateLogin: "最后登录时间",
        timeLogin: "总登录次数",
        dateComment: "最后评论时间",
        timeComment: "总评论次数",
        warnComment: "被删评论次数",
        warnUser: "账户被封次数"
    };
    upper.tbody = [];
    lower.tbody = [];
    let tbodyUpper = {};
    let tbodyLower = {};
    tbodyUpper.username = userItem.body[0].username;
    tbodyUpper.userId = userItem.body[0].id;
    tbodyUpper.sex = userItem.body[0].sex;
    tbodyUpper.age = userItem.body[0].age;
    tbodyUpper.email = userItem.body[0].email;
    tbodyUpper.signinDate = userItem.body[0].date;
    tbodyUpper.state = userItem.body[0].status;
    upper.tbody.push(tbodyUpper);
    tbodyLower.isLogin = userItem.body[0].isToken;
    tbodyLower.dateLogin = userRecord.body[0].dateLogin;
    tbodyLower.timeLogin = userRecord.body[0].timeLogin;
    tbodyLower.dateComment = userRecord.body[0].dateComment;
    tbodyLower.timeComment = userRecord.body[0].timeComment;
    tbodyLower.warnComment = userRecord.body[0].warnComment;
    tbodyLower.warnUser = userRecord.body[0].warnUser;
    lower.tbody.push(tbodyLower);
    let useritem = {};
    useritem.upper = upper;
    useritem.lower = lower;
    return useritem;
};

var GiftHistory = async function (userId, page, filter, pageSize) {
    let history = await Model.history(4, { userId: userId });
    if (history.body.length === 0) return { status: -1, body: '没有找到对应的历史数据库' };
    let a = history.body[0].value;
    if (filter !== undefined) {
        filter = JSON.parse(filter)
        var value = a.filter(item => item.state === filter.state);//过滤装置
    } else {
        var value = a
    }
    let pageParse = parseInt(page);
    let pageSizeParse = parseInt(pageSize);
    let valuelength = value.length;//总个数
    let total = Math.ceil(valuelength / pageSizeParse); //总页数
    let start = (pageParse - 1) * pageSizeParse; //开始位置
    let over = start + pageSizeParse; //结束位置
    let sliceValue = value.slice(start, over); //页数的数组
    let thead = {
        date: '时间',
        state: '状态',
        value: '内容',
        position: '位置',
        remark: '备注',
        adminId: '管理员',
    };
    let body = {
        total: valuelength,
        pages: total,
        page: pageParse,
        tbody: sliceValue,
        thead: thead
    }
    return { status: 200, body: body };
}


module.exports = { GiftCommet, GiftUsers, GiftUserItem, GiftHistory };