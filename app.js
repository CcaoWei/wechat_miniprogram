/** @format */

var mqtt = require('utils/paho-mqtt');
var mqtthandler = require('utils/mqtthandler');
var mqttclient = require('utils/mqttclient');
var HomeCenterManager = require('data/HomeCenterManager.js');
var HomeCenter = require('clazz/HomeCenter.js');
var Const = require('data/Const.js');
App({
  //message id 生成器
  guid: function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  },
  // 二进制转换
  ccc: function(num) {
    var transitionNum = num.toString(2);
    if (transitionNum.length == 1) {
      transitionNum = '0000000' + transitionNum;
      return transitionNum;
    } else if (transitionNum.length == 2) {
      transitionNum = '000000' + transitionNum;
      return transitionNum;
    } else if (transitionNum.length == 3) {
      transitionNum = '00000' + transitionNum;
      return transitionNum;
    } else if (transitionNum.length == 4) {
      transitionNum = '0000' + transitionNum;
      return transitionNum;
    } else if (transitionNum.length == 6) {
      return '00' + transitionNum;
    } else if (transitionNum.length > 6) {
      return transitionNum;
    }
  },
  // 是不是表情
  isEmojiCharacter: function(substring) {
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
  },
  detectionLeftpeople: function(substr) {
    //左边有没有事件
    var that = this;
    var str = that.ccc(substr); //10010001
    if (str == undefined){
      return
    }
    var str2 = str.split('').reverse().join(''); //10001001
    return str2.substr(5, 1);
  },
  detectionLeft: function(substr) {
    //左边有没有人
    var that = this;
    var str = that.ccc(substr); //10010001
    // str.toString()
    if (str == undefined) {
      return
    }
    var str2 = str
      .split('')
      .reverse()
      .join(''); //10001001

    return str2.substr(3, 1);
  },
  detectionRightpeople: function(substr) {
    //表示右边有事件
    var that = this;
    var str = that.ccc(substr); //10010001
    if (str == undefined) {
      return
    }
    // str.toString()
    var str2 = str
      .split('')
      .reverse()
      .join(''); //10001001
    return str2.substr(2, 1);
  },
  detectionRight: function(substr) {
    //表示右边有没有人
    var that = this;
    var str = that.ccc(substr);
    if (str == undefined) {
      return
    }
    var str2 = str
      .split('')
      .reverse()
      .join('');
    return str2.substr(0, 1);
  },
  // 调登录接口获取微信code
  getCode: function() {
    var p = new Promise(function(resolve) {
      wx.login({
        success: function(res) {
          var code = res.code;
          console.log(code);
          resolve({
            code
          });
        }
      });
    });
    return p;
  },

  // 随机获取一个小名字
  makeid: function() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 17; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  },

  getIv: function(res) {
    var code = res.code;
    var p = new Promise(function(resolve) {
      wx.getUserInfo({
        withCredentials: true,
        fail: function(res) {
          console.log(res);
        },
        success: function(res) {
          console.log(res);
          var ivandencryptedData = res.encryptedData + ':' + res.iv;
          resolve({
            code,
            ivandencryptedData
          });
        }
      });
    });
    return p;
  },

  // 匹配区域
  matching: function(res) {
    var areaArr = [
      'area-0000',
      'area-0001',
      'area-0002',
      'area-0003',
      'area-0004',
      'area-0005',
      'area-0006',
      'area-0007',
      'area-0008',
      'area-0009'
    ];
    var nameArr = ['未定义', '客厅', '主卧', '次卧', '餐厅', '厨房', '阳台', '书房', '玄关', '洗手间'];
    for (var q = 0; q < areaArr.length; q++) {
      if (res == areaArr[q]) {
        return nameArr[q];
      }
    }
  },

  // 创建用户
  creatUser: function(res) {
    var that = this;
    var code = res.code;
    var ivandencryptedData = res.ivandencryptedData;
    var Url = that.globalData.xyurl;
    var p = new Promise(function(resolve) {
      wx.request({
        method: 'post',
        url: Url + '/users',
        data: {
          id_type: 'wechat_miniprogram',
          id: res.ivandencryptedData,
          credential: res.code
        },
        success: function(res) {
          console.log(res);
          resolve({
            code,
            ivandencryptedData
          });
        },
        fail: function() {
          console.log('创建用户失败');
          resolve();
        }
      });
    });
    return p;
  },

  // 身份验证
  authentication: function(res) {
    console.log(res);
    var that = this;
    var Url = that.globalData.xyurl;
    var p = new Promise(function(resolve) {
      wx.request({
        method: 'post',
        url: Url + '/users/authenticate',
        data: {
          id_type: 'wechat_miniprogram',
          id: res.ivandencryptedData,
          credential: res.code,
          client_id: 'xy_wechat_mnlibuHGGttrtl'
        },

        success: function(msg) {
          console.log('服务器验证身份成功');
          var token_ = msg.data.access_token;
          var username_ = msg.data.username;
          var statusCode_ = msg.statusCode;
          console.log(msg);
          wx.setStorage({
            key: 'token_',
            data: token_
          });
          wx.setStorage({
            key: 'username_',
            data: username_
          });
          //   //将拿到的token缓存到本地
          //   wx.setStorageSync('token_', token_);
          // //   //将拿到的username_缓存到本地
          //   wx.setStorageSync('username_', username_);
          resolve({
            token_,
            username_,
            statusCode_
          });
        },
        fail: function(msg) {
          console.log(msg);
          console.log('服务器验证身份失败');
        }
      });
    });
    return p;
  },

  // 获取能用的家庭中心列表
  getHomecenter: function() {
    var that = this;
    wx.getStorageSync('token_');
    wx.getStorageSync('username_');
    var urls = that.globalData.xyurl + '/users/' + wx.getStorageSync('username_') + '/roster';
    var p = new Promise(function() {
      wx.request({
        url: urls,
        header: {
          Authorization: 'Bearer ' + wx.getStorageSync('token_')
        },
        success: function(msg) {
          console.log('获得家庭中心列表');
          console.log(msg);
          that.globalData.addHomecenterMsg = [];
          //测试代码
          for (var ii = 0; ii < msg.data.roster.length; ii++) {
            let homeCenter = new HomeCenter(
              msg.data.roster[ii].Username,
              msg.data.roster[ii].Nickname,
              undefined,
              undefined,
              undefined,
              msg.data.roster[ii].Type
            );
            HomeCenterManager.addHomeCenter(homeCenter);
          }
          //把可用box列表放到当前的roster里面去里面去
          that.globalData.deviceAll = {
            roster: msg.data.roster
          };
          console.log(that.globalData.deviceAll);
          if (that.globalData.deviceAll.roster) {
            if (that.globalData.deviceAll.roster.length > 0) {
              var selectedHomecenter = wx.getStorageSync('selectedHomecenter');
              if (selectedHomecenter && selectedHomecenter.length >= 0) {
                console.log('current selected home center is ' + selectedHomecenter);
                for (let i = 0; i < that.globalData.deviceAll.roster.length; i++) {
                  if (that.globalData.deviceAll.roster[i].Username == selectedHomecenter) {
                    console.log('set selected home center to ' + selectedHomecenter);
                    that.globalData.deviceAll.roster.splice(0, 0, that.globalData.deviceAll.roster[i]);
                    that.globalData.deviceAll.roster.splice(i + 1, 1);
                    break;
                  }
                }
              }
              that.globalData.boxName = that.globalData.deviceAll.roster[0].Username;
              for (let i = 0; i < that.globalData.deviceAll.roster.length; i++) {
                that.globalData.deviceAll.roster[i].version = '';
                if (
                  that.globalData.deviceAll.roster[i].Type == 3 &&
                  that.globalData.deviceAll.roster[i].Groups[0] == '__gateway__'
                ) {
                  //此时此刻订阅了我所能用的家庭中心
                  that.getClient().subscribe('event/' + msg.data.roster[i].Username, {
                    qos: Number(0)
                  });
                  var boxuuid = that.globalData.deviceAll.roster[i].Username;
                  var boxUrls = that.globalData.xyurl + '/users/' + boxuuid + '/roster';
                  wx.request({
                    url: boxUrls,
                    header: {
                      Authorization: 'Bearer ' + wx.getStorageSync('token_')
                    },
                    success: function(msg) {
                      console.log(msg);
                      console.log(that.globalData.addHomecenterMsg);
                      for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
                        if (homecenter.uuid == msg.data.username) {
                          homecenter.roster = msg.data.roster;
                        }
                      }
                      for (var y = 0; y < msg.data.roster.length; y++) {
                        if (msg.data.roster[y].Type == 1) {
                          if (that.globalData.addHomecenterMsg == '') {
                            let obj = {};
                            obj.ByDisplayName = msg.data.roster[y].Nickname;
                            let onetype = msg.data.username.replace(/-/gi, '');
                            let towtype = onetype.replace(/box/gi, '');
                            obj.DeviceName = towtype;
                            obj.DeviceUUID = msg.data.username;
                            obj.User = msg.data.roster[y].Username;
                            that.globalData.addHomecenterMsg.push(obj);
                            console.log(that.globalData.addHomecenterMsg);
                          } else if (that.globalData.addHomecenterMsg.length > 0) {
                            for (var s = 0; s < that.globalData.addHomecenterMsg.length; s++) {
                              if (
                                that.globalData.addHomecenterMsg[s].User == msg.data.roster[y].Username &&
                                that.globalData.addHomecenterMsg[s].DeviceUUID == msg.data.username
                              ) {
                                console.log('不需要处理');
                              } else {
                                let obj = {};
                                obj.ByDisplayName = msg.data.roster[y].Nickname;
                                let onetype = msg.data.username.replace(/-/gi, '');
                                let twotype = onetype.replace(/box/gi, '');
                                obj.DeviceName = twotype;
                                obj.DeviceUUID = msg.data.username;
                                obj.User = msg.data.roster[y].Username;
                                that.globalData.addHomecenterMsg.push(obj);
                                console.log(that.globalData.addHomecenterMsg);
                              }
                            }
                          }
                        }
                      }
                      var allArr = [];
                      for (var i = 0; i < that.globalData.addHomecenterMsg.length; i++) {
                        var flag = true;
                        for (var j = 0; j < allArr.length; j++) {
                          if (
                            that.globalData.addHomecenterMsg[i].User == allArr[j].User &&
                            that.globalData.addHomecenterMsg[i].DeviceUUID == allArr[j].DeviceUUID
                          ) {
                            flag = false;
                          }
                        }
                        if (flag) {
                          allArr.push(that.globalData.addHomecenterMsg[i]);
                        }
                      }
                      that.globalData.addHomecenterMsg = allArr;
                      setTimeout(function() {
                        var pages = getCurrentPages();
                        var p = pages[pages.length - 1];
                        if (pages.length > 0) {
                          if (p.onGetRosterResult) {
                            p.onGetRosterResult(msg);
                          }
                        }
                      }, 1000);
                    }
                  });
                } else {
                  console.log('设备尚未被授权使用');
                }
              }
            } else {
              console.log('当前没有可用设备');
              setTimeout(function() {
                var pages = getCurrentPages();
                var p = pages[pages.length - 1];
                if (pages.length > 0) {
                  if (p.onGetRosterResult) {
                    p.onGetRosterResult(msg);
                  }
                }
              }, 1000);
            }
          }
        } // on get roster success
      });
    });
    return p;
  },

  // 连接mqtt
  connectMqtt: function(res) {
    var that = this;
    var p = new Promise(function(resolve) {
      that.globalData.clientLock = true;
      var clientID = wx.getStorageSync('mqttClientID');
      if (!clientID || clientID == '') {
        clientID = 'wechat_miniprogram_' + that.makeid();
        wx.setStorage({
          key: 'mqttClientID',
          data: clientID
        });
      }
      console.log('mqtt client id: ' + clientID);
      var client = new mqtt.Client(that.globalData.mqttbroker + '/ws/mqtt/json', clientID);
      client.onConnectionLost = function(msg) {
        console.log('mqtt connection lost!!!!');
        console.log(msg);
        that.globalData.client = null;
        that.doCloseSocket();
      }; //mqtt失去链接
      client.onConnected = function(reconnect, uri) {
        console.log('on mqtt connected');
        console.log(uri);
      }; //mqtt还在链接
      client.onMessageArrived = function(msg) {
        var msg_ = JSON.parse(msg.payloadString);
        //console.log(msg_);
        mqtthandler.handleMqttMessage(msg_, that);
        mqttclient.onMqttMsg(msg_);
        setTimeout(function() {
          that.globalData.notFirstTime = true;
          var pages = getCurrentPages();
          if (pages.length > 0) {
            var p = pages[pages.length - 1];
            p.onMqttMsg(msg_);
          }
        }, 100);
      }; //收后台返回的消息
      //把用户名缓存起来
      that.globalData.username_ = res.username_;
      that.globalData.token_ = res.token_;
      client.connect({
        userName: res.username_, //用户名是验证身份的获取的username
        password: res.token_, //密码是验证身份的获取的token
        useSSL: false,
        timeout: 5,
        mqttVersion: 4,
        mqttVersionExplicit: true,
        // reconnect: true,
        cleanSession: true,
        keepAliveInterval: 150,
        onFailure: function(msg) {
          console.log(msg);
          that.globalData.clientLock = false;
          that.globalData.client = null;
          that.doCloseSocket();
          // wx.hideLoading();
          console.log(msg.errorMessage);
          if (msg.errorMessage && msg.errorMessage.indexOf('return code:4') > 0) {
            console.log('failed because of bad username or password');
            wx.removeStorageSync('token_');
            wx.removeStorageSync('username_');
          }
          that.clientMqtt();
          console.log(msg);
          console.log(client);
        },
        onSuccess: function(msg) {
          console.log(msg);
          that.globalData.clientLock = false;
          // wx.hideLoading();
          console.log('连接成功了,设置global client, hide loading');
          that.globalData.client = client;
          console.log(that.globalData.client);
          // // 获取用户名和头像 + 上传用户名
          var getUserUrl = that.globalData.xyurl + '/users/' + that.globalData.username_ + '?id_type=basic';
          wx.request({
            url: getUserUrl,
            method: 'GET',
            header: {
              Authorization: 'Bearer ' + that.globalData.token_
            },
            success: function(res) {
              console.log(res);
              if (res.data.name == '') {
                wx.getUserInfo({
                  success: function(res) {
                    console.log(res);
                    that.globalData.userInfo = res.userInfo.nickName;
                    that.globalData.avatarUrl = res.userInfo.avatarUrl;
                    wx.setStorage({
                      key: 'nickname',
                      data: that.globalData.userInfo
                    });
                    wx.setStorage({
                      key: 'avatarUrl',
                      data: that.globalData.avatarUrl
                    });
                    wx.getStorage({
                      key: 'nickname',
                      success: function(res) {
                        console.log(res);
                        wx.request({
                          method: 'PUT',
                          url: that.globalData.xyurl + '/users/' + that.globalData.username_ + '/name',
                          data: {
                            name: that.globalData.userInfo
                          },
                          header: {
                            Authorization: 'Bearer ' + that.globalData.token_
                          },
                          success: function(res) {
                            console.log(res);
                          },
                          fail: function(res) {
                            console.log(res);
                          }
                        });
                      }
                    });
                  }
                });
              }
            }
          });
          // 订阅话题
          var myTopic = 'message/' + res.username_;
          that.getClient().subscribe(myTopic, {
            qos: Number(0)
          });

          resolve({
            res,
            myTopic
          });
        }
      });
    });
    return p;
  },
  getClient: function() {
    var that = this;
    if (that.globalData.client && that.globalData.client.isConnected() == true) {
      console.log('global client is connected');
      // console.log(that.globalData.client.isConnected());
      return that.globalData.client;
    } else {
      if (that.globalData.clientLock) {
        console.log('a mqtt connection is already being made, wait for it to complete');
        return that.globalData.client;
      }
      var res = {};
      var strogeToken_ = wx.getStorageSync('token_');
      var strogeUsername_ = wx.getStorageSync('username_');
      res.token_ = strogeToken_;
      res.username_ = strogeUsername_;
      console.log('global client is null or not connected, create a new one, show loading');
      // wx.showLoading({
      //   title: '加载中...'
      // });
      that.connectMqtt(res).then(function(res) {
        console.log(res);
        that.getHomecenter(res);
      });
      return that.globalData.client;
    }
  },

  onLaunch: function() {
    var that = this;
    console.log(that.globalData.lastConnectedNetworkType);
    wx.onNetworkStatusChange(function(res) {
      // var pagedevice = getCurrentPages();
      // var pageitem = pagedevice[pagedevice.length - 1];
      // if (pagedevice.length > 0) {
      //   if (pageitem.show) {
      //     pageitem.show(res, that.globalData.lastConnectedNetworkType);
      //   }
      // }
      if (
        that.globalData.lastConnectedNetworkType &&
        that.globalData.lastConnectedNetworkType != res.networkType
      ) {
        HomeCenterManager.homeCenterMap = null;
        HomeCenterManager.homeCenterCacheMap = null;
        HomeCenterManager.defaultHomeCenterUuid = null;
        console.log(HomeCenterManager);
        console.log('network status changed, need to reconnect');
        if (that.globalData.client) {
          that.globalData.client = null;
          that.doCloseSocket();
        }
      }
      if (res.isConnected) {
        that.globalData.lastConnectedNetworkType = res.networkType;
        if (!that.globalData.client) {
          setTimeout(function() {
            console.log('network is connected, try to get a client now');
            that.getClient();
          }, 500);
        }
      } else {
        console.log('network is not connected');
        that.globalData.lastConnectedNetworkType = 'none';
        if (that.globalData.client) {
          that.globalData.client = null;
          that.doCloseSocket();
        }
      }
    });
  },

  doCloseSocket: function() {
    var that = this;
    wx.closeSocket({
      success: function(arg) {
        console.log('wx.closeSocket success', arg);
      },
      fail: function(arg) {
        console.log('wx.closeSocket fail', arg);
        that.globalData.netdisconnect = true;
        var pages = getCurrentPages();
        var p = pages[pages.length - 1];
        if (pages.length > 0) {
          if (p.netdisconnect) {
            p.netdisconnect(arg);
          }
        }
        if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
          return;
        }
        if (HomeCenterManager.getDefaultHomeCenterCache().entities == undefined) {
          return;
        }
        var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
        for (var t of entities.values()) {
          if (t.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
            //场景
            t.setAvailable();
          }
        }
      }
    });
  },

  onError: function(msg) {
    console.log(msg);
  },
  clientMqtt: function() {
    console.log('app.js onShow, hide loading if exist');
    // wx.hideLoading();
    var that = this;
    var strogeToken_ = wx.getStorageSync('token_');
    var strogeUsername_ = wx.getStorageSync('username_');
    if (strogeToken_ && strogeUsername_) {
      that.getClient();
    } else {
      that
        .getCode()
        .then(function(res) {
          return that.getIv(res);
        })
        .then(function(res) {
          return that.authentication(res);
        })
        .then(function(res) {
          if (res.statusCode_ == 200) {
            console.log('验证成功');
            that.connectMqtt(res).then(function(res) {
              console.log(res);
              return that.getHomecenter(res);
            });
          } else if (res.statusCode_ == 404) {
            console.log('用户不存在，创建新用户');
            that
              .getCode()
              .then(function(res) {
                return that.getIv(res);
              })
              .then(function(res) {
                console.log('创建用户code');
                return that.creatUser(res);
              })
              .then(function(res) {
                console.log(res);
                return that.getCode();
              })
              .then(function(res) {
                return that.getIv(res);
              })
              .then(function(res) {
                console.log('创建用户完成，正在验证');
                return that.authentication(res);
              })
              .then(function(res) {
                return that.connectMqtt(res);
              })
              .then(function(res) {
                return that.getHomecenter(res);
              });
          } else {
            wx.removeStorageSync('token_');
            wx.removeStorageSync('username_');
            wx.showModal({
              title: '提示',
              content: '登录失败，请重新尝试登录',
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                } else if (res.cancel) {
                  console.log('用户点击取消');
                }
              }
            });
          }
        });
    }
  },

  onShow: function(share) {
    var that = this;
    console.log("分享家庭中心唉唉唉")
    console.log(share);
    // wx.showLoading({
    //   title: '正在加载中...',
    // })
    if (share.query.types == 'share') {
      that.globalData.sharHomecenter = true;
      setTimeout(function() {
        wx.navigateTo({
          url:
            '../boxDetail/boxDetail?types=share&boxuuid=' +
            share.query.boxuuid +
            '&sharecode=' +
            share.query.sharecode
        });
      }, 1000);
    }
    var strogeToken_ = wx.getStorageSync('token_');
    var strogeUsername_ = wx.getStorageSync('username_');
    if (strogeToken_ && strogeUsername_) {
      let urls = that.globalData.xyurl + '/users/' + strogeUsername_;
      wx.request({
        url: urls,
        method: 'GET',
        header: {
          Authorization: 'Bearer ' + strogeToken_ 
        },
        success: function(res) {
          console.log(res);
          if (res.statusCode == 200) {
            if (res.data.open_ids.length == 0) {
              wx.clearStorage();
              that.clientMqtt();
              return;
            }
          } else{
            wx.showToast({
              title: '登录信息失效,重试中',
              duration	: 10000
            })
            setTimeout(function () {
              wx.clearStorage();
              that.clientMqtt();
            }, 3000);
            return;
          }
        }
      });
    }
    that.clientMqtt();
  },
  onHide: function() {
    // let that = this;
    // that.globalData.addHomecenterMsg = []
  },

  globalData: {
    deviceAll: '', //包括家庭中心和设备
    devices: null, //设备名称
    client: null, //全局client
    clientLock: null, //全局client锁
    lastConnectedNetworkStatus: null,
    username_: null, // 登录成功的用户名
    boxStatus: '', //公共页面的家庭中心的状态
    token_: null, //重要的登录名称
    // xyurl: 'http://t-centos.lan',//链接地址
    xyurl: 'https://api.xiaoyan.io', //后台服务器地址
    mqttbroker: 'wss://ws.xiaoyan.io', //通信服务器地址
    boxName: '未关联家庭中心', //每个页面头部导航要现实的box的名字
    addHomecenterMsg: [], //表示请求添加信息
    addDeviceNew: [], //添加新设备的集合（非网关）
    userInfo: null, //用户名
    avatarUrl: '', //头像
    ivandencryptedData: '', //给后台的数据
    netdisconnect: false,
    sharHomecenter: false,
    notFirstTime: false
  }
});
