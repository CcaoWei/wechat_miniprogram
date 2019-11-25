/** @format */
var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
var app = getApp();
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    deviceList: {
      type: Object,
      observer: function() {
        let that = this;
        let deviceArr = [];
        console.log(that.data.deviceList, 'get deviceList info to view')
        if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
          return;
        }
        let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
        if(entities == undefined){
          that.setData({
            noDevice:true
          })
          return
        }
        for (var j of entities.values()) {
          if (j.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
            //设备
            deviceArr.push(j);
          }
        }
        // 判断是否有新设备
        console.log(deviceArr);
        console.log(that.isnewDevice(deviceArr));
        // if (that.isnewDevice(deviceArr)) {
        //   console.log(that.isnewDevice(deviceArr))
        if (that.isnewDevice(deviceArr) == undefined) {
          that.setData({
            isnewDevice: false
          });
        } else {
          that.setData({
            isnewDevice: true
          });
        }
        console.log(that.data.deviceList, 'get deviceList info to view');
        if (that.data.deviceList.length > 0) {
          console.log(that.isnoDevice(that.data.deviceList));
          if (that.isnoDevice(that.data.deviceList) == undefined) {
            that.setData({
              noDevice: true //判断是否没有设备
            });
          } else {
            that.setData({
              noDevice: !that.isnoDevice(that.data.deviceList) //判断是否没有设备
            });
          }
        }
      }
    },
    open: {
      type: Boolean
    },
    onLines: {
      type: String,
      observer: function() {
        let that = this;
        console.log("online函数")
        console.log(that.data.onLines)
        this.setData({
          onLines: that.data.onLines
        });
      }
    },
    addHomecenter: {
      type: Object
    }
  },
  data: {
    // 这里是一些组件内部数据
    deviceList: '',
    translate: '',
    clname: false, //以上侧边栏效果变量
    boxName: app.globalData.boxName, //这个是展示到导航上面的使用的box名字
    add_homecenter: app.globalData.addHomecenterMsg, //用户请求添加消息或者被邀请添加家庭中心
    nickname: app.globalData.userInfo, //昵称
    onLines: 'false',
    loadingshow: false
  },
  methods: {
    // 判断是否有新设备
    isnewDevice: function(srg) {
      for (let item of srg) {
        if (item.isNew == true && item.Available == true) {
          return true;
        }
      }
    },
    bindAreaNameChange: function(e) {
      // let that = this
      console.log(e);
      // that.setData({
      //   changeAreaname:true,
      //   areauuid: e.currentTarget.dataset.areauuid
      // })
    },
    bindAreanameInput: function(e) {
      let that = this;
      var substring = e.detail.value;
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
      that.setData({
        newAreaname: substring
      });
    },
    bindAreanameConfirm: function() {
      let that = this;
      let topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
      let username_ = app.globalData.username_; //全局用户名
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: topicPub,
        req: mqttclient.buildConfigEntityInfoRequest(
          username_,
          that.data.areauuid,
          that.data.areauuid,
          that.data.newAreaname
        ),
        error: function(req, res) {
          console.log('got error', req, res);
        },
        success: function(req, res) {
          console.log(res);
          console.log(req);
          if (req.ConfigEntityInfo) {
            that.setData({
              changeAreaname: false
            });
          }
        }
      });
    },
    bindAreanameCancel: function() {
      let that = this;
      that.setData({
        changeAreaname: false
      });
    },
    // deviceloading: function () {
    //   let that = this
    //   console.log(that)
    //   that.triggerEvent('deviceloading', true);
    // },
    // 点击打开侧边栏
    tap_ch: function() {
      var that = this;
      console.log(that.data.open);
      console.log(HomeCenterManager.getAllHomeCenters());
      if (that.data.open == true) {
        that.setData({
          clname: false,
          open: false
        });
      } else if (that.data.open == false) {
        that.setData({
          clname: true,
          open: true
        });
      }
      that.triggerEvent('sidebar', that.data.open);
    },
    // 判断设备页面是否没有设备
    isnoDevice: function(deviceList) {
      // let that = this
      for (let item of deviceList) {
        if (item.areaDevices.length > 0) {
          return true;
        }
      }
    },

    // 跳转页面到详情页
    details: function(e) {
      console.log(e)
      wx.navigateTo({
        url:
          '../details/details?parentuuid=' +
          e.currentTarget.dataset.detailim +
          '&uuid=' +
          e.currentTarget.dataset.uuid
      });
    },
    // btn改变
    switchtap: function(e) {
      console.log(e);
      var that = this;
      var uuidValue = e.currentTarget.dataset.uuid; //当前设备uuid
      var profileValue = e.currentTarget.dataset.profile; //设备类型
      var topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
      var username_ = app.globalData.username_; //全局用户名
      let areaindex = e.currentTarget.dataset.area;
      let deviceindex = e.currentTarget.dataset.device;
      that.data.deviceList[areaindex].areaDevices[deviceindex].device.load = true;
      that.setData({
        deviceList: that.data.deviceList
      });
      if (profileValue == 1 || profileValue == 2) {
        mqttclient.sendRequest({
          client: app.getClient(),
          topic: topicPub,
          req: mqttclient.buildOnOffRequest(username_, uuidValue, 2),
          error: function(req, res) {
            console.log('got error', req, res);
          }
        });
        //如果是门磁或者开关
      } else if (profileValue == 3 || profileValue == 0) {
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
          success: function(req) {
            console.log(req);
          },
          error: function(req, res) {
            console.log('got error', req, res);
          }
        });
      } else if (profileValue == 5) {
        let levelValue; //切换level的值
        if (e.currentTarget.dataset.switchenable == true) {
          levelValue = 100;
        } else {
          levelValue = 0;
        }
        mqttclient.sendRequest({
          client: app.getClient(),
          topic: topicPub,
          req: mqttclient.buildControlWindowCoveringRequest(username_, uuidValue, levelValue),
          error: function(req, res) {
            console.log(req, res);
          }
        });
      }
    },
    // 进入添加设备页面
    addDevicePage: function() {
      wx.navigateTo({
        url: '../addDevice/addDevice'
      });
    },
    goInvitation: function(e) {
      var demand = e.currentTarget.dataset.deviceuuid;
      var str = JSON.stringify(demand);
      wx.navigateTo({
        url: '../invitation/invitation?deviceuuid=' + str
      });
    }
  }
});
