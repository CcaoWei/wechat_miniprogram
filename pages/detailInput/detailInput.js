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
      }
    }
    if (msg_.WriteAttributeResult != null && msg_.WriteAttributeResult != undefined) {
      // if (that.data.otherIn.UUID == msg_.WriteAttributeResult.UUID) {
      that.switchModuleInputMode()
      that.programmableSwitch()
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
    if (types == 'switchModuleInputMode') {
      that.data.switchModuleInputMode.load = true;
      that.setData({
        switchModuleInputMode: that.data.switchModuleInputMode
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      console.log("write to " + uuidValue + "   " + enableVal)
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.CFG_SW_Input_Mode, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    } else if (types == 'switchModulePolarity') {
      that.data.switchModulePolarity.load = true;
      that.setData({
        switchModulePolarity: that.data.switchModulePolarity
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      console.log("write to " + uuidValue + "   " + enableVal)
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.CFG_SW_Polarity, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    } else if (types == 'programmableInput') {
      that.data.programmableInput.load = true;
      that.setData({
        programmableInput: that.data.programmableInput
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      console.log("write to " + uuidValue + "   " + enableVal)
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.CFG_SW_Pure_Input, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    } else if (types == 'relayEnable') {
      that.data.relayEnable.load = true;
      that.setData({
        relayEnable: that.data.relayEnable
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      console.log("write to " + uuidValue + "   " + enableVal)
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
    } else if (types == 'relayAlwaysOn') {
      that.data.relayAlwaysOn.load = true;
      that.setData({
        relayAlwaysOn: that.data.relayAlwaysOn
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      console.log("write to " + uuidValue + "   " + enableVal)
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.Disabled_Relay_Status, enableVal),
        error: function (req, res) {
          console.log(req, res);
        },
        success: function (req, res) {
          console.log(req, res);
        },
      });
    } else if (types == 'ledFeedbackState') {
      that.data.ledFeedbackState.load = true;
      that.setData({
        ledFeedbackState: that.data.ledFeedbackState
      })
      if (enable == true) {
        enableVal = 1
      } else {
        enableVal = 0
      }
      console.log("write to " + uuidValue + "   " + enableVal)
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildWriteAttributeRequest(username_, uuidValue, Const.AttrKey.CFG_Button_LED_Polarity, enableVal),
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
  let inputIndex = parseInt(options.inputindex)
  console.log(inputIndex)
    if (options.parentuuid == 'undefined' || options.parentuuid == undefined) {
      let phydevice = {}
      console.log(options.information)
      console.log(entities)
      let obj = entities.get(options.information)
      console.log(obj)
      phydevice.device = obj
      that.setData({
        inputIndex: inputIndex,
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
      inputIndex: inputIndex,
      otherIn: device,
      parentuuid: options.parentuuid
    });
      console.log(that)
      console.log(that.data)
    wx.setNavigationBarTitle({
      title: obj.logicDevice[that.data.inputIndex].uiname,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },
  switchModuleInputMode:function(){
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
    var supportPalarity = false
    for (let attr of deviceInformation.logicDevice[that.data.inputIndex].attributes) {
      if (attr.key == Const.AttrKey.CFG_SW_Input_Mode && (attr.value == 1 || attr.value == 0)) {
        console.log(deviceInformation.logicDevice[that.data.inputIndex])
        let switchModuleInputMode = {}
        // switchModuleInputMode.load = false
        switchModuleInputMode.uuid = deviceInformation.logicDevice[that.data.inputIndex].uuid
        if (attr.value == 1) {
          switchModuleInputMode.statusBt = '按键式开关'
          switchModuleInputMode.statusText = '开关按下后自动回弹'
          switchModuleInputMode.mode = true
          switchModuleInputMode.deviceimg = "../../imgs/switchmodule_input_mode_button.png"
        } else if (attr.value == 0 || attr.value == -1) {
          switchModuleInputMode.statusBt = '翘板式开关'
          switchModuleInputMode.statusText = '传统的翘板式开关'
          switchModuleInputMode.mode = false
          switchModuleInputMode.deviceimg = "../../imgs/switchmodule_input_mode_rocker.png"
          supportPalarity = true
        }
        that.setData({
          switchModuleInputMode: switchModuleInputMode
        })
        console.log(that.data.switchModuleInputMode)
      }
    }
    if(supportPalarity) {
      for (let attr of deviceInformation.logicDevice[that.data.inputIndex].attributes) {
        if (attr.key == Const.AttrKey.CFG_SW_Polarity && (attr.value == 1 || attr.value == 0)) {
          console.log(deviceInformation.logicDevice[that.data.inputIndex])
          let switchModulePolarity = {}
          // switchModuleInputMode.load = false
          switchModulePolarity.uuid = deviceInformation.logicDevice[that.data.inputIndex].uuid
          if (attr.value == 1) {
            switchModulePolarity.statusBt = '按键切换'
            switchModulePolarity.statusText = '每次开关按键状态变化，即切换输出状态'
            switchModulePolarity.mode = true
            switchModulePolarity.deviceimg = "../../imgs/switchmodule_input_polarity_toggle.png"
          } else if (attr.value == 0 || attr.value == -1) {
            switchModulePolarity.statusBt = '按键状态'
            switchModulePolarity.statusText = '输出状态与按键状态保持一致'
            switchModulePolarity.mode = false
            switchModulePolarity.deviceimg = "../../imgs/switchmodule_input_polarity_fixed.png"
          }
          that.setData({
            switchModulePolarity: switchModulePolarity
          })
          console.log(that.data.switchModulePolarity)
        }
      }
    } else {
      that.setData({
        switchModulePolarity: null
      })
    }
  },
  programmableSwitch:function(){
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
    var supportRelayEnable = false
    var supportRelayAlwayson = false
    var isExclusiveOnEnable = false
    for (let attr of deviceInformation.logicDevice[that.data.inputIndex].attributes) {
      if (attr.key == Const.AttrKey.CFG_Mutexed_Index && (attr.value != 0)) {
        isExclusiveOnEnable = true
      }
    }
    for (let attr of deviceInformation.logicDevice[that.data.inputIndex].attributes) {
      if (attr.key == Const.AttrKey.CFG_SW_Pure_Input && (attr.value == 1 || attr.value == 0)) {
        console.log(deviceInformation.logicDevice[that.data.inputIndex])
        let programmableInput = {}
        // switchModuleInputMode.load = false
        programmableInput.uuid = deviceInformation.logicDevice[that.data.inputIndex].uuid
        if (attr.value == 1) {
          programmableInput.statusBt = '可编程开关已启用'
          programmableInput.statusText = ''
          programmableInput.mode = true
          programmableInput.deviceimg = "../../imgs/programmable_input_en.png"
          supportRelayEnable = true
        } else if (attr.value == 0 || attr.value == -1) {
          programmableInput.statusBt = '可编程开关已禁用'
          programmableInput.statusText = ''
          programmableInput.mode = false
          programmableInput.deviceimg = "../../imgs/programmable_input_dis.png"
        }
        that.setData({
          programmableInput: programmableInput
        })
        console.log(that.data.programmableInput)
      }
    }
    if(!isExclusiveOnEnable && supportRelayEnable) {
      for (let attr of deviceInformation.logicDevice[that.data.inputIndex].attributes) {
        if (attr.key == Const.AttrKey.Cfg_Disable_Relay && (attr.value == 1 || attr.value == 0)) {
          console.log(deviceInformation.logicDevice[that.data.inputIndex])
          let relayEnable = {}
          // switchModuleInputMode.load = false
          relayEnable.uuid = deviceInformation.logicDevice[that.data.inputIndex].uuid
          if (attr.value == 1) {
            relayEnable.statusBt = '继电器已禁用'
            relayEnable.statusText = ''
            relayEnable.mode = true
            relayEnable.deviceimg = "../../imgs/relay_disable.png"
            supportRelayAlwayson = true
          } else if (attr.value == 0) {
            relayEnable.statusBt = '继电器已启用'
            relayEnable.statusText = ''
            relayEnable.mode = false
            relayEnable.deviceimg = "../../imgs/relay_enable.png"
          }
          that.setData({
            relayEnable: relayEnable
          })
          console.log(that.data.relayEnable)
        }
      }
    } else {
          that.setData({
            relayEnable: null
          })
    }
    if(!isExclusiveOnEnable && supportRelayAlwayson) {
      for (let attr of deviceInformation.logicDevice[that.data.inputIndex].attributes) {
        if (attr.key == Const.AttrKey.Disabled_Relay_Status && (attr.value == 1 || attr.value == 0)) {
          console.log(deviceInformation.logicDevice[that.data.inputIndex])
          let relayAlwaysOn = {}
          // switchModuleInputMode.load = false
          relayAlwaysOn.uuid = deviceInformation.logicDevice[that.data.inputIndex].uuid
          if (attr.value == 1) {
            relayAlwaysOn.statusBt = '继电器保持接通'
            relayAlwaysOn.statusText = ''
            relayAlwaysOn.mode = true
            relayAlwaysOn.deviceimg = "../../imgs/relay_alwayson_enable.png"
          } else if (attr.value == 0) {
            relayAlwaysOn.statusBt = '继电器保持断开'
            relayAlwaysOn.statusText = ''
            relayAlwaysOn.mode = false
            relayAlwaysOn.deviceimg = "../../imgs/relay_alwayson_disable.png"
          }
          that.setData({
            relayAlwaysOn: relayAlwaysOn
          })
          console.log(that.data.relayAlwaysOn)
        }
      }
    } else {
          that.setData({
            relayAlwaysOn: null
          })
    }
    for (let attr of deviceInformation.logicDevice[that.data.inputIndex].attributes) {
      if (attr.key == Const.AttrKey.CFG_Button_LED_Polarity && (attr.value == 1 || attr.value == 0)) {
        console.log(deviceInformation.logicDevice[that.data.inputIndex])
        let ledFeedbackState = {}
        // switchModuleInputMode.load = false
        ledFeedbackState.uuid = deviceInformation.logicDevice[that.data.inputIndex].uuid
        if (attr.value == 1) {
          ledFeedbackState.statusBt = '已设置为正反馈'
          ledFeedbackState.statusText = '接通时指示灯亮'
          ledFeedbackState.mode = true
          ledFeedbackState.deviceimg = "../../imgs/led_feedback_positive.png"
        } else if (attr.value == 0 || attr.value == -1) {
          ledFeedbackState.statusBt = '已设置为负反馈'
          ledFeedbackState.statusText = '断开时指示灯亮'
          ledFeedbackState.mode = false
          ledFeedbackState.deviceimg = "../../imgs/led_feedback_negative.png"
        }
        that.setData({
          ledFeedbackState: ledFeedbackState
        })
        console.log(that.data.ledFeedbackState)
      }
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.switchModuleInputMode()
    this.programmableSwitch()
    console.log(this.data)
  },
});
