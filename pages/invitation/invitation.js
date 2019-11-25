/** @format */

var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    invitation: '邀请函',
    add_homecenter: ''
  },
  getEntityResult: function() {},
  agreeBtn: function() {
    var that = this;
    console.log(app.globalData.addHomecenterMsg);
    console.log(that.data.add_homecenter);
    wx.request({
      method: 'post',
      url: app.globalData.xyurl + '/devices/' + that.data.add_homecenter.DeviceUUID + '/association',
      data: {
        action: 'approve',
        user: that.data.add_homecenter.User,
        user_display_name: that.data.add_homecenter.ByDisplayName,
        by: app.globalData.username_,
        by_display_name: wx.getStorageSync('nickname'),
        device_name: that.data.add_homecenter.DeviceName
      },
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function(msg_) {
        console.log(app.globalData.addHomecenterMsg);
        console.log(msg_);
        console.log('请求成功');
        wx.navigateBack({
          delta: 1
        });
      }
    });
  },
  refuseBtn: function() {
    var that = this;
    wx.request({
      method: 'post',
      url: app.globalData.xyurl + '/devices/' + that.data.add_homecenter.DeviceUUID + '/association',
      data: {
        action: 'reject',
        user: that.data.add_homecenter.User,
        user_display_name: '',
        by: app.globalData.username_,
        by_display_name: '',
        device_name: that.data.add_homecenter.DeviceUUID
      },
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function(msg_) {
        console.log(msg_);
        console.log('请求成功');
        // wx.reLaunch({
        //   url: '../index/index'
        // })
        wx.navigateBack({
          delta: 1
        });
      }
    });
  },
  onMqttMsg: function() {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var obj = JSON.parse(options.deviceuuid);
    var that = this;
    console.log(app.globalData.addHomecenterMsg);
    for (let s = 0, len = app.globalData.addHomecenterMsg.length; s < len; s++) {
      let addHomecenterMsg = app.globalData.addHomecenterMsg[s];
      if (addHomecenterMsg.User == obj.User && addHomecenterMsg.DeviceUUID == obj.DeviceUUID) {
        that.setData({
          add_homecenter: addHomecenterMsg
        });
      }
    }
    console.log(that.data.add_homecenter);
    wx.setNavigationBarTitle({
      title: this.data.invitation //页面标题为路由参数
    });
  },
});
