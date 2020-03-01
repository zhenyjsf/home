var mongoose = require('mongoose');
var Schema = mongoose.Schema

var Mongoose = {
    url: 'mongodb://localhost:27017/home',
    connect() {
        mongoose.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
            if (err) {
                console.log(err);
                console.log('连接数据库home失败')
            } else {
                console.log('连接数据库home成功')
            }
        })
    }
};

const twoSchema = new Schema({ data: String });
const userSchema = new Schema({
    id: String,
    username: String,
    password: String,
    sex: String,
    age: Number,
    email: String,
    date: Object,
    status: Number,
    isToken: Boolean,
    cookies: Number,
})
const commentSchema = new Schema({
    commentID: String,
    userID: String,
    value: '',
    date: Object,
    status: String,
    adminId: String,
})
const recordSchema = new Schema({
    userId: Number,
    dateLogin: Object,
    timeLogin: Number,
    dateComment: Object,
    timeComment: Number,
    warnComment: Number,
    warnUser: Number,
})
const historySchema = new Schema({
    userId: Number,
    value: new Array,
})


const Two = mongoose.model('two', twoSchema);
const User = mongoose.model('user', userSchema);
const Comment = mongoose.model('comment', commentSchema);
const Record = mongoose.model('record', recordSchema);
const History = mongoose.model('history', historySchema);

var Model = {
    gettwo: async (data) => {
        let two = new Two({ data: data });
        return two.save().then(() => {
            return { status: 200 }
        }).catch(() => {
            return { status: -1 }
        })
    },//往测试数据库中存入数据
    user: async (status, data) => {
        switch (status) {
            case 1:
                let idBody = User.estimatedDocumentCount();
                var id = 0;
                await idBody.then((res) => {
                    id = res
                });
                id++;
                let user = {
                    id: id,
                    username: data.username,
                    password: data.password,
                    sex: data.sex,
                    age: data.age,
                    email: data.email,
                    date: new Date(),
                    status: 0,
                    isToken: false,
                    cookies: 0
                }
                let users = new User(user);
                return users.save().then(() => {
                    return { status: 200, body: id }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 3:
                return User.updateOne(data[0], data[1]).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 4:
                return User.find(data).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 5:
                return User.estimatedDocumentCount(data).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
        }
    },//对用户数据库的操作
    comment: async (status, data) => {
        switch (status) {
            case 1:
                let idBody = Comment.estimatedDocumentCount();
                var id = 0;
                await idBody.then((res) => {
                    id = res
                });
                id++;
                let comment = {
                    commentID: id,
                    userID: data.userID,
                    value: data.value,
                    date: new Date(),
                    status: 0,
                    adminId: 0,
                }
                let comments = new Comment(comment);
                return comments.save().then(() => {
                    return { status: 200 }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 2:
                return Comment.deleteOne(data).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 3:
                return Comment.updateOne(data[0], data[1]).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 4:
                return Comment.find(data).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 5:
                return Comment.estimatedDocumentCount(data).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            default:
                return { status: -1, body: '请选择正确数字' }
        }
    },//对评论数据库的操作
    record: async (type, data) => {
        switch (type) {//data为{userId:用户id}，仅在创建用户时使用
            case 1:
                var userId = data.userId
                if (userId === userSchema || userId === '') return { status: -1, body: '请输入ID' };
                let user = await User.find({ id: userId });
                if (user.length === 0 && type !== 1) return { status: -1, body: '没有找到ID' };
                let record = {
                    userId: userId,
                    dateLogin: new Date(),
                    timeLogin: 1,
                    dateComment: {},
                    timeComment: 0,
                    warnComment: 0,
                    warnUser: 0,
                }
                let records = new Record(record);
                return records.save().then(() => {
                    return { status: 200 }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 2:
                return { status: -1, body: '暂不支持' }
            case 3:
                return Record.updateOne(data[0], data[1]).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 4:
                return Record.find(data).then((res) => {
                    return { status: 200, body: res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
        }
    },//对用户详细资料数据库的操作
    history: async (type, data) => {
        switch (type) {
            case 1://传入数据为{userId:用户id}，仅在创建用户时候创建
                var userId = data.userId
                if (userId === userSchema || userId === '') return { status: -1, body: '请输入ID' };
                let user = await User.find({ id: userId });
                if (user.length === 0 && type !== 1) return { status: -1, body: '没有找到ID' };
                let history = {
                    userId: userId,
                    value: [{
                        id: 0,
                        date: new Date(),
                        state: 0,
                        value: '创建账号',
                        position: 'user',
                        remark:'',
                        adminId:'',
                    }],
                }
                let historys = new History(history);
                return historys.save().then(() => {
                    return { status: 200 }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 2:
                return { status: -1, body: '未启动' }
            case 3://传入的数据为[{userId:userId},{state:状态码,value:新增内容,position:位置,adminId:管理员账号,remark:备注}]
                let a = await History.find(data[0]);
                if(a === undefined) return;
                let id = a[0].value.length + 1;
                let value = a[0].value;
                let b = {
                    id: id,
                    date: new Date(),
                    state: data[1].state,
                    value: data[1].value,
                    position: data[1].position,
                    remark:data[1].remark ? data[1].remark : '',
                    adminId:data[1].adminId ? data[1].adminId : '',
                }
                value.push(b);
                return History.updateOne(data[0],{value:value}).then(() => {
                    return { status: 200 }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
            case 4:
                return History.find(data).then((res) => {
                    return { status: 200,body:res }
                }).catch((err) => {
                    return { status: -1, body: err }
                })
        }
    },//对用户历史记录数据库的操作
    page: async (type, data) => {//传入data为{filter:过滤,pageNo:当前页数,pageSize:一页多少个,sort:排列方式}
        if (type === undefined || type === '') return { status: -1, body: '请输入需要查询的数据库' };
        if (data.filter === undefined || data.filter === '') data.filter = {};
        if (data.pageNo === undefined || data.pageNo === '') data.pageNo = 1;
        if (data.pageSize === undefined || data.pageSize === '') data.pageNo = 20;
        if (data.sort === undefined || data.sort === '') {
            sort = { id: 1 };
        } else {
            data.sort = JSON.parse(data.sort);
        }
        switch (type) {
            case 'two':
                let totalTwo = await Two.estimatedDocumentCount(data.filter);
                if (totalTwo === 0) return { status: -1, body: '没有检查到结果，请重新检查内容' };
                let two = await Two.find(data.filter)
                    .skip((data.pageNo - 1) * data.pageSize)
                    .limit(parseInt(data.pageSize))
                    .sort(data.sort);
                if (two.length === 0) return { status: -1, body: '未找到数据' }
                let twoPages = Math.ceil(totalTwo / data.pageSize)
                return { status: 200, body: { result: two, total: totalTwo, pages: twoPages,page:data.pageNo } }

            case 'user':
                let totalUser = await User.estimatedDocumentCount(data.filter);
                if (totalUser === 0) return { status: -1, body: '没有检查到结果，请重新检查内容' };
                let user = await User.find(data.filter)
                    .skip((data.pageNo - 1) * data.pageSize)
                    .limit(parseInt(data.pageSize))
                    .sort(data.sort)
                if (user.length === 0) return { status: -1, body: '未找到数据' }
                let userPages = Math.ceil(totalUser / data.pageSize)
                return { status: 200, body: { result: user, total: totalUser, pages: userPages,page:data.pageNo } }

            case 'comment':
                let totalComment = await Comment.estimatedDocumentCount(data.filter);
                if (totalComment === 0) return { status: -1, body: '没有检查到结果，请重新检查内容' };
                let comment = await Comment.find(data.filter)
                    .skip((data.pageNo - 1) * data.pageSize)
                    .sort(data.sort)
                    .limit(parseInt(data.pageSize));
                if (comment.length === 0) return { status: -1, body: '未找到数据' }
                let commentPages = Math.ceil(totalComment / data.pageSize);
                return { status: 200, body: { result: comment, total: totalComment, pages: commentPages,page:data.pageNo } }
                
            default:
                return { status: -1, body: '请输入正确的数据库' };
        }
    },//表格分层查询
}

module.exports = { Mongoose, Model };