//引入第三方库
let jwt = require('jsonwebtoken')
let db = uniCloud.database({
    throwOnNotFount: false,
})
//appId 和 appSecret必须填你自己的,不然会报错  后台修改request合法域名和uploadFile合法域名
//修改request文档地址 https://uniapp.dcloud.net.cn/uniCloud/publish.html
//小程序后台地址 https://mp.weixin.qq.com 
let appId = '填你自己的'
let appSecret = '填你自己的'
let jwtSecret = 'onejwtSecret'

exports.main = async (event, context) => {
    if (event.api == 'loginWithMp') {
        //发送请求 uniCloud.httpclient.request(URL,requestOptions)
        let wxRes = await uniCloud.httpclient.request(
            //注意是键盘左上角 ``
            `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${event.code}&grant_type=authorization_code`, {
                dataType: "json",
            });

        let userId = wxRes.data.openid;
        if (!userId) {
            throw Error(wxRes.data.errmsg)
        }
        let user = await db.collection('user').doc('userId').get();
        //声明token变量 固定格式'Bearer '+
        let token = 'Bearer ' + jwt.sign({
            userId
        }, jwtSecret)
        if (user.data[0]) {
            //存在则直接返回
            return {
                user: user.data[0],
                token
            }
        } else {
            //不存在,新增一个用户数据并返回
            let data = {
                _id: userId,
                createdAt: Date.now()
            }
            await db.collection('user').add(data);
            return {
                user: data,
                token
            }
        }
    }
    if (!event.token) {
        throw Error('未登录')
    }
    //使用verify验证并返回函数
    let auth = jwt.verify(event.token.replace('Bearer ', ''), jwtSecret)
    let userId = auth.userId;
    if (event.api == 'publish') {
        return await db.collection('message').add({
            content: event.content,
            public: false,
            userId,
        })
    }
    if (event.api == 'getMessages') {
        return await db.collection('message').where({
            public: true
        }).get()
    }
    if (event.api == 'getMyMessages') {
        return await db.collection('message').where({
            userId
        }).get()
    }
    if (event.api == 'deleteMyMessage') {
        return await db.collection('message').where({
            userId
        }).get()
    }



    //返回数据给客户端
    return ''
};

//  cd .\uniCloud-aliyun\cloudfunctions\fun 进入函数目录
// npx nrm use taobao  切换下载镜像为国内
// npm install jsonwebtoken 下载解密token的第三方库
