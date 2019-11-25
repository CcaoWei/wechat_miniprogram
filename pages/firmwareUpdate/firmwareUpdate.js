/** @format */

// pages/firmwareUpdate/firmwareUpdate.js
var app = getApp();
var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
var count, boxcount;
// var gwok//网关的变量
// var deviceok = []

Page({
      /**
       * 页面的初始数据
       */
      data: {
        boxuuid: '', //存储box的uuid
        firmwareAll: '',
        Percents: '', //显示完成百分比
        noneUpdata: false,
      },
      getEntityResult: function() {},
      onMqttMsg: function(msg_) {
        var that = this;
        // 设备升级
        
        if (msg_.FirmwareUpgradeStatusChanged != undefined && msg_.FirmwareUpgradeStatusChanged != null) {
          console.log(msg_, '固件升级页面固件信息');
          if (msg_.FirmwareUpgradeStatusChanged.Status == 1) {
            //正在升级
            for (let q = 0; q < that.data.firmwareAll.length; q++) {
              if (msg_.FirmwareUpgradeStatusChanged.FirmwareUUID == that.data.firmwareAll[q].uiFirmware.uuid) {
                for (let w = 0; w < that.data.firmwareAll[q].firmwaredevices.length; w++) {
                  if (
                    msg_.FirmwareUpgradeStatusChanged.DeviceUUID ==
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.uuid
                  ) {
                    if (that.data.firmwareAll[q].firmwaredevices.length < 1) {
                      that.setData({
                        noneUpdata: true
                      });
                    }
                    // else{
                    //   that.setData({
                    //     noneUpdata: false
                    //   })
                    // }
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.updata = true;
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.okUpdata = false;
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.stopUpdata = false;
                    var Percent = msg_.FirmwareUpgradeStatusChanged.Percent;
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.Percent = Percent + '%';
                    // 页面渲染完成
                    let canvasArc = 'canvasArc' + q + w;
                    console.log(canvasArc);
                    let cxt_arc = wx.createCanvasContext(canvasArc); //创建并返回绘图上下文context对象。
                    cxt_arc.setLineWidth(1.7);
                    cxt_arc.setStrokeStyle('#8fd4fb');
                    cxt_arc.setLineCap('round');
                    cxt_arc.beginPath(); //开始一个新的路径
                    cxt_arc.arc(14.3, 14, 11.5, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * Percent);
                    cxt_arc.stroke(); //对当前路径进行描边
                    cxt_arc.draw();
                    that.setData({
                      firmwareAll: that.data.firmwareAll
                    });
                    console.log(that.data.firmwareAll);
                    if (Percent == 100) {
                      that.data.firmwareAll[q].firmwaredevices[w].fwDevice.okUpdata = true;
                      that.data.firmwareAll[q].firmwaredevices[w].fwDevice.stopUpdata = false;
                      that.data.firmwareAll[q].firmwaredevices[w].fwDevice.updata = false;
                      // that.data.firmwareAll[q].firmwaredevices.splice(w, 1)
                      // deviceok.push(that.data.firmwareAll[q].firmwaredevices[w])
                      // console.log(deviceok)
                      // console.log(that.data.firmwareAll)

                      that.setData({
                        firmwareAll: that.data.firmwareAll
                      });
                    }
                  }
                }
              }
            }
          } else if (msg_.FirmwareUpgradeStatusChanged.Status == 3) {
            //停止升级
            for (let q = 0; q < that.data.firmwareAll.length; q++) {
              if (msg_.FirmwareUpgradeStatusChanged.FirmwareUUID == that.data.firmwareAll[q].uiFirmware.uuid) {
                for (let w = 0; w < that.data.firmwareAll[q].firmwaredevices.length; w++) {
                  if (
                    msg_.FirmwareUpgradeStatusChanged.DeviceUUID ==
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.uuid
                  ) {
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.stopUpdata = true;
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.updata = false;
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.okUpdata = false;
                    that.setData({
                      firmwareAll: that.data.firmwareAll
                    });
                  }
                }
              }
            }
          } else if (msg_.FirmwareUpgradeStatusChanged.Status == 2) {
            for (let q = 0; q < that.data.firmwareAll.length; q++) {
              if (msg_.FirmwareUpgradeStatusChanged.FirmwareUUID == that.data.firmwareAll[q].uiFirmware.uuid) {
                for (var w = 0; w < that.data.firmwareAll[q].firmwaredevices.length; w++) {
                  if (
                    msg_.FirmwareUpgradeStatusChanged.DeviceUUID ==
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.uuid
                  ) {
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.okUpdata = true;
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.stopUpdata = false;
                    that.data.firmwareAll[q].firmwaredevices[w].fwDevice.updata = false;
                    that.setData({
                      firmwareAll: that.data.firmwareAll
                    });
                    console.log(that.data.firmwareAll);
                  }
                }
              }
            }
            that.setData({
              firmwareAll: that.data.firmwareAll
            });
          }
        }
        //box升级
        if (msg_.Presence != undefined && msg_.Presence != null) {
          for (var r = 0; r < that.data.firmwareAll.length; r++) {
            for (var t = 0; t < that.data.firmwareAll[r].firmwaredevices.length; t++) {
              if (msg_.Presence.Username == that.data.firmwareAll[r].firmwaredevices[t].fwDevice.uuid) {
                var rr = r;
                var tt = t;
                if (msg_.Presence.Online == false) {
                  // wx.setStorageSync('updata', that.data.firmwareAll[r].firmwaredevices[t].fwDevice.uuid);
                  //设备离线了在升级
                  that.data.firmwareAll[r].firmwaredevices[t].fwDevice.updata = true;
                  that.setData({
                    firmwareAll: that.data.firmwareAll,
                    noneUpdata: true
                  });
                  var num = 0;
                  boxcount = setInterval(function() {
                    
                    num++;
                    var canvasbox = 'canvasArc' + rr + tt;
                    var cxt_arcbox = wx.createCanvasContext(canvasbox); //创建并返回绘图上下文context对象。
                    cxt_arcbox.setLineWidth(1.7);
                    cxt_arcbox.setStrokeStyle('#8fd4fb');
                    cxt_arcbox.setLineCap('round');
                    cxt_arcbox.beginPath(); //开始一个新的路径
                    cxt_arcbox.arc(14.3, 14, 11.5, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * num);
                    cxt_arcbox.stroke(); //对当前路径进行描边
                    cxt_arcbox.draw();
                    that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.Percent = num + '%';
                    that.setData({
                      firmwareAll: that.data.firmwareAll
                    });
                    if (num == 99) {
                      console.log("num");
                      console.log(num);
                      clearInterval(boxcount);
                    }
                  }, 1000);
                  
                }
                // if (
                //   msg_.Presence.Online == true) {
                //   console.log("?!@!@")
                //   clearInterval(boxcount);
                //   wx.removeStorageSync('updata');
                //   that.setData({
                //     boxupdata: false
                //   });
                //   // 升级成功
                //   that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.okUpdata = true;
                //   that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.Percent = 100 + '%';
                //   that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.stopUpdata = false;
                //   that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.updata = false;
                //   that.setData({
                //     firmwareAll: that.data.firmwareAll
                //   });
                // }
                if (
                  msg_.Presence.Online == true && wx.getStorageSync("updata")) {
                  clearInterval(boxcount);
                  // wx.removeStorageSync('updata');
                  // that.setData({
                  //   boxupdata: false
                  // });
                  // 升级成功
                  that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.okUpdata = true;
                  that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.Percent = 100 + '%';
                  that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.stopUpdata = false;
                  that.data.firmwareAll[rr].firmwaredevices[tt].fwDevice.updata = false;
                  that.setData({
                    firmwareAll: that.data.firmwareAll
                  });
                }
              }
            }
          }
        }
      },
      //查看新功能
      lookMetergasis: function(e) {
        let that = this;
        console.log(e)
        let model = e.currentTarget.dataset.model
        if (model == Const.DeviceModel.GATEWAY) {
          let version = e.currentTarget.dataset.version.replace(/\./ig, "-");
          console.log(version)
          let gwUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/home_center_release_history/#v' + version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + gwUrl,
          })
        } else if (model == Const.DeviceModel.LIGHT_SOCKET) {
          let socketUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/light_socket_release_history/#v' + e.currentTarget.dataset.version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + socketUrl,
          })
        } else if (model == Const.DeviceModel.SMART_PLUG) {
          let plugUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/smart_plug_release_history/#v' + e.currentTarget.dataset.version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + plugUrl,
          })
        } else if (model == Const.DeviceModel.WIRELESS_SWITCH) {
          let pirUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/awareness_switch_release_history/#v' + e.currentTarget.dataset.version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + pirUrl,
          })
        } else if (model == Const.DeviceModel.DOOR_SENSOR) {
          let sensorUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/door_sensor_release_history/#v' + e.currentTarget.dataset.version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + sensorUrl,
          })
        } else if (model == Const.DeviceModel.CURTAIN) {
          let curtainUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/curtain_motor_release_history/#v' + e.currentTarget.dataset.version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + curtainUrl,
          })
        } else if (model == Const.DeviceModel.WALL_SWITCH_S1 || model == Const.DeviceModel.WALL_SWITCH_S2 || model == Const.DeviceModel.WALL_SWITCH_S3 || model == Const.DeviceModel.WALL_SWITCH_S4) {
          console.log("ssss");
          let wssUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/wall_switch_sx_release_history/#v' + e.currentTarget.dataset.version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + wssUrl,
          })
        } else if (model == Const.DeviceModel.WALL_SWITCH_D1 || model == Const.DeviceModel.WALL_SWITCH_D2 || model == Const.DeviceModel.WALL_SWITCH_D3 || model == Const.DeviceModel.WALL_SWITCH_D4) {
          console.log("dddd");
          let wsdUrl = 'https://www.xiaoyan.io/zh-cn/blog/posts/wall_switch_dx_release_history/#v' + e.currentTarget.dataset.version;
          wx.navigateTo({
            url: '../interlinkage/interlinkage?url=' + wsdUrl,
          })
        }
      },
      onLoad: function(options) {
        console.log(options);
        var that = this;
        that.setData({
          boxuuid: options.boxuuid
        });
      },
      // 判断是否是窗帘
      iswallSwitch: function(phy) {
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
      // 选中
      isSelect: function(e) {
        console.log(e);
        var that = this;
        if (
          that.data.firmwareAll[e.currentTarget.dataset.in].firmwaredevices[e.currentTarget.dataset.index]
          .fwDevice.select &&
          that.data.firmwareAll[e.currentTarget.dataset.in].firmwaredevices[e.currentTarget.dataset.index]
          .fwDevice.select == true
        ) {
          that.data.firmwareAll[e.currentTarget.dataset.in].firmwaredevices[
            e.currentTarget.dataset.index
          ].fwDevice.select = false;
        } else {
          that.data.firmwareAll[e.currentTarget.dataset.in].firmwaredevices[
            e.currentTarget.dataset.index
          ].fwDevice.select = true;
        }
        that.setData({
          firmwareAll: that.data.firmwareAll
        });
        console.log(that.data.firmwareAll);
      },
      updataFirmware: function(e) {
        console.log(e);
        var that = this;
        var topicPub = 'message/' + that.data.boxuuid;
        var username_ = app.globalData.username_; //全局用户名
        var num = e.currentTarget.dataset.in;
        console.log(that.data.firmwareAll[num]);
        for (var u = 0; u < that.data.firmwareAll[num].firmwaredevices.length; u++) {
          if (that.data.firmwareAll[num].firmwaredevices[u].fwDevice.select == true && that.data.firmwareAll[num].firmwaredevices[u].fwDevice.okUpdata != true) {
            that.data.firmwareAll[num].firmwaredevices[u].fwDevice.updata = true;
            that.data.firmwareAll[num].firmwaredevices[u].fwDevice.stopUpdata = false;
            that.data.firmwareAll[num].firmwaredevices[u].fwDevice.okUpdata = false;
            that.data.firmwareAll[num].firmwaredevices[u].fwDevice.Percent = '0%';
            that.setData({
              firmwareAll: that.data.firmwareAll
            });
            console.log(
              mqttclient.buildFirmwareUpgradeRequest(
                username_,
                that.data.firmwareAll[num].uiFirmware.uuid,
                that.data.firmwareAll[num].firmwaredevices[u].fwDevice.uuid
              )
            );
            mqttclient.sendRequest({
              client: app.getClient(),
              topic: topicPub,
              req: mqttclient.buildFirmwareUpgradeRequest(
                username_,
                that.data.firmwareAll[num].uiFirmware.uuid,
                that.data.firmwareAll[num].firmwaredevices[u].fwDevice.uuid
              ),
              success: function(req) {
                console.log(req);
              },
              error: function(req, res) {
                console.log('got error', req, res);
              }
            });
          }
        }
      },
      allUpdeta: function() {
        var that = this;
        console.log(that.data.firmwareAll);
        var topicPub = 'message/' + that.data.boxuuid;
        var username_ = app.globalData.username_; //全局用户名
        for (var n = 0; n < that.data.firmwareAll.length; n++) {
          for (var u = 0; u < that.data.firmwareAll[n].firmwaredevices.length; u++) {
            if (that.data.firmwareAll[n].firmwaredevices[u].fwDevice.okUpdata != true) {
              that.data.firmwareAll[n].firmwaredevices[u].fwDevice.select = true;
              that.data.firmwareAll[n].firmwaredevices[u].fwDevice.updata = true;
              that.data.firmwareAll[n].firmwaredevices[u].fwDevice.Percent = '0%';
              that.setData({
                firmwareAll: that.data.firmwareAll
              });
              mqttclient.sendRequest({
                client: app.getClient(),
                topic: topicPub,
                req: mqttclient.buildFirmwareUpgradeRequest(
                  username_,
                  that.data.firmwareAll[n].uiFirmware.uuid,
                  that.data.firmwareAll[n].firmwaredevices[u].fwDevice.uuid
                ),
                success: function(req) {
                  console.log(req);
                },
                error: function(req, res) {
                  console.log('got error', req, res);
                }
              });
            }

            // }
          }
        }
      },
  onShow: function () {
    var that = this;
    var entities = HomeCenterManager.getHomeCenterCache(that.data.boxuuid).entities;
    console.log(entities, '查看 entities 内容');
    var firmware = [];
    for (var uiFirmware of entities.values()) {
      if (uiFirmware.getEntityType() == Const.EntityType.FIRMWARE) {
        var uiFirmwares = {};
        uiFirmwares.uiFirmware = uiFirmware;
        firmware.push(uiFirmwares);
      }
    }
   console.log(firmware, '把所有类型是 FIRMWARE 的设备保存起来');
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
        physicDevice.name = HomeCenterManager.getHomeCenter(that.data.boxuuid).name;

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
      // }
      that.setData({
        firmwareAll: firmwareItem
      });
    }
    if (that.data.firmwareAll && that.data.firmwareAll.length > 0) {
      that.setData({
        EntityFirmware: true
      });
      console.log(that.data.firmwareAll, '查看所有的固件升级信息');
    }
  },
      
        onHide: function() {
            clearInterval(count);
            clearInterval(boxcount);
          },
          onUnload: function() {
            clearInterval(count);
            clearInterval(boxcount);
          },
      })