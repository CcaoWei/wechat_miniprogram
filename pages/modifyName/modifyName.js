/** @format */

var app = getApp();
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
var mqttclient = require('../../utils/mqttclient');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    modifyName: '快速命名',
    customName: '', //命名值
    areaChoose: '', //区域
    id: '',
    areauuid: 'area-0000',
    deviceuuid: '',
    device: ''
  },
  getEntityResult: function() {},
  /**
   * 生命周期函数--监听页面加载
   */
  addRoom: function () {
    wx.navigateTo({
      url: '../roomEditer/roomEditer?types=add&boxuuid=' + wx.getStorageSync('setDefaultHomeCenter'),
    })
  },
  mateName: function(res) {
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    var newDevice = [];
    for (var isnewDevice of entities.values()) {
      if (isnewDevice.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        if (isnewDevice.isNew == false && isnewDevice.isWallSwitch() == false) {
          for (var logicD of isnewDevice.logicDevice) {
            logicD.Available = isnewDevice.Available;
            let logicDevice = {};
            logicDevice.logicDevices = logicD;
            newDevice.push(logicDevice);
          }
        } else if (isnewDevice.isNew == false && isnewDevice.isWallSwitch() == true) {
          let logicDevice = {};
          logicDevice.logicDevices = isnewDevice;
          newDevice.push(logicDevice);
        }
      }
    }
    // console.log(newDevice);
    if (newDevice) {
      for (let s of newDevice) {
        if (res == s.logicDevices.name) {
          return true;
        }
      }
      return false;
    }
  },
  // 是不是表情
  bindKeyInput: function(substr) {
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
      customName: substring
    });
    console.log(that.data.customName, '查看输入的设备名称');
  },
  affirm: function() {
    var that = this;
    if (that.data.customName == null || that.data.customName == '') {
      wx.showToast({
        title: '名称为空哦'
      });
    } else {
      var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
      if(that.data.areauuid == "area-0000"){
        that.setData({
          areauuid:""
        })
      }
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildConfigEntityInfoRequest(
          app.globalData.username_,
          that.data.deviceuuid,
          that.data.areauuid,
          that.data.customName
        ),
        success: function(req) {
          console.log(req, '保存设备名称房间后返回的数据');
        },
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    }
  },
  choseTxt: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id; //获取自定义的ID值
    var areaUUID = e.currentTarget.dataset.areauuid; //获取自定义的ID值
    that.setData({
      id: id,
      areauuid: areaUUID
    });
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
    var that = this;
    // 添加新设备成功
    console.log(that.data);
    if (
      msg_.EntityInfoConfigured != undefined &&
      msg_.EntityInfoConfigured != null &&
      that.data.deviceuuid == msg_.EntityInfoConfigured.UUID
    ) {
      if (that.data.profile == Const.Profile.WINDOW_COVERING) {
        wx.navigateTo({
          url:
            '../curtainType/curtainType?types=addDevice&&curtainUuid=' +
            that.data.deviceuuid +
            '&&parentuuid=' +
            that.data.device.logicD.parentUuid
        });
        return;
      }
      if (that.data.newdevicelen == 1) {
        wx.navigateBack({
          delta: 2
        });
        return;
      }
      wx.navigateBack({
        delta: 1
      });
    }
  },
  onLoad: function(options) {
    console.log(options);
    var that = this;
    that.setData({
      deviceuuid: options.uuid,
      device: JSON.parse(options.device),
      profile: options.profile,
      newdevicelen: options.newdevice
    });
    wx.setNavigationBarTitle({
      title: that.data.modifyName //页面标题为路由参数
    });
    let profile = options.profile;
    let boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    if (profile == 1 || profile == 2) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildIdentifyDeviceRequest(app.globalData.username_, that.data.deviceuuid, 4),
        success: function(req) {
          console.log(req);
        },
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    } else if (profile == 'undefined') {
      let physicD = HomeCenterManager.getDefaultHomeCenterCache().entities.get(that.data.deviceuuid);
      // if (physicD.isWallSwitch()){
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildIdentifyDeviceRequest(
          app.globalData.username_,
          physicD.logicDevice[0].uuid,
          8
        ),
        success: function(req) {
          console.log(req);
        },
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
      // }
    } else {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildIdentifyDeviceRequest(app.globalData.username_, that.data.deviceuuid, 8),
        success: function(req) {
          console.log(req);
        },
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
    }

    var g = 1;
    var names = '';
    if (options.profile == Const.Profile.PIR_PANEL) {
      for (; ; g++) {
        names = '感应开关0' + g;
        if (!that.mateName(names)) {
          console.log(names);
          that.setData({
            customName: names
          });
          return;
        }
      }
    } else if (options.profile == Const.Profile.SMART_PLUG) {
      //插座
      for (; ; g++) {
        names = '智能插座0' + g;
        if (!that.mateName(names)) {
          console.log(names);
          that.setData({
            customName: names
          });
          return;
        }
      }
    } else if (options.profile == Const.Profile.ON_OFF_LIGHT) {
      //灯座
      for (; ; g++) {
        names = '智能灯座0' + g;
        if (!that.mateName(names)) {
          console.log(names);
          that.setData({
            customName: names
          });
          return;
        }
      }
    } else if (options.profile == Const.Profile.DOOR_CONTACT) {
      console.log('????');
      //门磁
      for (; ; g++) {
        names = '无线门磁0' + g;
        if (!that.mateName(names)) {
          console.log(names);
          that.setData({
            customName: names
          });
          return;
        }
      }
    } else if (options.profile == 'undefined') {
      let physicD = HomeCenterManager.getDefaultHomeCenterCache().entities.get(that.data.deviceuuid);
      if (physicD.isWallSwitch()) {
        for (; ; g++) {
          names = '墙壁开关0' + g;
          if (!that.mateName(names)) {
            // console.log(names);
            that.setData({
              customName: names
            });
            return;
          }
        }
      } else if (physicD.isZHHVRVGateway()){
        for (; ; g++) {
          names = '空调网关0' + g;
          if (!that.mateName(names)) {
            console.log(names);
            that.setData({
              customName: names
            });
            return;
          }
        }
      }
    } else if (options.profile == Const.Profile.WINDOW_COVERING) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildWriteAttributeRequest(app.globalData.username_, that.data.deviceuuid, 19, 1),
        success: function(req) {
          console.log(req);
        },
        error: function(req, res) {
          console.log('got error', req, res);
        }
      });
      //插座
      for (; ; g++) {
        names = '智能窗帘0' + g;
        if (!that.mateName(names)) {
          console.log(names);
          that.setData({
            customName: names
          });
          return;
        }
      }
    } else if (options.profile == Const.Profile.HA_ZHH_GATEWAY) {
    
      //空调网关
      for (; ; g++) {
        names = '空调网关0' + g;
        if (!that.mateName(names)) {
          console.log(names);
          that.setData({
            customName: names
          });
          return;
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    var areas = [];
    for (var t of entities.values()) {
      if (t.getEntityType() == Const.EntityType.AREA) {
        //区域
        areas.push(t);
      }
    }
    console.log(areas);
    that.setData({
      areaChoose: areas
    });
  }
});
