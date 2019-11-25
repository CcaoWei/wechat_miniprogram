/** @format */

// pages/curtainWay/curtainWay.js\\
var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var app = getApp();
var feedbackApi = require('../../utils/showToast.js');
import Const from '../../data/Const.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    typesA: false,
    typesB: false,
    adjusting: false
  },
  getEntityResult: function() {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: '窗帘方向'
    });
    let that = this;
    let curtainWay = {};
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    if (options.types == 'a' || options.types == 0) {
      curtainWay.types = 'a';
      curtainWay.imgLeft = '../../imgs/curtainLeft_little.png';
      curtainWay.imgRight = '../../imgs/curtainLeft_big.png';
      // curtainWay.leftText = '从左向右';
      // curtainWay.rightText = '从右向左';
      // curtainWay.leftIcon = '../../imgs/left_right.png';
      // curtainWay.rightIcon = '../../imgs/right_left.png';
    } else if (options.types == 'b' || options.types == 1) {
      curtainWay.types = 'b';
      curtainWay.imgLeft = '../../imgs/curtainRight_little.png';
      curtainWay.imgRight = '../../imgs/curtainRight_big.png';
      // curtainWay.leftText = '从左向右';
      // curtainWay.rightText = '从右向左';
      // curtainWay.leftIcon = '../../imgs/left_right.png';
      // curtainWay.rightIcon = '../../imgs/right_left.png';
    } else if (options.types == 'c' || options.types == 2) {
      curtainWay.types = 'c';
      curtainWay.imgLeft = '../../imgs/doubleOpen_big.png';
      curtainWay.imgRight = '../../imgs/doubleOpen_little.png';
      // curtainWay.leftText = '从中间向两边';
      // curtainWay.rightText = '从两边向中间';
      // curtainWay.leftIcon = '../../imgs/right_left.png';
      // curtainWay.rightIcon = '../../imgs/left_right.png';
    }
    if (options.direction == 0) {
      that.setData({
        typesA: true
      });
    } else if (options.direction == 1) {
      that.setData({
        typesB: true
      });
    }
    that.setData({
      curtainWays: curtainWay,
      curtainUuid: options.curtainUuid,
      detail_parentuuid: options.parentuuid
    });
    if (options.add) {
      that.setData({
        add: options.add
      });
    }
    if (entities.get(options.parentuuid).model == 'TERNCY-CM01') {
      for (let logicD of entities.get(options.parentuuid).logicDevice) {
        console.log(logicD);
        for (let attr of logicD.attributes) {
          if (attr.key == Const.AttrKey.WINDOW_COVERING_DIRECTION && attr.value == 0) {
            that.setData({
              Default: true
            });
          } else if (attr.key == Const.AttrKey.WINDOW_COVERING_DIRECTION && attr.value == 1) {
            that.setData({
              Reverse: true
            });
          } else if (attr.key == Const.AttrKey.WINDOW_COVERING_MOTOR_TRIP_CONFUGURED && attr.value == 1) {
            that.setData({
              adjusting: true
            });
          }
        }
      }
    }
    console.log(that.data);
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
    let that = this;
    if (that.data.add == 'true') {
      if (
        msg_.WriteAttributeResult != undefined &&
        msg_.WriteAttributeResult != null &&
        that.data.isClick == true
      ) {
        wx.reLaunch({
          url: '../index/index?types=facility'
        });
      }
      if (msg_.DeviceAttrReport != undefined && msg_.DeviceAttrReport != null) {
        console.log(msg_.DeviceAttrReport.Attributes);
        for (let attr of msg_.DeviceAttrReport.Attributes) {
          if (attr.AttrID == Const.AttrKey.WINDOW_COVERING_MOTOR_TRIP_CONFUGURED && attr.AttrValue == 1) {
            that.setData({
              adjusting: true
            });
            feedbackApi.showToast({ title: '智能窗帘行程校准已完毕，请选择智能窗帘方向' });
          }
        }
      }
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
    console.log(that.data);
    if (
      msg_.DeviceAttrReport != undefined &&
      msg_.DeviceAttrReport != null &&
      msg_.DeviceAttrReport.UUID == that.data.curtainUuid
    ) {
      for (let attr of msg_.DeviceAttrReport.Attributes) {
        if (attr.AttrID == 19 && attr.AttrValue == 0) {
          that.setData({
            adjusting: true
          });
        }
      }
    }
  },
  chooseType: function(e) {
    let that = this;
    console.log(e);
    if (e.currentTarget.dataset.types == 'a') {
      that.setData({
        typesA: true,
        typesB: false
      });
    } else if (e.currentTarget.dataset.types == 'b') {
      that.setData({
        typesB: true,
        typesA: false
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  wayBtn: function() {
    let that = this;
    var username_ = app.globalData.username_; //全局用户名
    var topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    console.log(that.data.adjusting);
    console.log(that.data);
    if (that.data.adjusting == false) {
      feedbackApi.showToast({ title: '请等待智能窗帘行程校准完毕' });
      return;
    }
    if (that.data.typesA == true && that.data.Default != true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 11, 0),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
      that.setData({
        isClick: true
      });
    } else if (that.data.typesB == true && that.data.Reverse != true) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, that.data.curtainUuid, 11, 1),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
      that.setData({
        isClick: true
      });
    } else if (that.data.typesA == true && that.data.Default == true && that.data.add == 'true') {
      wx.reLaunch({
        url: '../index/index?types=facility'
      });
    } else if (that.data.typesB == true && that.data.Reverse == true && that.data.add == 'true') {
      console.log('???');
      wx.reLaunch({
        url: '../index/index?types=facility'
      });
    } else if (that.data.typesA == true && that.data.Default == true && !that.data.add) {
      wx.navigateBack({
        delta: 1
      });
    } else if (that.data.typesB == true && that.data.Reverse == true && !that.data.add) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      feedbackApi.showToast({ title: '请选择窗帘方向' }); //调用
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
