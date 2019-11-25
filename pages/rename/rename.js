/** @format */

var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceLog: ''
  },
  getEntityResult: function() {},
  // 是不是表情
  bindKeyInput: function(substr) {
    // var that = this;
    // console.log(substring);
    var substring = substr.detail.value;
    for (var i = 0; i < substring.length; i++) {
      var hs = substring.charCodeAt(i);
      if (0xd800 <= hs && hs <= 0xdbff) {
        if (substring.length > 0) {
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
    var newName = 'deviceLog.device.name';
    this.setData({
      [newName]: substring
    });
    // console.log(that.data.deviceLog);
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
    if (msg_.ConfigEntityInfoResult != null && msg_.ConfigEntityInfoResult != undefined) {
      console.log(msg_.ConfigEntityInfoResult);
      if (!msg_.ConfigEntityInfoResult.Error) {
        wx.navigateBack({
          delta: 1
        });
      }
    }
  },
  save: function() {
    var that = this;
    // 检验名字是否合法
    console.log(that.data.deviceLog);
    if (that.data.deviceLog.device.name == null || that.data.deviceLog.device.name == '') {
      wx.showToast({
        title: '名称为空哦'
      });
    } else {
      var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
      var deviceUuid = that.data.deviceLog.device.uuid;
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildConfigEntityInfoRequest(
          app.globalData.username_,
          deviceUuid,
          '',
          that.data.deviceLog.device.name
        ),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    }
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '修改设备名称'
    });
    var that = this;
    var obj = JSON.parse(options.name);
    console.log(options);
    if (obj.device.name == '') {
      obj.device.name = obj.device.uiname;
    }
    console.log(obj);
    that.setData({
      deviceLog: obj
    });
  }
});
