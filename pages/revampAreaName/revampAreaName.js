/** @format */

// pages/revampAreaName/revampAreaName.js
var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    areaChoose: '', //区域
    id: '',
    areauuid: '',
    deviceUUID: ''
  },
  getEntityResult: function() {},
  choseTxt: function(e) {
    var that = this;
    let id = e.currentTarget.dataset.id; //获取自定义的ID值
    var areaUUID = e.currentTarget.dataset.areauuid; //获取自定义的ID值
    console.log(areaUUID);
    that.setData({
      areauuid: areaUUID
    });
  },
  save: function() {
    var that = this;
    console.log(that.data.areauuid);
    console.log(that.data);
    var boxname = 'message/' + HomeCenterManager.getDefaultHomeCenterCache().uuid;
    mqttclient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: mqttclient.buildConfigEntityInfoRequest(
        app.globalData.username_,
        that.data.deviceuuid,
        that.data.areauuid,
        ''
      ),
      error: function(req, res) {
        console.log('got error', req, res);
      }
    });
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
    var that = this;
    if (msg_.ConfigEntityInfoResult != null && msg_.ConfigEntityInfoResult != undefined) {
      if (!msg_.ConfigEntityInfoResult.Error) {
        // console.log(that.data.deviceItem);
        // that.data.deviceItem.AreaUUID = that.data.areauuid;
        wx.navigateBack({
          delta: 1
        });
      }
    }
  },
  addRoom: function () {
    wx.navigateTo({
      url: '../roomEditer/roomEditer?types=add&boxuuid=' + wx.getStorageSync('setDefaultHomeCenter'),
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    this.setData({
      areauuid: options.areaName,
      presentuuid: options.presentuuid,
      deviceuuid : options.deviceuuid
    })
    // var areaName = JSON.parse(options.areaName); //拿当前设备uuid
    // console.log(areaName)
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  // 匹配区域
  matching: function (areaArrs,areauuid) {
    for (var q = 0; q < areaArrs.length; q++) {
      if (areauuid == areaArrs[q].uuid) {
        return areaArrs[q].uuid;
      }
    }
    return areaArrs[0].uuid
  },
  onShow: function() {
    var that = this;
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
      wx.setNavigationBarTitle({
        title: '房间设置'
      });
      let areas = [];
      for (let t of entities.values()) {
        if (t.getEntityType() == Const.EntityType.AREA) {
          //区域
          areas.push(t);
        }
      }
    that.matching(areas,that.data.areauuid)
      that.setData({
        areaChoose: areas,
        areauuid:that.matching(areas, that.data.areauuid)
      });
      console.log(that.data);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
