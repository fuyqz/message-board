<template>
    <view class="content">
        <input type="text" class="input" v-model="content" placeholder="留言">
        <button type="primary" @click="publish()" size="mini">发布</button>
        <button type="primary" @click="getList('getMyMessages')" size="mini">我的留言</button>
    </view>
    <view v-for="item in list" :key="item_id">
        <view class="box">
            <view>{{item.content }}</view>
            <view v-if="!item.publish">未公开</view>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                content: '',
                list: [],
            }
        },
        onLoad() {
            //获取token
            let token = uni.getStorageSync('token');
            //不存在token,使用第三方程序获取第三方code
            if (!token) {
                //调用loginWithMp函数
                uni.login().then(({
                    code
                }) => {
                    uniCloud.callFunction({
                        name: 'fun',
                        data: {
                            api: 'loginWithMp',
                            code
                        }
                    }).then(({
                        result
                    }) => {
                        token = result.token;
                        //保存到前端
                        uni.setStorageSync('token', token)
                        //列表查询
                        this.getList();
                    })
                })
            } else {
                //已登录,直接查询
                this.getList();
            }
        },
        methods: {
            getList(api) {
                uniCloud.callFunction({
                    name: 'fun',
                    data: {
                        api: api || 'getMessages',
                        token: uni.getStorageSync('token')
                    }
                }).then(res => {
                    this.list = res.result.data
                })
            },
            publish() {
                uniCloud.callFunction({
                    name: 'fun',
                    data: {
                        api: 'publish',
                        content: this.content,
                        token: uni.getStorageSync('token')
                    }
                }).then(res => {
                    this.content = '';
                    uni.showToast({
                        title: '留言成功',
                        icon: 'success'
                    })
                })
            }
        }
    }
</script>

<style>
    .content {
        display: flex;
        align-items: center;
        margin: 40px;

    }

    .input {
        border-bottom: 1px solid #ccc;
        padding: 6px;
        flex: 1;
    }

    .box {
        margin: 40rpx;
        border-bottom: 1px solid #ccc;
        padding: 20rpx 0;

    }
</style>



}
