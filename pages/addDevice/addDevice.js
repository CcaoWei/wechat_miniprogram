/** @format */

var mqttclient = require('../../utils/mqttclient');
var feedbackApi = require('../../utils/showToast.js');
var app = getApp();
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
// var newDevice = []

Page({
  /**
   * 页面的初始数据
   */
  data: {
    addDevice: '添加设备',
    addFacility: '', //添加设备的集合
    replaceAdd: ''
  },
  getEntityResult: function () { },
  addHelp: function () {
    wx.navigateTo({
      url: '../addHelp/addHelp'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onMqttMsg: function (msg_) {
    console.log(msg_);
    var that = this;
    if (msg_.EntityAvailable != undefined && msg_.EntityAvailable != null) {
      if (msg_.EntityAvailable.Entity.EntityDevice.IsNew == false) {
        feedbackApi.showToast({ title: '设备已上线' });
      }
      that.getIsnewDevice();
    }
    // 别人同意了添加新设备
    if (msg_.EntityInfoConfigured != undefined && msg_.EntityInfoConfigured != null) {
      for (var agreeDevice = 0; agreeDevice < that.data.addFacility.length; agreeDevice++) {
        if (that.data.addFacility[agreeDevice].logicD.uuid == msg_.EntityInfoConfigured.UUID) {
          that.data.addFacility.splice(agreeDevice, 1);
          break;
        }
      }
      console.log(that.data);
      that.setData({
        addFacility: that.data.addFacility
      });
    }
    //打开扫描成功提示
    if (msg_.PermitJoinChanged != undefined && msg_.PermitJoinChanged != null) {
      feedbackApi.showToast({ title: '开启扫描成功' }); //调用
    }
    //打开扫描失败提示
    if (msg_.Error != undefined && msg_.Error != null) {
      if (msg_.Error.Code == 51) {
        feedbackApi.showToast({ title: '开启扫描失败' }); //调用
      }
    }
  },
  addFacility: function (e) {
    console.log(e);
    var profile = e.currentTarget.dataset.profile;
    var deviceuuid = e.currentTarget.dataset.deviceuuid;
    var device = JSON.stringify(e.currentTarget.dataset.devicedetial);
    console.log(device);
    wx.navigateTo({
      url:
        '../modifyName/modifyName?profile=' +
        profile +
        '&uuid=' +
        deviceuuid +
        '&device=' +
        device +
        '&newdevice=' +
        this.data.addFacility.length
    });
  },
  onLoad: function (options) {
    console.log(options);
    var that = this;
    wx.setNavigationBarTitle({
      title: that.data.addDevice //页面标题为路由参数
    });
    var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    console.log(entities);
    var zigbeeInformationUuid;
    for (var zigbeeInformation of entities.values()) {
      if (zigbeeInformation.getEntityType() == Const.EntityType.ZIGBEE_SYSTEM) {
        zigbeeInformationUuid = zigbeeInformation.uuid;
      }
    }
    console.log(zigbeeInformationUuid);
    mqttclient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: mqttclient.buildSetPermitJoinRequest(app.globalData.username_, zigbeeInformationUuid, 240),
      error: function (req, res) {
        console.log('got error', req, res);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },
  /**
   * 生命周期函数--监听页面显示
   */
  getIsnewDevice() {
    var that = this;
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    console.log(entities);
    var newDevice = [];
    for (var isnewDevice of entities.values()) {
      if (isnewDevice.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        if (isnewDevice.isNew == true && isnewDevice.Available) {
          console.log(isnewDevice);
          if (isnewDevice.isZHHVRVGateway() || isnewDevice.isUsWallSwitch() || isnewDevice.isSwitchModule() || isnewDevice.isWallSwitch()) {
            var physicDevice = {};
            physicDevice.logicD = isnewDevice;
            physicDevice.uuid = isnewDevice.uuid.substr(12, 7);
            if (isnewDevice.isWallSwitch()) {
              physicDevice.img = '../../imgs/new_device_wallswitch.png';
              } else if (isnewDevice.isUsWallSwitch()) {
                physicDevice.img = '../../imgs/new_device_wall_switch_us.png';
                } else if (isnewDevice.isSwitchModule()) {
                  physicDevice.img = '../../imgs/new_device_switch_module.png';
                  } else if (isnewDevice.isZHHVRVGateway()) {
                    physicDevice.img = '../../imgs/new_device_air_conditioner.png';
                    } else {
                      physicDevice.img = '../../imgs/new_device_light.png';
                      }
                      newDevice.push(physicDevice);
            } else {
            for (var logicD of isnewDevice.logicDevice) {
              logicD.Available = isnewDevice.Available;
              var logicDevice = {};
              logicDevice.logicD = logicD;
              console.log(logicDevice);
              logicDevice.uuid = logicDevice.logicD.uuid.substr(12, 7);
              if (logicDevice.logicD.profile == Const.Profile.ON_OFF_LIGHT) {
                //灯座
                logicDevice.img = '../../imgs/new_device_light.png';
              } else if (logicDevice.logicD.profile == Const.Profile.SMART_PLUG) {
                logicDevice.img = '../../imgs/new_device_plug.png';
              } else if (logicDevice.logicD.profile == Const.Profile.PIR_PANEL) {
                logicDevice.img = '../../imgs/new_device_pir.png';
              } else if (logicDevice.logicD.profile == Const.Profile.DOOR_CONTACT) {
                logicDevice.img = '../../imgs/new_device_dc.png';
              } else if (logicDevice.logicD.profile == Const.Profile.WINDOW_COVERING) {
                logicDevice.img = '../../imgs/new_device_curtain.png';
              } else if (logicDevice.logicD.profile == Const.Profile.SMART_DIAL) {
                logicDevice.img = '../../imgs/new_device_rotary_knob.png';
              } else if (logicDevice.logicD.profile == Const.Profile.HA_ZHH_GATEWAY) {
                logicDevice.img = '../../imgs/new_device_air_conditioner.png';
              }
              newDevice.push(logicDevice);
            }
          }
        }
      }
    }
    that.setData({
      addFacility: newDevice
    });
    console.log(that.data);
  },
  onShow: function () {
    var that = this;
    that.getIsnewDevice();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // if (app.globalData.deviceAll.roster) {
    var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    var zigbeeInformationUuid;
    for (var zigbeeInformation of entities.values()) {
      if (zigbeeInformation.getEntityType() == Const.EntityType.ZIGBEE_SYSTEM) {
        zigbeeInformationUuid = zigbeeInformation.uuid;
      }
    }
    mqttclient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: mqttclient.buildSetPermitJoinRequest(app.globalData.username_, zigbeeInformationUuid, 0),
      error: function (req, res) {
        console.log('got error', req, res);
      }
    });
    // }
  },
  onHide: function () {
    // if (app.globalData.deviceAll.roster) {
    var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    var zigbeeInformationUuid;
    for (var zigbeeInformation of entities.values()) {
      if (zigbeeInformation.getEntityType() == Const.EntityType.ZIGBEE_SYSTEM) {
        zigbeeInformationUuid = zigbeeInformation.uuid;
      }
    }
    mqttclient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: mqttclient.buildSetPermitJoinRequest(app.globalData.username_, zigbeeInformationUuid, 0),
      error: function (req, res) {
        console.log('got error', req, res);
      }
    });
    // }
  },

  /**
   * 生命周期函数--监听页面卸载
   */

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { }
});
