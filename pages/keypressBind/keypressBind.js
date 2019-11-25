/** @format */

// pages/keypressBind/keypressBind.js
var HomeCenterManager = require('../../data/HomeCenterManager.js');
// var app = getApp();
// var mqttclient = require('../../utils/mqttclient');
import Const from '../../data/Const.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    firstBind: true,
    firstBindDouble: true
  },
  getEntityResult: function() {},
  //单击按键和双击按键的绑定
  keyType: function(e) {
    // let binduuid = e.currentTarget.dataset.binduuid
    let doublebind = e.currentTarget.dataset.doublebind;
    let uuid = this.data.triggerAddress;
    let parentuuid = this.data.keypressBind.uuid;
    wx.navigateTo({
      url:
        '../keyType/keyType?binduuid=undefined&uuid=' +
        uuid +
        '&parentuuid=' +
        parentuuid +
        '&doublebind=' +
        doublebind
    });
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
    // let that = this;
  },
  isUsWallSwitch: function (model) {
    console.log(model)
    if (model == Const.DeviceModel.WALL_SWITCH_X1) {
      return true
    }
    return false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  showFun: function() {
    var that = this;
    console.log(that.data)
   
    if (that.data.triggerAddress.charAt(18) == 1) {
      //左上健
      // if (that.isUsWallSwitch(that.data.keypressBind.model)) { 
      //   that.data.keypressBind.keypressImg = '../../imgs/uskeypressTLeft.png';
      // }else{
        that.data.keypressBind.keypressImg = '../../imgs/keypressTLeft.png';
      // }
      
    }
    if (that.data.triggerAddress.charAt(18) == 2) {
      //右上健
      if (that.isUsWallSwitch(that.data.keypressBind.model)) {
        that.data.keypressBind.keypressImg = '../../imgs/uskeypressTLeft.png';
      } else {
        that.data.keypressBind.keypressImg = '../../imgs/keypressTRight.png';
      }
      
    } else if (that.data.triggerAddress.charAt(18) == 3) {
      //左下健
      that.data.keypressBind.keypressImg = '../../imgs/keypressLeft.png';
    } else if (that.data.triggerAddress.charAt(18) == 4) {
      //右下健
      that.data.keypressBind.keypressImg = '../../imgs/keypressRigth.png';
    }
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    var bindings = [];
    for (var t of entities.values()) {
      if (t.getEntityType() == Const.EntityType.BINDING) {
        //区域
        bindings.push(t);
      }
    }
    console.log(bindings);
    if (bindings.length > 0) {
      for (var e = 0; e < bindings.length; e++) {
        // var binding = bindings[e].Action
        for (var logicD of entities.get(that.data.keypressBind.uuid).logicDevice) {
          if (
            bindings[e].triggerAddress == logicD.uuid &&
            bindings[e].triggerAddress == that.data.triggerAddress &&
            bindings[e].parameter == 1
          ) {
            let devicebind = {};
            devicebind.bind = bindings[e];
            that.setData({
              triggerAddress: bindings[e].triggerAddress,
              bindingsUuid: bindings[e].uuid,
              firstBind: false, //按键左
              leftCheck: bindings[e].enabled,
              bindings: devicebind
            });
          } else if (
            bindings[e].triggerAddress == logicD.uuid &&
            bindings[e].triggerAddress == that.data.triggerAddress &&
            bindings[e].parameter == 2
          ) {
            let devicebind = {};
            devicebind.bind = bindings[e];
            that.setData({
              triggerAddress: bindings[e].triggerAddress,
              bindingsUuid: bindings[e].uuid,
              firstBindDouble: false, //按键左
              leftCheck: bindings[e].enabled,
              bindingsDouble: devicebind
            });
            console.log(that.data);
          }
        }
      }
    }
    that.setData({
      keypressBind: that.data.keypressBind,
      triggerAddress: that.data.triggerAddress
    });
    console.log(that.data);
  },
  onLoad: function(options) {
    var that = this;
    console.log(options);
    var obj = JSON.parse(options.keypressBind);
    console.log(obj);
    that.setData({
      keypressBind: obj,
      triggerAddress: options.information
    });
    for (let logicD of obj.logicDevice) {
      if (logicD.uuid == options.information) {
        wx.setNavigationBarTitle({
          title: logicD.uiname
        });
      }
    }
    console.log(that.data);
    that.showFun();
  },
  onShow: function() {
    var that = this;
    that.showFun();
    console.log(that.data);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */

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
