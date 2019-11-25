/** @format */
var app = getApp();
var mqttclient = require('../../utils/mqttclient');
var feedbackApi = require('../../utils/showToast.js');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    boxDetail: '', //box消息
    EntityFirmware: false, // 是否可以升级
    firmwareAll: '',
    newhomecenter: '加载中'
  },
  getEntityResult: function() {},
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
  // 分享该家庭中心
  shareHomecenter: function() {},
  // 改变背景色的动画
  bgColor: function() {
    var animation = wx.createAnimation({
      transformOrigin: '0% 0%',
      duration: 1000,
      timingFunction: 'ease'
    });
    this.animation = animation;
  },
  // 删除家庭中心
  delectRoster: function(e) {
    console.log(e);
    wx.showModal({
      title: '删除该家庭中心',
      content: '是否确定删除该家庭中心？',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.request({
            method: 'post',
            url: app.globalData.xyurl + '/devices/' + e.currentTarget.dataset.boxuuid + '/association',
            data: {
              action: 'remove',
              user: app.globalData.username_,
              user_display_name: wx.getStorageSync('nickname'), //我的昵称
              by: app.globalData.username_,
              by_display_name: wx.getStorageSync('nickname'), //我的昵称
              device_name: e.currentTarget.dataset.boxuuid //box名称
            },
            header: {
              Authorization: 'Bearer ' + app.globalData.token_
            },
            success: function(msg_) {
              console.log(msg_);
              console.log('删除成功');
              wx.showToast({
                title: '删除成功'
              });
              console.log(HomeCenterManager);
              if (HomeCenterManager.getAllHomeCenters().length == 0) {
                wx.removeStorageSync('setDefaultHomeCenter');
                wx.reLaunch({
                  url: '../addRoster/addRoster'
                });
                return;
              }
              if (
                e.currentTarget.dataset.boxuuid == wx.getStorageSync('setDefaultHomeCenter') &&
                HomeCenterManager.getAllHomeCenters().length != 0
              ) {
                for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
                  if (homecenter.online == true && homecenter.types == Const.AssociationState.ASSOCIATED) {
                    wx.setStorageSync('setDefaultHomeCenter', homecenter.uuid);
                    HomeCenterManager.setDefaultHomeCenter(homecenter.uuid);
                    wx.navigateBack({
                      delta: 1
                    });
                    return;
                  } else if (
                    homecenter.online == false &&
                    homecenter.types == Const.AssociationState.ASSOCIATED
                  ) {
                    wx.setStorageSync('setDefaultHomeCenter', homecenter.uuid);
                    wx.navigateBack({
                      delta: 1
                    });
                    return;
                  } else if (
                    homecenter.online == undefined &&
                    homecenter.types == Const.AssociationState.SHARED
                  ) {
                    wx.setStorageSync('setDefaultHomeCenter', homecenter.uuid);
                    wx.reLaunch({
                      url: '../addRoster/addRoster'
                    });
                  }
                }
              } else {
                wx.navigateBack({
                  delta: 1
                });
              }
            },
            fail: function(msg_) {
              console.log(msg_);
              console.log('删除失败');
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },
  adding: function() {
    let that = this;
    feedbackApi.showToast({
      title: '请求已发送,请稍后'
    });
    wx.request({
      method: 'post',
      url: app.globalData.xyurl + '/devices/' + that.data.boxuuid + '/association',
      data: {
        action: 'request',
        user: app.globalData.username_,
        user_display_name: wx.getStorageSync('nickname'), //我的昵称
        by: app.globalData.username_,
        by_display_name: wx.getStorageSync('nickname'), //我的昵称
        device_name: that.data.boxname //box名称
      },
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function(msg_) {
        console.log(msg_);
        that.setData({
          newhomecenter: '取消添加'
        });
        // console.log('二维码请求成功');
        // console.log(HomeCenterManager.getAllHomeCenters()[0].online);
        // if (HomeCenterManager.getAllHomeCenters().length > 1) {
        //   for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
        //     if (
        //       homecenter.types == Const.AssociationState.ASSOCIATED &&
        //       homecenter.online == true
        //     ) {
        //       wx.navigateBack({
        //         delta: 2
        //       });
        //       return;
        //     }
        //   }
        //   wx.navigateBack({
        //     delta: 1
        //   });
        // } else {
        //   wx.redirectTo({
        //     url: '../boxDetail/boxDetail?boxuuid=' + that.data.device_ider
        //   });
        // }
      },
      fail: function(msg_) {
        console.log(msg_);
      }
    });
  },
  // 无升级设备时候的提示
  testToast: function() {
    feedbackApi.showToast({
      title: '暂无可升级设备'
    }); //调用
  },

  onMqttMsg: function(msg_) {
    console.log(msg_);
    let that = this;
    if (
      msg_.DeviceAssociation != undefined &&
      msg_.DeviceAssociation != null &&
      msg_.DeviceAssociation.DeviceUUID == that.data.boxuuid
    ) {
      that.onShow();
      var user = msg_.DeviceAssociation.User;
      var by = msg_.DeviceAssociation.By;
      var action = msg_.DeviceAssociation.Action;
      var status = msg_.DeviceAssociation.Status;
      // var deviceUUID = msg_.DeviceAssociation.DeviceUUID
      var getUsername = app.globalData.username_;
      if (
        user == getUsername &&
        by !== getUsername &&
        action == Const.ActionType.APPROVE &&
        status == Const.SubscriptionType.BOTH
      ) {
        console.log("嘻嘻嘻我嘻嘻嘻哈哈哈哈哈哈哈")
        wx.reLaunch({
          url: '../index/index?types=main'
        });
        // wx.navigateBack({
        //   delta:2
        // })
        return;
      } else if (
        user == getUsername &&
        by != getUsername &&
        action == Const.ActionType.REJECT &&
        status == Const.SubscriptionType.UNKNOWN
      ) {
        feedbackApi.showToast({
          title: '被其他用户拒绝使用该网关'
        }); //调用
        that.setData({
          newhomecenter: '添加'
        });
      }
    }
    // if (
    //   msg_.GetEntityResult != undefined &&
    //   msg_.GetEntityResult != null &&
    //   msg_.Sender == that.data.boxuuid
    // ) {
    //   wx.reLaunch({
    //     url: '../index/index?types=main'
    //   });
    // }
    if (msg_.Presence != undefined && msg_.Presence != null && msg_.Sender == that.data.boxuuid) {
      wx.reLaunch({
        url: '../index/index?types=main'
      });
      // wx.navigateBack({
      //   delta: 2
      // })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log(options);
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo);
              //获取用户名字和头像
              wx.getUserInfo({
                success: function(res) {
                  console.log(res);
                  wx.setStorage({
                    key: 'nickname',
                    data: res.userInfo.nickName
                  });
                  wx.setStorage({
                    key: 'avatarUrl',
                    data: res.userInfo.avatarUrl
                  });
                }
              });
            }
          });
        } else {
          wx.navigateTo({
            url: '../accredit/accredit'
          });
        }
      }
    });
    if (options.types == 'share') {
      console.log(app.globalData.xyurl + '/devices/share/' + options.sharecode)
      wx.request({
        url: app.globalData.xyurl + '/devices/share/' + options.sharecode,
        method: "get",
        header: {
          Authorization: 'Bearer ' + app.globalData.token_
        },
        success: function (msg_) {
          console.log(msg_)
          if (msg_.statusCode == 200) {
            that.setData({
              boxuuid: msg_.data.device_id,
              newhomecenter: '添加',
              boxname: msg_.data.device_name
            });
            for (let roster of HomeCenterManager.getAllHomeCenters()) {
              if (roster.uuid == msg_.data.device_id) {
                if (roster.types == 2) {
                  that.setData({
                    boxuuid: msg_.data.device_id,
                    newhomecenter: '取消添加',
                    boxname: msg_.data.device_name
                  });
                } else if (roster.types == 3) {
                  that.setData({
                    boxDetail: roster
                  })
                }
              }
            }
            wx.setNavigationBarTitle({
              title: msg_.data.device_name
            });

          } else if (msg_.statusCode == 404) {
            feedbackApi.showToast({
              title: '分享地址错误或分享地址已过期'
            })
          } else if (msg_.statusCode == 401) {
            feedbackApi.showToast({
              title: '请先授权或登录'
            })
          }


        }
      })
    }
    if (options.type == 'add') {
      setTimeout(function() {
        console.log(HomeCenterManager.getAllHomeCenters());
        if (
          HomeCenterManager.getAllHomeCenters() == undefined ||
          HomeCenterManager.getAllHomeCenters() == ''
        ) {
          that.setData({
            boxuuid: options.boxuuid,
            boxname: options.boxname,
            newhomecenter: '添加'
          });
          wx.setNavigationBarTitle({
            title: options.boxname
          });
          return;
        }

        for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
          if (homecenter.uuid == options.boxuuid && homecenter.types == 2) {
            that.setData({
              newhomecenter: '取消添加',
              boxuuid: options.boxuuid,
              boxname: options.boxname
            });
            return;
          } else if (homecenter.uuid == options.boxuuid && homecenter.types == 3) {
            that.setData({
              boxDetail: HomeCenterManager.getHomeCenter(options.boxuuid)
            });
            wx.setNavigationBarTitle({
              title: that.data.boxDetail.name
            });
            return;
          }
          that.setData({
            newhomecenter: '添加',
            boxuuid: options.boxuuid,
            boxname: options.boxname
          });
          wx.setNavigationBarTitle({
            title: options.boxname
          });
        }
      }, 1000);
      return;
    }
    if (options.types == 2) {
      that.setData({
        newhomecenter: '取消添加',
        boxuuid: options.boxuuid,
        boxname: options.boxname
      });
      wx.setNavigationBarTitle({
        title: options.boxname
      });
      return;
    }
    that.setData({
      boxDetail: HomeCenterManager.getHomeCenter(options.boxuuid)
    });
    wx.setNavigationBarTitle({
      title: that.data.boxDetail.name
    });
  },
  cancelAdding: function() {
    let that = this;
    feedbackApi.showToast({
      title: '请求已发送,请稍后'
    });
    let boxusername = HomeCenterManager.getHomeCenter(that.data.boxuuid).name;
    wx.request({
      method: 'post',
      url: app.globalData.xyurl + '/devices/' + that.data.boxuuid + '/association',
      data: {
        action: 'cancel_request',
        user: app.globalData.username_,
        user_display_name: wx.getStorageSync('nickname'), //我的昵称
        by: app.globalData.username_,
        by_display_name: wx.getStorageSync('nickname'), //我的昵称
        device_name: boxusername //box名称
      },
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function() {
        that.setData({
          newhomecenter: '添加'
        });
        // HomeCenterManager.removeHomeCenter(that.data.boxuuid);
        // if (HomeCenterManager.getAllHomeCenters().length == 0) {
        //   wx.reLaunch({
        //     url: '../addRoster/addRoster'
        //   });
        //   return;
        // }
        // wx.navigateBack({
        //   delta: 1
        // });
      },
      fail: function(msg_) {
        console.log(msg_);
      }
    });
  },
  checkUpdata: function() {
    let that = this;
    console.log(that.data.boxDetail.uuid);
    var boxname = 'message/' + that.data.boxDetail.uuid;
    console.log(boxname);
    mqttclient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: mqttclient.buildCheckNewVersionRequest(app.globalData.username_),
      success: function(req) {
        console.log(req);
        feedbackApi.showToast({
          title: ' 发送检测成功'
        });
      },
      error: function(req, res) {
        console.log('got error', req, res);
      }
    });
    // mqttclient.sendRequest({
    //   client: app.getClient(),
    //   topic: boxname,
    //   req: mqttclient.buildSetUpgradePolicyRequest(app.globalData.username_, 'stable', 604800),
    //   success: function (req,res) {
    //     console.log(req);
    //     console.log(res);

    //   },
    //   error: function (req, res) {
    //     console.log('got error', req, res);
    //   }
    // });
  },
  onShow: function() {
    var that = this;
    console.log(that.data);
    if (HomeCenterManager.getHomeCenterCache(that.data.boxDetail.uuid) == undefined) {
      return;
    }
    if (HomeCenterManager.getHomeCenter(that.data.boxDetail.uuid).online != undefined) {
      that.setData({
        boxDetail: HomeCenterManager.getHomeCenter(that.data.boxDetail.uuid)
      });
      wx.setNavigationBarTitle({
        title: that.data.boxDetail.name
      });
    } else if (HomeCenterManager.getHomeCenter(that.data.boxDetail.uuid).online == undefined) {
      that.setData({
        boxDetail: ''
      });
    }
    if (HomeCenterManager.getHomeCenterCache(that.data.boxDetail.uuid).entities == undefined) {
      return;
    }
    var entities = HomeCenterManager.getHomeCenterCache(that.data.boxDetail.uuid).entities;
    var firmware = [];
    for (var uiFirmware of entities.values()) {
      if (uiFirmware.getEntityType() == Const.EntityType.FIRMWARE) {
        var uiFirmwares = {};
        uiFirmwares.uiFirmware = uiFirmware;
        firmware.push(uiFirmwares);
      }
    }
    // if (that.data.boxuuid == HomeCenterManager.getDefaultHomeCenterCache().uuid) {
    // console.log(firmware)
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
        physicDevice.name = HomeCenterManager.getHomeCenter(that.data.boxDetail.uuid).name;

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
    console.log();
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
    }
    that.setData({
      boxDetail: that.data.boxDetail
    });
    wx.request({
      url: app.globalData.xyurl + '/devices/' + that.data.boxDetail.uuid + '/share',
      method: "post",
      data: {
        "expiration": 259200
      },
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function (msg_) {
        console.log(msg_)
        that.setData({
          sharecode: msg_.data.share_code
        })


      }
    })
  },
  onShareAppMessage: function() {
    var that = this;
    console.log(that.data.boxDetail);
    // wx.request({
    //   url: app.globalData.xyurl + '/devices/' + that.data.boxDetail.uuid + '/share',
    //   method: "post",
    //   data: {
    //     "expiration": 1000
    //   },
    //   header: {
    //     Authorization: 'Bearer ' + app.globalData.token_
    //   },
    //   success: function (msg_) {
    //       console.log(msg_)
        
        
    //   }
    // })
    // setTimeout(function(){
      
    // },700)
    that.setData({
      webviewUrl:
        '/pages/index/index?types=share&boxuuid=' +
        that.data.boxDetail.uuid +'&sharecode='+that.data.sharecode
    });
    console.log("分享家庭中心唉唉唉")
    console.log(that.data.webviewUrl);
    return {
      title: '分享家庭中心',
      path: that.data.webviewUrl
    };
    
  }
});
