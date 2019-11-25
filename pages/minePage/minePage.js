/** @format */
var app = getApp();
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    information: {
      type: Object
    },
    open: {
      type: Boolean
    }
  },

  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    translate: '',
    clname: false, //以上侧边栏效果变量
    homecenters: app.globalData.deviceAll.roster,
    boxName: app.globalData.boxName, //这个是展示到导航上面的使用的box名字
    add_homecenter: app.globalData.addHomecenterMsg, //用户请求添加消息或者被邀请添加家庭中心
    nickname: app.globalData.userInfo, //昵称
    headPortrait: app.globalData.avatarUrl //头像
  },
  methods: {
    // 注销账号
    cancel: function() {
      wx.showModal({
        title: '注销账号',
        content: '确定注销账号吗？',
        success: function(e) {
          console.log(e);
          wx.clearStorageSync();
          if (e.confirm) {
            var delUrl = app.globalData.xyurl + '/users/' + app.globalData.username_;
            wx.request({
              url: delUrl,
              method: 'DELETE',
              data: {
                username: app.globalData.username_
              },
              header: {
                Authorization: 'Bearer ' + app.globalData.token_
              },
              success: function(res) {
                console.log(res);
                wx.clearStorage();
              }
            });
          }
        }
      });
    },
    tap_ch: function() {
      var that = this;
      console.log(that.data.open);
      if (that.data.open == true) {
        that.setData({
          clname: false,
          open: false
        });
      } else if (that.data.open == false) {
        that.setData({
          clname: true,
          open: true
        });
      }
      console.log(that.data.open);
      that.triggerEvent('sidebar', that.data.open);
    }
    // shop:function(){
    //   console.log("????怎么回事")
    //   wx.navigateTo({
    //     url: 'https://mp.weixin.qq.com/s/jbOk33KoxocV_PC9Sm-1SQ',
    //     success: function(res) {},
    //     fail: function(res) {},
    //     complete: function(res) {
    //       console.log(res)
    //     },
    //   })
    // }
  }
});
