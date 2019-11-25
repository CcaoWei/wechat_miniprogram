/** @format */

// pages/bindingAccount/bindingAccount.js
var feedbackApi = require('../../utils/showToast.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mobile: false, //手机号是否绑定
    email: false, //email是否绑定
    weixin: false, //微信是否绑定
    qq: false, //qq是否绑定
    numCheck: true,
    emailCheck: true,
    weixinCheck: true
  },
  getEntityResult: function() {},
  onMqttMsg: function(msg_) {
    console.log(msg_);
  },
  deleteMoblie: function() {
    var that = this;
    var urls = app.globalData.xyurl + '/users/' + app.globalData.username_ + '/mobile';
    wx.showModal({
      title: '解除绑定',
      content: '您确定要执行此操作吗？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: urls,
            method: 'DELETE',
            header: {
              Authorization: 'Bearer ' + app.globalData.token_
            },
            data: {
              mobile: that.data.mobilevalue
            },
            success: function(res) {
              console.log(res);
              if (res.statusCode == 200) {
                that.setData({
                  mobile: false
                });
                wx.removeStorageSync('mobile');
              }
            }
          });
        } else if (res.cancel) {
          console.log(res);
        }
      }
    });
  },
  deleteemail: function() {
    var that = this;
    var urls = app.globalData.xyurl + '/users/' + app.globalData.username_ + '/email';
    wx.showModal({
      title: '解除绑定',
      content: '您确定要执行此操作吗？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: urls,
            method: 'DELETE',
            header: {
              Authorization: 'Bearer ' + app.globalData.token_
            },
            data: {
              email: that.data.emailvalue
            },
            success: function(res) {
              console.log(res);
              if (res.statusCode == 200) {
                that.setData({
                  email: false
                });
                wx.removeStorageSync('email');
              }
            }
          });
        } else if (res.cancel) {
          console.log(res);
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    let urls = app.globalData.xyurl + '/users/' + app.globalData.username_;
    let checkUrl = app.globalData.xyurl + '/users/' + app.globalData.username_ + '/notification';
    wx.request({
      url: checkUrl,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 200) {
          if (res.data.notifications.lenght != 0) {
            for (let types of res.data.notifications) {
              if (types.type == 'sms' && types.enabled == false) {
                that.setData({
                  numCheck: false
                });
              } else if (types.type == 'wechat' && types.enabled == false) {
                that.setData({
                  weixinCheck: false
                });
              } else if (types.type == 'email' && types.enabled == false) {
                that.setData({
                  emailCheck: false
                });
              }
            }
          }
        }
      }
    });
    wx.request({
      url: urls,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function(res) {
        console.log(res);
        if (res.data.email != '' && res.data.email_confirmed == true) {
          that.setData({
            email: true,
            emailvalue: res.data.email
          });
        }
        if (res.data.email != '' && res.data.email_confirmed == false) {
          that.setData({
            email: 'state',
            emailvalue: res.data.email
          });
        }
        if (res.data.mobile != '' && res.data.mobile_confirmed == true) {
          that.setData({
            mobile: true,
            mobilevalue: res.data.mobile
          });
        }
        for (let bindAccount of res.data.open_ids) {
          if (bindAccount.id_type == 'wechat') {
            that.setData({
              weixin: true
            });
          }
        }
      }
    });
  },
  getCode: function() {
    var that = this;
    let urls = app.globalData.xyurl + '/verificationcodes';
    wx.request({
      url: urls,
      method: 'POST',
      data: {
        type: 'alphabet',
        push_type: 'email',
        push_target: that.data.emailvalue,
        length: 6,
        expire_in_second: 600,
        purpose: 'confirm'
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 200) {
          feedbackApi.showToast({
            title: '已发送，注意查看邮箱'
          }); //调用
        }
      }
    });
  },
  checkboxChange: function(e) {
    console.log(e);
    let that = this;
    if (e.currentTarget.dataset.types == 'wechat') {
      that.setData({
        weixinCheck: e.currentTarget.dataset.check
      });
    } else if (e.currentTarget.dataset.types == 'email') {
      that.setData({
        emailCheck: e.currentTarget.dataset.check
      });
    } else if (e.currentTarget.dataset.types == 'sms') {
      that.setData({
        numCheck: e.currentTarget.dataset.check
      });
    }
    let checkUrl = app.globalData.xyurl + '/users/' + app.globalData.username_ + '/notification';
    wx.request({
      url: checkUrl,
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      data: {
        type: e.currentTarget.dataset.types,
        enabled: e.currentTarget.dataset.check
      },
      success: function(res) {
        console.log(res);
      }
    });
  },
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
