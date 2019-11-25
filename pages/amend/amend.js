/** @format */

// pages/amend/amend.js
var mqttclient = require('../../utils/mqttclient');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    amendtitle: '修改家庭中心名称',
    uuid: '',
    boxName: '',
    boxnickname: ''
  },
  getEntityResult: function() {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log(options);
    wx.setNavigationBarTitle({
      title: that.data.amendtitle //页面标题为路由参数
    });
    that.setData({
      uuid: options.uuid,
      boxnickname: options.nickname
    });
  },
  // 是不是表情
  amendBoxName: function(substr) {
    var that = this;
    console.log(substr);
    var substring = substr.detail.value;
    for (var i = 0; i < substring.length; i++) {
      var hs = substring.charCodeAt(i);
      if (0xd800 <= hs && hs <= 0xdbff) {
        if (substring.length > 1) {
          let ls = substring.charCodeAt(i + 1);
          var uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
          if (0x1d000 <= uc && uc <= 0x1f77f) {
            return '';
          }
        }
      } else if (substring.length > 1) {
        let ls = substring.charCodeAt(i + 1);
        if (ls == 0x20e3) {
          return '';
        }
      } else {
        if (0x2100 <= hs && hs <= 0x27ff) {
          return '';
        } else if (0x2b05 <= hs && hs <= 0x2b07) {
          return '';
        } else if (0x2934 <= hs && hs <= 0x2935) {
          return '';
        } else if (0x3297 <= hs && hs <= 0x3299) {
          return '';
        } else if (
          hs == 0xa9 ||
          hs == 0xae ||
          hs == 0x303d ||
          hs == 0x3030 ||
          hs == 0x2b55 ||
          hs == 0x2b1c ||
          hs == 0x2b1b ||
          hs == 0x2b50
        ) {
          return '';
        }
      }
    }
    that.setData({
      boxName: substring
    });
  },
  save: function() {
    var that = this;
    // 检验名字是否合法
    if (that.data.boxName == null || that.data.boxName == '') {
      wx.showToast({
        title: '名称为空哦'
      });
    } else if (that.data.boxName == that.data.boxnickname) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      var boxname = 'message/' + that.data.uuid;
      console.log(boxname);
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildConfigEntityInfoRequest(
          app.globalData.username_,
          that.data.uuid,
          '',
          that.data.boxName
        ),
        success: function(req) {
          console.log(req);
          if (req.ConfigEntityInfo) {
            for (var q = 0; q < app.globalData.deviceAll.roster.length; q++) {
              if (that.data.uuid == app.globalData.deviceAll.roster[q].Username) {
                console.log(app.globalData.deviceAll.roster[q].Username);
                app.globalData.deviceAll.roster[q].Nickname = req.ConfigEntityInfo.Name;
              }
            }
            console.log(app.globalData.deviceAll.roster);
            wx.navigateBack({
              delta: 1
            });
          }
        },
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    }
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
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
    that.setData({
      boxName: that.data.boxnickname
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
