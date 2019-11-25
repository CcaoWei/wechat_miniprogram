/** @format */

// pages/phoneAccount/phoneAccount.js
var app = getApp();
var feedbackApi = require('../../utils/showToast.js');
var count;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ercode: '获取验证码',
    codeok: false
  },
  getEntityResult: function() {},
  onMqttMsg: function() {},
  codeValue: function(e) {
    console.log(e);
    var that = this;
    if (e.detail.value.length > 0) {
      that.setData({
        erclose: true
      });
    }
    if (e.detail.value.length == 6 && that.data.numberVal.length == 11) {
      that.setData({
        submit: true,
        ercodeVal: e.detail.value
      });
    } else {
      that.setData({
        submit: false
      });
    }
  },
  numValue: function(e) {
    var that = this;
    console.log(e);
    if (e.detail.value.length > 0) {
      that.setData({
        close: true,
        numberVal: e.detail.value,
        codeok: false
      });
    }
    if (e.detail.value.length > 0 && e.detail.value.length <= 3) {
      clearInterval(count);
      that.setData({
        codeok: false,
        close: true,
        numberVal: '',
        ercode: '获取验证码'
      });
    }
    if (e.detail.value.length == 11 && that.data.codeok == false) {
      that.setData({
        codeok: true,
        numberVal: e.detail.value
      });
    } else if (e.detail.value.length > 11) {
      that.setData({
        codeok: false
      });
    }
    if (e.detail.value.length == 0) {
      clearInterval(count);
      that.setData({
        codeok: false,
        close: false,
        numberVal: '',
        ercode: '获取验证码'
      });
    }
  },
  // 邮箱验证
  check: function(val) {
    var reg = new RegExp('^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z0-9]{2,6}$'); //正则表达式
    if (val == '') {
      //输入不能为空
      return false;
    } else if (!reg.test(val)) {
      //正则验证不通过，格式不对
      return false;
    } else {
      return true;
    }
  },
  emailValue: function(e) {
    var that = this;
    if (e.detail.value.length > 0) {
      that.setData({
        email: true
      });
    }
    if (that.check(e.detail.value) == true) {
      that.setData({
        emailSub: true,
        emailVal: e.detail.value
      });
    } else {
      that.setData({
        emailSub: false,
        emailVal: ''
      });
    }
  },
  emailSub: function() {
    var that = this;
    let addemail = app.globalData.xyurl + '/users/' + app.globalData.username_ + '/email';
    let urls = app.globalData.xyurl + '/verificationcodes';
    wx.request({
      url: addemail,
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      data: {
        email: that.data.emailVal
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 200) {
          wx.request({
            url: urls,
            method: 'POST',
            data: {
              type: 'alphabet',
              push_type: 'email',
              push_target: that.data.emailVal,
              length: 6,
              expire_in_second: 600,
              purpose: 'confirm'
            },
            success: function(res) {
              console.log(res);
              if (res.statusCode == 200) {
                feedbackApi.showToast({
                  title: '验证码发送成功请注意查看邮箱，可能在垃圾邮箱'
                });
                setTimeout(function() {
                  wx.navigateBack({
                    delta: 1
                  });
                }, 1500);
              } else if (res.statusCode == 429) {
                feedbackApi.showToast({
                  title: '邮箱已被占用'
                }); //调用
              } else {
                feedbackApi.showToast({
                  title: '错误'
                });
              }
            }
          });
        } else if (res.statusCode == 409) {
          feedbackApi.showToast({
            title: '邮箱已被注册或绑定'
          });
        }
      }
    });
  },
  ercode: function() {
    var that = this;
    let urls = app.globalData.xyurl + '/verificationcodes';
    wx.request({
      url: urls,
      method: 'POST',
      data: {
        type: 'number',
        push_type: 'sms',
        push_target: that.data.numberVal,
        length: 6,
        expire_in_second: 600,
        purpose: 'confirm'
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 200) {
          that.setData({
            codeok: false,
            verificationcodeid: res.data.verification_code_id
          });
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
        } else if (res.statusCode == 429) {
          feedbackApi.showToast({
            title: '验证码发送的太频繁了'
          }); //调用
        }
      }
    });
  },
  submitbtn: function() {
    var that = this;
    let urls = app.globalData.xyurl + '/users/' + app.globalData.username_ + '/mobile';
    wx.request({
      url: urls,
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      data: {
        mobile: that.data.numberVal,
        verification_code: that.data.ercodeVal,
        verification_code_id: that.data.verificationcodeid
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 404) {
          feedbackApi.showToast({
            title: '请重新获取验证码'
          }); //调用
        } else if (res.statusCode == 200) {
          feedbackApi.showToast({
            title: '绑定成功'
          });
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        } else if (res.statusCode == 409) {
          feedbackApi.showToast({
            title: '手机号被占用'
          }); //调用
        } else if (res.statusCode == 401 || res.statusCode == 400) {
          feedbackApi.showToast({
            title: '验证码错误'
          }); //调用
        }
      }
    });
  },
  purgeNum: function() {
    var that = this;
    clearInterval(count);
    that.setData({
      numVal: '',
      codeok: true,
      ercode: '重新发送'
    });
  },
  purgeCode: function() {
    var that = this;
    that.setData({
      codeVal: ''
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    that.setData({
      types: options.type
    });
    if (options.type == 'phone') {
      wx.setNavigationBarTitle({
        title: '绑定手机'
      });
    } else if (options.type == 'email') {
      wx.setNavigationBarTitle({
        title: '绑定邮箱'
      });
    }
    console.log(that.data.types);
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(count);
  },
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
