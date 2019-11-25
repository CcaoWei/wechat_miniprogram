/** @format */

// pages/changePwd/changePwd.js
var feedbackApi = require('../../utils/showToast.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    newhide: true,
    oldhide: true
  },
  getEntityResult: function() {},
  showPwd: function(e) {
    console.log(e);
    let that = this;
    if (e.currentTarget.dataset.newhide) {
      that.setData({
        newhide: e.currentTarget.dataset.isshow
      });
    }
    if (e.currentTarget.dataset.oldhide) {
      that.setData({
        oldhide: e.currentTarget.dataset.isshow,
        oldVal:that.data.oldValue
      });
    }
    console.log(that.data);
  },
  clearVal: function(e) {
    console.log(e);
    let that = this;
    console.log(that.data);
    if (e.currentTarget.dataset.newhide) {
      that.setData({
        newValue: '',
        newVal: ''
      });
    }
    if (e.currentTarget.dataset.oldhide) {
      that.setData({
        oldValue: '',
        oldVal: ''
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '修改密码'
    });
  },
  forgetPwd: function() {
    wx.navigateTo({
      url: '../sendCode/sendCode'
    });
  },
  onMqttMsg: function() {},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  oldPwd: function(e) {
    let that = this;
    that.setData({
      oldValue: e.detail.value
    });
  },
  newPwd: function(e) {
    let that = this;
    if (e.detail.value.length >= 6) {
      that.setData({
        newValue: e.detail.value,
        isnewpswOk: true
      });
    } else {
      that.setData({
        newValue: e.detail.value,
        isnewpswOk: false
      });
    }
  },
  submitBtn: function() {
    let that = this;
    // let urls=
    // console.log(urls)
    if (that.data.isnewpswOk == false) {
      feedbackApi.showToast({ title: '密码长度不合法' });
      return;
    }
    wx.request({
      url: app.globalData.xyurl + '/users/' + app.globalData.username_ + '/password',
      method: 'PUT',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      data: {
        username: app.globalData.username_,
        current_password: that.data.oldValue,
        new_password: that.data.newValue
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 200) {
          wx.removeStorageSync('token_');
          wx.navigateBack({
            delta: 1
          });
        } else {
          feedbackApi.showToast({ title: '新密码或者旧密码不正确，请查看' });
        }
      },
      fail: function(res) {
        console.log(res);
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
