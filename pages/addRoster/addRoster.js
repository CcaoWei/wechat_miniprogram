/** @format */

// pages/addRoster/addRoster.js
var feedbackApi = require('../../utils/showToast.js');
// var HomeCenterManager = require('../../data/HomeCenterManager.js');
var app = getApp();
import Const from '../../data/Const.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {},
  getEntityResult: function() {},
  // 二维码
  erCode: function() {
    // var that = this;
    wx.scanCode({
      onlyFromCamera: false,
      success: function(res) {
        console.log(res);
        // TODO: 需要校验扫描出来的值是否是合法的值，不合法则不能提交服务器
        var erValue_ = res.result.replace('X-HM://', '');
        erValue_ = erValue_.replace('https://api.xiaoyan.io/miniprogram/xiaoyanzaijia/', '');
        var regex = /^[a-zA-Z0-9-_]{12,32}$/;
        console.log(erValue_.match(regex));
        if (!erValue_.match(regex)) {
          console.log('invalid qr code');
          wx.showToast({
            title: '无效的二维码'
          });
          return;
        }
        console.log(erValue_);
        var erUrl = app.globalData.xyurl + '/devices/' + erValue_;
        wx.request({
          method: 'get',
          url: erUrl,
          header: {
            Authorization: 'Bearer ' + app.globalData.token_
          },
          success: function(res) {
            console.log(res);
            if (res.statusCode == 404) {
              feedbackApi.showToast({ title: '未找到该设备' }); //调用
            } else {
              wx.navigateTo({
                url:
                  '../boxDetail/boxDetail?type=add&boxuuid=' +
                  res.data.device_id +
                  '&boxname=' +
                  res.data.name
              });
              // var device_id = res.data.device_id;
              // var device_name = res.data.name;
              // that.setData({
              //   device_ider: device_id,
              //   device_name: device_name
              // });
              // wx.hideLoading();
              // wx.showModal({
              //   title: '提示',
              //   content: '确定使用家庭中心: ' + that.data.device_name + ' ？',
              //   success: function(res) {
              //     if (res.confirm) {
              //       console.log(wx.getStorageSync('nickname'));
              //       wx.request({
              //         method: 'post',
              //         url: app.globalData.xyurl + '/devices/' + that.data.device_ider + '/association',
              //         data: {
              //           action: 'request',
              //           // "action": "remove",
              //           user: app.globalData.username_,
              //           user_display_name: wx.getStorageSync('nickname'), //我的昵称
              //           by: app.globalData.username_,
              //           by_display_name: wx.getStorageSync('nickname'), //我的昵称
              //           device_name: that.data.device_name //box名称
              //         },
              //         header: {
              //           Authorization: 'Bearer ' + app.globalData.token_
              //         },
              //         success: function(msg_) {
              //           console.log(msg_);
              //           console.log('二维码请求成功');
              //           console.log(HomeCenterManager.getAllHomeCenters()[0].online);
              //           if (HomeCenterManager.getAllHomeCenters().length > 1) {
              //             for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
              //               if (
              //                 homecenter.types == Const.AssociationState.ASSOCIATED &&
              //                 homecenter.online == true
              //               ) {
              //                 wx.navigateBack({
              //                   delta: 2
              //                 });
              //                 return;
              //               }
              //             }
              //             wx.navigateBack({
              //               delta: 1
              //             });
              //           } else {
              //             wx.redirectTo({
              //               url: '../boxDetail/boxDetail?boxuuid=' + that.data.device_ider
              //             });
              //           }
              //         },
              //         fail: function(msg_) {
              //           console.log(msg_);
              //           console.log('二维码请求失败');
              //         }
              //       });
              //     } else if (res.cancel) {
              //       console.log('用户点击取消');
              //       console.log(res);
              //     }
              //   }
              // });
            }
          }
        });
      }
    });
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
    if (!app.globalData.deviceAll.roster.devices) {
      if (msg_.DeviceAssociation != undefined && msg_.DeviceAssociation != null) {
        var user = msg_.DeviceAssociation.User;
        var by = msg_.DeviceAssociation.By;
        var action = msg_.DeviceAssociation.Action;
        var status = msg_.DeviceAssociation.Status;
        // var deviceUUID = msg_.DeviceAssociation.DeviceUUID
        var getUsername = app.globalData.username_;
        if (
          user == getUsername &&
          by !== getUsername &&
          action == Const.ActionType.APPROVE &&
          status == Const.SubscriptionType.BOTH
        ) {
          console.log('tongyile');
          wx.switchTab({
            url: '../index/index'
          });
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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
