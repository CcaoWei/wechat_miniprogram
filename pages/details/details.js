/** @format */

var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
var feedbackApi = require('../../utils/showToast.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detailsIfm: '', //详情页设备信息
    bgcolorAn: '', //头部背景色
    winWidth: wx.getSystemInfoSync().windowWidth,
    adjusting: '', //是否校验
    sun: 0, //光照值
    electricity: 0, //电量
    temperature: 0, //温度
    opacityL: 0,
    opacityR: 0,
    isLorS: false,
    doublebind: false,
    index: 5,
    airtem: null,
    supportAutomation: false
  },
  getEntityResult: function () { },
  // 改名字
  rename: function () {
    var that = this;
    var dn = JSON.stringify(that.data.detailsIfm);
    wx.navigateTo({
      url: '../rename/rename?name=' + dn
    });
  },
  // 改房间名字
  revampAreaName: function () {
    var that = this;

    var dn = JSON.stringify(that.data.detailsIfm);
    wx.navigateTo({
      url: '../revampAreaName/revampAreaName?areaName=' + that.data.detailsIfm.device.areaUuid + '&presentuuid=' + that.data.detail_parentuuid + '&deviceuuid=' + that.data.detailsIfm.device.uuid
    });
  },
  // 顶部点击效果
  onoffchange: function (e) {
    var that = this;

    if (that.data.detailsIfm.device.model) {
      return;
    }
    that.detailsDevice();
    // 动画
    let animationbg = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease'
    });
    that.animationbg = animationbg;
    if (
      that.data.detailsIfm.device.Available == true &&
      that.data.detailsIfm.switchEnable == true &&
      that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG
    ) {
      animationbg.backgroundColor('#D6D6D6').step();
      that.setData({
        bgcolorAn: animationbg.export()
      });
    } else if (
      that.data.detailsIfm.device.Available == true &&
      that.data.detailsIfm.switchEnable == false &&
      that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG
    ) {
      animationbg.backgroundColor('#8FD4FB').step();
      that.setData({
        bgcolorAn: animationbg.export()
      });
    } else if (
      that.data.detailsIfm.device.Available == true &&
      that.data.detailsIfm.switchEnable == true &&
      that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT
    ) {
      animationbg.backgroundColor('#D6D6D6').step();
      that.setData({
        bgcolorAn: animationbg.export()
      });
    } else if (
      that.data.detailsIfm.device.Available == true &&
      that.data.detailsIfm.switchEnable == false &&
      that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT
    ) {
      animationbg.backgroundColor('#FFB34D').step();
      that.setData({
        bgcolorAn: animationbg.export()
      });
    }
    if (app.getClient()) {
      if (
        that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG ||
        that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT
      ) {
        var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
        mqttclient.sendRequest({
          client: app.getClient(),
          topic: boxname,
          req: mqttclient.buildOnOffRequest(app.globalData.Username_, that.data.detailsIfm.device.uuid, 2),
          success: function (req, res) {

          },
          error: function (req, res) {
            console.log('got error', req, res);
          }
        });
      }
    }
    that.setData({
      detailsIfm: that.data.detailsIfm
    });
  },
  deviceSafety: function (e) {

    var that = this;
    var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    if (e.currentTarget.dataset.everydevice == 'true') {
      that.setData({
        load: true
      });
    }

    setTimeout(function () {
      if (e.currentTarget.dataset.switchenable == true) {
        mqttclient.sendRequest({
          client: app.getClient(),
          topic: boxname,
          req: mqttclient.buildSetAlertLevelRequest(
            app.globalData.username_,
            that.data.detailsIfm.device.uuid,
            1
          ),
          error: function (req, res) {
            console.log('got error', req, res);
          }
        });
      } else if (e.currentTarget.dataset.switchenable == false) {
        mqttclient.sendRequest({
          client: app.getClient(),
          topic: boxname,
          req: mqttclient.buildSetAlertLevelRequest(
            app.globalData.username_,
            that.data.detailsIfm.device.uuid,
            0
          ),
          error: function (req, res) {
            console.log('got error', req, res);
          }
        });
      }
    }, 500);
  },
  // 绑定事件的发送
  initiateMode: function (e) {
    let that = this;

    if (
      e.currentTarget.dataset.types == Const.BindingType.KEY_PRESS &&
      that.data.detail_parentuuid != 'undefined'
    ) {
      that.data.deviceBind1.loading = true;
      that.setData({
        deviceBind1: that.data.deviceBind1
      });
    } else if (e.currentTarget.dataset.types == '1&d' && that.data.detail_parentuuid != 'undefined') {
      that.data.deviceBind4.loading = true;
      that.setData({
        deviceBind4: that.data.deviceBind4
      });
    } else if (e.currentTarget.dataset.types == Const.BindingType.OPEN_CLOSE) {
      that.data.deviceBind2.loading = true;
      that.setData({
        deviceBind2: that.data.deviceBind2
      });
    } else if (e.currentTarget.dataset.types == Const.BindingType.PIR_PANEL) {
      that.data.deviceBind3.loading = true;
      that.setData({
        deviceBind3: that.data.deviceBind3
      });
    } else if (
      e.currentTarget.dataset.types == Const.BindingType.KEY_PRESS &&
      that.data.detail_parentuuid == 'undefined'
    ) {
      for (let krypress of that.data.uiWallSwitch.uiWallKeyprass) {
        if (e.currentTarget.dataset.place == krypress.place) {
          krypress.loading = true;
        }
      }
      that.setData({
        uiWallSwitch: that.data.uiWallSwitch
      });
    }
    let boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    setTimeout(function () {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildSetBindingEnableRequest(
          app.globalData.username_,
          e.currentTarget.dataset.binduuid,
          e.currentTarget.dataset.switchenable
        ),
        error: function (req, res) {
          console.log('got error', req, res);
        }
      });
    }, 500);
  },

  // btn事件
  switchtap: function (e) {

    let that = this;
    var uuidValue = e.currentTarget.dataset.uuid; //当前设备uuid
    var profileValue = e.currentTarget.dataset.profile; //设备类型
    var topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    var username_ = app.globalData.username_; //全局用户名
    if (e.currentTarget.dataset.types == 'wallLight') {
      for (let wallLight of that.data.uiWallSwitch.uiWallLight) {
        if (uuidValue == wallLight.device.uuid) {
          wallLight.load = true;
        }
      }
      that.setData({
        uiWallSwitch: that.data.uiWallSwitch
      });
    }
    if (profileValue == Const.Profile.SMART_PLUG || profileValue == Const.Profile.ON_OFF_LIGHT) {
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildOnOffRequest(username_, uuidValue, 2),
        error: function (req, res) {
          console.log('got error', req, res);
        }
      });
      //如果是门磁或者开关
    } else if (profileValue == Const.Profile.DOOR_CONTACT || profileValue == Const.Profile.PIR_PANEL) {
      let levelValue; //切换level的值
      if (e.currentTarget.dataset.switchenable == true) {
        levelValue = 1;
      } else {
        levelValue = 0;
      }
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildSetAlertLevelRequest(username_, uuidValue, levelValue),
        error: function (req, res) {
          console.log('got error', req, res);
        }
      });
    } else if (profileValue == Const.Profile.WINDOW_COVERING) {
      let levelValue; //切换level的值
      if (e.currentTarget.dataset.switchenable == true) {
        levelValue = 90;
      } else {
        levelValue = 0;
      }
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildControlWindowCoveringRequest(username_, uuidValue, levelValue),
        error: function (req, res) {
          console.log(req, res);
        }
      });
    }
    // }, 500)
  },
  // 其他的点击函数
  littlePage: function () {
    var that = this;
    // var dn = JSON.stringify(that.data.detailsIfm);

    wx.navigateTo({
      url: '../detailOther/detailOther?information=' + that.data.detailsIfm.device.uuid + '&parentuuid=' + that.data.detail_parentuuid
    });
  },
  //窗帘校准行程
  correct: function () {
    let that = this;
    let boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    wx.showModal({
      title: '行程校准',
      content: '此过程大约需要30-60秒，您确定要进行行程校准吗？',
      success: function (res) {
        if (res.confirm) {
          that.setAttr(19, 1);
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },
  //单击按键和双击按键的绑定
  keyType: function (e) {
    let binduuid = e.currentTarget.dataset.binduuid;
    let doublebind = e.currentTarget.dataset.doublebind;
    let uuid = this.data.detail_uuid;
    let parentuuid = this.data.detail_parentuuid;
    wx.navigateTo({
      url:
        '../keyType/keyType?binduuid=' +
        binduuid +
        '&uuid=' +
        uuid +
        '&parentuuid=' +
        parentuuid +
        '&doublebind=' +
        doublebind
    });
  },
  //绑定编辑
  bindRedact: function (e) {
    var that = this;

    if (e.currentTarget.dataset.doublebind == 'true') {
      wx.navigateTo({
        url:
          '../bindDevice/bindDevice?curtain=undefined&doublebind=true&bindingUuid=' +
          e.currentTarget.dataset.binduuid +
          '&bindingType=' +
          e.currentTarget.dataset.types +
          '&triggerAddress=' +
          that.data.detailsIfm.device.uuid +
          '&parentuuid=' +
          that.data.detail_parentuuid
      });
      return;
    }
    wx.navigateTo({
      url:
        '../bindDevice/bindDevice?curtain=undefined&bindingUuid=' +
        e.currentTarget.dataset.binduuid +
        '&bindingType=' +
        e.currentTarget.dataset.types +
        '&triggerAddress=' +
        that.data.detailsIfm.device.uuid +
        '&parentuuid=' +
        that.data.detail_parentuuid
    });
  },
  // 墙壁开关的按键绑定
  keypressBind: function (e) {

    var that = this;
    console.log(e);
    if (e.currentTarget.dataset.profile == 10) {
      wx.navigateTo({
        url:
          '../details/details?parentuuid=' +
          that.data.detail_uuid +
          '&uuid=' +
          e.currentTarget.dataset.information
      });
      return;
    }

    wx.navigateTo({
      url:
        '../keypressBind/keypressBind?keypressBind=' +
        JSON.stringify(that.data.detailsIfm.device) +
        '&information=' +
        e.currentTarget.dataset.information
    });
  },
  // 开关模块的输入设置
  inputConfiguration: function (e) {

    var that = this;
    wx.navigateTo({
      url:
        '../detailInput/detailInput?input=' +
        JSON.stringify(that.data.detailsIfm.device) +
        '&information=' +
        e.currentTarget.dataset.information +
        '&parentuuid=' +
        e.currentTarget.dataset.parentuuid +
        '&inputindex=' +
        e.currentTarget.dataset.inputindex
    });
  },
  //获取家庭中心版本
  isSupportAutomation: function () {
    let that = this;

    let cache = HomeCenterManager.getDefaultHomeCenterCache();
    let entities = cache.entities;
    let physicD = entities.get(that.data.detail_uuid);
    if (physicD != undefined && physicD.isZHHVRVGateway()){
      that.setData({
        supportAutomation: false
      })
      return;
    }
    for (let entity of entities.values()) {
      if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        if (entity.model == Const.DeviceModel.GATEWAY) {
          console.log(entity)
          for (let attribute of entity.attributes) {
           
            if (attribute.key == Const.AttrKey.CFG_Auto_Version) {
           
              if (attribute.value > Const.SUPPORT_AUTOMATION) {
                that.setData({
                  supportAutomation: true
                })
                
                return;
              }
            }
          }
        }
      }
    }
    that.setData({
      supportAutomation: false
    })
    
  },
  // 匹配区域
  matching: function (res) {
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let areaArrs = [];
    for (var area of entities.values()) {
      if (area.getEntityType() == Const.EntityType.AREA) {
        areaArrs.push(area);
      }
    }

    for (var q = 0; q < areaArrs.length; q++) {
      if (res == areaArrs[q].uuid) {
        return areaArrs[q].name;
      }
    }
    return "默认房间"
  },
  // 光照
  sunLevel: function (num) {
    if (num < Const.Luminance.VERY_DARK) {
      // return 0 + num / Const.Luminance.VERY_DARK * 10;
      return num
    } else if (num < Const.Luminance.LITTLE_DARK) {
      // return 10 + num / Const.Luminance.LITTLE_DARK * 10;
      return num
    } else if (num < Const.Luminance.LIGHT) {
      // return 20 + num / Const.Luminance.LIGHT * 40;
      return num
    } else if (num < Const.Luminance.VERY_LIGHT) {
      // return 60 + num / Const.Luminance.VERY_LIGHT * 20;
      return num
    } else if (num < Const.Luminance.VERY_VERY_LIGHT) {
      // return 80 + num / Const.Luminance.VERY_VERY_LIGHT * 10;
      return num
    } else if (num < 3 * Const.Luminance.UPPER_LIMIT) {
      // return 100;
      return num
    }
  },
  // 删除设备
  deleteBtn: function () {
    var that = this;

    wx.showModal({
      title: '提示',
      content: '确定删除该设备？',
      success: function (res) {
        if (res.confirm && that.data.detailsIfm.device.uuid) {
          if (app.getClient()) {
            var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
            mqttclient.sendRequest({
              client: app.getClient(),
              topic: boxname,
              req: mqttclient.buildDeleteEntityRequest(
                app.globalData.username_,
                that.data.detailsIfm.device.uuid
              ),
              error: function (req, res) {
                console.log('got error', req, res);
              }
            });
          }
        }
      }
    });
  },
  // 窗帘类型
  curtainType: function () {
    let that = this;
    wx.navigateTo({
      url:
        '../curtainType/curtainType?curtainUuid=' +
        that.data.detail_uuid +
        '&types=details&mold=' +
        that.data.detailsIfm.types +
        '&parentuuid=' +
        that.data.detail_parentuuid
    });
  },
  // 窗帘方向
  curtainWay: function () {
    let that = this;

    if (that.data.detailsIfm.types == -1) {
      feedbackApi.showToast({
        title: '请先选择窗帘类型'
      }); //调用
      return;
    }
    wx.navigateTo({
      url:
        '../curtainWay/curtainWay?types=' +
        that.data.detailsIfm.types +
        '&curtainUuid=' +
        that.data.detail_uuid +
        '&direction=' +
        that.data.detailsIfm.direction +
        '&parentuuid=' +
        that.data.detailsIfm.device.parentUuid
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let that = this;

    that.setData({
      detail_uuid: options.uuid, //保存当前设备的uuid
      detail_parentuuid: options.parentuuid //当前设备的physic uuid
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  isUsWallSwitch: function (model) {

    if (model == Const.DeviceModel.WALL_SWITCH_X1) {
      return true
    }
    return false
  },
  isSwitchModule: function (model) {

    if (model == Const.DeviceModel.SWITCH_MODULE) {
      return true
    }
    return false
  },
  onReady: function () { 
    let that = this;
    console.log("that.data")
    console.log( that.data)
    console.log(HomeCenterManager.findEntity(that.data.detail_uuid));
  },
  onMqttMsg: function (msg_) {
    var that = this;

    if (msg_.GetEntityResult != null && msg_.GetEntityResult != undefined) {
      that.detailsDevice();
      that.onShow();
    }
    if (msg_.Sender != HomeCenterManager.getAllHomeCenters()[0].uuid) {
      return;
    }
    if (msg_.DeviceAttrReport != null && msg_.DeviceAttrReport != undefined) {
      that.detailsDevice();
      if (
        that.data.detailsIfm.device.model &&
        that.data.detailsIfm.device.uuid != msg_.DeviceAttrReport.UUID
      ) {
        for (let wallLight of that.data.uiWallSwitch.uiWallLight) {
          if (wallLight.device.uuid == msg_.DeviceAttrReport.UUID) {
            wallLight.load = false;
            for (let attr of msg_.DeviceAttrReport.Attributes) {
              if (attr.AttrID == 0 && attr.AttrValue == 1) {
                wallLight.switchEnable = true;


                if (wallLight.place == 'lt') {
                  if (that.isUsWallSwitch(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                  } else if (that.isSwitchModule(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/switch_module_lightLOffline.png';
                  } else {
                    wallLight.deviceimg = '../../imgs/wallswitch_lightLOn.png';
                  }

                } else if (wallLight.place == 'rt') {
                  if (that.isUsWallSwitch(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                  } else if (that.isSwitchModule(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/switch_module_lightROffline.png';
                  } else {
                    wallLight.deviceimg = '../../imgs/wallswitch_lightROn.png';
                  }

                } else if (wallLight.place == 'lb') {
                  if (that.isUsWallSwitch(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                  } else {
                    wallLight.deviceimg = '../../imgs/wallswitch_lightLBOn.png';
                  }

                } else if (wallLight.place == 'rb') {
                  if (that.isUsWallSwitch(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                  } else {
                    wallLight.deviceimg = '../../imgs/wallswitch_lightRBOn.png';
                  }

                }
              } else if (attr.AttrID == 0 && attr.AttrValue == 0) {
                wallLight.switchEnable = false;
                if (wallLight.place == 'lt') {
                  if (that.isUsWallSwitch(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/usWallswitch_lightLOff.png';
                  } else if (that.isSwitchModule(that.data.detailsIfm.device.model)) {
                    wallLight.deviceimg = '../../imgs/switch_module_lightLOffline.png';
                  } else {
                    wallLight.deviceimg = '../../imgs/wallswitch_lightLOff.png';
                  }

                } else if (wallLight.place == 'rt') {
                  if (that.isSwitchModule(that.data.detailsIfm.device.model)) {
                    return
                  }
                  wallLight.deviceimg = '../../imgs/wallswitch_lightROff.png';
                } else if (wallLight.place == 'lb') {
                  wallLight.deviceimg = '../../imgs/wallswitch_lightLBOff.png';
                } else if (wallLight.place == 'rb') {
                  wallLight.deviceimg = '../../imgs/wallswitch_lightRBOff.png';
                }
              }
            }
          }
        }
        that.setData({
          uiWallSwitch: that.data.uiWallSwitch
        });
        return;
      }
      if (that.data.detailsIfm.device.uuid == msg_.DeviceAttrReport.UUID) {
        that.setData({
          load: false
        });
        if (msg_.DeviceAttrReport.RSSI != undefined) {
          var rssis = 'detailsIfm.rssi';
          that.setData({
            [rssis]: msg_.DeviceAttrReport.RSSI
          });
        }
        var detailselPeo = 'detailsIfm.detailselpeo';
        var detailserPeo = 'detailsIfm.detailserpeo';
        var num;
        // 接收到事件的背景颜色改变
        let animation = wx.createAnimation({
          duration: 1500,
          timingFunction: 'ease'
        });
        that.animation = animation;
        //门磁左边
        var animationL = wx.createAnimation({
          duration: 2000,
          timingFunction: 'ease'
        });
        that.animationL = animationL;
        //门磁右边
        var animationR = wx.createAnimation({
          duration: 2000,
          timingFunction: 'ease'
        });
        that.animationR = animationR;
        //门磁的顶部变化
        for (var r = 0; r < msg_.DeviceAttrReport.Attributes.length; r++) {
          for (var b = 0; b < that.data.detailsIfm.device.attributes.length; b++) {
            if (
              that.data.detailsIfm.device.attributes[b].key == msg_.DeviceAttrReport.Attributes[r].AttrID
            ) {
              that.data.detailsIfm.device.attributes[b].value =
                msg_.DeviceAttrReport.Attributes[r].AttrValue;
            }
          }
          if (
            msg_.DeviceAttrReport.Attributes[r].AttrID == Const.AttrKey.ON_OFF_STATUS &&
            msg_.DeviceAttrReport.Attributes[r].AttrValue == 1 &&
            (that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT ||
              that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG)
          ) {
            that.data.detailsIfm.switchEnable = true;
          } else if (
            msg_.DeviceAttrReport.Attributes[r].AttrID == Const.AttrKey.ON_OFF_STATUS &&
            msg_.DeviceAttrReport.Attributes[r].AttrValue == 0 &&
            (that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT ||
              that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG)
          ) {
            that.data.detailsIfm.switchEnable = false;
          } else if (
            msg_.DeviceAttrReport.Attributes[r].AttrID == Const.AttrKey.ALERT_LEVEL &&
            msg_.DeviceAttrReport.Attributes[r].AttrValue == 0 &&
            (that.data.detailsIfm.device.profile == Const.Profile.PIR_PANEL ||
              that.data.detailsIfm.device.profile == Const.Profile.DOOR_CONTACT)
          ) {
            that.data.detailsIfm.switchEnable = false;
          } else if (
            msg_.DeviceAttrReport.Attributes[r].AttrID == Const.AttrKey.ALERT_LEVEL &&
            msg_.DeviceAttrReport.Attributes[r].AttrValue == 1 &&
            (that.data.detailsIfm.device.profile == Const.Profile.PIR_PANEL ||
              that.data.detailsIfm.device.profile == Const.Profile.DOOR_CONTACT)
          ) {
            that.data.detailsIfm.switchEnable = true;
          } else if (msg_.DeviceAttrReport.Attributes[r].AttrID == Const.AttrKey.OCCUPANCY) {
            num = 0;
            if (app.detectionLeftpeople(msg_.DeviceAttrReport.Attributes[r].AttrValue) == 1) {
              //左边有事件
              if (app.detectionLeft(msg_.DeviceAttrReport.Attributes[r].AttrValue) == 1) {
                that.setData({
                  [detailselPeo]: true,
                  opacityL: 1
                });
                num = 1;
              } else {
                that.setData({
                  [detailselPeo]: false,
                  opacityL: 0
                });
              }
            } else if (app.detectionRightpeople(msg_.DeviceAttrReport.Attributes[r].AttrValue) == 1) {
              //右边有事件
              if (app.detectionRight(msg_.DeviceAttrReport.Attributes[r].AttrValue) == 1) {
                that.setData({
                  [detailserPeo]: true,
                  opacityR: 1
                });
                num = 1;
              } else {
                that.setData({
                  [detailserPeo]: false,
                  opacityR: 0
                });
              }
            }
          } else if (msg_.DeviceAttrReport.Attributes[r].AttrID == Const.AttrKey.BINARY_INPUT_STATUS) {
            num = msg_.DeviceAttrReport.Attributes[r].AttrValue;
          } else if (msg_.DeviceAttrReport.Attributes[r].AttrID == Const.AttrKey.AttrIDBatteryPercent) {
            that.setData({
              electricity: msg_.DeviceAttrReport.Attributes[r].AttrValue
            });
          }

          //门磁的顶部变化

          if (
            that.data.detailsIfm.device.Available == true &&
            num == 1 &&
            that.data.detailsIfm.device.profile == Const.Profile.DOOR_CONTACT
          ) {
            animation.backgroundColor('#FD7271').step();
            animationL.left(79).step();
            animationR.right(70).step();
            that.setData({
              doorL: animationL.export(),
              doorR: animationR.export(),
              bgcolorAn: animation.export()
            });
          } else if (
            that.data.detailsIfm.device.Available == true &&
            num == 0 &&
            that.data.detailsIfm.device.profile == Const.Profile.DOOR_CONTACT
          ) {
            animation.backgroundColor('#61EA68').step();
            that.setData({
              bgcolorAn: animation.export()
            });
            animationL.left('215rpx').step();
            that.setData({
              doorL: animationL.export()
            });
            animationR.right('215rpx').step();
            that.setData({
              doorR: animationR.export()
            });
          } else if (
            that.data.detailsIfm.device.Available == true &&
            that.data.detailsIfm.switchEnable == true &&
            that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG
          ) {
            animation.backgroundColor('#8FD4FB').step();
            that.setData({
              bgcolorAn: animation.export()
            });
          } else if (
            that.data.detailsIfm.device.Available == true &&
            that.data.detailsIfm.switchEnable == false &&
            that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG
          ) {
            animation.backgroundColor('#D6D6D6').step();
            that.setData({
              bgcolorAn: animation.export()
            });
          } else if (
            that.data.detailsIfm.device.Available == true &&
            that.data.detailsIfm.switchEnable == true &&
            that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT
          ) {
            let deviceimg = 'detailsIfm.detailsImg';
            animation.backgroundColor('#FFB34D').step();
            that.setData({
              bgcolorAn: animation.export(),
              [deviceimg]: '../../imgs/big_light_on.png'
            });
          } else if (
            that.data.detailsIfm.device.Available == true &&
            that.data.detailsIfm.switchEnable == false &&
            that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT
          ) {
            let deviceimg = 'detailsIfm.detailsImg';
            animation.backgroundColor('#D6D6D6').step();
            that.setData({
              bgcolorAn: animation.export(),
              [deviceimg]: '../../imgs/big_light_off.png'
            });
          } else if (
            that.data.detailsIfm.device.Available == true &&
            num == 1 &&
            that.data.detailsIfm.device.profile == Const.Profile.PIR_PANEL
          ) {
            animation.backgroundColor('#FD7271').step();
            that.setData({
              bgcolorAn: animation.export()
            });
          } else if (
            that.data.detailsIfm.device.Available == true &&
            num == 0 &&
            that.data.detailsIfm.device.profile == Const.Profile.PIR_PANEL
          ) {
            animation.backgroundColor('#9CA8B6').step();
            that.setData({
              bgcolorAn: animation.export()
            });
          }
          that.setData({
            detailsIfm: that.data.detailsIfm
          });

        }
        that.detailsDevice();
      }
    }
    if (msg_.BindingEnableChanged != null && msg_.BindingEnableChanged != undefined) {
      if (that.data.detail_parentuuid == 'undefined') {
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
        that.detailsDevice();
      }
    }
    if (msg_.OnOffResult != null && msg_.OnOffResult != undefined) {
      if (that.data.detailsIfm.device.model && that.data.detailsIfm.device.uuid != msg_.OnOffResult.UUID) {
        return;
      }
      that.detailsDevice();
    }
    // 删除了设备
    if (msg_.DeleteEntityResult != null && msg_.DeleteEntityResult != undefined) {
      wx.navigateBack({
        delta: 1
      });
    }
    // 设备长安离线
    if (msg_.PhysicDeviceOffline != null && msg_.PhysicDeviceOffline != undefined) {

      if (that.data.detail_parentuuid == 'undefined') {
        let animation = wx.createAnimation({
          duration: 1500,
          timingFunction: 'ease'
        });
        that.animation = animation;
        animation.backgroundColor('#d6d6d6').step();
        that.setData({
          bgcolorAn: animation.export()
        });
        that.detailsDevice();
      }
      if (msg_.PhysicDeviceOffline.UUID == that.data.detail_parentuuid) {
        let animation = wx.createAnimation({
          duration: 1500,
          timingFunction: 'ease'
        });
        that.animation = animation;
        animation.backgroundColor('#d6d6d6').step();
        that.setData({
          bgcolorAn: animation.export()
        });
        that.detailsDevice();
      }
    }
    if (msg_.EntityAvailable != null && msg_.EntityAvailable != undefined) {
      that.onShow();
    }
  },

  // 完善pir信息
  perfectPIRIfm: function (logicDs) {
    let that = this;
    if (logicDs.device.Available == false) {
      that.setData({
        detailsIfm: logicDs
      });
      return;
    }
    // 上面的icon
    let iconList = [];
    let iconItme1 = {};
    let iconItme2 = {};
    let iconItme3 = {};
    // iconItme1.icon = "../../imgs/icon_temperature.png";
    // iconItme1.icontype = "icon-temperature";
    // iconItme1.top = attr.value + "℃";
    for (let attr of logicDs.device.attributes) {
      if (attr.key == 15 && attr.value == 0) {
        logicDs.switchEnable = false;
      } else if (attr.key == 15 && attr.value == 1) {
        logicDs.switchEnable = true;
      } else if (attr.key == Const.AttrKey.TEMPERATURE) {
        iconItme1.icon = "../../imgs/icon_temperature.png";
        iconItme1.icontype = "icon-temperature";
        iconItme1.top = attr.value / 10 + "℃";
      } else if (attr.key == 8) {
        iconItme2.icon = "";
        iconItme2.electricity = attr.value;
        iconItme2.icontype = "icon-electricity";
        iconItme2.top = attr.value + "%";
      }
      if (attr.key == 5) {
        iconItme3.icon = "../../imgs/icon_mode_hot.png";
        iconItme3.icontype = "icon-hot";
        iconItme3.top = parseInt(that.sunLevel(attr.value)) + "Lux";
      }
    }
    iconList.push(iconItme1);
    iconList.push(iconItme2);
    iconList.push(iconItme3);

    that.setData({
      detailsIfm: logicDs,
      iconList: iconList
    });
  },
  // 完善门磁信息
  perfectDOORIfm: function (logicDs) {
    let that = this;
    if (logicDs.device.Available == false) {
      that.setData({
        detailsIfm: logicDs
      });
      return;
    }
    // 上面的icon
    let iconList = [];
    let iconItme1 = {};
    let iconItme2 = {};
    // iconItme1.icon = "../../imgs/icon_temperature.png";
    // iconItme1.icontype = "icon-temperature";
    // iconItme1.top = attr.value + "℃";
    for (let attr of logicDs.device.attributes) {
      if (attr.key == 15 && attr.value == 0) {
        logicDs.switchEnable = false;
      } else if (attr.key == 15 && attr.value == 1) {
        logicDs.switchEnable = true;
      } else if (attr.key == Const.AttrKey.TEMPERATURE) {
        iconItme2.icon = "../../imgs/icon_temperature.png";
        iconItme2.icontype = "icon-temperature";
        iconItme2.top = attr.value / 10 + "℃";
      } else if (attr.key == Const.AttrKey.BATTERY_PERCENT) {
        iconItme1.icon = "";
        iconItme1.electricity = attr.value;
        iconItme1.icontype = "icon-electricity";
        iconItme1.top = attr.value + "%";
      }
    }
    iconList.push(iconItme1);
    iconList.push(iconItme2);
    that.setData({
      detailsIfm: logicDs,
      iconList: iconList
    });
  },
  // 完善灯座信息
  perfectLIGHTIfm: function (logicDs) {
    let that = this;
    if (logicDs.device.Available == false) {
      logicDs.detailsImg = '../../imgs/big_light_off.png';
      that.setData({
        detailsIfm: logicDs
      });
      return;
    }
    for (let attr of logicDs.device.attributes) {
      if (attr.key == Const.AttrKey.ON_OFF_STATUS && attr.value == 0) {
        logicDs.switchEnable = false;
        logicDs.detailsImg = '../../imgs/big_light_off.png';
      } else if (attr.key == Const.AttrKey.ON_OFF_STATUS && attr.value == 1) {
        logicDs.switchEnable = true;
        logicDs.detailsImg = '../../imgs/big_light_on.png';
      }
    }

    that.setData({
      detailsIfm: logicDs
    });
  },
  // 完善插座信息
  perfectPLUGIfm: function (logicDs) {
    let that = this;
    // 上面的icon
    let iconList = [];
    let iconItme1 = {};
    let iconItme2 = {};
    // iconItme1.icon = "../../imgs/icon_temperature.png";
    // iconItme1.icontype = "icon-temperature";
    // iconItme1.top = attr.value + "℃";
    logicDs.detailsImg = '../../imgs/plug_hole_off.png';
    if (logicDs.device.Available == false) {
      that.setData({
        detailsIfm: logicDs,
        iconList: iconList
      });
      return;
    }
    for (let attr of logicDs.device.attributes) {
      if (attr.key == Const.AttrKey.ON_OFF_STATUS && attr.value == 0) {
        logicDs.switchEnable = false;
      } else if (attr.key == Const.AttrKey.ON_OFF_STATUS && attr.value == 1) {
        logicDs.switchEnable = true;
      } else if (attr.key == Const.AttrKey.ACTIVE_POWER) {
        iconItme2.icon = '../../imgs/icon_power.png';
        iconItme2.icontype = "icon-power"
        iconItme2.top = attr.value / 10 + " W";
      } else if (attr.key == Const.AttrKey.INSERT_EXTRACT_STATUS) {
        iconItme1.icontype = "two-holes"
        if (attr.value == 1) {
          iconItme1.icon = '../../imgs/two_holes.png';
        } else if (attr.value == 2) {
          iconItme1.icon = '../../imgs/three_holes.png';
        } else if (attr.value == 0) {
          iconItme1.icon = '../../imgs/plug_in_use_none.png';
        }
      }
    }
    iconList.push(iconItme1);
    iconList.push(iconItme2);
    that.setData({
      detailsIfm: logicDs,
      iconList: iconList
    });
  },
  // 完善窗帘信息
  perfectCURTAINIfm: function (logicDs) {
    let that = this;
    if (logicDs.device.Available == false) {
      logicDs.detailsImg = '../../imgs/image_curtain.png';
      for (let attr of logicDs.device.attributes) {
        if (
          attr.key == Const.AttrKey.WINDOW_COVERING_MOTOR_USER_TYPE &&
          attr.value != -1 &&
          logicDs.device.profile == Const.Profile.WINDOW_COVERING
        ) {
          //窗帘类型
          logicDs.types = attr.value;
          if (attr.value == 0) {
            logicDs.curtainType = '左侧窗帘';
          } else if (attr.value == 1) {
            logicDs.curtainType = '右侧窗帘';
          } else if (attr.value == 2) {
            logicDs.curtainType = '双开窗帘';
          }
        } else if (
          attr.key == Const.AttrKey.WINDOW_COVERING_DIRECTION &&
          attr.value != -1 &&
          logicDs.device.profile == Const.Profile.WINDOW_COVERING
        ) {
          //窗帘方向
          logicDs.direction = attr.value;
          if (attr.value == 0) {
            logicDs.curtainWay = '正向';
          } else if (attr.value == 1) {
            logicDs.curtainWay = '反向';
          } else if (attr.value == 2) {
            logicDs.curtainWay = '未配置';
          }
        } else if (
          attr.key == Const.AttrKey.WINDOW_COVERING_MOTOR_TRIP_CONFUGURED &&
          attr.value == 1 &&
          logicDs.device.profile == Const.Profile.WINDOW_COVERING
        ) {
          //窗帘方向
          that.setData({
            adjusting: '是'
          });
        } else if (
          attr.key == Const.AttrKey.WINDOW_COVERING_MOTOR_TRIP_CONFUGURED &&
          attr.value == 0 &&
          logicDs.device.profile == Const.Profile.WINDOW_COVERING
        ) {
          //窗帘方向
          that.setData({
            adjusting: '否'
          });
        }
      }
      that.setData({
        detailsIfm: logicDs
      });
      return;
    }
    for (let attr of logicDs.device.attributes) {
      if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 0) {
        logicDs.switchEnable = false;
        logicDs.detailsImg = '../../imgs/image_curtain.png';
      } else if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 1) {
        logicDs.switchEnable = true;
        logicDs.detailsImg = '../../imgs/image_curtain.png';
      } else if (attr.key == Const.AttrKey.WINDOW_COVERING_MOTOR_USER_TYPE && attr.value != -1) {
        //窗帘类型
        logicDs.types = attr.value;
        if (attr.value == 0) {
          logicDs.curtainType = '左侧窗帘';
        } else if (attr.value == 1) {
          logicDs.curtainType = '右侧窗帘';
        } else if (attr.value == 2) {
          logicDs.curtainType = '双开窗帘';
        }
      } else if (attr.key == Const.AttrKey.WINDOW_COVERING_DIRECTION && attr.value != -1) {
        //窗帘方向
        logicDs.direction = attr.value;
        if (attr.value == 0) {
          logicDs.curtainWay = '正向';
        } else if (attr.value == 1) {
          logicDs.curtainWay = '反向';
        } else if (attr.value == 2) {
          logicDs.curtainWay = '未配置';
        }
      } else if (attr.key == Const.AttrKey.WINDOW_COVERING_MOTOR_TRIP_CONFUGURED && attr.value == 1) {
        that.setData({
          adjusting: '是'
        });
      } else if (attr.key == Const.AttrKey.WINDOW_COVERING_MOTOR_TRIP_CONFUGURED && attr.value == 0) {
        that.setData({
          adjusting: '否'
        });
      }
    }
    that.setData({
      detailsIfm: logicDs
    });
  },
  // 完善旋钮开关信息
  perfectROTARYKNOBfm: function (logicDs) {
    let that = this;
    logicDs.detailsImg = "../../imgs/image_rotary_knob.png"
    if (logicDs.device.Available == false) {
      that.setData({
        detailsIfm: logicDs
      });
      return;
    }
    let iconList = [];
    let iconItme1 = {};
    for (let attr of logicDs.device.attributes) {
      if (attr.key == Const.AttrKey.BATTERY_PERCENT) {
        iconItme1.icon = "";
        iconItme1.electricity = attr.value;
        iconItme1.icontype = "icon-electricity";
        iconItme1.top = attr.value + "%";
      }
    }
    iconList.push(iconItme1);
    that.setData({
      detailsIfm: logicDs,
      iconList: iconList
    });
  },
  // 完善空调控制器信息
  perfectAIRCONDITIONERfm: function (logicDs) {
    var that = this;
    logicDs.detailsImg = "../../imgs/image_air_condition.png"
    if(logicDs.device.name == ""){
      logicDs.device.uiname = logicDs.device.uuid.substr(12,12)
    }
    console.log(logicDs)
    that.setData({
      detailsIfm: logicDs
    });
    // 上面的icon
    let iconList = [];
    let iconItme1 = {};
    let iconItme2 = {};
    let iconItme3 = {};
    let airSetList = [];
    let airSetItem1 = {};
    let airSetItem2 = {};
    let airSetItem3 = {};
    let airSetItem4 = {};
    let airSetItem5 = {};
    airSetItem1.name = "开关";
    airSetItem2.name = "风速";
    airSetItem3.name = "模式";
    airSetItem4.name = "设定温度";
    airSetItem5.name = "当前温度";
    airSetItem1.type = 0;
    airSetItem2.type = 1;
    airSetItem3.type = 2;
    airSetItem4.type = 3;
    airSetItem5.type = 4;
    airSetItem2.index = 0;
    airSetItem4.index = 0;
    airSetItem5.index = 0;
    airSetItem2.array = ["快速", "中速", "慢速"];
    airSetItem3.array = ["制冷", "制热", "除湿", "通风"];
    airSetItem4.array = ["16℃", "17℃", "18℃", "19℃", "20℃", "21℃", "22℃", "23℃", "24℃", "25℃", "26℃", "27℃", "28℃", "29℃", "30℃"];
    airSetItem1.array = ["关闭", "打开"]
    for (let attr of logicDs.device.attributes) {

      if (attr.key == 49) {
        airSetItem4.value = attr.value + "℃";

        that.setData({
          airtem: attr.value + "℃"
        })
        airSetItem4.index = attr.value - 16
      } else if (attr.key == 50) {
        iconItme1.icon = "../../imgs/icon_temperature.png";
        iconItme1.icontype = "icon-temperature";
        iconItme1.top = attr.value + "℃";
        airSetItem5.value = attr.value + "℃";
      } else if (attr.key == 51) {
        iconItme2.icon = "../../imgs/icon_flow.png";
        iconItme2.icontype = "icon-flow";
        switch (attr.value) {
          case 1:
            airSetItem2.value = "快速";
            airSetItem2.index = 0;
            iconItme2.top = "快";
            break;
          case 2:
            airSetItem2.value = "中速";
            airSetItem2.index = 1;
            iconItme2.top = "中";
            break;
          case 4:
            airSetItem2.value = "慢速";
            airSetItem2.index = 2;
            iconItme2.top = "低";
            break;

        }
      } else if (attr.key == 52) {
        switch (attr.value) {
          case 1:
            airSetItem3.value = "制冷";
            airSetItem3.index = 0;
            iconItme3.icon = "../../imgs/icon_mode_cool.png";
            iconItme3.icontype = "icon-cool";
            break;
          case 2:
            airSetItem3.value = "除湿";
            airSetItem3.index = 2;
            iconItme3.icon = "../../imgs/icon_mode_demoisture.png";
            iconItme3.icontype = "icon-demoisture";
            break;
          case 4:
            airSetItem3.value = "通风";
            airSetItem3.index = 3;
            iconItme3.icon = "../../imgs/icon_mode_flow.png";
            iconItme3.icontype = "icon-mode-flow";
            break;
          case 8:
            airSetItem3.value = "制热";
            airSetItem3.index = 1;
            iconItme3.icon = "../../imgs/icon_mode_hot.png";
            iconItme3.icontype = "icon-hot";
            break;
          default:
            airSetItem3.value = "";
        }
      } else if (attr.key == 48) {
        switch (attr.value) {
          case 0:
            airSetItem1.value = "关闭"
            airSetItem1.index = 0
            break;
          default:
            airSetItem1.value = "打开"
            airSetItem1.index = 1

        }
      }
    }
    airSetList.push(airSetItem1);
    airSetList.push(airSetItem2);
    airSetList.push(airSetItem3);
    airSetList.push(airSetItem4);
    airSetList.push(airSetItem5);
    iconList.push(iconItme1);
    iconList.push(iconItme2);
    iconList.push(iconItme3);
    that.setData({
      airSetList: airSetList,
      iconList: iconList
    });

  },
  selectedIndex: function (e) {

    let that = this;
    that.setData({
      index: e.currentTarget.dataset.type
    })
  },
  setAttr: function (attrKey, attrValue) {
    let that = this;

    let boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    mqttclient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: mqttclient.buildWriteAttributeRequest(
        app.globalData.username_,
        that.data.detail_uuid,
        attrKey,
        attrValue
      ),
      success: function (req) {
        console.log(req);
      },
      error: function (req, res) {
        console.log('got error', req, res);
      }
    });
  },
  settingAirConditionItem: function (e) {
    let that = this;
    that.data.airSetList[that.data.index].value = that.data.airSetList[that.data.index].array[e.detail.value];

    that.data.airSetList[that.data.index].index = e.detail.value;
    that.setData({
      airSetList: that.data.airSetList
    })

    if (that.data.index == 0) {//开关状态
      that.setAttr(48, e.detail.value);
    } else if (that.data.index == 1) {//风速
      if (e.detail.value == 0) {
        that.setAttr(51, 1);
      } else if (e.detail.value == 1) {
        that.setAttr(51, 2);
      } else if (e.detail.value == 2) {
        that.setAttr(51, 4);
      }
    } else if (that.data.index == 2) {//模式
      if (e.detail.value == 0) {
        that.setAttr(52, 1);
      } else if (e.detail.value == 1) {
        that.setAttr(52, 8);
      } else if (e.detail.value == 2) {
        that.setAttr(52, 2);
      } else if (e.detail.value == 3) {
        that.setAttr(52, 4);
      }
    } else if (that.data.index == 3) {//目标温度
      let val = that.data.airSetList[that.data.index].array[e.detail.value];
      that.setAttr(49, val.split("℃")[0]);
    }
  },
  detailsDevice: function () {
    
    let that = this;
    if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
      return;
    }
    if (HomeCenterManager.getDefaultHomeCenterCache().entities == undefined) {
      return;
    }
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;

    var bindings = [];
    // 绑定
    for (let t of entities.values()) {
      if (t.getEntityType() == Const.EntityType.BINDING) {
        //绑定
        bindings.push(t);
      }
    }
    // 墙壁开关
    if (that.data.detail_parentuuid == 'undefined') {
      let physicD = entities.get(that.data.detail_uuid);

      let physicDs = {};
      physicDs.device = physicD;
      physicDs.areaName = that.matching(physicD.areaUuid);
      if (physicD.isUsWallSwitch()) {
        physicDs.detailsImg = '../../imgs/image_wallswitch_Us.png';
      } else if (physicD.isSwitchModule()) {
        physicDs.detailsImg = '../../imgs/image_switch_module.png';
      } else if (physicD.isZHHVRVGateway()) {
        physicDs.detailsImg = '../../imgs/image_air_condition_controller.png';
      } else {
        physicDs.detailsImg = '../../imgs/image_wallswitch.png';
      }
      let wallLight = [];
      let wallKeyprass = [];
      let wallSwitch = {};
      if (physicD.name == '') {
        wx.setNavigationBarTitle({
          title: physicD.uiname
        });
      } else {
        wx.setNavigationBarTitle({
          title: physicD.name
        });
      }
      for (let logicD of physicD.logicDevice) {
        var uiWallLogicD = {};
        uiWallLogicD.device = logicD;
        uiWallLogicD.parent = physicD.uuid;
        if (logicD.name == '') {
          if (logicD.profile == 10) {
            logicD.uiUuid = logicD.uuid.substr(12, 12);
            logicD.uiname = logicD.uuid.substr(12, 12);
          } else {
            logicD.uiUuid = logicD.uuid.substr(12, 7);
          }
        }
        if (logicD.profile == Const.Profile.ON_OFF_LIGHT) {
          //灯
          if (((!physicD.isSwitchModule() && logicD.isWallSwitchLightChange()) ||
            (physicD.isSwitchModule() && logicD.isPureInput()))) {
            if (logicD.uuid.charAt(18) == 1) {
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallkeypressLT.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallkeypressLT.png';
              }
              uiWallLogicD.place = 1;
            } else if (logicD.uuid.charAt(18) == 2) {
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallkeypressLT.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallkeypressRT.png';
              }

              uiWallLogicD.place = 2;
            } else if (logicD.uuid.charAt(18) == 3) {
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallkeypressLT.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallkeypressL.png';
              }

              uiWallLogicD.place = 3;
            } else if (logicD.uuid.charAt(18) == 4) {
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallkeypressLT.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallkeypressR.png';
              }

              uiWallLogicD.place = 4;
            }
            wallKeyprass.push(uiWallLogicD);
          } else {
            if (logicD.uuid.charAt(18) == 1) {
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOffline.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLOffline.png';
              }
              uiWallLogicD.place = 'lt';
              if (logicD.Available == true) {
                for (let attrs of logicD.attributes) {
                  if (attrs.key == 0 && attrs.value == 1) {
                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                    } else if (physicD.isSwitchModule()) {
                      uiWallLogicD.deviceimg = '../../imgs/switch_module_lightLOffline.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLOn.png';
                    }
                    uiWallLogicD.switchEnable = true;
                  } else if (attrs.key == 0 && attrs.value == 0) {
                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOff.png';
                    } else if (physicD.isSwitchModule()) {
                      uiWallLogicD.deviceimg = '../../imgs/switch_module_lightLOffline.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLOff.png';
                    }

                    uiWallLogicD.switchEnable = false;
                  }
                }
              }
            } else if (logicD.uuid.charAt(18) == 2) {
              uiWallLogicD.place = 'rt';
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightROffline.png';
              }
              if (logicD.Available == true) {
                for (let attrs of logicD.attributes) {
                  if (attrs.key == 0 && attrs.value == 1) {
                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                    } else if (physicD.isSwitchModule()) {
                      uiWallLogicD.deviceimg = '../../imgs/switch_module_lightROffline.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightROn.png';
                    }
                    uiWallLogicD.switchEnable = true;
                  } else if (attrs.key == 0 && attrs.value == 0) {

                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOff.png';
                    } else if (physicD.isSwitchModule()) {
                      uiWallLogicD.deviceimg = '../../imgs/switch_module_lightROffline.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightROff.png';
                    }

                    uiWallLogicD.switchEnable = false;
                  }
                }
              }
            } else if (logicD.uuid.charAt(18) == 3) {
              uiWallLogicD.place = 'lb';
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLBOffline.png';
              }
              if (logicD.Available == true) {
                for (let attrs of logicD.attributes) {
                  if (attrs.key == 0 && attrs.value == 1) {
                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLBOn.png';
                    }

                    uiWallLogicD.switchEnable = true;
                  } else if (attrs.key == 0 && attrs.value == 0) {
                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOff.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightLBOff.png';
                    }

                    uiWallLogicD.switchEnable = false;
                  }
                }
              }
            } else if (logicD.uuid.charAt(18) == 4) {
              uiWallLogicD.place = 'rb';
              if (physicD.isUsWallSwitch()) {
                uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
              } else {
                uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightRBOffline.png';
              }

              if (logicD.Available == true) {
                for (let attrs of logicD.attributes) {
                  if (attrs.key == 0 && attrs.value == 1) {
                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOn.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightRBOn.png';
                    }

                    uiWallLogicD.switchEnable = true;
                  } else if (attrs.key == 0 && attrs.value == 0) {
                    if (physicD.isUsWallSwitch()) {
                      uiWallLogicD.deviceimg = '../../imgs/usWallswitch_lightLOff.png';
                    } else {
                      uiWallLogicD.deviceimg = '../../imgs/wallswitch_lightRBOff.png';
                    }

                    uiWallLogicD.switchEnable = false;
                  }
                }
              }
            }
            wallLight.push(uiWallLogicD);
          }
        } else if (logicD.profile == Const.Profile.YAN_BUTTON) {
          //按键
          if (logicD.uuid.charAt(18) == 2) {
            if (physicD.isUsWallSwitch()) {
              uiWallLogicD.deviceimg = '../../imgs/usWallkeypressLT.png';
            } else {
              uiWallLogicD.deviceimg = '../../imgs/wallkeypressRT.png';
            }

            uiWallLogicD.place = 2;
          } else if (logicD.uuid.charAt(18) == 3) {
            uiWallLogicD.place = 3;
            if (physicD.isUsWallSwitch()) {
              uiWallLogicD.deviceimg = '../../imgs/usWallkeypressLT.png';
            } else {
              uiWallLogicD.deviceimg = '../../imgs/wallkeypressL.png';
            }

          } else if (logicD.uuid.charAt(18) == 4) {
            if (physicD.isUsWallSwitch()) {
              uiWallLogicD.deviceimg = '../../imgs/usWallkeypressLT.png';
            } else {
              uiWallLogicD.deviceimg = '../../imgs/wallkeypressR.png';
            }

            uiWallLogicD.place = 4;
          }
          wallKeyprass.push(uiWallLogicD);
        } else if (logicD.profile == 10) {
          uiWallLogicD.deviceimg = '../../imgs/dev_icon_air_conditioner_on.png';
          wallKeyprass.push(uiWallLogicD);
        }

        // let deviceBinds = []
        for (let binding of bindings) {
          for (var wallKeyprassItem of wallKeyprass) {
            if (
              binding.triggerAddress == wallKeyprassItem.device.uuid &&
              wallKeyprassItem.device.uuid.charAt(18) == 3
            ) {
              let binds = {};
              binds.bind = binding;
              wallKeyprassItem.bindDevice = binds;
            } else if (
              binding.triggerAddress == wallKeyprassItem.device.uuid &&
              wallKeyprassItem.device.uuid.charAt(18) == 4
            ) {
              let binds = {};
              binds.bind = binding;
              wallKeyprassItem.bindDevice = binds;
            }
          }
        }
        
      }
      wallSwitch.uiWallLight = wallLight;
      wallSwitch.uiWallKeyprass = wallKeyprass;


      that.setData({
        uiWallSwitch: wallSwitch,
        detailsIfm: physicDs
      });
      
    } else {
      //其他类型的设备
      let physicD = entities.get(that.data.detail_parentuuid);

      for (let logicD of physicD.logicDevice) {

        if (logicD.uuid == that.data.detail_uuid) {
          let logicDs = {};

          // logicD.Available = physicD.Available;
          // if (logicD.Available){
          //   logicD.Available = logicD.Available;
          // }
          logicDs.device = logicD;
          logicDs.switchEnable = false;
          logicDs.areaName = that.matching(logicD.areaUuid);
          if (logicD.profile == 0) {
            that.perfectPIRIfm(logicDs);
          } else if (logicD.profile == 1) {
            that.setData({
              isLorS: true
            });
            that.perfectPLUGIfm(logicDs);
          } else if (logicD.profile == 2) {
            that.setData({
              isLorS: true
            });
            that.perfectLIGHTIfm(logicDs);
          } else if (logicD.profile == 3) {
            that.perfectDOORIfm(logicDs);
          } else if (logicD.profile == 5) {
            that.setData({
              isLorS: true
            });
            that.perfectCURTAINIfm(logicDs);
          } else if (logicD.profile == 7) {
            that.perfectROTARYKNOBfm(logicDs);
          } else if (logicD.profile == 10) {
            that.perfectAIRCONDITIONERfm(logicDs);
          }
        }
      }
      let bindItem = {};

      if (that.data.detailsIfm.device.profile == Const.Profile.PIR_PANEL) {
        bindItem.switchEnable = that.data.detailsIfm.switchEnable;
        bindItem.iconImg = '../../imgs/switch_police.png';
        bindItem.bt = '布防撤防';
        bindItem.text = '有人经过发送报警';
        bindItem.stateL = '布防';
        bindItem.stateR = '撤防';
        that.setData({
          everyDevice: bindItem
        });
      } else if (that.data.detailsIfm.device.profile == Const.Profile.SMART_PLUG) {
        for (let attr of that.data.detailsIfm.device.attributes) {
          if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 1) {
            bindItem.switchEnable = true;
          } else if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 0) {
            bindItem.switchEnable = false;
          }
        }
        bindItem.iconImg = '../../imgs/plug_light.png';
        bindItem.bt = '通知';
        bindItem.text = '状态改变马上通知您';
        bindItem.stateL = '关注';
        bindItem.stateR = '取关';
        that.setData({
          everyDevice: bindItem
        });
      } else if (that.data.detailsIfm.device.profile == Const.Profile.ON_OFF_LIGHT) {
        for (let attr of that.data.detailsIfm.device.attributes) {
          if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 1) {
            bindItem.switchEnable = true;
          } else if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 0) {
            bindItem.switchEnable = false;
          }
        }
        bindItem.iconImg = '../../imgs/alarm.png';
        bindItem.bt = '通知';
        bindItem.text = '状态改变马上通知您';
        bindItem.stateL = '关注';
        bindItem.stateR = '取关';
        that.setData({
          everyDevice: bindItem
        });
      } else if (that.data.detailsIfm.device.profile == Const.Profile.DOOR_CONTACT) {
        bindItem.switchEnable = that.data.detailsIfm.switchEnable;
        bindItem.iconImg = '../../imgs/door_plarm.png';
        bindItem.bt = '布防撤防';
        bindItem.text = '门窗打开，发送警报';
        bindItem.stateL = '布防';
        bindItem.stateR = '撤防';
        that.setData({
          everyDevice: bindItem
        });
      } else if (that.data.detailsIfm.device.profile == Const.Profile.WINDOW_COVERING) {
        for (let attr of that.data.detailsIfm.device.attributes) {
          if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 1) {
            bindItem.switchEnable = true;
          } else if (attr.key == Const.AttrKey.ALERT_LEVEL && attr.value == 0) {
            bindItem.switchEnable = false;
          }
        }
        bindItem.iconImg = '../../imgs/alarm.png';
        bindItem.bt = '通知';
        bindItem.text = '状态改变，马上通知您';
        bindItem.stateL = '关注';
        bindItem.stateR = '取关';
        that.setData({
          everyDevice: bindItem
        });
      } else if (that.data.detailsIfm.device.profile == Const.Profile.SMART_DIAL) {
        // bindItem.iconImg = '../../imgs/switch_police.png';
        // bindItem.bt = '无线开关';
        // bindItem.text = '轻轻一按，全部搞定';

        that.setData({
          everyDevice: bindItem
        });
      }

      for (let binding of bindings) {
        if (binding.triggerAddress == that.data.detail_uuid) {
          let binds = {};
          binds.bind = binding;
          if (binding.types == Const.BindingType.KEY_PRESS && binding.parameter == 1) {
            //pir的绑定
            that.setData({
              deviceBind1: binds
            });
          } else if (binding.types == Const.BindingType.KEY_PRESS && binding.parameter == 2) {
            //pir的绑定
            that.setData({
              deviceBind4: binds
            });
          } else if (binding.types == Const.BindingType.PIR_PANEL) {
            //pir的绑定
            that.setData({
              deviceBind3: binds
            });
          } else if (binding.types == Const.BindingType.OPEN_CLOSE) {
            //门磁的绑定
            that.setData({
              deviceBind2: binds
            });
          } else if (binding.types == Const.BindingType.ROTARY) {
            //pir的绑定
            that.setData({
              deviceBind5: binds
            });
          }
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;

    that.isSupportAutomation();
    
    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'ease'
    });
    that.animation = animation;
    var animationL = wx.createAnimation({
      duration: 0,
      timingFunction: 'ease'
    });
    that.animationL = animationL;
    var animationR = wx.createAnimation({
      duration: 0,
      timingFunction: 'ease'
    });
    that.animationR = animationR;
    // setTimeout(function(){
    that.detailsDevice();
    // },800)

    if (that.data.detailsIfm == '') {
      return;
    }
    var profile = that.data.detailsIfm.device.profile;
    let deviceifm = that.data.detailsIfm;

    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let physic = entities.get(that.data.detail_parentuuid);
    if (deviceifm.device.model != undefined) {
      if (deviceifm.device.isWallSwitch() || deviceifm.device.isUsWallSwitch() || deviceifm.device.isSwitchModule() || deviceifm.device.isZHHVRVGateway()) {

        if (deviceifm.device.Available == true) {
          animation.backgroundColor('#9CA8B6').step();
          that.setData({
            bgcolorAn: animation.export()
          });
        } else if (
          deviceifm.device.Available == false &&
          deviceifm.device.logicDevice[0].Available == false
        ) {
          animation.backgroundColor('#d6d6d6').step();
          that.setData({
            bgcolorAn: animation.export()
          });
        }
      }
      return;
    }

    if (physic.isSmartDial()) {

      if (deviceifm.device.Available == true) {
        animation.backgroundColor('#9CA8B6').step();
        that.setData({
          bgcolorAn: animation.export(),
          deviceBg: 'pironBg'
        });
      } else if (deviceifm.device.Available == false) {
        animation.backgroundColor('#d6d6d6').step();
        that.setData({
          bgcolorAn: animation.export()
        });
      }
    }
    if (deviceifm.device.Available == true && deviceifm.switchEnable == true && !physic.isSmartDial()) {
      let num = 0;
      if (profile == Const.Profile.PIR_PANEL) {
        animation.backgroundColor('#9CA8B6').step();
        that.setData({
          bgcolorAn: animation.export(),
          deviceBg: 'pironBg'
        });
        // 判断pir有人没
        for (let attr of deviceifm.device.attributes) {
          if (attr.key == Const.AttrKey.OCCUPANCY) {
            let str = attr.value;
            num = 0;
            if (
              app.detectionLeftpeople(str) == 1 ||
              app.detectionRightpeople(str) == 1
            ) {
              //左边有事件
              if (app.detectionLeft(str) == 1) {
                that.setData({
                  opacityL: 1
                });
                num = 1;
                animation.backgroundColor('#FD7271').step();
                that.setData({
                  bgcolorAn: animation.export()
                });
              }
              if (app.detectionLeft(str) == 0) {
                that.setData({
                  opacityL: 0
                });
              }
              if (app.detectionRight(str) == 1) {
                that.setData({
                  opacityR: 1
                });
                num = 1;
                animation.backgroundColor('#FD7271').step();
                that.setData({
                  bgcolorAn: animation.export()
                });
              }
              if (app.detectionRight(str) == 0) {
                that.setData({
                  opacityR: 0
                });
              }
              if (
                app.detectionRight(str) == 0 &&
                app.detectionLeft(str) == 0
              ) {
                that.setData({
                  opacityR: 0,
                  opacityL: 0
                });
              }
            }
          }
        }
      } else if (profile == Const.Profile.SMART_PLUG) {
        animation.backgroundColor('#8FD4FB').step();
        that.setData({
          bgcolorAn: animation.export()
        });
      } else if (profile == Const.Profile.ON_OFF_LIGHT) {
        animation.backgroundColor('#FFB34D').step();
        that.setData({
          bgcolorAn: animation.export()
        });
      } else if (profile == Const.Profile.DOOR_CONTACT) {
        // animation.backgroundColor('#61EA68').step();
        that.setData({
          // bgcolorAn: animation.export(),
          deviceBg: 'dooronBg'
        });
        for (let arrt of deviceifm.device.attributes) {
          if (arrt.key == 7) {
            num = arrt.value;
          }
        }
        if (num == 1) {
          animation.backgroundColor('#FD7271').step();
          that.setData({
            bgcolorAn: animation.export()
          });
          animationL.left(70).step();
          that.setData({
            doorL: animationL.export()
          });
          animationR.right(70).step();
          that.setData({
            doorR: animationR.export()
          });
        } else if (num == 0) {
          animation.backgroundColor('#61EA68').step();
          that.setData({
            bgcolorAn: animation.export()
          });
        }
      } else if (profile == Const.Profile.WINDOW_COVERING) {
        animation.backgroundColor('#8fd4fb').step();
        that.setData({
          bgcolorAn: animation.export()
        });
      }
    } else if (deviceifm.device.Available == true && deviceifm.switchEnable == false && !physic.isSmartDial()) {
      animation.backgroundColor('#d6d6d6').step();
      that.setData({
        bgcolorAn: animation.export()
      });
      let num = 0;
      if (profile == Const.Profile.WINDOW_COVERING) {
        animation.backgroundColor('#8fd4fb').step();
        that.setData({
          bgcolorAn: animation.export()
        });
      } else if (profile == Const.Profile.DOOR_CONTACT) {
        // animation.backgroundColor('#61EA68').step();
        that.setData({
          // bgcolorAn: animation.export(),
          deviceBg: 'dooronBg'
        });
        for (let attr of deviceifm.device.attributes) {
          if (attr.key == 7) {
            num = attr.value;
          }
        }
        if (num == 1) {
          animation.backgroundColor('#FD7271').step();
          that.setData({
            bgcolorAn: animation.export()
          });
          animationL.left(70).step();
          that.setData({
            doorL: animationL.export()
          });
          animationR.right(70).step();
          that.setData({
            doorR: animationR.export()
          });
        } else if (num == 0) {
          animation.backgroundColor('#61EA68').step();
          that.setData({
            bgcolorAn: animation.export()
          });
        }
      } else if (profile == Const.Profile.PIR_PANEL || profile == 10) {
        animation.backgroundColor('#9CA8B6').step();
        that.setData({
          bgcolorAn: animation.export()
        });
        // 判断pir有人没
        for (let attr of deviceifm.device.attributes) {
          if (attr.key == Const.AttrKey.OCCUPANCY) {
            let str = attr.value;
            num = 0;
            if (
              app.detectionLeftpeople(str) == 1 ||
              app.detectionRightpeople(str) == 1
            ) {
              //左边有事件
              if (app.detectionLeft(str) == 1) {
                that.setData({
                  opacityL: 1
                });
                num = 1;
                animation.backgroundColor('#FD7271').step();
                that.setData({
                  bgcolorAn: animation.export()
                });
              }
              if (app.detectionLeft(str) == 0) {
                that.setData({
                  opacityL: 0
                });
              }
              if (app.detectionRight(str) == 1) {
                that.setData({
                  opacityR: 1
                });
                num = 1;
                animation.backgroundColor('#FD7271').step();
                that.setData({
                  bgcolorAn: animation.export()
                });
              }
              if (app.detectionRight(str) == 0) {
                that.setData({
                  opacityR: 0
                });
              }
              if (
                app.detectionRight(str) == 0 &&
                app.detectionLeft(str) == 0
              ) {
                that.setData({
                  opacityR: 0,
                  opacityL: 0
                });
              }
            }
          }
        }
      }
    } else if (deviceifm.device.Available == false) {
      animation.backgroundColor('#d6d6d6').step();
      that.setData({
        bgcolorAn: animation.export()
      });
    }
    if (that.data.detailsIfm.device.profile == 10) {

      wx.setNavigationBarTitle({
        title: that.data.detailsIfm.device.uuid.substr(12, 12)
      });
      return;
    }
    if (that.data.detailsIfm.device.name == '') {
      wx.setNavigationBarTitle({
        title: that.data.detailsIfm.device.uiname
      });
      return;
    }
    wx.setNavigationBarTitle({
      title: that.data.detailsIfm.device.name
    });

  }
});
