/** @format */
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
var app = getApp();
var mqttclient = require('../../utils/mqttclient');
// pages/sysInformation/sysInformation.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    systitle: '系统信息',
    // sysDetial:''
    uiVersion: '',
    uiChannel: ''
  },
  getEntityResult: function() {},
  setUpgradePolicy: function(e) {
    console.log(e);
    let that = this;
    var boxname = 'message/' + that.data.boxuuid;
    console.log(boxname);
    mqttclient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: mqttclient.buildSetUpgradePolicyRequest(
        app.globalData.username_,
        e.currentTarget.dataset.infomation,
        604800
      ),
      success: function(req) {
        console.log(req);
      },
      error: function(req, res) {
        console.log('got error', req, res);
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log(options);
    wx.setNavigationBarTitle({
      title: that.data.systitle //页面标题为路由参数
    });
    that.setData({
      optionstypes: options.types,
      optionsuuid:options.uuid
    })
    
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
    if (msg_.DeviceAssociation != undefined && msg_.DeviceAssociation != null) {
      for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
        if (homecenter.uuid == this.data.optionsuuid) {
          this.setData({
            roster: homecenter
          });
        }
        console.log(homecenter);
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this
    if (that.data.optionstypes != undefined && that.data.optionstypes == 'count') {
      wx.setNavigationBarTitle({
        title: '主人账号'
      });
      for (let homecenter of HomeCenterManager.getAllHomeCenters()) {
        if (homecenter.uuid == that.data.optionsuuid) {
          that.setData({
            roster: homecenter
          });
        }
        console.log(homecenter);
      }

      return;
    }
    if (that.data.optionstypes != undefined && that.data.optionstypes == 'updata') {
      that.setData({
        boxuuid: that.data.optionsuuid,
        upgradePolicy: true
      });
      let boxname = 'message/' + that.data.boxuuid;
      mqttclient.sendRequest({
        client: app.getClient(),
        topic: boxname,
        req: mqttclient.buildGetUpgradePolicyRequest(app.globalData.username_),
        success: function (req, res) {
          console.log(req);
          console.log(res);
          console.log(res.GetUpgradePolicyResult.Channel);
          if (res.GetUpgradePolicyResult.Channel == 'alpha') {
            that.setData({
              alpha: true,
              beta: false,
              stable: false
            });
          } else if (res.GetUpgradePolicyResult.Channel == 'beta') {
            that.setData({
              alpha: false,
              beta: true,
              stable: false
            });
          } else {
            that.setData({
              alpha: false,
              beta: false,
              stable: true
            });
          }
        },
        error: function (req, res) {
          console.log('got error', req, res);
        }
      });
      return;
    }
    console.log(HomeCenterManager.getHomeCenterCache(that.data.optionsuuid));
    console.log(HomeCenterManager);
    console.log(that.data.optionsuuid);
    var entities = HomeCenterManager.getHomeCenterCache(that.data.optionsuuid).entities;
    for (var zigbee of entities.values()) {
      if (zigbee.getEntityType() == Const.EntityType.ZIGBEE_SYSTEM) {
        that.setData({
          uiChannel: zigbee.channel
        });
      }
    }
    console.log(entities.get(that.data.optionsuuid));
    var nums = entities.get(that.data.optionsuuid).version.toString();
    var one = Number(nums.substr(0, 1));
    var two = Number(nums.substr(1, 2));
    var three = Number(nums.substr(3, 2));
    var ver = one + '.' + two + '.' + three;
    console.log(ver);
    that.setData({
      uiVersion: ver,
      uuid: entities.get(that.data.optionsuuid).uuid
    });
  },
  compileRoster:function(e){
    console.log(e)
    console.log(this.data)
    wx.navigateTo({
      url: '../rosterEditer/rosterEditer?username=' + e.currentTarget.dataset.username+"&boxuuid="+this.data.roster.uuid,
    })
    
  },
});
