/** @format */
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var app = getApp();
var mqttclient = require('../../utils/mqttclient');
import Const from '../../data/Const.js';
var feedbackApi = require('../../utils/showToast.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    otherIn: '',
    version: '' //版本信息
  },
  getEntityResult: function (msg_) {
  },
  onMqttMsg: function (msg_) {
    console.log(msg_);
    // 别人操作了布防撤防
    var that = this;
    console.log(that.data)
    if (msg_.DeviceAttrReport != null && msg_.DeviceAttrReport != undefined) {
      if (that.data.uuid == msg_.DeviceAttrReport.UUID) {
        console.log(that.data);
        let rssis = 'otherIn.rssi';
        if (msg_.DeviceAttrReport.RSSI != undefined) {
          console.log(that.data.otherIn)
          that.setData({
            [rssis]: msg_.DeviceAttrReport.RSSI
          });
        }

      }
      that.lightChange()
      that.LEDChange()
      that.keepOnOffStatus()

    }
    // 按键 --- 开关和门磁
    if (msg_.DeviceKeyPressed != null && msg_.DeviceKeyPressed != undefined) {
      if (that.data.uuid == msg_.DeviceKeyPressed.UUID) {
        console.log(that.data.uuid);
        let rssis = 'otherIn.rssi';
        if (msg_.DeviceKeyPressed.RSSI) {
          that.setData({
            [rssis]: msg_.DeviceKeyPressed.RSSI
          });
        }
        
      }
      that.lightChange()
      that.LEDChange()
      that.keepOnOffStatus()
    }
    if (msg_.WriteAttributeResult != null && msg_.WriteAttributeResult != undefined) {
      // if (that.data.otherIn.UUID == msg_.WriteAttributeResult.UUID) {
      that.lightChange()
      that.LEDChange()
      that.keepOnOffStatus()
      that.exclusiveOn()
      // }
    }
  },
  // btn事件
  switchtap: function (e) {
    console.log(e);
    let that = this;
    var enableVal;
    var uuidValue = e.currentTarget.dataset.uuid; //当前设备uuid
    var enable = e.currentTarget.dataset.enable;
    var types = e.currentTarget.dataset.type;
    var topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    var username_ = app.globalData.username_; //全局用户名
    console.log(that.data)
    // if (e.currentTarget.dataset.types == 'wallLight') {
    //   for (let wallLight of that.data.uiWallSwitch.uiWallLight) {
    //     if (uuidValue == wallLight.device.uuid) {
    //       wallLight.load = true;
    //     }
    //   }
    //   that.setData({
    //     uiWallSwitch: that.data.uiWallSwitch
    //   });
    // }
    // sender, uuid, attrID, value
    if (types == "lightChange") {
      // if (e.currentTarget.dataset.types == 'wallLight') {
      for (let wallLight of that.data.lightArrs) {
        if (uuidValue == wallLight.device.uuid) {
          wallLight.load = true;
        }
      }
      that.setData({
        lightArrs: that.data.lightArrs
      });
      // }
      if (enable == true) {
        enableVal = 0
      } else {
        enableVal = 1
      }
      console.log(enableVal)
      console.log(Const.AttrKey.Cfg_Disable_Relay)
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.Cfg_Disable_Relay, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    } else if (types == 'LEDChange') {
      that.data.LEDInformations.load = true;
      that.setData({
        LEDInformations: that.data.LEDInformations
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.Cfg_Indicator_LED, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    } else if (types == 'keepOnOffStatus') {
      that.data.keepOnOffStatus.load = true;
      that.setData({
        keepOnOffStatus: that.data.keepOnOffStatus
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.Enable_Keep_OnOff_Status, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    } else if (types == 'exclusiveOn') {
      that.data.exclusiveOn.load = true;
      that.setData({
        exclusiveOn: that.data.exclusiveOn
      })
      if (enable == true) {
        enableVal = 2
      } else {
        enableVal = 0
      }
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.CFG_Mutexed_Index, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    that.setData({
      uuid:options.information
    })
    if (options.parentuuid == 'undefined') {
      let phydevice = {}
      let obj = entities.get(options.information)
      console.log(obj)
      phydevice.device = obj
      that.setData({
        otherIn: phydevice,
        version: phydevice.device.version,
        parentuuid: 'undefined'
      });
      wx.setNavigationBarTitle({
        title: obj.uiname,
      })
      return;
    }
    let obj = entities.get(options.parentuuid)
    console.log(obj)
    let device = {}
    device.device = obj
    that.setData({
      otherIn: device,
      version: obj.version,
      parentuuid: options.parentuuid
    });
    wx.setNavigationBarTitle({
      title: obj.logicDevice[0].uiname,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },
  lightChange: function () {
    let that = this
    if (that.data.parentuuid == "undefined") {
      
      let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
      let phySicDevice = entities.get(that.data.otherIn.device.uuid)
    
      if (phySicDevice.model == "TERNCY-SM01-D2")return;
      if (phySicDevice.model == "TERNCY-WS01-D1" || phySicDevice.model == "TERNCY-WS01-D2" || phySicDevice.model == "TERNCY-WS01-D3" || phySicDevice.model == "TERNCY-WS01-D4"){
        if (phySicDevice.version <= 13){
            return
        }
      } else if (phySicDevice.model == "TERNCY-WS01-S1" || phySicDevice.model == "TERNCY-WS01-S2" || phySicDevice.model == "TERNCY-WS01-S3") {
        if (phySicDevice.version <= 54) {
          return
        }
      } 
      console.log(entities.get(that.data.otherIn.device.uuid))
      let lightArr = []
      for (let logicD of entities.get(that.data.otherIn.device.uuid).logicDevice) {
        if (logicD.profile == 2) {
          for (let attr of logicD.attributes) {
            if (attr.key == Const.AttrKey.Cfg_Disable_Relay && (attr.value == 1 || attr.value == 0)) {
              var uiWallLogicD = {};
              uiWallLogicD.device = logicD;
              // uiWallLogicD.load = 'false'
              if (logicD.name == '') {
                logicD.uiUuid = logicD.uuid.substr(12, 7);
              }
              if (attr.value == 1) {
                uiWallLogicD.placeBt = '已设为可编程按键'
                uiWallLogicD.placeText = '可编程按键，可用于双联双控'
                uiWallLogicD.switchEnable = false
                if (logicD.uuid.charAt(18) == 1) {
                  uiWallLogicD.deviceimg = '../../imgs/wallkeypressLT.png';
                } else if (logicD.uuid.charAt(18) == 2) {
                  uiWallLogicD.place = 'rt';
                  uiWallLogicD.deviceimg = '../../imgs/wallkeypressRT.png';
                } else if (logicD.uuid.charAt(18) == 3) {
                  uiWallLogicD.place = 'lb';
                  uiWallLogicD.deviceimg = '../../imgs/wallkeypressL.png';
                } else if (logicD.uuid.charAt(18) == 4) {
                  uiWallLogicD.place = 'rb';
                  uiWallLogicD.deviceimg = '../../imgs/wallkeypressR.png';
                }
              } else if (attr.value == 0) {
                uiWallLogicD.placeBt = '已设为控灯光按键'
                uiWallLogicD.placeText = '单击按键控制本地的灯光'
                uiWallLogicD.switchEnable = true
                if (logicD.uuid.charAt(18) == 1) {
                  uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLOffline.png';
                  uiWallLogicD.place = 'lt';
                  if (logicD.Available == true) {
                    for (let attrs of logicD.attributes) {
                      if (attrs.key == 0 && attrs.value == 1) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLOn.png';
                      } else if (attrs.key == 0 && attrs.value == 0) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLOff.png';
                      }
                    }
                  }
                } else if (logicD.uuid.charAt(18) == 2) {
                  uiWallLogicD.place = 'rt';
                  uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightROffline.png';
                  if (logicD.Available == true) {
                    for (let attrs of logicD.attributes) {
                      if (attrs.key == 0 && attrs.value == 1) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightROn.png';
                      } else if (attrs.key == 0 && attrs.value == 0) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightROff.png';
                      }
                    }
                  }
                } else if (logicD.uuid.charAt(18) == 3) {
                  uiWallLogicD.place = 'lb';
                  uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLBOffline.png';
                  if (logicD.Available == true) {
                    for (let attrs of logicD.attributes) {
                      if (attrs.key == 0 && attrs.value == 1) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLBOn.png';
                      } else if (attrs.key == 0 && attrs.value == 0) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLBOff.png';
                      }
                    }
                  }
                } else if (logicD.uuid.charAt(18) == 4) {
                  uiWallLogicD.place = 'rb';
                  uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightRBOffline.png';
                  if (logicD.Available == true) {
                    for (let attrs of logicD.attributes) {
                      if (attrs.key == 0 && attrs.value == 1) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightRBOn.png';
                      } else if (attrs.key == 0 && attrs.value == 0) {
                        uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightRBOff.png';
                      }
                    }
                  }
                }
              }
              lightArr.push(uiWallLogicD)
            }
          }

        }
      }
      that.setData({
        lightArrs: lightArr
      })
    }

  },
  LEDChange: function () {
    let that = this
    console.log(that.data)
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let deviceInformation = entities.get(that.data.otherIn.device.uuid)
    if (deviceInformation.model == "TERNCY-SM01-D2") return;
    if (deviceInformation.model == "TERNCY-WS01-D1" || deviceInformation.model == "TERNCY-WS01-D2" || deviceInformation.model == "TERNCY-WS01-D3" || deviceInformation.model == "TERNCY-WS01-D4") {
      if (deviceInformation.version <= 13) {
        return
      }
    } else if (deviceInformation.model == "TERNCY-WS01-S1" || deviceInformation.model == "TERNCY-WS01-S2" || deviceInformation.model == "TERNCY-WS01-S3") {
      if (deviceInformation.version <= 54) {
        return
      }
    } else if (deviceInformation.model == "TERNCY-SP01"){
      if (deviceInformation.version <= 84) {
        return
      }
    } else if (deviceInformation.model == "TERNCY-CM01") {
      if (deviceInformation.version <= 25) {
        return
      }
    }
    console.log(deviceInformation)
    if (deviceInformation == undefined) {
      return
    }
    console.log(that.data.parentuuid)
    console.log(deviceInformation.model)
    if (that.data.parentuuid != 'undefined' && (deviceInformation.model == "TERNCY-PP01" || deviceInformation.model == "TERNCY-LS01" || deviceInformation.model == "TERNCY-DC01")){
      return
    }
    console.log(deviceInformation)
    for (let attr of deviceInformation.logicDevice[0].attributes) {
      if (attr.key == Const.AttrKey.Cfg_Indicator_LED && (attr.value == 1 || attr.value == 0)) {
        console.log(deviceInformation.logicDevice[0])
        let LEDInformation = {}

        // LEDInformation.load = false
        LEDInformation.uuid = deviceInformation.logicDevice[0].uuid
        if (attr.value == 1) {
          if (deviceInformation.logicDevice[0].profile == 5) {
            LEDInformation.ledBT = '指示灯设置'
            LEDInformation.deviceName = '指示灯开启 '
            LEDInformation.ledText = '绿色常亮表示正常工作中'
          } else if (deviceInformation.model == "TERNCY-SP01") {
            LEDInformation.ledBT = '按键指示灯设置'
            LEDInformation.deviceName = '按键指示灯开启'
            LEDInformation.ledText = '绿色打开，黄色关闭'
          } else {
            LEDInformation.ledBT = '中心指示灯设置'
            LEDInformation.deviceName = '指示灯常亮'
            LEDInformation.ledText = '表示设备处于正常工作中'
          }
          LEDInformation.switchEnable = true
          LEDInformation.deviceimg = "../../imgs/indicator_light_enable.png"
        } else if (attr.value == 0) {
          if (deviceInformation.logicDevice[0].profile == 5) {
            LEDInformation.ledBT = '指示灯设置'
            LEDInformation.deviceName = '指示灯长灭'
            LEDInformation.ledText = '可减少对夜间睡眠的干扰'
          } else if (deviceInformation.model == "TERNCY-SP01") {
            LEDInformation.ledBT = '按键指示灯设置'
            LEDInformation.deviceName = '按键指示灯长灭'
            LEDInformation.ledText = '可减少对夜间睡眠的干扰'
          } else {
            LEDInformation.ledBT = '中心指示灯设置'
            LEDInformation.deviceName = '指示灯长灭'
            LEDInformation.ledText = '可减少对夜间睡眠的干扰'
          }
          LEDInformation.switchEnable = false
          LEDInformation.deviceimg = "../../imgs/indicator_light_disenable.png"
        }
        that.setData({
          LEDInformations: LEDInformation
        })
        console.log(that.data.LEDInformations)
      }
    }
  },
  keepOnOffStatus:function(){
    let that = this
    console.log(that.data)
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let deviceInformation = entities.get(that.data.otherIn.device.uuid)
    console.log(deviceInformation)
    if (deviceInformation == undefined) {
      return
    }
    if (deviceInformation.model != "TERNCY-SP01") {
      return
    }
    if (deviceInformation.version < 102) {
      return
    }
    console.log(deviceInformation)
    for (let attr of deviceInformation.logicDevice[0].attributes) {
      if (attr.key == Const.AttrKey.Enable_Keep_OnOff_Status && (attr.value == 1 || attr.value == 0)) {
        console.log(deviceInformation.logicDevice[0])
        let keepOnOffStatus = {}
        // keepOnOffStatus.load = false
        keepOnOffStatus.uuid = deviceInformation.logicDevice[0].uuid
        if (attr.value == 1) {
          keepOnOffStatus.statusBt = '启用自动恢复功能'
          keepOnOffStatus.statusText = '上电时开关设置为以前的状态'
          keepOnOffStatus.switchEnable = true
          keepOnOffStatus.deviceimg = "../../imgs/indicator_onoff_enable.png"
        } else if (attr.value == 0) {
          keepOnOffStatus.statusBt = '禁用自动恢复功能'
          keepOnOffStatus.statusText = '上电时开关设置为关闭的状态'
          keepOnOffStatus.switchEnable = false
          keepOnOffStatus.deviceimg = "../../imgs/indicator_onoff_disenable.png"
        }
        that.setData({
          keepOnOffStatus: keepOnOffStatus
        })
        console.log(that.data.keepOnOffStatus)
      }
    }
  },
  exclusiveOn:function(){
    let that = this
    console.log(that.data)
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let deviceInformation = entities.get(that.data.otherIn.device.uuid)
    console.log(deviceInformation)
    if (deviceInformation == undefined) {
      return
    }
    if (deviceInformation.model != Const.DeviceModel.SWITCH_MODULE) {
      return
    }
    if (deviceInformation.version < 18) {
      return
    }
    console.log(deviceInformation)
    for (let attr of deviceInformation.logicDevice[0].attributes) {
      if (attr.key == Const.AttrKey.CFG_Mutexed_Index && (attr.value >= 1 || attr.value == 0)) {
        console.log(deviceInformation.logicDevice[0])
        let exclusiveOn = {}
        // exclusiveOn.load = false
        exclusiveOn.uuid = deviceInformation.logicDevice[0].uuid
        if (attr.value > 0) {
          exclusiveOn.statusBt = '开关互锁已启用'
          exclusiveOn.statusText = '仅允许一路开关处于打开状态'
          exclusiveOn.enable = true
          exclusiveOn.deviceimg = "../../imgs/exclusiveon_state_enable.png"
        } else if (attr.value == 0) {
          exclusiveOn.statusBt = '开关互锁已禁用'
          exclusiveOn.statusText = '所有开关可以自由独立控制'
          exclusiveOn.enable = false
          exclusiveOn.deviceimg = "../../imgs/exclusiveon_state_disable.png"
        }
        that.setData({
          exclusiveOn: exclusiveOn
        })
        console.log(that.data.exclusiveOn)
      }
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.lightChange()
    this.LEDChange()
    this.keepOnOffStatus()
    this.exclusiveOn()
    console.log(this.data)
  },
});
