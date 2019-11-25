/** @format */
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
Component({
  properties: {
    innerText: {
      type: Object,
      observer: function() {
        this.setData({
          getmsg: true
        });
        let that = this
        console.log(this.data, 'get all homecenter data to view');
        console.log(HomeCenterManager.homeCenterCacheMap, 'get all map data to view');
        for (let rosterValues of HomeCenterManager.homeCenterCacheMap.values()){
          let deviceValues = {}
          deviceValues.device = rosterValues
          var entities = rosterValues.entities
          console.log(entities, 'get all device no matter physic or logic device');
          if(entities == undefined){
            continue
          }
          var firmware = [];
          for (var uiFirmware of entities.values()) {
            if (uiFirmware.getEntityType() == Const.EntityType.FIRMWARE) {
              var uiFirmwares = {};
              uiFirmwares.uiFirmware = uiFirmware;
              firmware.push(uiFirmwares);
            }
          }
          console.log(firmware,'get all firmware infomation');
          // 相同类型的升级包放入相同数组里
          var GW = [],
            LS = [],
            PP = [],
            DC = [],
            SP = [],
            WSS1 = [],
            WSS2 = [],
            WSS3 = [],
            WSS4 = [],
            WSD1 = [],
            WSD2 = [],
            WSD3 = [],
            WSD4 = [],
            CM = [],
            SM = [],
            HZG = [];
          if (firmware) {
            for (var q = 0; q < firmware.length; q++) {
              if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.GATEWAY) {
                //网关
                let nums = firmware[q].uiFirmware.Version.toString();
                let one = Number(nums.substr(0, 1));
                let two = Number(nums.substr(1, 2));
                let three = Number(nums.substr(3, 2));
                let ver = one + '.' + two + '.' + three;
                firmware[q].uiFirmware.version = ver;
                GW.push(firmware[q]);
              } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.LIGHT_SOCKET) {
                //灯座
                LS.push(firmware[q]);
              } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WIRELESS_SWITCH) {
                //开关
                PP.push(firmware[q]);
              } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.DOOR_SENSOR) {
                //门磁

                DC.push(firmware[q]);
              } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.SMART_PLUG) {
                //插座
                SP.push(firmware[q]);
              } else if (that.iswallSwitch(firmware[q].uiFirmware.ImageModel) == true) {
                //墙壁开关
                if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_S1) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSS1.push(firmware[q]);
                } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_S2) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSS2.push(firmware[q]);
                } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_S3) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSS3.push(firmware[q]);
                } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_S4) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSS4.push(firmware[q]);
                } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_D1) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSD1.push(firmware[q]);
                } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_D2) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSD2.push(firmware[q]);
                } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_D3) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSD3.push(firmware[q]);
                } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.WALL_SWITCH_D4) {
                  firmware[q].uiFirmware.types = 'ws';
                  WSD4.push(firmware[q]);
                }
              } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.CURTAIN) {
                //窗帘
                CM.push(firmware[q]);
              } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.SWITCH_MODULE) {
                //开关模块
                SM.push(firmware[q]);
              } else if (firmware[q].uiFirmware.ImageModel == Const.DeviceModel.HA_ZHH_GATEWAY) {
                //空调网关
                HZG.push(firmware[q]);
              }
            }
          }
          // 五个升级包数组排序
          if (GW.length > 1) {
            GW.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            GW.reverse();
          }
          if (LS.length > 1) {
            LS.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            LS.reverse();
          }
          if (DC.length > 1) {
            DC.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            DC.reverse();
          }
          if (SP.length > 1) {
            SP.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            SP.reverse();
          }
          if (PP.length > 1) {
            PP.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            PP.reverse();
          }
          if (WSS1.length > 1) {
            WSS1.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSS1.reverse();
          }
          if (WSS2.length > 1) {
            WSS2.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSS2.reverse();
          }
          if (WSS3.length > 1) {
            WSS3.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSS3.reverse();
          }
          if (WSS4.length > 1) {
            WSS4.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSS4.reverse();
          }
          if (WSD1.length > 1) {
            WSD1.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSD1.reverse();
          }
          if (WSD2.length > 1) {
            WSD2.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSD2.reverse();
          }
          if (WSD3.length > 1) {
            WSD3.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSD3.reverse();
          }
          if (WSD4.length > 1) {
            WSD4.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            WSD4.reverse();
          }
          if (CM.length > 1) {
            CM.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            CM.reverse();
          }
          if (SM.length > 1) {
            SM.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            SM.reverse();
          }
          if (HZG.length > 1) {
            HZG.sort(function (x, y) {
              return x.uiFirmware.Version > y.uiFirmware.Version ? 1 : -1;
            });
            HZG.reverse();
          }

          var firmwaredeviceBefore = [];
          for (var isnewDevice of entities.values()) {
            if (isnewDevice.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
              if (isnewDevice.Available) {
                //isnewDevice.isNew == false &&
                var fwDevices = {};
                fwDevices.fwDevice = isnewDevice;
                firmwaredeviceBefore.push(fwDevices);
              }
            }
          }
          console.log(that.data, 'get data info in another time');
          var firmwareItem = [];
          var firmwareDevice = [];
          for (var physicDevice of firmwaredeviceBefore) {
            if (
              GW.length > 0 &&
              GW[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              GW[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(GW[0]);
              let nums = physicDevice.fwDevice.version.toString();
              let one = Number(nums.substr(0, 1));
              let two = Number(nums.substr(1, 2));
              let three = Number(nums.substr(3, 2));
              let ver = one + '.' + two + '.' + three;
              physicDevice.uiVersion = ver;
              // physicDevice.name = HomeCenterManager.getHomeCenter(that.data.boxDetail.uuid).name;

              firmwareDevice.push(physicDevice);
            }
            if (
              LS.length > 0 &&
              LS[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              LS[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(LS[0]);
              firmwareDevice.push(physicDevice);
            }
            if (
              PP.length > 0 &&
              PP[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              PP[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(PP[0]);
              firmwareDevice.push(physicDevice);
            }
            if (
              SP.length > 0 &&
              SP[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              SP[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(SP[0]);
              firmwareDevice.push(physicDevice);
            }
            if (
              DC.length > 0 &&
              DC[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              DC[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(DC[0]);
              firmwareDevice.push(physicDevice);
            }
            if (WSS1.length > 0) {
              for (let ws of WSS1) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (WSS2.length > 0) {
              for (let ws of WSS2) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (WSS3.length > 0) {
              for (let ws of WSS3) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (WSS4.length > 0) {
              for (let ws of WSS4) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (WSD1.length > 0) {
              for (let ws of WSD1) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (WSD2.length > 0) {
              for (let ws of WSD2) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (WSD3.length > 0) {
              for (let ws of WSD3) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (WSD4.length > 0) {
              for (let ws of WSD4) {
                if (
                  ws.uiFirmware.Version > physicDevice.fwDevice.version &&
                  ws.uiFirmware.ImageModel == physicDevice.fwDevice.model
                ) {
                  firmwareItem.push(ws);
                  firmwareDevice.push(physicDevice);
                }
              }
            }
            if (
              CM.length > 0 &&
              CM[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              CM[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(CM[0]);
              firmwareDevice.push(physicDevice);
            }
            if (
              SM.length > 0 &&
              SM[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              SM[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(SM[0]);
              firmwareDevice.push(physicDevice);
            }
            if (
              HZG.length > 0 &&
              HZG[0].uiFirmware.Version > physicDevice.fwDevice.version &&
              HZG[0].uiFirmware.ImageModel == physicDevice.fwDevice.model
            ) {
              firmwareItem.push(HZG[0]);
              firmwareDevice.push(physicDevice);
            }
          }
          // 拿到升级包去重
          var hash = {};
          firmwareItem = firmwareItem.reduce(function (item, next) {
            if (!hash[next.uiFirmware.uuid]) {
              hash[next.uiFirmware.uuid] = true;
              item.push(next);
            }
            // hash[next.uiFirmware.uuid] ? '' : hash[next.uiFirmware.uuid] = true && item.push(next)
            return item;
          }, []);
          firmwareDevice = firmwareDevice.reduce(function (item, next) {
            if (!hash[next.fwDevice.uuid]) {
              hash[next.fwDevice.uuid] = true;
              item.push(next);
            }
            // hash[next.fwDevice.uuid] ? '' : hash[next.fwDevice.uuid] = true && item.push(next)
            return item;
          }, []);
          // 为每一个升级包添加一个村设备的数组
          for (var t = 0; t < firmwareItem.length; t++) {
            firmwareItem[t].firmwaredevices = [];
          }
          //  将对应的设备放到对应的升级包里
          for (var m = 0; m < firmwareDevice.length; m++) {
            for (var h = 0; h < firmwareItem.length; h++) {
              if (firmwareDevice[m].fwDevice.model == firmwareItem[h].uiFirmware.ImageModel) {
                firmwareDevice[m].Uuid = firmwareDevice[m].fwDevice.uuid.substring(20, 12);
                firmwareItem[h].firmwaredevices.push(firmwareDevice[m]);
              }
            }
          }
          if (firmwareItem && firmwareItem.length > 0) {
            for(let roster of that.data.innerText){
              if (roster.uuid == deviceValues.device.uuid){
                roster.EntityFirmware = true
                that.setData({
                  innerText:that.data.innerText
                })
              }
            }
            
          }
        } 
      }
    },
    userBox: {
      type: Object
    },
    boxStatus: {
      type: String,
      value: '添加'
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {},
    getmsg: false,
    comBoxID: 'why',
    catalogSelect: 0 //判断是否选中
  },
  methods: {
    // 这里是一个自定义方法
    customMethod: function() {},
    _boxSelect: function(e) {
      console.log(e, 'get the incoming infomation');
      var that = this;
      that.triggerEvent('myevent', e.currentTarget.dataset.boxid);
    },
    goInvitation: function(e) {
      console.log(e, 'get the incoming infomation');
      var demand = e.currentTarget.dataset.deviceuuid;
      var str = JSON.stringify(demand);
      wx.navigateTo({
        url: '../invitation/invitation?deviceuuid=' + str
      });
    },
    // 判断是否是窗帘
    iswallSwitch: function (phy) {
      if (
        phy == Const.DeviceModel.WALL_SWITCH_S1 ||
        phy == Const.DeviceModel.WALL_SWITCH_S2 ||
        phy == Const.DeviceModel.WALL_SWITCH_S3 ||
        phy == Const.DeviceModel.WALL_SWITCH_S4 ||
        phy == Const.DeviceModel.WALL_SWITCH_D1 ||
        phy == Const.DeviceModel.WALL_SWITCH_D2 ||
        phy == Const.DeviceModel.WALL_SWITCH_D3 ||
        phy == Const.DeviceModel.WALL_SWITCH_D4
      ) {
        return true;
      }
    },
  }
});
