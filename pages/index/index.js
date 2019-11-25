/** @format */

var mqttclient = require('../../utils/mqttclient');
var feedbackApi = require('../../utils/showToast.js');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
// var mqttclient = require('utils/mqttclient')
import Const from '../../data/Const.js';
const app = getApp();
var deviceInfos = []; //设备状态显示集合
var deviceInfoImgs = []; //设备状态图标显示集合
var animation1, animation2;
var isCurtains = [];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    open: false,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    windowHeight: wx.getSystemInfoSync().windowHeight,
    translate: '',
    clname: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    deviceList: '',
    homenters: HomeCenterManager.getAllHomeCenters(), //这个是侧边栏使用的家庭中心
    boxStatus: app.globalData.boxStatus, //公共页面的家庭中心的状态
    // boxName: '', //这个是展示到导航上面的使用的box名字
    add_homecenter: app.globalData.addHomecenterMsg, //用户请求添加消息或者被邀请添加家庭中心
    largen: false, //长按图标变大
    scenes: null, //场景
    onLines: false, //如果第一个box离线 显示设备离线
    lock: false,
    // deviceInfo: '',//用来在页面上显示设备开关的状态提示
    animationData1: {}, //执行动画数据开始
    animationData2: {},
    animationData3: {},
    animation1: false,
    animation2: false,
    animation3: false,
    data1: '',
    data2: '',
    data3: '', //执行动画数据结束
    safetyDevice: '', //布防设备集合
    otherDevice: '', //非布防设备集合
    imganimationData1: {}, //图片动画效果数据开始
    imganimationData2: {},
    imganimationData3: {},
    imganimationData4: {},
    imganimationData5: {},
    imganimation1: false,
    imganimation2: false,
    imganimation3: false,
    imganimation4: false,
    imganimation5: false,
    imgdata1: '',
    imgdata2: '',
    imgdata3: '',
    imgdata4: '',
    imgdata5: '', //图片动画效果数据结束
    tem: '', //温度表示
    webviewUrl: '', //分享小程序的url
    // netdisconnect: app.globalData.netdisconnect,
    mine: false,
    main: true,
    facility: false,
    noDevice: true,
    isnewDevice: false,
    loadingshow: false
  },
  getEntityResult: function(msg_) {
   
    wx.hideLoading();
    this.getEntities();
    this.setData({
      loadingshow: true
    });
  },
  // 侧边栏
  sidebar: function(e) {
    let that = this;
   
    if (e.detail == true) {
      that.setData({
        translate: 'transform: translateX(' + that.data.windowWidth * 0.85 + 'px)',
        clname: true,
        open: true
      });
    } else {
      that.setData({
        translate: 'transform: translateX(0px)',
        clname: false,
        open: false
      });
    }
    that.setData({
      homecenters: HomeCenterManager.getAllHomeCenters()
    });
  },
  // 点击打开侧边栏
  tap_ch: function() {
    var that = this;
    console.log(HomeCenterManager.getAllHomeCenters());
    that.setData({
      homecenters: HomeCenterManager.getAllHomeCenters()
    });
    if (this.data.open) {
      this.setData({
        translate: 'transform: translateX(0px)',
        clname: false,
        boxStatus: app.globalData.boxStatus,
        open: false
      });
    } else {
      this.setData({
        translate: 'transform: translateX(' + this.data.windowWidth * 0.85 + 'px)',
        clname: true,
        boxStatus: app.globalData.boxStatus,
        open: true
      });
    }
  },
  tap_start: function(e) {
    this.data.mark = this.data.newmark = e.touches[0].pageX;
    if (this.data.staus == 1) {
      // staus = 1指默认状态
      this.data.startmark = e.touches[0].pageX;
    } else {
      // staus = 2指屏幕滑动到右边的状态
      this.data.startmark = e.touches[0].pageX;
    }
  },
  tap_drag: function(e) {
    let that = this;
    that.data.newmark = e.touches[0].pageX;
    that.data.mark = that.data.newmark;
  },
  tap_end: function() {
    let that = this;
    if (that.data.staus == 1 && that.data.startmark < that.data.newmark) {
      if (Math.abs(that.data.newmark - that.data.startmark) < that.data.windowWidth * 0.2) {
        that.setData({
          translate: 'transform: translateX(0px)',
          clname: false
        });
        that.data.staus = 1;
      } else {
        that.setData({
          translate: 'transform: translateX(' + this.data.windowWidth * 0.85 + 'px)',
          clname: true,
          boxStatus: app.globalData.boxStatus,
          open: true
        });
      }
    } else {
      if (Math.abs(that.data.newmark - that.data.startmark) < that.data.windowWidth * 0.2) {
        console.log('暂时不作处理');
      } else {
        that.setData({
          translate: 'transform: translateX(0px)',
          clname: false,
          open: false
        });
        that.data.staus = 1;
      }
    }

    that.data.mark = 0;
    that.data.newmark = 0;
  },
  //判断几个设备开灯和布防
  deviceState: function() {
    var that = this;
    let deviceState = {};
    var safetyDevices = []; //布防设备集合
    var otherDevices = []; //非布防设备集合
    if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
      return;
    }
    if (HomeCenterManager.getDefaultHomeCenterCache().entities == undefined) {
      return;
    }
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let mainDevice = [];
    for (let physicD of entities.values()) {
      if (physicD.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        //设备
        if (physicD.Available && physicD.isNew == false) {
          for (let logicD of physicD.logicDevice) {
            var mainDevices = {};
            mainDevices.device = logicD;
            mainDevice.push(mainDevices);
          }
        }
      }
    }
    let temarr = []; //为了获取温度
    for (var j = 0; j < mainDevice.length; j++) {
      for (var attr of mainDevice[j].device.attributes) {
        if (
          attr.key == Const.AttrKey.ALERT_LEVEL &&
          attr.value == 1 &&
          mainDevice[j].device.profile == Const.Profile.PIR_PANEL
        ) {
          safetyDevices.push(mainDevice[j]);
        } else if (
          attr.key == Const.AttrKey.ON_OFF_STATUS &&
          attr.value == 1 &&
          mainDevice[j].device.profile == Const.Profile.ON_OFF_LIGHT
        ) {
          otherDevices.push(mainDevice[j]);
        } else if (
          attr.key == Const.AttrKey.ALERT_LEVEL &&
          attr.value == 1 &&
          mainDevice[j].device.profile == Const.Profile.DOOR_CONTACT
        ) {
          safetyDevices.push(mainDevice[j]);
        } else if (
          attr.key == Const.AttrKey.TEMPERATURE &&
          (mainDevice[j].device.profile == Const.Profile.DOOR_CONTACT ||
            mainDevice[j].device.profile == Const.Profile.PIR_PANEL)
        ) {
          //获取温度
          mainDevice[j].tem = attr.value;
          temarr.push(mainDevice[j]);
        }
      }
    }
    deviceState.safetyDevices = safetyDevices;
    deviceState.otherDevices = otherDevices;
    if (safetyDevices.length == 0 && otherDevices.length == 0) {
      deviceState.otherDevicesText = '没有开灯，';
      deviceState.safetyDevicesText = '没有设备布防';
    } else if (safetyDevices.length > 0 && otherDevices.length == 0) {
      deviceState.otherDevicesText = '';
      deviceState.safetyDevicesText = safetyDevices.length + ' 个设备布防';
    } else if (safetyDevices.length > 0 && otherDevices.length > 0) {
      deviceState.otherDevicesText = otherDevices.length + ' 盏灯开着';
      deviceState.safetyDevicesText = safetyDevices.length + ' 个设备布防';
    } else if (safetyDevices.length == 0 && otherDevices.length > 0) {
      deviceState.otherDevicesText = otherDevices.length + ' 盏灯开着';
      deviceState.safetyDevicesText = '';
    }
    that.setData({
      deviceStates: deviceState
    });
    if (temarr.length > 0) {
      that.setData({
        tem: Math.round(temarr[0].tem / 10)
      });
    }
  },
  tabChange: function(e) {
   
    let that = this;
    // that.setData({
    //   isnewDevice: false
    // });
    if (e.detail == 'mine' && that.data.main != 'null') {
      that.setData({
        mine: true,
        main: false,
        facility: false
      });
    } else if (e.detail == 'scene') {
      that.setData({
        mine: false,
        main: true,
        facility: false
      });
      that.getEntities();
    } else if (e.detail == 'facility' && that.data.main != 'null') {
      that.setData({
        mine: false,
        main: false,
        facility: true
      });
      that.perfectDevcie();
    } else if (e.detail == 'facility' && that.data.main == 'null') {
      that.setData({
        mine: false,
        main: 'null',
        facility: true
      });
      if (that.isnoDevice(that.data.deviceList) == true) {
        that.setData({
          main: false
        });
      }
      that.perfectDevcie();
    } else if (e.detail == 'mine' && that.data.main == 'null') {
      that.setData({
        mine: true,
        main: 'null',
        facility: true
      });
    }
  },
  //判断选中的是哪个设备
  selectBox: function(e) {
    console.log('判断选中的是哪个设备');
    console.log(e);
    var that = this;
    if (e.detail != wx.getStorageSync('setDefaultHomeCenter')) {
      HomeCenterManager.setDefaultHomeCenter(e.detail);
      wx.setStorageSync('setDefaultHomeCenter', e.detail);
      that.setData({
        tem: '',
        isnewDevice: false,
        noDevice: true,
        homecenters: HomeCenterManager.getAllHomeCenters()
      });
      that.perfectDevcie();
      if (that.data.main == true) {
        that.getEntities();
      }
      wx.setNavigationBarTitle({
        title: that.data.homecenters[0].name
      });
      if (that.data.homecenters[0].online == false) {
        that.setData({
          onLines: '家庭中心已离线'
        });
        wx.setNavigationBarTitle({
          title: that.data.homecenters[0].name + '离线'
        });
      } else {
        that.setData({
          onLines: false
        });
      }
      if (that.data.main == true) {
        // that.deviceState();
        // that.getEntities();
        // 判断是否没有设备
        if (that.isnoDevice(that.data.deviceList) != true) {
          that.setData({
            main: 'null',
            noDevice: !that.isnoDevice(that.data.deviceList)
          });
        } else {
          that.setData({
            main: true,
            noDevice: !that.isnoDevice(that.data.deviceList)
          });
        }
      } else if (that.data.facility == true) {
        // 判断是否没有设备
        if (that.isnoDevice(that.data.deviceList) != true) {
          that.setData({
            main: 'null',
            noDevice: !that.isnoDevice(that.data.deviceList)
          });
        } else {
          that.setData({
            main: false,
            noDevice: !that.isnoDevice(that.data.deviceList)
          });
        }
      }
    }
    let count = (function() {
      let timer;
      let i = 8;
      function change(tar) {
        i--;
        that.setData({
          translate: 'transform: translateX(' + that.data.windowWidth * i / 10 + 'px)',
          clname: false,
          open: false
        });
        if (i === tar) {
          clearTimeout(timer);
          return false;
        }
        timer = setTimeout(function() {
          change(tar);
        }, 0);
      }

      return change;
    })();
    count(0);
  },
  //文本动画播放函数
  textPlay: function(name, action) {
    var that = this;
    var animation1 = wx.createAnimation({
      duration: 1500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.animation1 = animation1;
    var animation2 = wx.createAnimation({
      duration: 1500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.animation2 = animation2;
    var animation3 = wx.createAnimation({
      duration: 1500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.animation3 = animation3;
    if (that.data.animation1 == false) {
      that.setData({
        data1: name + action
      });
      animation1
        .opacity(0.6)
        .top(-20)
        .step({
          duration: 1400
        });
      that.setData({
        animationData1: animation1.export(),
        animation1: true
      });
      setTimeout(function() {
        animation1
          .opacity(1)
          .top(35)
          .step({
            duration: 1
          });
        that.setData({
          animationData1: animation1.export(),
          animation1: false,
          data1: ''
        });
      }, 1000);
    } else if (that.data.animation1 == true) {
      if (that.data.animation2 == false) {
        that.setData({
          data2: name + action
        });
        animation2
          .opacity(0.6)
          .top(-20)
          .step({
            duration: 1400
          });
        that.setData({
          animationData2: animation2.export(),
          animation2: true
        });
        setTimeout(function() {
          animation2
            .opacity(1)
            .top(35)
            .step({
              duration: 1
            });
          that.setData({
            animationData2: animation2.export(),
            animation2: false,
            data2: ''
          });
        }, 1000);
      } else if (that.data.animation2 == true) {
        if (that.data.animation3 == false) {
          that.setData({
            data3: name + action
          });
          animation3
            .opacity(0.6)
            .top(-20)
            .step({
              duration: 1500
            });
          that.setData({
            animationData3: animation3.export(),
            animation3: true
          });
          setTimeout(function() {
            animation3
              .opacity(1)
              .top(35)
              .step({
                duration: 1
              });
            that.setData({
              animationData3: animation3.export(),
              animation3: false,
              data3: ''
            });
          }, 1000);
        }
      }
    }
  },
  //图片动画效果函数
  imgPlay: function(beforeImg, afterImg) {
    var that = this;
    var imganimation1 = wx.createAnimation({
      duration: 2500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.imganimation1 = imganimation1;
    var imganimation2 = wx.createAnimation({
      duration: 2500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.imganimation2 = imganimation2;
    var imganimation3 = wx.createAnimation({
      duration: 2500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.imganimation3 = imganimation3;
    var imganimation4 = wx.createAnimation({
      duration: 2500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.imganimation4 = imganimation4;
    var imganimation5 = wx.createAnimation({
      duration: 2500,
      timingFunction: 'ease',
      transformOrigin: '0% 0%'
    });
    that.imganimation5 = imganimation5;
    if (that.data.imganimation1 == false) {
      that.setData({
        imgdata1: beforeImg
      });
      imganimation1.top(1).step({
        duration: 500
      });
      that.setData({
        imganimationData1: imganimation1.export(),
        imganimation1: true
      });
      setTimeout(function() {
        imganimation1.opacity(0).step({
          duration: 1990
        });
        that.setData({
          imganimationData1: imganimation1.export(),
          imgdata1: afterImg
        });
        setTimeout(function() {
          imganimation1
            .opacity(1)
            .top(52)
            .step({
              duration: 1
            });
          that.setData({
            imganimationData1: imganimation1.export(),
            imganimation1: false,
            imgdata1: ''
          });
        }, 1000);
      }, 600);
    } else if (that.data.imganimation1 == true) {
      if (that.data.imganimation2 == false) {
        that.setData({
          imgdata2: beforeImg
        });
        imganimation2.top(1).step({
          duration: 500
        });
        that.setData({
          imganimationData2: imganimation2.export(),
          imganimation2: true
        });
        setTimeout(function() {
          imganimation2.opacity(0).step({
            duration: 1990
          });
          that.setData({
            imganimationData2: imganimation2.export(),
            imgdata2: afterImg
          });
          setTimeout(function() {
            imganimation2
              .opacity(1)
              .top(52)
              .step({
                duration: 1
              });
            that.setData({
              imganimationData2: imganimation2.export(),
              imganimation2: false,
              imgdata2: ''
            });
          }, 1000);
        }, 600);
      } else if (that.data.imganimation2 == true) {
        if (that.data.imganimation3 == false) {
          that.setData({
            imgdata3: beforeImg
          });
          imganimation3.top(1).step({
            duration: 500
          });
          that.setData({
            imganimationData3: imganimation3.export(),
            imganimation3: true
          });
          setTimeout(function() {
            imganimation3.opacity(0).step({
              duration: 1990
            });
            that.setData({
              imganimationData3: imganimation3.export(),
              imgdata3: afterImg
            });
            setTimeout(function() {
              imganimation3
                .opacity(1)
                .top(52)
                .step({
                  duration: 1
                });
              that.setData({
                imganimationData3: imganimation3.export(),
                imganimation3: false,
                imgdata3: ''
              });
            }, 1000);
          }, 600);
        } else if (that.data.imganimation3 == true) {
          if (that.data.imganimation4 == false) {
            that.setData({
              imgdata4: beforeImg
            });
            imganimation4.top(1).step({
              duration: 500
            });
            that.setData({
              imganimationData4: imganimation4.export(),
              imganimation4: true
            });
            setTimeout(function() {
              imganimation4.opacity(0).step({
                duration: 1990
              });
              that.setData({
                imganimationData4: imganimation4.export(),
                imgdata4: afterImg
              });
              setTimeout(function() {
                imganimation4
                  .opacity(1)
                  .top(52)
                  .step({
                    duration: 1
                  });
                that.setData({
                  imganimationData4: imganimation4.export(),
                  imganimation4: false,
                  imgdata4: ''
                });
              }, 1000);
            }, 600);
          } else if (that.data.imganimation4 == true) {
            if (that.data.imganimation5 == false) {
              that.setData({
                imgdata5: beforeImg
              });
              imganimation5.top(1).step({
                duration: 500
              });
              that.setData({
                imganimationData5: imganimation5.export(),
                imganimation5: true
              });
              setTimeout(function() {
                imganimation5.opacity(0).step({
                  duration: 1990
                });
                that.setData({
                  imganimationData5: imganimation5.export(),
                  imgdata5: afterImg
                });
                setTimeout(function() {
                  imganimation5
                    .opacity(1)
                    .top(52)
                    .step({
                      duration: 1
                    });
                  that.setData({
                    imganimationData5: imganimation5.export(),
                    imganimation5: false,
                    imgdata5: ''
                  });
                }, 1000);
              }, 600);
            }
          }
        }
      }
    }
  },
  // 场景长按
  scenarioLongTap: function(e) {
    var that = this;
    if (e.currentTarget.dataset.addscene == 'addScene') {
      wx.navigateTo({
        url: '../scenarioEditor/scenarioEditor?addScene=true'
      });
      return;
    }
    that.setData({
      lock: true
    });
    var strscences;
    for (var s = 0; s < that.data.scenes.length; s++) {
      if (e.currentTarget.dataset.uuid == that.data.scenes[s].scene.uuid) {
        strscences = 'scenes[' + s + '].largen';
        that.setData({
          [strscences]: true
        });
        setTimeout(function() {
          that.setData({
            [strscences]: false
          });
        }, 1500);
        setTimeout(function() {
          wx.navigateTo({
            url:
              '../scenarioEditor/scenarioEditor?sceneUuid=' +
              e.currentTarget.dataset.uuid +
              '&del=' +
              e.currentTarget.dataset.del
          });
        }, 500);
      }
    }
  },
  //单机场景
  scenetap: function(e) {
    var that = this;
    if (that.data.lock) {
      return;
    }
    var mm;
    var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    // var icon
    for (var m = 0; m < that.data.scenes.length; m++) {
      if (e.currentTarget.dataset.uuid == that.data.scenes[m].scene.uuid) {
        mm = m;
        mqttclient.sendRequest({
          client: app.getClient(),
          topic: boxname,
          req: mqttclient.buildSetSceneOnOffRequest(
            app.globalData.username_,
            e.currentTarget.dataset.uuid,
            2
          ),
          success: function(req) {
            console.log(req);
            if (req.SetSceneOnOff) {
              if (that.data.main == true) {
                that.getEntities();
              }
            }
          },
          error: function(req, res) {
            console.log('got error', req, res);
            if (res.Error.Code == 45) {
              feedbackApi.showToast({
                title: '场景为空'
              }); //调用
            }
          }
        });

        if (
          that.data.windowWidth > 320 &&
          that.data.scenes[mm].scenetaps == false &&
          that.data.scenes[mm].scene.actions.length > 0
        ) {
          that.data.scenes[mm].bg1 = true;
          that.data.scenes[mm].bg2 = false;
          that.setData({
            scenes: that.data.scenes
          });
          let countW = (function() {
            let timer;
            let i = 0;
            function change(tar) {
              i++;
              // 页面渲染完成
              // if (that.data.firmwareAll[rr].firmwaredevices[tt].Percent){
              let canvasArc = e.currentTarget.dataset.class;
              let cxt_arc = wx.createCanvasContext(canvasArc); //创建并返回绘图上下文context对象。
              cxt_arc.setLineWidth(4);
              cxt_arc.setStrokeStyle('#8fd4fb');
              cxt_arc.setLineCap('round');
              cxt_arc.beginPath(); //开始一个新的路径
              cxt_arc.arc(55, 55, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * i);
              cxt_arc.stroke(); //对当前路径进行描边
              cxt_arc.draw();
              if (i === tar) {
                // var canvasArc = e.currentTarget.dataset.class
                // console.log(canvasArc)
                // var cxt_arc = wx.createCanvasContext(canvasArc) //创建并返回绘图上下文context对象。
                cxt_arc.setLineWidth(0);
                cxt_arc.setStrokeStyle('#ffffff');
                cxt_arc.setLineCap('round');
                cxt_arc.beginPath(); //开始一个新的路径
                cxt_arc.arc(52, 55, 55, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * 1);
                cxt_arc.stroke(); //对当前路径进行描边
                cxt_arc.draw();
                clearTimeout(timer);
                return false;
              }
              timer = setTimeout(function() {
                change(tar);
              }, 10);
            }
            return change;
          })();
          countW(100);
        } else if (
          that.data.windowWidth <= 320 &&
          that.data.scenes[mm].scenetaps == false &&
          that.data.scenes[mm].scene.actions.length > 0
        ) {
          that.data.scenes[mm].bg1 = true;
          that.data.scenes[mm].bg2 = false;
          that.setData({
            scenes: that.data.scenes
          });
          let count = (function() {
            let timer;
            let i = 0;
            function change(tar) {
              i++;
              // 页面渲染完成
              // if (that.data.firmwareAll[rr].firmwaredevices[tt].Percent){
              let canvasArc = e.currentTarget.dataset.class;
              let cxt_arc = wx.createCanvasContext(canvasArc); //创建并返回绘图上下文context对象。
              cxt_arc.setLineWidth(3);
              cxt_arc.setStrokeStyle('#8fd4fb');
              cxt_arc.setLineCap('round');
              cxt_arc.beginPath(); //开始一个新的路径
              cxt_arc.arc(48, 48, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * i);
              cxt_arc.stroke(); //对当前路径进行描边
              cxt_arc.draw();
              if (i === tar) {
                // var canvasArc = e.currentTarget.dataset.class
                // console.log(canvasArc)
                // var cxt_arc = wx.createCanvasContext(canvasArc) //创建并返回绘图上下文context对象。
                cxt_arc.setLineWidth(0);
                cxt_arc.setStrokeStyle('#ffffff');
                cxt_arc.setLineCap('round');
                cxt_arc.beginPath(); //开始一个新的路径
                cxt_arc.arc(48, 48, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * 1);
                cxt_arc.stroke(); //对当前路径进行描边
                cxt_arc.draw();
                clearTimeout(timer);
                return false;
              }
              timer = setTimeout(function() {
                change(tar);
              }, 10);
            }

            return change;
          })();
          count(100);
        } else if (
          that.data.windowWidth <= 320 &&
          that.data.scenes[mm].scenetaps == true &&
          that.data.scenes[mm].scene.actions.length > 0
        ) {
          that.data.scenes[mm].bg1 = false;
          that.data.scenes[mm].bg2 = true;
          that.setData({
            scenes: that.data.scenes
          });
          let count = (function() {
            let timer;
            let i = 0;

            function change(tar) {
              i++;
              // 页面渲染完成
              // if (that.data.firmwareAll[rr].firmwaredevices[tt].Percent){
              let canvasArc = e.currentTarget.dataset.class;
              let cxt_arc = wx.createCanvasContext(canvasArc); //创建并返回绘图上下文context对象。
              cxt_arc.setLineWidth(3);
              cxt_arc.setStrokeStyle('#f8f8f8');
              cxt_arc.setLineCap('round');
              cxt_arc.beginPath(); //开始一个新的路径
              cxt_arc.arc(48, 48, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * i);
              cxt_arc.stroke(); //对当前路径进行描边
              cxt_arc.draw();
              if (i === tar) {
                // var canvasArc = e.currentTarget.dataset.class
                // console.log(canvasArc)
                // var cxt_arc = wx.createCanvasContext(canvasArc) //创建并返回绘图上下文context对象。
                cxt_arc.setLineWidth(0);
                cxt_arc.setStrokeStyle('#ffffff');
                cxt_arc.setLineCap('round');
                cxt_arc.beginPath(); //开始一个新的路径
                cxt_arc.arc(48, 48, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * 1);
                cxt_arc.stroke(); //对当前路径进行描边
                cxt_arc.draw();
                clearTimeout(timer);
                return false;
              }
              timer = setTimeout(function() {
                change(tar);
              }, 10);
            }
            return change;
          })();
          count(100);
        } else if (
          that.data.windowWidth > 320 &&
          that.data.scenes[mm].scenetaps == true &&
          that.data.scenes[mm].scene.actions.length > 0
        ) {
          that.data.scenes[mm].bg1 = false;
          that.data.scenes[mm].bg2 = true;
          that.setData({
            scenes: that.data.scenes
          });
          let count = (function() {
            let timer;
            let i = 0;
            function change(tar) {
              i++;
              // 页面渲染完成
              // if (that.data.firmwareAll[rr].firmwaredevices[tt].Percent){
              let canvasArc = e.currentTarget.dataset.class;
              let cxt_arc = wx.createCanvasContext(canvasArc); //创建并返回绘图上下文context对象。
              cxt_arc.setLineWidth(4);
              cxt_arc.setStrokeStyle('#f8f8f8');
              cxt_arc.setLineCap('round');
              cxt_arc.beginPath(); //开始一个新的路径
              cxt_arc.arc(55, 55, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * i);
              cxt_arc.stroke(); //对当前路径进行描边
              cxt_arc.draw();
              if (i === tar) {
                // var canvasArc = e.currentTarget.dataset.class
                // console.log(canvasArc)
                // var cxt_arc = wx.createCanvasContext(canvasArc) //创建并返回绘图上下文context对象。
                cxt_arc.setLineWidth(0);
                cxt_arc.setStrokeStyle('#ffffff');
                cxt_arc.setLineCap('round');
                cxt_arc.beginPath(); //开始一个新的路径
                cxt_arc.arc(52, 55, 55, -Math.PI / 2, -Math.PI / 2 + Math.PI / 180 * 3.6 * 1);
                cxt_arc.stroke(); //对当前路径进行描边
                cxt_arc.draw();
                clearTimeout(timer);
                return false;
              }
              timer = setTimeout(function() {
                change(tar);
              }, 10);
            }
            return change;
          })();
          count(100);
        }
      } else {
        that.data.scenes[m].bg1 = false;
        that.data.scenes[m].bg2 = true;
        that.setData({
          scenes: that.data.scenes
        });
      }
    }
  },
  mytouchend: function() {
    var that = this;
    if (that.data.lock) {
      //开锁
      setTimeout(() => {
        that.setData({
          lock: false
        });
      }, 100);
    }
  },
  getAllHomecenters: function() {
    var that = this;
    if (HomeCenterManager.getAllHomeCenters() == undefined) {
      return;
    }
    if (HomeCenterManager.getAllHomeCenters().length == 0) {
      wx.redirectTo({
        url: '../addRoster/addRoster'
      });
      return;
    }
    that.setData({
      homecenters: HomeCenterManager.getAllHomeCenters()
    });
    //  wx.hideLoading()
    //  that.setData({
    //    loadingshow:true,
    //    onLines: '家庭中心已离线...'
    //  })
    if (wx.getStorageSync('setDefaultHomeCenter')) {
      HomeCenterManager.setDefaultHomeCenter(wx.getStorageSync('setDefaultHomeCenter'));
      wx.setNavigationBarTitle({
        title: HomeCenterManager.getHomeCenter(wx.getStorageSync('setDefaultHomeCenter')).name,
      })
    } else {
      wx.setStorageSync('setDefaultHomeCenter', HomeCenterManager.getAllHomeCenters()[0].uuid);
      wx.setNavigationBarTitle({
        title: HomeCenterManager.getAllHomeCenters()[0].name,
      })
    }

    if (HomeCenterManager.getAllHomeCenters()[0].online == true) {
      that.setData({
        onLines: false
      });
    }
    if (that.data.main == true) {
      that.getEntities();
    }
    if (that.data.facility == true) {
      that.perfectDevcie();
    }
    
  },
  onGetRosterResult: function(msg_) {
    var that = this;
    if (msg_.data.roster.length == 0) {
      wx.redirectTo({
        url: '../addRoster/addRoster'
      });
      return;
    }
    that.getAllHomecenters();
    if (that.data.homecenters != null && that.data.homecenters.length != 0) {
      console.log(that.data.homecenters);
    } else {
      wx.navigateTo({
        url: '../addRoster/addRoster'
      });
    }
    // 别人请求关联box消息
    if (app.globalData.addHomecenterMsg && app.globalData.addHomecenterMsg.length > 0) {
      that.setData({
        add_homecenter: app.globalData.addHomecenterMsg
      });
    } else {
      that.setData({
        add_homecenter: ''
      });
    }
  },
  // 收到app.js的加载完成函数
  onMqttMsg: function(msg_) {
    var that = this;
   
    if (msg_.DeviceAssociation != undefined && msg_.DeviceAssociation != null) {
      var user = msg_.DeviceAssociation.User;
      var by = msg_.DeviceAssociation.By;
      var action = msg_.DeviceAssociation.Action;
      var status = msg_.DeviceAssociation.Status;
      var deviceUuid = msg_.DeviceAssociation.DeviceUUID;
      var username = app.globalData.username_;
      //别人同意了我的请求
      if (
        user == username &&
        by != username &&
        action == Const.ActionType.APPROVE &&
        status == Const.SubscriptionType.BOTH
      ) {
        that.getAllHomecenters();
      } else if (
        user != username &&
        by != username &&
        action == Const.ActionType.REMOVE &&
        status == Const.SubscriptionType.UNKNOWN
      ) {
        if (that.data.homecenters.length == 0) {
          wx.redirectTo({
            url: '../addRoster/addRoster'
          });
        }
        that.getAllHomecenters();
      } else if (
        user == username &&
        by != username &&
        action == Const.ActionType.REJECT &&
        status == Const.SubscriptionType.UNKNOWN
      ) {
        // 别人拒绝了我的请求
        that.getAllHomecenters();
      } else if (
        user == username &&
        (by == username || by == deviceUuid) &&
        action == Const.ActionType.REMOVE &&
        status == Const.SubscriptionType.UNKNOWN
      ) {
        // 别人拒绝了我的请求
        that.getAllHomecenters();
        if (
          HomeCenterManager.getAllHomeCenters().length == 1 &&
          HomeCenterManager.getAllHomeCenters()[0].online == false &&
          HomeCenterManager.getAllHomeCenters()[0].types == 3
        ) {
          that.setData({
            deviceList: null
          });
          return;
        }
        if (that.data.main == true) {
          that.getEntities();
        }
      } else if (
        user == username &&
        by != username &&
        action == Const.ActionType.REMOVE &&
        status == Const.SubscriptionType.UNKNOWN
      ) {
        console.log('cucucu')
        that.getAllHomecenters();
      }
      
      // 请求消息
      if (app.globalData.addHomecenterMsg && app.globalData.addHomecenterMsg.length > 0) {
        that.setData({
          add_homecenter: app.globalData.addHomecenterMsg
        });
      } else {
        that.setData({
          add_homecenter: ''
        });
      }
      that.perfectDevcie();
    }
    if (msg_.PhysicDeviceOffline != undefined && msg_.PhysicDeviceOffline != null) {
      that.perfectDevcie();
    }
    if (
      HomeCenterManager.getAllHomeCenters().length > 0 &&
      msg_.Sender != HomeCenterManager.getAllHomeCenters()[0].uuid
    ) {
      return;
    }
    // that.perfectDevcie();
    if (msg_.Presence != undefined && msg_.Presence != null) {
      that.getAllHomecenters();
      if (msg_.Presence.Online == false && msg_.Sender == HomeCenterManager.getAllHomeCenters()[0].uuid) {
        that.setData({
          onLines: '家庭中心已离线'
        });
      } else if (
        msg_.Presence.Online == true &&
        msg_.Sender == HomeCenterManager.getAllHomeCenters()[0].uuid
      ) {
        that.setData({
          onLines: false
        });
        if (that.data.main == true) {
          that.getEntities();
        }
        if (that.data.facility == true) {
          setTimeout(function() {
            that.perfectDevcie();
          }, 1000);
        }
      }
    }
    if (msg_.EntityInfoConfigured != undefined && msg_.EntityInfoConfigured != null) {
      that.getAllHomecenters();
      if (that.data.main == true) {
        that.getEntities();
      }
      that.perfectDevcie();
    }
    if (msg_.DeviceAttrReport != undefined && msg_.DeviceAttrReport != null && that.data.main == true) {
      that.getEntities();
      //设备打开关闭的问题
      if (msg_.DeviceAttrReport.UUID.substr(0, 2) == '00') {
        that.deviceState();
        if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
          return;
        }
        console.log(HomeCenterManager.getDefaultHomeCenterCache());
        if (HomeCenterManager.getDefaultHomeCenterCache().entities == undefined) {
          return;
        }
        var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
        var mainDevice = [];
        for (let physicD of entities.values()) {
          if (physicD.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
            //设备
            if (physicD.Available) {
              // && physicD.isNew == false
              for (let logicD of physicD.logicDevice) {
                var mainDevices = {};
                mainDevices.device = logicD;
                mainDevice.push(mainDevices);
              }
            }
          }
        }
        if (mainDevice) {
          for (var j = 0; j < mainDevice.length; j++) {
            if (msg_.DeviceAttrReport.UUID == mainDevice[j].device.uuid) {
              msg_.DeviceAttrReport.Name = mainDevice[j].device.uiname;
              msg_.DeviceAttrReport.Profile = mainDevice[j].device.profile;
              for (var c = 0; c < msg_.DeviceAttrReport.Attributes.length; c++) {
                if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ON_OFF_STATUS &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 0 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.SMART_PLUG
                ) {
                  //插座关
                  msg_.DeviceAttrReport.stateText = '关闭';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_plug_on.png';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_plug_off.png';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                } else if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ON_OFF_STATUS &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 1 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.SMART_PLUG
                ) {
                  //插座开
                  msg_.DeviceAttrReport.stateText = '打开';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_plug_off.png';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_plug_on.png';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                } else if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ON_OFF_STATUS &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 0 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.ON_OFF_LIGHT
                ) {
                  //灯座关
                  msg_.DeviceAttrReport.stateText = '关闭';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_light_off.png';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_light_on.png';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                } else if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ON_OFF_STATUS &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 1 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.ON_OFF_LIGHT
                ) {
                  //灯座开
                  msg_.DeviceAttrReport.stateText = '打开';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_light_on.png';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_light_off.png';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                } else if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ALERT_LEVEL &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 0 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.DOOR_CONTACT &&
                  msg_.DeviceAttrReport.Attributes.length == 1
                ) {
                  //门磁撤防
                  msg_.DeviceAttrReport.stateText = '撤防';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_dc_closed.png';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_dc_open.jpg';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                } else if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ALERT_LEVEL &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 1 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.DOOR_CONTACT
                ) {
                  //门磁布防
                  msg_.DeviceAttrReport.stateText = '布防';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_dc_open.jpg';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_dc_closed.png';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                } else if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ALERT_LEVEL &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 0 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.PIR_PANEL &&
                  msg_.DeviceAttrReport.Attributes.length == 1
                ) {
                  //开关撤防
                  msg_.DeviceAttrReport.stateText = '撤防';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_pir_safe.png';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_pir_alarm.png';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                } else if (
                  msg_.DeviceAttrReport.Attributes[c].AttrID == Const.AttrKey.ALERT_LEVEL &&
                  msg_.DeviceAttrReport.Attributes[c].AttrValue == 1 &&
                  msg_.DeviceAttrReport.Profile == Const.Profile.PIR_PANEL &&
                  msg_.DeviceAttrReport.Attributes.length == 1
                ) {
                  //开关布防
                  msg_.DeviceAttrReport.stateText = '布防';
                  msg_.DeviceAttrReport.stateImg = '/imgs/dev_icon_pir_alarm.png';
                  msg_.DeviceAttrReport.stateImgBefore = '/imgs/dev_icon_pir_safe.png';
                  deviceInfos.push(msg_.DeviceAttrReport);
                  deviceInfoImgs.push(msg_.DeviceAttrReport);
                }
              }
            }
          }
        }
      }
    }
    if (
      msg_.DeviceAttrReport != undefined &&
      msg_.DeviceAttrReport != null &&
      that.data.facility == true &&
      msg_.Sender == HomeCenterManager.getAllHomeCenters()[0].uuid &&
      HomeCenterManager.getDefaultHomeCenterCache() != undefined
    ) {
      let patt = /scene-/;
      if (patt.test(msg_.DeviceAttrReport.UUID) == true) {
        return;
      }
      let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
      let uuid = msg_.DeviceAttrReport.UUID.substr(0, 17) + '00';
      if (entities.get(uuid)) {
        if (entities.get(uuid).logicDevice == undefined) {
          return;
        }
      }
      for (let logicD of entities.get(uuid).logicDevice) {
        if (logicD.uuid == msg_.DeviceAttrReport.UUID) {
          // logicD.loading = false;
        }
      }
      that.perfectDevcie();
      for (let attr of msg_.DeviceAttrReport.Attributes) {
        if (that.data.isCurtain != undefined) {
          for (var curtain of that.data.isCurtain) {
            if (curtain.uuid == msg_.DeviceAttrReport.UUID) {
              let physicD = HomeCenterManager.getDefaultHomeCenterCache().entities.get(curtain.parentUuid);
              if (attr.AttrID == Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT && attr.AttrValue >= 50) {
                for (let logicD of physicD.logicDevice) {
                  if (logicD.uuid == curtain.uuid) {
                    logicD.curtainBtn = true;
                  }
                }
              } else if (attr.AttrID == Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT && attr.AttrValue < 50) {
                for (let logicD of physicD.logicDevice) {
                  if (logicD.uuid == curtain.uuid) {
                    logicD.curtainBtn = false;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (msg_.EntityAvailable != undefined && msg_.EntityAvailable != null) {
      that.perfectDevcie();
    }
    if (msg_.SceneCreated != undefined && msg_.SceneCreated != null) {
      if (that.data.main == true) {
        that.getEntities();
      }
    }
    if (msg_.BindingDeleted != undefined && msg_.BindingDeleted != null) {
      if (that.data.main == true) {
        that.getEntities();
      }
    }
  },
  onLoad: function(options) {
    console.log(options)
    wx.showLoading({
      title: '正在加载中...'
    });
    var that = this;
    let tabc = {};
    tabc.detail = 'scene';
    that.perfectDevcie();
    if (options.types) {
      if (options.types == 'facility') {
        that.setData({
          facility: true,
          main: false,
          mine: false
        });
      } else if (options.types == 'main') {
        that.setData({
          facility: false,
          main: true,
          mine: false
        });
      } else if (options.types == 'mine') {
        that.setData({
          facility: false,
          main: false,
          mine: true
        });
      }
    }
    that.setData({
      nickname: wx.getStorageSync('nickname'),
      headPortrait: wx.getStorageSync('avatarUrl')
    });
    let userInformation = {};
    userInformation.nickname = that.data.nickname;
    userInformation.headPortrait = that.data.headPortrait;
    that.setData({
      information: userInformation
    });
  },
  // 场景页面
  getEntities: function() {
    var that = this;
    if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
      return;
    }
    console.log(that.data);
    if (that.data.homecenters) {
      wx.setNavigationBarTitle({
        title: that.data.homecenters[0].name
      });
      if (HomeCenterManager.getAllHomeCenters()[0].types == Const.AssociationState.SHARED) {
        for (let home of HomeCenterManager.getAllHomeCenters()) {
          if (home.types == Const.AssociationState.ASSOCIATED) {
            wx.setStorageSync('setDefaultHomeCenter', home.uuid);
            break;
          } else if (app.globalData.sharHomecenter != true) {
            wx.reLaunch({
              url: '../addRoster/addRoster'
            });
          }
        }
        that.setData({
          onLines: '家庭中心未授权',
          scenes: '',
          deviceList: ''
        });
      }
    }
    if (HomeCenterManager.getDefaultHomeCenterCache().entities == undefined) {
      return;
    }
    var entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    console.log(entities);
    var mainScenes = []; //场景
    var mainDevice = []; //设备
    for (var device of entities.values()) {
      if (device.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        //设备
        // if (device.isNew == false) {
        mainDevice.push(device);
        // }
      }
    }
    for (var t of entities.values()) {
      if (t.getEntityType() == Const.EntityType.SCENE) {
        //场景
        var uiScenes = {};
        uiScenes.scene = t;
        uiScenes.scenetaps = 'null';
        mainScenes.push(uiScenes);
        that.matchingScene(mainScenes);
      }
    }
    console.log(mainDevice)
    if (mainDevice.length > 1) {
      if (that.data.mine == true) {
        that.setData({
          main: false,
          mine: true,
          facility: false
        });
      } else if (that.data.facility == true) {
        that.setData({
          main: false,
          mine: false,
          facility: true
        });
      } else if (that.data.main == true) {
        that.setData({
          main: true,
          mine: false,
          facility: false
        });
      }
    } else {
      that.setData({
        main: 'null',
        mine: false,
        facility: true
      });
    }
    console.log(mainScenes);

    that.setData({
      scenes: mainScenes,
      // mainScenes: true,
      loadingshow: true
    });
    console.log(that.data);
    if (that.data.scenes.length > 0) {
      wx.hideLoading();
    }
    that.deviceState();
  },
  //判断场景是否匹配
  matchingScene: function(scene) {
    for (let item of scene) {
      for (let attr of item.scene.attributes) {
        if (attr.key == 0 && attr.value == 1 && item.scene.uuid == Const.SceneUuid.SCENE_01) {
          item.scenetaps = true;
          item.scenesImg = '../../imgs/scene_gohome_on.png';
        } else if (
          attr.key == 0 &&
          (attr.value == 0 || attr.value == -1) &&
          item.scene.uuid == Const.SceneUuid.SCENE_01
        ) {
          item.scenetaps = false;
          item.scenesImg = '../../imgs/scene_gohome_off.png';
        } else if (attr.key == 0 && attr.value == 1 && item.scene.uuid == Const.SceneUuid.SCENE_02) {
          item.scenetaps = true;
          item.scenesImg = '../../imgs/scene_leave_home_on.png';
        } else if (
          attr.key == 0 &&
          (attr.value == 0 || attr.value == -1) &&
          item.scene.uuid == Const.SceneUuid.SCENE_02
        ) {
          item.scenetaps = false;
          item.scenesImg = '../../imgs/scene_leave_home_off.png';
        } else if (attr.key == 0 && attr.value == 1 && item.scene.uuid == Const.SceneUuid.SCENE_03) {
          item.scenetaps = true;
          item.scenesImg = '../../imgs/scene_getup_on.png';
        } else if (
          attr.key == 0 &&
          (attr.value == 0 || attr.value == -1) &&
          item.scene.uuid == Const.SceneUuid.SCENE_03
        ) {
          item.scenetaps = false;
          item.scenesImg = '../../imgs/scene_getup_off.png';
        } else if (attr.key == 0 && attr.value == 1 && item.scene.uuid == Const.SceneUuid.SCENE_04) {
          item.scenetaps = true;
          item.scenesImg = '../../imgs/scene_sleep_on.png';
        } else if (
          attr.key == 0 &&
          (attr.value == 0 || attr.value == -1) &&
          item.scene.uuid == Const.SceneUuid.SCENE_04
        ) {
          item.scenetaps = false;
          item.scenesImg = '../../imgs/scene_sleep_off.png';
        } else if (attr.key == 0 && attr.value == 1) {
          item.scenetaps = true;
          item.scenesImg = '../../imgs/scene_casual_on.png';
        } else if (attr.key == 0 && (attr.value == 0 || attr.value == -1)) {
          item.scenetaps = false;
          item.scenesImg = '../../imgs/scene_casual_off.png';
        }
      }
    }
  },
  isWallSwitch: function(model) {
    // isWallSwitch() {
    // let that = this;
    return (
      model == Const.DeviceModel.WALL_SWITCH_S1 ||
      model == Const.DeviceModel.WALL_SWITCH_S2 ||
      model == Const.DeviceModel.WALL_SWITCH_S3 ||
      model == Const.DeviceModel.WALL_SWITCH_S4 ||
      model == Const.DeviceModel.WALL_SWITCH_D1 ||
      model == Const.DeviceModel.WALL_SWITCH_D2 ||
      model == Const.DeviceModel.WALL_SWITCH_D3 ||
      model == Const.DeviceModel.WALL_SWITCH_D4
    );
    // }
  },
  netdisconnect: function() {
    var that = this;
    if (app.globalData.netdisconnect == true) {
      that.setData({
        onLines: '网络失去连接...'
      });
    }
    if (that.data.facility == true) {
      console.log(app.globalData.devicezhezhao);
      console.log(that.data);
      for (let area of that.data.deviceList) {
        for (let device of area.areaDevices) {
          device.device.Available = false;
          if (device.device.model) {
            console.log(that.isWallSwitch(device.device.model));
            if (that.isWallSwitch(device.device.model) == true) {
              device.deviceImg = '../../imgs/wallswitch_offline.png';
            }
          }
          if (device.device.profile == 0) {
            device.deviceImg = '../../imgs/dev_icon_pir_offline.png';
          } else if (device.device.profile == 1) {
            device.deviceImg = '../../imgs/dev_icon_plug_offline.png';
          } else if (device.device.profile == 2) {
            device.deviceImg = '../../imgs/dev_icon_light_offline.png';
          } else if (device.device.profile == 3) {
            device.deviceImg = '../../imgs/dev_icon_dc_offline.png';
          } else if (device.device.profile == 5) {
            device.deviceImg = '../../imgs/icon_curtain_offline.png';
          }
        }
      }
      that.setData({
        deviceList: that.data.deviceList
      });
      // that.perfectDevcie()
    }
  },
  isOnlineRoster: function() {
    for (let roster of HomeCenterManager.getAllHomeCenters()) {
      if (roster.online == true) {
        return true;
      }
    }
  },
  // 进addroster页面
  navigatetoAddroster: function() {
    if (HomeCenterManager.getAllHomeCenters().length == 0) {
      wx.reLaunch({
        url: '../addRoster/addRoster'
      });
    } else if (
      HomeCenterManager.getAllHomeCenters().length == 1 &&
      HomeCenterManager.getAllHomeCenters()[0].types != 3
    ) {
      wx.reLaunch({
        url: '../addRoster/addRoster'
      });
    } else if (
      HomeCenterManager.getAllHomeCenters().length == 1 &&
      HomeCenterManager.getAllHomeCenters()[0].types == 3 &&
      HomeCenterManager.getAllHomeCenters()[0].online == false
    ) {
      wx.hideLoading();
      this.setData({
        loadingshow: true,
        main: 'null',
        facility: true,
        mine: false,
        onLines: '家庭中心已离线'
      });
      wx.setNavigationBarTitle({
        title: this.data.homecenters[0].name
      });
    } else if (
      HomeCenterManager.getAllHomeCenters()[0].types == 3 &&
      HomeCenterManager.getAllHomeCenters()[0].online == true
    ) {
      wx.hideLoading();
      this.setData({
        loadingshow: true,
        // main: 'null',
        // facility: true,
        // main: true,
        onLines: false
      });
      wx.setNavigationBarTitle({
        title: this.data.homecenters[0].name
      });
    }
    if (this.isOnlineRoster() != true && HomeCenterManager.getAllHomeCenters().length > 0) {
      wx.hideLoading();
      this.setData({
        loadingshow: true,
        main: 'null',
        facility: true,
        mine: false,
        onLines: '家庭中心已离线...'
      });
    }
  },
  onShow: function() {
    var that = this;
    if (that.data.deviceList.length > 0 && that.data.facility == true) {
      if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
        for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
          if (that.data.boxName == homecenter.name) {
            HomeCenterManager.setDefaultHomeCenter(homecenter.uuid);
          }
        }
      }
    }
    that.setData({
      system: wx.getSystemInfoSync().system
    });
    if (HomeCenterManager.getDefaultHomeCenterCache() != undefined) {
      let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
      if (entities != undefined) {
        for (let physicD of entities.values()) {
          if (physicD.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
            for (let logicD of physicD.logicDevice) {
              // logicD.loading = false;
            }
          }
        }
      }
    }

    if (
      (wx.getStorageSync('token_') == null || wx.getStorageSync('token_') == '') &&
      app.globalData.client != null
    ) {
      app.globalData.client.disconnect();
      app.clientMqtt();
    }
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        if (res.screenHeight >= 812) {
          that.setData({
            systemModel: true
          });
        }
      }
    });
    animation1 = setInterval(function() {
      if (deviceInfos.length > 0) {
        that.textPlay(deviceInfos[0].Name, deviceInfos[0].stateText);
        deviceInfos.splice(0, 1);
      }
    }, 499);
    animation2 = setInterval(function() {
      if (deviceInfoImgs.length > 0) {
        that.imgPlay(deviceInfoImgs[0].stateImgBefore, deviceInfoImgs[0].stateImg);
        deviceInfoImgs.splice(0, 1);
      }
    }, 340);
    wx.getNetworkType({
      success: function(res) {
        console.log(res);
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType;
        if (networkType == 'none') {
          that.setData({
            onLines: false
          });
        }
      }
    });
    // 别人请求关联box消息
    if (app.globalData.addHomecenterMsg && app.globalData.addHomecenterMsg.length > 0) {
      that.setData({
        add_homecenter: app.globalData.addHomecenterMsg
      });
    } else {
      that.setData({
        add_homecenter: ''
      });
    }
    if (app.globalData.notFirstTime == true) {
      if (wx.getStorageSync('setDefaultHomeCenter') != '') {
        HomeCenterManager.setDefaultHomeCenter(wx.getStorageSync('setDefaultHomeCenter'));
      }
      that.perfectDevcie();
      if (that.data.main == true) {
        that.getEntities();
      }
    }
    if (HomeCenterManager.getAllHomeCenters()) {
      that.setData({
        homecenters: HomeCenterManager.getAllHomeCenters()
      });
      if (that.isOnlineRoster() != true) {
        that.setData({
          main: 'null',
          facility: true,
          mine: false,
          deviceList: '',
          onLines: '家庭中心已离线...'
        });
      }
      wx.setNavigationBarTitle({
        title: that.data.homecenters[0].name
      });
     
    }
    setTimeout(function() {
      that.perfectDevcie();
    }, 1000);
  },
  onReady: function() {
    let that = this;
    if (app.globalData.sharHomecenter == true) {
      return;
    }
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function() {
              //获取用户名字和头像
              wx.getUserInfo({
                success: function(res) {
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
    setTimeout(function() {
      if (HomeCenterManager.getAllHomeCenters() != undefined) {
        that.navigatetoAddroster();
      }
    }, 1500);
    that.perfectDevcie();
    
  },
  onShareAppMessage: function() {
    var that = this;
    that.setData({
      webviewUrl: '/pages/index/index'
    });
    return {
      title: '自定义转发标题',
      path: that.data.webviewUrl
    };
  },
  onHide: function() {
    var that = this;
    console.log('onHide');
    that.setData({
      translate: 'transform: translateX(0px)',
      clname: false,
      open: false
      // loadingshow:false
    });
    clearInterval(animation1);
    clearInterval(animation2);
  },
  deviceloading: function(e) {
    console.log(e);
    let that = this;
    that.setData({
      deviceload: true,
      loadingshow: true
    });
    wx.hideLoading();
  },
  // 设备页面
  perfectDevcie: function() {
    var that = this;

    that.setData({
      isCurtain: ''
    });
    if (HomeCenterManager.getDefaultHomeCenterCache() == undefined) {
      return;
    }
    console.log(HomeCenterManager.getDefaultHomeCenterCache().entities)
    if (HomeCenterManager.getDefaultHomeCenterCache().entities == undefined) {
      that.setData({
        deviceList:"",
        main:false,
        facility:true
      })
      let defaulhomecenter = HomeCenterManager.getHomeCenter(
        HomeCenterManager.getDefaultHomeCenterCache().uuid
      );
      if (defaulhomecenter.types == Const.AssociationState.SHARED) {
        that.setData({
          deviceList: null,
          onLines: false,
          loadingshow: true
        });
        return;
      }
      return;
    }
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    console.log(entities,'index1');
    var areas = [];
    for (var t of entities.values()) {
      if (t.getEntityType() == Const.EntityType.AREA) {
        //区域
        areas.push(t);
      }
    }
    for (var k of areas) {
      k.areaDevices = [];
    }
    let deviceArr = [];
    for (var j of entities.values()) {
      if (j.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        //设备
        deviceArr.push(j);
        if (j.isWallSwitch()) {

          // && j.isNew == false
          let physicD = {};
          physicD.device = j;
          physicD.areaUuid = j.areaUuid;
          //  var for
          physicD.deviceImg = '../../imgs/wallswitch_offline.png';
          if (j.Available) {
            physicD.deviceImg = '../../imgs/wallswitch_on.png';
          }
          if (j.name == '') {
            physicD.uiUuid = j.uuid.substr(12, 7);
          }
          that.matchingArea(areas, physicD);
          for (let logicD of j.logicDevice) {
            // logicD.loading = false
            let logicDs = {};
            logicDs.device = logicD;
            logicDs.parent = j.uuid;
            if (logicD.name == '') {
              logicDs.uiUuid = logicD.uuid.substr(12, 7);
            }
            if (logicD.profile == Const.Profile.ON_OFF_LIGHT) {
              // for (let attr of logicD.attributes){
              if (logicD.isWallSwitchLightChange() != true) {
                
                  logicDs.areaUuid = logicD.areaUuid;
                if (logicD.Available == false) {
                  logicDs.deviceImg = '../../imgs/dev_icon_light_offline.png';
                } else if (logicD.Available == true) {
                  for (let attributes of logicD.attributes) {
                    if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 1) {
                      logicDs.switchEnable = true;
                      logicDs.deviceImg = '../../imgs/dev_icon_light_on.png';
                    } else if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 0) {
                      logicDs.switchEnable = false;
                      logicDs.deviceImg = '../../imgs/dev_icon_light_off.png';
                    }
                  }
                }
                that.matchingArea(areas, logicDs);
              }
              // }
            }
          }
        } else if (j.isUsWallSwitch()) {

          // && j.isNew == false
          let physicD = {};
          physicD.device = j;
          physicD.areaUuid = j.areaUuid;
          //  var for
          physicD.deviceImg = '../../imgs/dev_icon_wallswitchUS_offline.png';
          if (j.Available) {
            physicD.deviceImg = '../../imgs/dev_icon_wallswitchUS_on.png';
          }
          if (j.name == '') {
            physicD.uiUuid = j.uuid.substr(12, 7);
          }
          that.matchingArea(areas, physicD);
          for (let logicD of j.logicDevice) {
            // logicD.loading = false
            let logicDs = {};
            logicDs.device = logicD;
            logicDs.parent = j.uuid;
            if (logicD.name == '') {
              logicDs.uiUuid = logicD.uuid.substr(12, 7);
            }
            if (logicD.profile == Const.Profile.ON_OFF_LIGHT) {
              // for (let attr of logicD.attributes){
              if (logicD.isWallSwitchLightChange() != true) {
                logicDs.areaUuid = logicD.areaUuid;
                if (logicD.Available == false) {
                  logicDs.deviceImg = '../../imgs/dev_icon_light_offline.png';
                } else if (logicD.Available == true) {
                  for (let attributes of logicD.attributes) {
                    if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 1) {
                      logicDs.switchEnable = true;
                      logicDs.deviceImg = '../../imgs/dev_icon_light_on.png';
                    } else if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 0) {
                      logicDs.switchEnable = false;
                      logicDs.deviceImg = '../../imgs/dev_icon_light_off.png';
                    }
                  }
                }
                that.matchingArea(areas, logicDs);
              }
              // }
            }
          }
        } else if(j.isSwitchModule()){
          let physicD = {};
          physicD.device = j;
          physicD.areaUuid = j.areaUuid;
          //  var for
          physicD.deviceImg = '../../imgs/dev_icon_switch_module_offline.png';
          if (j.Available) {
            physicD.deviceImg = '../../imgs/dev_icon_switch_module_on.png';
          }
          if (j.name == '') {
            physicD.uiUuid = j.uuid.substr(12, 7);
          }
          that.matchingArea(areas, physicD);
          for (let logicD of j.logicDevice) {
            // logicD.loading = false
            let logicDs = {};
            logicDs.device = logicD;
            logicDs.parent = j.uuid;
            logicDs.uiUuid = logicD.uuid.substr(12, 7);
            if (logicD.profile == Const.Profile.ON_OFF_LIGHT) {
              if (logicD.isPureInput() != true) {
                logicDs.areaUuid = logicD.areaUuid;
                if (logicD.Available == false) {
                  logicDs.deviceImg = '../../imgs/switch_module_lightLOffline.png';
                } else if (logicD.Available == true) {
                  for (let attributes of logicD.attributes) {
                    if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 1) {
                      logicDs.switchEnable = true;
                      if (logicD.uuid.endsWith("-01")) {
                        logicDs.deviceImg = '../../imgs/switch_module_lightLOffline.png';
                      } else {
                        logicDs.deviceImg = '../../imgs/switch_module_lightROffline.png';
                      }
                    } else if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 0) {
                      logicDs.switchEnable = false;
                      if (logicD.uuid.endsWith("-01")) {
                        logicDs.deviceImg = '../../imgs/switch_module_lightLOffline.png';
                      } else {
                        logicDs.deviceImg = '../../imgs/switch_module_lightROffline.png';
                      }
                    }
                  }
                }
                that.matchingArea(areas, logicDs);
              }
            }
          }
        } else if (j.isZHHVRVGateway()){
          let physicD = {};
          physicD.device = j;
          physicD.areaUuid = j.areaUuid;
          physicD.deviceImg = '../../imgs/dev_icon_air_condition_controller_off.png';
          if (j.Available) {
            physicD.deviceImg = '../../imgs/dev_icon_air_condition_controller_on.png';
          }
          if (j.name == '') {
            physicD.uiUuid = j.uuid.substr(12, 7);
          }

          that.matchingArea(areas, physicD);
          for (let logicD of j.logicDevice) {
            // logicD.loading = false
            if (logicD.profile != 9){
              let logicDs = {};
              logicDs.device = logicD;
              logicDs.parent = j.uuid;
                logicD.areaUuid = logicD.areaUuid;
              if (logicD.name == '') {
                logicDs.uiUuid = logicD.uuid.substr(12, 12);
              }
              if (logicD.Available == false) {
                logicDs.deviceImg = '../../imgs/dev_icon_air_conditioner_off.png';
              } else if (logicD.Available == true) {
                logicDs.deviceImg = '../../imgs/dev_icon_air_conditioner_on.png';
              }
              that.matchingArea(areas, logicDs);
            }
            
            
          }
        } else if (j.isNew == true && j.isCurtain()) {
          console.log(j);
        } else {
          // if (j.isNew == false) {
          for (let logicD of j.logicDevice) {
            isCurtains = [];
            let logicDs = {};
            logicDs.device = logicD;
            logicDs.parent = j.uuid;
            if (logicD.name == '') {
              logicDs.uiUuid = logicD.uuid.substr(12, 7);
            }
            logicDs.areaUuid = logicD.areaUuid;
            if (logicD.profile == Const.Profile.SMART_PLUG) {
              if (logicD.Available == false) {
                logicDs.deviceImg = '../../imgs/dev_icon_plug_offline.png';
              } else if (logicD.Available == true) {
                for (let attributes of logicD.attributes) {
                  if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 1) {
                    logicDs.switchEnable = true;
                    logicDs.deviceImg = '../../imgs/dev_icon_plug_on.png';
                  } else if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 0) {
                    logicDs.switchEnable = false;
                    logicDs.deviceImg = '../../imgs/dev_icon_plug_off.png';
                  }
                }
              }
            } else if (logicD.profile == Const.Profile.ON_OFF_LIGHT) {
              if (logicD.Available == false) {
                logicDs.deviceImg = '../../imgs/dev_icon_light_offline.png';
              } else if (logicD.Available == true) {
                for (let attributes of logicD.attributes) {
                  if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 1) {
                    logicDs.switchEnable = true;
                    logicDs.deviceImg = '../../imgs/dev_icon_light_on.png';
                  } else if (attributes.key == Const.AttrKey.ON_OFF_STATUS && attributes.value == 0) {
                    logicDs.switchEnable = false;
                    logicDs.deviceImg = '../../imgs/dev_icon_light_off.png';
                  }
                }
              }
            } else if (logicD.profile == Const.Profile.PIR_PANEL) {
              if (logicD.Available == false) {
                logicDs.deviceImg = '../../imgs/dev_icon_pir_offline.png';
              } else if (logicD.Available == true) {
                logicDs.deviceImg = '../../imgs/dev_icon_pir_safe.png';
                for (let attributes of logicD.attributes) {
                  if (attributes.key == Const.AttrKey.ALERT_LEVEL && attributes.value == 1) {
                    logicDs.switchEnable = true;
                  } else if (attributes.key == Const.AttrKey.ALERT_LEVEL && attributes.value == 0) {
                    logicDs.switchEnable = false;
                  } else if (attributes.key == Const.AttrKey.OCCUPANCY) {
                    if (
                      app.detectionLeftpeople(attributes.value) == 1 ||
                      app.detectionRightpeople(attributes.value) == 1
                    ) {
                      //左边有事件
                      if (app.detectionLeft(attributes.value) == 1) {
                        logicDs.detectionLeft = true;
                        logicDs.deviceImg = '../../imgs/dev_icon_pir_alarm.png';
                      }
                      if (app.detectionLeft(attributes.value) == 0) {
                        logicDs.detectionLeft = 'false';
                      }
                      if (app.detectionRight(attributes.value) == 1) {
                        logicDs.detectionRight = true;
                        logicDs.deviceImg = '../../imgs/dev_icon_pir_alarm.png';
                      }
                      if (app.detectionRight(attributes.value) == 0) {
                        logicDs.detectionRight = 'false';
                      }
                      if (
                        app.detectionRight(attributes.value) == 0 &&
                        app.detectionLeft(attributes.value) == 0
                      ) {
                        logicDs.detectionLeft = 'false';
                        logicDs.detectionRight = 'false';
                        logicDs.deviceImg = '../../imgs/dev_icon_pir_safe.png';
                      }
                    }
                  }
                }
              }
            } else if (logicD.profile == Const.Profile.WINDOW_COVERING) {
              if (logicD.Available == false) {
                logicDs.deviceImg = '../../imgs/icon_curtain_offline.png';
                isCurtains.push(logicD);
              } else if (logicD.Available == true) {
                logicDs.deviceImg = '../../imgs/icon_curtain.png';
                for (let attr of logicDs.device.attributes) {
                  if (attr.key == Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT && attr.value > 10) {
                    logicDs.switchEnable = true;
                  } else if (attr.key == Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT && attr.value < 10) {
                    logicDs.switchEnable = false;
                  }
                }

                isCurtains.push(logicD);
              }
              that.setData({
                isCurtain: isCurtains
              });
            } else if (logicD.profile == Const.Profile.SMART_DIAL) {
              if (logicD.Available == false) {
                logicDs.deviceImg = '../../imgs/dev_icon_rotary_knob_offline.png';
              } else if (logicD.Available == true) {
                logicDs.deviceImg = '../../imgs/dev_icon_rotary_knob_on.png';
              }
            }
            if (logicD.profile == Const.Profile.DOOR_CONTACT) {
              if (j.Available == false) {
                let animation = wx.createAnimation({
                  duration: 300,
                  timingFunction: 'linear'
                });
                that.animation = animation;
                animation.left('13.5rpx').step();
                animation2 = wx.createAnimation({
                  duration: 300,
                  timingFunction: 'linear'
                });
                that.animation2 = animation2;
                animation2.right('13.5rpx').step();
                logicDs.animationleft = animation.export();
                logicDs.animationright = animation2.export();
                logicDs.variableoffline = true;
              } else if (logicD.Available == true) {
                for (let attribute of logicD.attributes) {
                  if (attribute.key == Const.AttrKey.BINARY_INPUT_STATUS && attribute.value == 0) {
                    let animation = wx.createAnimation({
                      duration: 300,
                      timingFunction: 'linear'
                    });
                    that.animation = animation;
                    animation.left('13.5rpx').step();
                    let animation2 = wx.createAnimation({
                      duration: 300,
                      timingFunction: 'linear'
                    });
                    that.animation2 = animation2;
                    animation2.right('13.5rpx').step();
                    logicDs.animationleft = animation.export();
                    logicDs.animationright = animation2.export();
                    logicDs.doorimg = false;
                    logicDs.variable = false;
                    logicDs.variableEnd = false;
                  } else if (attribute.key == Const.AttrKey.BINARY_INPUT_STATUS && attribute.value == 1) {
                    let animation = wx.createAnimation({
                      duration: 300,
                      timingFunction: 'linear'
                    });
                    that.animation = animation;
                    animation.left('9rpx').step();

                    let animation2 = wx.createAnimation({
                      duration: 300,
                      timingFunction: 'linear'
                    });
                    that.animation2 = animation2;
                    animation2.right('9rpx').step();
                    logicDs.animationleft = animation.export();
                    logicDs.animationright = animation2.export();
                    logicDs.doorimg = true;
                    logicDs.variable = true;
                    logicDs.variableEnd = true;
                  }
                  if (attribute.key == Const.AttrKey.ALERT_LEVEL && attribute.value == 1) {
                    logicDs.switchEnable = true;
                  } else if (attribute.key == Const.AttrKey.ALERT_LEVEL && attribute.value == 0) {
                    logicDs.switchEnable = false;
                  }
                }
              }
            }
            that.matchingArea(areas, logicDs);
          }
          // }
        }
      }
    }
    if (deviceArr.length > 0) {
      if (that.isnewDevice(deviceArr)) {
        that.setData({
          isnewDevice: that.isnewDevice(deviceArr)
        });
      }
    }

    that.setData({
      deviceList: areas
    });
    if (areas.length > 0) {
      if (
        that.isnoDevice(that.data.deviceList) != true ||
        that.isnoDevice(that.data.deviceList) == undefined
      ) {
        that.setData({
          noDevice: true,
          tabarMain: null
          // loadingshow: true
        });
        // wx.hideLoading()
      }
      if (that.isnoDevice(that.data.deviceList) == true) {
        that.setData({
          noDevice: false,
          tabarMain: false
          // loadingshow: true
        });
        // wx.hideLoading()
      }
    }
    // console.log(that.data.deviceList)
  },
  // 判断是否有新设备
  isnewDevice: function(srg) {
    for (let item of srg) {
      if (item.isNew == true && item.Available == true) {
        return true;
      }
    }
  },
  // 判断设备页面是否没有设备
  isnoDevice: function(deviceList) {
    for (let item of deviceList) {
      if (item.areaDevices.length > 0) {
        return true;
      }
    }
  },
  // 设备匹配自己的区域
  matchingArea: function(area, device) {
    if (device.device.parentUuid){
      let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
      let phyD = entities.get(device.device.parentUuid);
      if (phyD == undefined) return;
      if (phyD.isWallSwitch() || phyD.isSwitchModule() || phyD.isUsWallSwitch() || phyD.isZHHVRVGateway()) {
        if (device.device.areaUuid == "area-0000"){
          for (var s of area) {
            if (s.uuid == phyD.areaUuid) {
              s.areaDevices.push(device);
              return
            }
          }
        }else{
          for (var s of area) {
            if (s.uuid == device.device.areaUuid) {
              s.areaDevices.push(device);
              return
            }
          }
        }
        
      }else{
        for (var s of area) {
          if (s.uuid == device.device.areaUuid) {
            s.areaDevices.push(device);
            return
          }
        }
      }
    }  else{
      for (var s of area) {
        if (s.uuid == device.device.areaUuid) {
          s.areaDevices.push(device);
          return
        }
      }
    }
    
    if(area[0]){
      area[0].areaDevices.push(device)
    }
    
  },
  switchtap: function(e) {
    var that = this;
    var uuidValue = e.currentTarget.dataset.uuid; //当前设备uuid
    var profileValue = e.currentTarget.dataset.profile; //设备类型
    var topicPub = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    var username_ = app.globalData.username_; //全局用户名
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;

    for (let logicD of entities.get(e.currentTarget.dataset.parentuuid).logicDevice) {
      if (logicD.uuid == uuidValue) {
        logicD.loading = true;
      }
    }
    that.perfectDevcie();
    if (that.data.isCurtain != undefined) {
      for (var curtain of that.data.isCurtain) {
        if (curtain.uuid == uuidValue) {
          var cbtn = 'curtain.curtainBtn';
          if (!e.currentTarget.dataset.switchenable) {
            that.setData({
              [cbtn]: false
            });
          } else if (e.currentTarget.dataset.switchenable) {
            that.setData({
              [cbtn]: true
            });
          }
        }
      }
    }
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
  // 跳转页面到详情页
  details: function(e) {
    wx.navigateTo({
      url:
        '../details/details?parentuuid=' +
        e.currentTarget.dataset.detailim +
        '&uuid=' +
        e.currentTarget.dataset.uuid
    });
    this.setData({
      navigateTo: true
    });
  },
  goInvitation: function(e) {
    var demand = e.currentTarget.dataset.deviceuuid;
    var str = JSON.stringify(demand);
    wx.navigateTo({
      url: '../invitation/invitation?deviceuuid=' + str
    });
  },
  addDevicePage: function() {
    wx.navigateTo({
      url: '../addDevice/addDevice'
    });
  }
});
