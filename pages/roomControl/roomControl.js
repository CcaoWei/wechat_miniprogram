// pages/roomControl/roomControl.js
// var mqttclient = require('../../utils/mqttclient');
var HomeCenterManager = require('../../data/HomeCenterManager.js');
import Const from '../../data/Const.js';
// var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomArrs:'',//全部的房间集合
  },
  onMqttMsg:function(){},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let that = this
    that.setData({
      boxuuid:options.uuid
    })
  },
  roomEditer:function(e){
    console.log(e)
    if (e.currentTarget.dataset.uuid == "area-0000"){
      return
    }
    wx.navigateTo({
      url: '../roomEditer/roomEditer?uuid=' + e.currentTarget.dataset.uuid+'&boxuuid=' + this.data.boxuuid,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    console.log(HomeCenterManager.homeCenterCacheMap.get(that.data.boxuuid))
    let homecenter = HomeCenterManager.homeCenterCacheMap.get(that.data.boxuuid)
    let entities = homecenter.entities;
    let roomArr = []
    for (var entity of entities.values()) {
      if (entity.getEntityType() == Const.EntityType.AREA) {
        //设备
        let entityRoom = {}
        entityRoom.room = entity
        roomArr.push(entityRoom);
      }
    }
    console.log(roomArr)
    that.setData({
      roomArrs: roomArr,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  addRoom:function(){
    wx.navigateTo({
      url: '../roomEditer/roomEditer?types=add&boxuuid=' + this.data.boxuuid,
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})