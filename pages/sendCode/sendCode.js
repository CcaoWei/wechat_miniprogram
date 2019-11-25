/** @format */

// pages/sendCode/sendCode.js
var feedbackApi = require('../../utils/showToast.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    emailAccredit: true
  },
  getEntityResult: function() {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '重置密码'
    });
  },
  onMqttMsg: function() {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  nowBind: function() {
    wx.navigateTo({
      url: '../bindingAccount/bindingAccount'
    });
  },
  // 获取verification_code_id和验证码
  getCode: function(e) {
    console.log(e);
    let that = this;
    let getid = app.globalData.xyurl + '/verificationcodes';
    console.log(that.data);
    if (e.currentTarget.dataset.types == 'mobile' && that.data.mobileType == true) {
      wx.request({
        url: getid,
        method: 'POST',
        data: {
          type: 'number',
          push_type: 'sms',
          push_target: that.data.mobile,
          length: 6,
          expire_in_second: 600,
          purpose: 'reset_password'
        },
        success: function(res) {
          console.log(res);
          that.setData({
            verificationCodeId: res.data.verification_code_id
          });
          wx.setStorage({
            key: 'verificationCodeId',
            data: res.data.verification_code_id
          });
          wx.navigateTo({
            url: '../forgetPwd/forgetPwd?mobile=true'
          });
        }
      });
    } else if (e.currentTarget.dataset.types == 'email' && that.data.emailType == true) {
      wx.request({
        url: getid,
        method: 'POST',
        data: {
          type: 'alphabet',
          push_type: 'email',
          push_target: that.data.email,
          length: 6,
          expire_in_second: 600,
          purpose: 'reset_password'
        },
        success: function(res) {
          console.log(res);
          if (res.statusCode == 500) {
            feedbackApi.showToast({ title: '获取验证码失败' });
            return;
          }
          that.setData({
            verificationCodeId: res.data.verification_code_id
          });
          // that.data.emailTypes = true
          wx.setStorage({
            key: 'verificationCodeId',
            data: res.data.verification_code_id
          });
          wx.navigateTo({
            url: '../forgetPwd/forgetPwd?email=true'
          });
        }
      });
    } else if (e.currentTarget.dataset.types == 'mobile' && that.data.mobileType != true) {
      feedbackApi.showToast({ title: '请先绑定手机号码' });
    } else if (
      e.currentTarget.dataset.types == 'email' &&
      that.data.emailType != true &&
      that.data.emailAccredit == true
    ) {
      feedbackApi.showToast({ title: '请先绑定邮箱' });
    } else if (that.data.emailAccredit == false) {
      feedbackApi.showToast({ title: '邮箱未授权成功，请验证' });
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    // 判断是否绑定了邮箱或者手机
    let urls = app.globalData.xyurl + '/users/' + app.globalData.username_;
    wx.request({
      url: urls,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function(res) {
        console.log(res);
        if (res.data.mobile_confirmed == true) {
          that.setData({
            mobileType: true,
            mobile: res.data.mobile
          });
          wx.setStorage({
            key: 'mobile',
            data: res.data.mobile
          });
        }
        if (res.data.email_confirmed == true) {
          that.setData({
            emailType: true,
            email: res.data.email
          });
          wx.setStorage({
            key: 'email',
            data: res.data.email
          });
        }
        console.log();
        if (res.data.email_confirmed == false && res.data.email != '') {
          //还未验证成功
          that.setData({
            emailAccredit: false
          });
        }
      }
    });
  },

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
