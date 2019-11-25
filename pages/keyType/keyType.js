/** @format */

// pages/keypressBind/keypressBind.js
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var app = getApp();
var mqttclient = require('../../utils/mqttclient');
import Const from '../../data/Const.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {},
  getEntityResult: function() {},
  onMqttMsg: function(msg_) {
    console.log(msg_);
    let that = this;
    if (msg_.BindingEnableChanged != null && msg_.BindingEnableChanged != undefined) {
      if (that.data.parentuuid == 'undefined') {
        for (let keypress of that.data.uiWallSwitch.uiWallKeyprass) {
          if (keypress.bindDevice && msg_.BindingEnableChanged.UUID == keypress.bindDevice.bind.uuid) {
            keypress.loading = false;
            keypress.bindDevice.bind.enabled = msg_.BindingEnableChanged.Enabled;
          }
        }
        that.setData({
          uiWallSwitch: that.data.uiWallSwitch
        });
        return;
      } else {
        if (that.data.uibindCurtain) {
          that.data.uibindCurtain.loading = false;

          that.setData({
            uibindCurtain: that.data.uibindCurtain
          });
        } else if (that.data.uibindDevice) {
          that.data.uibindDevice.loading = false;
          that.setData({
            uibindDevice: that.data.uibindDevice
          });
        }
        that.getBindmsg();
      }
    }
  },
  onLoad: function(options) {
    console.log(options);
    let that = this;
    that.setData({
      binduuid: options.binduuid,
      doublebind: options.doublebind,
      uuid: options.uuid,
      parentuuid: options.parentuuid
    });
    let entites = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let binddevice = entites.get(options.parentuuid);
    for (let logicD of binddevice.logicDevice) {
      if (logicD.uuid == options.uuid) {
        wx.setNavigationBarTitle({
          title: logicD.uiname
        });
      }
    }
  },
  // 绑定事件的发送
  initiateMode: function(e) {
    let that = this;
    console.log(e);
    // if (that.data.parentuuid != 'undefined' ) {
    if (e.currentTarget.dataset.bindtype == 'curtain') {
      that.data.uibindCurtain.loading = true;
      that.setData({
        uibindCurtain: that.data.uibindCurtain
      });
    } else if (e.currentTarget.dataset.bindtype == 'device') {
      that.data.uibindDevice.loading = true;
      that.setData({
        uibindDevice: that.data.uibindDevice
      });
    }
    let boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    console.log(
      mqttclient.buildSetBindingEnableRequest(
        app.globalData.username_,
        e.currentTarget.dataset.binduuid,
        e.currentTarget.dataset.switchenable
      )
    );
    setTimeout(function() {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildSetBindingEnableRequest(
          app.globalData.username_,
          e.currentTarget.dataset.binduuid,
          e.currentTarget.dataset.switchenable
        ),
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    }, 500);
  },
  // 点击进去binddevice
  bindDevice: function(e) {
    let that = this;
    if (e.currentTarget.dataset.doublebind == 'true') {
      wx.navigateTo({
        url:
          '../bindDevice/bindDevice?doublebind=true&bindingUuid=' +
          e.currentTarget.dataset.binduuid +
          '&bindingType=' +
          e.currentTarget.dataset.types +
          '&triggerAddress=' +
          that.data.uuid +
          '&parentuuid=' +
          that.data.parentuuid +
          '&curtain=' +
          e.currentTarget.dataset.curtain
      });
      return;
    }
    wx.navigateTo({
      url:
        '../bindDevice/bindDevice?bindingUuid=' +
        e.currentTarget.dataset.binduuid +
        '&bindingType=' +
        e.currentTarget.dataset.types +
        '&triggerAddress=' +
        that.data.uuid +
        '&parentuuid=' +
        that.data.parentuuid +
        '&curtain=' +
        e.currentTarget.dataset.curtain
    });
  },
  // 匹配信息
  getBindmsg: function() {
    let that = this;
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let device = entities.get(that.data.parentuuid);
    var bindings = [];
    // 绑定
    for (let t of entities.values()) {
      if (t.getEntityType() == Const.EntityType.BINDING) {
        //绑定
        bindings.push(t);
      }
    }
    console.log(bindings);
    let uibindall = [];
    for (let bindItem of bindings) {
      if (bindItem.triggerAddress == that.data.uuid) {
        if (that.data.doublebind == 'undefined' && bindItem.parameter == 1) {
          uibindall.push(bindItem);
        } else if (that.data.doublebind == 'true' && bindItem.parameter == 2) {
          uibindall.push(bindItem);
        }
      }
    }
    for (let bindType of uibindall) {
      // if (bindType.actions.length > 0){
      if (bindType.actions[0].key == 0) {
        //设备
        bindType.loading = false;
        bindType.uiType = 'device';
        that.setData({
          uibindDevice: bindType
        });
      } else if (bindType.actions[0].key == 13) {
        //窗帘
        bindType.uiType = 'curtain';
        bindType.loading = false;
        that.setData({
          uibindCurtain: bindType
        });
      }
      // }
    }
    console.log(uibindall);
    let uilogic = {};
    for (let logicD of device.logicDevice) {
      if (logicD.uuid == that.data.uuid) {
        uilogic.device = logicD;
      }
    }
    that.setData({
      uilogic: uilogic
      // uibind: uibindall
    });
    console.log(uilogic);
  },
  //判断是什么类型的设备
  deviceModel:function(){
    let that = this;
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let device = entities.get(that.data.parentuuid);
    console.log(device)
    let pageDeviceImg = {}
    if (device.model == "TERNCY-PP01"){
      pageDeviceImg.lightImg ="../../imgs/switch_lamp.png"
      pageDeviceImg.curtainImg = "../../imgs/curtain_lamp.png"
    }
    if (device.isWallSwitch()) {
      console.log(that.data.uuid)
      console.log(device.logicDevice[0].uuid)
      if (that.data.uuid == device.logicDevice[0].uuid){
        pageDeviceImg.lightImg = "../../imgs/lefttop_lamp.png"
        pageDeviceImg.curtainImg = "../../imgs/lefttop_curtain_lamp.png"
      } else if (that.data.uuid == device.logicDevice[1].uuid) {
        pageDeviceImg.lightImg = "../../imgs/righttop_lamp.png"
        pageDeviceImg.curtainImg = "../../imgs/righttop_curtain_lamp.png"
      } else if (that.data.uuid == device.logicDevice[2].uuid) {
        pageDeviceImg.lightImg = "../../imgs/leftbottom_lamp.png"
        pageDeviceImg.curtainImg = "../../imgs/leftbottom_curtain_lamp.png"
      } else if (that.data.uuid == device.logicDevice[3].uuid) {
        pageDeviceImg.lightImg = "../../imgs/rightbottom_lamp.png"
        pageDeviceImg.curtainImg = "../../imgs/rightbottom_curtain_lamp.png"
      }
      
    }
    if(device.isUsWallSwitch()){
      if (that.data.uuid == device.logicDevice[1].uuid) {
        pageDeviceImg.lightImg = "../../imgs/usrighttop_lamp.png"
        pageDeviceImg.curtainImg = "../../imgs/usrighttop_curtain_lamp.png"
      }
    }
    if (device.isSmartDial()){
      if (that.data.uuid == device.logicDevice[0].uuid) {
        pageDeviceImg.lightImg = "../../imgs/switch_lamp.png"
        pageDeviceImg.curtainImg = "../../imgs/curtain_lamp.png"
      }
    }
    that.setData({
      uiPageDeviceImg: pageDeviceImg
    })
  },
  onShow: function() {
    let that = this;
    that.getBindmsg();
    that.deviceModel()
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
