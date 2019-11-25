/** @format */

// pages/forgetPwd/forgetPwd.js
var feedbackApi = require('../../utils/showToast.js');
var app = getApp();
var count;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    newhide: true
  },
  getEntityResult: function() {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    console.log(options);
    if (options.email) {
      that.data.emailTypes = true;
      that.setData({
        emailTypes: that.data.emailTypes
      });
    }
    if (options.mobile) {
      that.data.mobileTypes = true;
      that.setData({
        mobileTypes: that.data.mobileTypes
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  // 一键清除验证码输入框内内容
  purgeCode: function() {
    let that = this;
    that.data.codeVal = '';
    that.setData({
      codeVal: that.data.codeVal
    });
  },
  // 验证码输入框
  codeBox: function(e) {
    let that = this;
    if (e.detail.value.length > 0) {
      that.data.erclose = true;
      that.setData({
        erclose: that.data.erclose
      });
    }
    if (e.detail.value.length == 6) {
      that.data.submit = true;
      that.data.ercodeVal = e.detail.value;
      that.setData({
        ercodeVal: that.data.ercodeVal,
        submit: that.data.submit
      });
    } else {
      that.data.submit = false;
      that.setData({
        submit: that.data.submit
      });
    }
    console.log(that.data);
  },
  // 重置密码输入框
  pwdBox: function(e) {
    let that = this;
    // if (e.detail.value.length >= 6) {
    that.data.submit = true;
    that.data.pwdNumber = e.detail.value;
    that.setData({
      pwdNumber: that.data.pwdNumber,
      submit: that.data.submit
    });
    // }
  },
  // 提交按钮
  submitBtn: function() {
    let that = this;
    let urls = app.globalData.xyurl + '/users/~/password';
    if (that.data.emailTypes == true) {
      if (that.data.pwdNumber.length < 6) {
        feedbackApi.showToast({ title: '密码长度不正确' });
        return;
      }
      wx.request({
        url: urls,
        method: 'POST',
        data: {
          id_type: 'email',
          id: wx.getStorageSync('email'),
          verification_code: that.data.ercodeVal, //验证码
          verification_code_id: wx.getStorageSync('verificationCodeId'),
          password: that.data.pwdNumber
        },
        success: function(res) {
          console.log(res);
          if (res.statusCode == 200) {
            wx.navigateBack({
              delta: 3
            });
            wx.removeStorageSync('token_');
          } else {
            feedbackApi.showToast({ title: '请确认验证码和密码正确' }); //调用
          }
        }
      });
    } else if (that.data.mobileTypes == true) {
      console.log(that.data.pwdNumber);
      if (that.data.pwdNumber.length < 6) {
        feedbackApi.showToast({ title: '密码长度不正确' });
        return;
      }
      wx.request({
        url: urls,
        method: 'POST',
        data: {
          id_type: 'mobile',
          id: wx.getStorageSync('mobile'),
          verification_code: that.data.ercodeVal, //验证码
          verification_code_id: wx.getStorageSync('verificationCodeId'),
          password: that.data.pwdNumber
        },
        success: function(res) {
          console.log(res);
          if (res.statusCode == 200) {
            wx.navigateBack({
              delta: 3
            });
            wx.removeStorageSync('token_');
          } else {
            feedbackApi.showToast({ title: '验证码不正确' });
          }
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onMqttMsg: function(msg) {
    console.log(msg);
  },
  onShow: function() {
    let that = this;
    let num = 60;
    count = setInterval(function() {
      num--;
      console.log(num);
      that.setData({
        ercode: '重新发送(' + num + 's)'
      });
      if (num == 0) {
        clearInterval(count);
        that.setData({
          codeok: true,
          ercode: '重新发送'
        });
      }
    }, 1000);
  },
  showPwd: function(e) {
    console.log(e);
    let that = this;
    that.data.newhide = e.currentTarget.dataset.isshow;
    that.setData({
      newhide: that.data.newhide
    });
  },
  clearVal: function(e) {
    console.log(e);
    let that = this;
    that.data.newVal = '';
    that.setData({
      newVal: that.data.newVal
    });
  },
  ercode: function() {
    let that = this;
    let getid = app.globalData.xyurl + '/verificationcodes';
    console.log(that.data);
    if (that.data.mobileTypes) {
      wx.request({
        url: getid,
        method: 'POST',
        data: {
          type: 'number',
          push_type: 'sms',
          push_target: wx.getStorageSync('mobile'),
          length: 6,
          expire_in_second: 600,
          purpose: 'reset_password'
        },
        success: function(res) {
          console.log(res);
          that.data.verificationCodeId = res.data.verification_code_id;
          wx.setStorageSync('verificationCodeId', res.data.verification_code_id);
          that.setData({
            codeok: false
          });
          // $digest(that);
          let num = 60;
          count = setInterval(function() {
            num--;
            that.setData({
              ercode: '重新发送(' + num + 's)'
            });
            if (num == 0) {
              clearInterval(count);
              that.setData({
                codeok: true,
                ercode: '重新发送'
              });
            }
          }, 1000);
        }
      });
    } else if (that.data.emailTypes) {
      wx.request({
        url: getid,
        method: 'POST',
        data: {
          type: 'alphabet',
          push_type: 'email',
          push_target: wx.getStorageSync('email'),
          length: 6,
          expire_in_second: 600,
          purpose: 'reset_password'
        },
        success: function(res) {
          console.log(res);
          that.data.verificationCodeId = res.data.verification_code_id;
          wx.setStorageSync('verificationCodeId', res.data.verification_code_id);
          that.data.codeok = false;
          // $digest(that);
          let num = 60;
          count = setInterval(function() {
            num--;
            that.setData({
              ercode: '重新发送(' + num + 's)'
            });
            if (num == 0) {
              clearInterval(count);
              that.setData({
                codeok: true,
                ercode: '重新发送'
              });
            }
          }, 1000);
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(count);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(count);
    wx.removeStorageSync('email');
    wx.removeStorageSync('mobile');
    wx.removeStorageSync('verificationCodeId');
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
