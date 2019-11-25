/** @format */

// pages/curtainType/curtainType.js
var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var app = getApp();
var feedbackApi = require('../../utils/showToast.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    typesA: false,
    typesB: false,
    typesC: false
  },
  getEntityResult: function() {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    let that = this;
    wx.setNavigationBarTitle({
      title: '窗帘类型'
    });
    that.setData({
      curtainUuid: options.curtainUuid,
      curtainBtn: options.types,
      parentuuid: options.parentuuid
    });
    if (options.mold == 0) {
      that.setData({
        typesA: true
      });
    } else if (options.mold == 1) {
      that.setData({
        typesB: true
      });
    } else if (options.mold == 2) {
      that.setData({
        typesC: true
      });
    }
  },
  // 完成
  curtainOk: function() {
    let that = this;
    console.log(that.data);
    var username_ = app.globalData.username_; //全局用户名
    var topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    if (that.data.typesA == true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 18, 0),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    } else if (that.data.typesB == true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 18, 1),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    } else if (that.data.typesC == true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 18, 2),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    } else {
      feedbackApi.showToast({ title: '请选择窗帘类型' }); //调用
    }
  },
  chooseType: function(e) {
    let that = this;
    console.log(e);
    if (e.currentTarget.dataset.types == 'a') {
      that.setData({
        typesA: true,
        typesB: false,
        typesC: false
      });
    } else if (e.currentTarget.dataset.types == 'b') {
      that.setData({
        typesB: true,
        typesA: false,
        typesC: false
      });
    } else if (e.currentTarget.dataset.types == 'c') {
      that.setData({
        typesC: true,
        typesB: false,
        typesA: false
      });
    }
  },
  //下一步
  curtainWay: function() {
    var that = this;
    var username_ = app.globalData.username_; //全局用户名
    var topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    if (that.data.typesA == true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 18, 0),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
      wx.navigateTo({
        url:
          '../curtainWay/curtainWay?add=true&&curtainUuid=' +
          that.data.curtainUuid +
          '&types=a&&parentuuid=' +
          that.data.parentuuid
      });
    } else if (that.data.typesB == true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 18, 1),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
      wx.navigateTo({
        url:
          '../curtainWay/curtainWay?add=true&&curtainUuid=' +
          that.data.curtainUuid +
          '&types=b&&parentuuid=' +
          that.data.parentuuid
      });
    } else if (that.data.typesC == true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 18, 2),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
      wx.navigateTo({
        url:
          '../curtainWay/curtainWay?add=true&&curtainUuid=' +
          that.data.curtainUuid +
          '&types=c&&parentuuid=' +
          that.data.parentuuid
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  onMqttMsg: function(msg_) {
    console.log(msg_);
    let that = this;
    console.log(that.data);
    if (that.data.curtainBtn == 'addDevice') {
      return;
    }
    if (msg_.WriteAttributeResult != undefined && msg_.WriteAttributeResult != null) {
      wx.navigateBack({
        delta: 1
      });
    }
    if (msg_.Error != undefined && msg_.Error != null && msg_.Error.Code == 113) {
      wx.navigateBack({
        delta: 1
      });
    }
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
