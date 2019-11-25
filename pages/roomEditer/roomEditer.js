/** @format */

var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
// import Const from '../../data/Const.js';
var feedbackApi = require('../../utils/showToast.js');
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    addRoom:false
  },
  getEntityResult: function () { },
  // 是不是表情
  bindKeyInput: function (substr) {
    // var that = this;
    // console.log(substring);
    var substring = substr.detail.value;
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
    this.setData({
      newAreaname: substring
    });
    // console.log(that.data.deviceLog);
  },
  onMqttMsg: function (msg_) {
    console.log(msg_);
    if (msg_.ConfigEntityInfoResult != null && msg_.ConfigEntityInfoResult != undefined) {
      console.log(msg_.ConfigEntityInfoResult);
      if (!msg_.ConfigEntityInfoResult.Error) {
        wx.navigateBack({
          delta: 1
        });
      }
    }

    if (msg_.DeleteAreaResult != null && msg_.DeleteAreaResult != undefined) {
      console.log(msg_.DeleteAreaResult);
      if (!msg_.DeleteAreaResult.Error) {
        wx.navigateBack({
          delta: 1
        });
      }
    }
    if (msg_.AreaCreated != null && msg_.AreaCreated != undefined) {
      console.log(msg_.AreaCreated);
      if (!msg_.AreaCreated.Error) {
        wx.navigateBack({
          delta: 1
        });
      } 
    }
    if (msg_.Error != null && msg_.Error != undefined){
      if (msg_.Error.Code == 25) {
        feedbackApi.showToast({
          title: '房间已存在'
        });
      }
    }
  },
  save: function () {
    var that = this;
    // 检验名字是否合法
    console.log(that.data.deviceLog);
    if (that.data.newAreaname == null || that.data.newAreaname == '' ) {
      wx.showToast({
        title: '名称为空哦'
      });
      return
    } 
    console.log(that.data.newAreaname)
     if (that.data.newAreaname == '默认房间' || that.data.newAreaname == '默认'){
      feedbackApi.showToast({
        title:'"默认房间"已存在'
      })
      return
     }
    
      var boxname = 'message/' + that.data.boxuuid;
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildConfigEntityInfoRequest(
          app.globalData.username_,
          that.data.dataInformation.uuid,
          that.data.dataInformation.uuid,
          that.data.newAreaname
        ),
        error: function (req, res) {
          console.log('got error', req, res);
        }
      });
    
  },
  onLoad: function (options) {
    var that = this;
    console.log(options)
    if(options.types == 'add'){
      that.setData({
        addRoom:true,
        boxuuid:options.boxuuid
      })
      return
    }
    wx.setNavigationBarTitle({
      title: '房间编辑'
    });
    let homecenter = HomeCenterManager.homeCenterCacheMap.get(options.boxuuid)
    let entities = homecenter.entities;
    console.log(entities.get(options.uuid))
    that.setData({
      dataInformation: entities.get(options.uuid),
      boxuuid: options.boxuuid,
      newAreaname: entities.get(options.uuid).name
    })
  },
  deleteRoom:function(){
    let that =this
    var boxname = 'message/' + that.data.boxuuid;
    wx.showModal({
      title: '移除房间',
      content: '确定移除房间？',
      success: function (res) {
        if (res.confirm) {
          mqttclient.sendRequest({
            client: app.getClient(),
            topic: boxname,
            req: mqttclient.buildDeleteAreaRequest(
              app.globalData.username_,
              that.data.dataInformation.uuid
            ),
            error: function (req, res) {
              console.log('got error', req, res);
            }

          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
   
  },
  //添加房间
  bindAddRoom: function (substr){
    var substring = substr.detail.value;
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
    this.setData({
      addRoomName: substring
    });
  },
  saveAddRoom:function(){
    let that = this
    if (that.data.addRoomName == null || that.data.addRoomName == '') {
      wx.showToast({
        title: '名称为空哦'
      });
      return
    } 
    if (that.data.addRoomName == '默认房间' || that.data.addRoomName == '默认') {
      feedbackApi.showToast({
        title: '不可以设置为默认房间'
      })
      return
    }
    //  {
      var boxname = 'message/' + that.data.boxuuid;
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildCreateAreaRequest(
          app.globalData.username_,
          that.data.addRoomName
        ),
        error: function (req, res) {
          console.log('got error', req, res);
        }
      });
    // }
  },
});
